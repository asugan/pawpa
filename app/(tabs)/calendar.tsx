import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, format } from 'date-fns';
import { CalendarHeader, CalendarViewType } from '@/components/calendar/CalendarHeader';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { EventModal } from '@/components/EventModal';
import { useUpcomingEvents, useCalendarEvents } from '@/lib/hooks/useEvents';
import { Event } from '@/lib/types';
import { LAYOUT } from '@/constants';

export default function CalendarScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  // State management
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch events based on view type
  // For month view: use upcoming events
  // For day view: fetch specific date events
  const { data: upcomingEvents = [], isLoading: isLoadingUpcoming, error: errorUpcoming } = useUpcomingEvents();

  // Fetch events for specific date when in day view
  // Extract UTC date portion to avoid timezone conversion issues
  const formattedDate = currentDate ? currentDate.toISOString().substring(0, 10) : '';
  const { data: dayEvents = [], isLoading: isLoadingDay, error: errorDay } = useCalendarEvents(formattedDate, {
    enabled: viewType === 'day',
  });

  // Determine which events to use based on view type
  const events = viewType === 'day' ? dayEvents : upcomingEvents;
  const isLoading = viewType === 'day' ? isLoadingDay : isLoadingUpcoming;
  const error = viewType === 'day' ? errorDay : errorUpcoming;

  // Debug logging
  console.log(`📅 Calendar View: ${viewType}`);
  console.log(`  currentDate: ${currentDate.toISOString()}`);
  console.log(`  formattedDate: ${formattedDate}`);
  console.log(`  upcomingEvents: ${upcomingEvents.length}`);
  console.log(`  dayEvents: ${dayEvents.length}`);
  console.log(`  events (used): ${events.length}`);

  // Navigation handlers
  const handlePrevious = () => {
    switch (viewType) {
      case 'month':
        setCurrentDate((prev) => subMonths(prev, 1));
        break;
      case 'week':
        setCurrentDate((prev) => subWeeks(prev, 1));
        break;
      case 'day':
        setCurrentDate((prev) => subDays(prev, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (viewType) {
      case 'month':
        setCurrentDate((prev) => addMonths(prev, 1));
        break;
      case 'week':
        setCurrentDate((prev) => addWeeks(prev, 1));
        break;
      case 'day':
        setCurrentDate((prev) => addDays(prev, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleViewTypeChange = (newViewType: CalendarViewType) => {
    setViewType(newViewType);
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    setViewType('day');
  };

  const handleEventPress = (event: Event) => {
    console.log('Event pressed:', event);
    // TODO: Navigate to event detail screen or open modal
  };

  const handleAddEvent = () => {
    setModalVisible(true);
  };

  const handleModalSuccess = () => {
    // React Query handles cache invalidation automatically
    setModalVisible(false);
  };

  // Render content based on view type
  const renderCalendarView = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            variant="bodyMedium"
            style={[styles.loadingText, { color: theme.colors.onSurface }]}
          >
            {t('common.loading')}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text
            variant="bodyLarge"
            style={[styles.errorText, { color: theme.colors.error }]}
          >
            {t('errors.loadingFailed')}
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.errorMessage, { color: theme.colors.onSurfaceVariant }]}
          >
            {error.message}
          </Text>
        </View>
      );
    }

    switch (viewType) {
      case 'month':
        return (
          <MonthView
            currentDate={currentDate}
            events={events}
            selectedDate={selectedDate}
            onDayPress={handleDayPress}
            testID="calendar-month-view"
          />
        );
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            events={events}
            onEventPress={handleEventPress}
            testID="calendar-week-view"
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            events={events}
            onEventPress={handleEventPress}
            testID="calendar-day-view"
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Calendar Header */}
      <CalendarHeader
        currentDate={currentDate}
        viewType={viewType}
        onViewTypeChange={handleViewTypeChange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        testID="calendar-header"
      />

      {/* Calendar View */}
      <View style={styles.calendarContainer}>{renderCalendarView()}</View>

      {/* Add Event FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
        onPress={handleAddEvent}
        label={t('calendar.addEvent')}
        testID="calendar-add-event-fab"
      />

      {/* Event Creation Modal */}
      <EventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
        testID="calendar-event-modal"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    flex: 1,
    paddingBottom: LAYOUT.FAB_OFFSET,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});