import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, IconButton, SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

export type CalendarViewType = 'month' | 'week' | 'day';

interface CalendarHeaderProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onViewTypeChange: (viewType: CalendarViewType) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  testID?: string;
}

export function CalendarHeader({
  currentDate,
  viewType,
  onViewTypeChange,
  onPrevious,
  onNext,
  onToday,
  testID,
}: CalendarHeaderProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language === 'tr' ? tr : enUS;

  // Format title based on view type
  const getTitle = () => {
    switch (viewType) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale });
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

        // If same month, show "1-7 Kasım 2024"
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${format(weekStart, 'd', { locale })}-${format(weekEnd, 'd MMMM yyyy', { locale })}`;
        }
        // Different months, show "28 Ekim - 3 Kasım 2024"
        return `${format(weekStart, 'd MMMM', { locale })} - ${format(weekEnd, 'd MMMM yyyy', { locale })}`;
      }
      case 'day':
        return format(currentDate, 'd MMMM yyyy, EEEE', { locale });
      default:
        return '';
    }
  };

  // View type options for segmented buttons
  const viewTypeOptions = [
    {
      value: 'month',
      label: t('calendar.views.month'),
      icon: 'calendar-month',
    },
    {
      value: 'week',
      label: t('calendar.views.week'),
      icon: 'calendar-week',
    },
    {
      value: 'day',
      label: t('calendar.views.day'),
      icon: 'calendar-today',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]} testID={testID}>
      {/* Navigation Controls */}
      <View style={styles.navigationRow}>
        {/* Previous Button */}
        <IconButton
          icon="chevron-left"
          size={24}
          iconColor={theme.colors.primary}
          onPress={onPrevious}
          style={styles.navButton}
          testID={`${testID}-previous`}
        />

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text
            variant="titleMedium"
            style={[styles.title, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {getTitle()}
          </Text>
        </View>

        {/* Next Button */}
        <IconButton
          icon="chevron-right"
          size={24}
          iconColor={theme.colors.primary}
          onPress={onNext}
          style={styles.navButton}
          testID={`${testID}-next`}
        />
      </View>

      {/* View Type Selector and Today Button */}
      <View style={styles.controlRow}>
        {/* View Type Segmented Buttons */}
        <View style={styles.segmentedButtonsContainer}>
          <SegmentedButtons
            value={viewType}
            onValueChange={(value) => onViewTypeChange(value as CalendarViewType)}
            buttons={viewTypeOptions}
            density="small"
            style={styles.segmentedButtons}
          />
        </View>

        {/* Today Button */}
        <IconButton
          icon="calendar-today"
          size={20}
          iconColor={theme.colors.tertiary}
          onPress={onToday}
          style={[styles.todayButton, { backgroundColor: theme.colors.tertiaryContainer }]}
          testID={`${testID}-today`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    margin: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segmentedButtonsContainer: {
    flex: 1,
    marginRight: 8,
  },
  segmentedButtons: {
    flex: 1,
  },
  todayButton: {
    margin: 0,
  },
});

export default CalendarHeader;
