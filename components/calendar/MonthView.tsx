import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Event } from '../../lib/types';
import { getEventColor } from '@/lib/utils/eventColors';

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  selectedDate?: Date;
  onDayPress: (date: Date) => void;
  testID?: string;
}

const { width } = Dimensions.get('window');
const DAY_SIZE = (width - 32) / 7; // 32 = container padding

export function MonthView({
  currentDate,
  events,
  selectedDate,
  onDayPress,
  testID,
}: MonthViewProps) {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const locale = i18n.language === 'tr' ? tr : enUS;

  // Get all days to display in the calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    // Extract UTC date portion to avoid timezone conversion issues
    const dayStr = day.toISOString().substring(0, 10);
    return events.filter((event) => {
      // Extract date portion from event startTime (ISO string)
      const eventDateStr = event.startTime.substring(0, 10);
      return eventDateStr === dayStr;
    });
  };

  // Weekday names (short)
  const weekDays = useMemo(() => {
    const days = [];
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      days.push(format(day, 'EEEEEE', { locale }).toUpperCase());
    }
    return days;
  }, [locale]);

  // Render a single day cell
  const renderDay = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isTodayDate = isToday(day);
    // Check if selected using UTC date comparison
    const isSelected = selectedDate && day.toISOString().substring(0, 10) === selectedDate.toISOString().substring(0, 10);
    const hasEvents = dayEvents.length > 0;

    const dayNumber = format(day, 'd');

    return (
      <Pressable
        key={day.toISOString()}
        style={[
          styles.dayCell,
          {
            width: DAY_SIZE,
            height: DAY_SIZE,
          },
        ]}
        onPress={() => onDayPress(day)}
        testID={`${testID}-day-${format(day, 'yyyy-MM-dd')}`}
      >
        <View
          style={[
            styles.dayContent,
            isTodayDate && { backgroundColor: theme.colors.primaryContainer },
            isSelected && {
              backgroundColor: theme.colors.tertiaryContainer,
              borderWidth: 2,
              borderColor: theme.colors.tertiary,
            },
          ]}
        >
          {/* Day Number */}
          <Text
            variant="bodyMedium"
            style={[
              styles.dayNumber,
              {
                color: isCurrentMonth
                  ? theme.colors.onSurface
                  : theme.colors.onSurfaceVariant,
                opacity: isCurrentMonth ? 1 : 0.4,
                fontWeight: isTodayDate || isSelected ? '700' : '400',
              },
            ]}
          >
            {dayNumber}
          </Text>

          {/* Event Indicators */}
          {hasEvents && isCurrentMonth && (
            <View style={styles.eventIndicators}>
              {dayEvents.slice(0, 3).map((event, index) => (
                <View
                  key={event._id}
                  style={[
                    styles.eventDot,
                    {
                      backgroundColor: getEventColor(event.type, theme),
                      marginLeft: index > 0 ? 2 : 0,
                    },
                  ]}
                />
              ))}
              {dayEvents.length > 3 && (
                <Text
                  style={[
                    styles.eventCount,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  +{dayEvents.length - 3}
                </Text>
              )}
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID={testID}>
      {/* Weekday Headers */}
      <View style={styles.weekRow}>
        {weekDays.map((day) => (
          <View
            key={day}
            style={[
              styles.weekDayCell,
              {
                width: DAY_SIZE,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={[
                styles.weekDayText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day) => renderDay(day))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayText: {
    fontWeight: '600',
    fontSize: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    padding: 2,
  },
  dayContent: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayNumber: {
    fontSize: 14,
  },
  eventIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 4,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventCount: {
    fontSize: 8,
    marginLeft: 2,
    fontWeight: '600',
  },
});

export default MonthView;
