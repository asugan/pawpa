import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  differenceInMinutes,
  startOfDay,
} from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Event } from '../../lib/types';

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  onEventPress?: (event: Event) => void;
  testID?: string;
}

const { width, height } = Dimensions.get('window');
const HOUR_HEIGHT = 60; // Height for each hour slot
const DAY_WIDTH = width - 60; // Width for day column (minus time labels)
const HOURS_START = 6; // Start at 6 AM
const HOURS_END = 23; // End at 11 PM
const TOTAL_HOURS = HOURS_END - HOURS_START + 1;

export function WeekView({
  currentDate,
  events,
  onEventPress,
  testID,
}: WeekViewProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language === 'tr' ? tr : enUS;
  const scrollViewRef = useRef<ScrollView>(null);

  // Get all days in the current week
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Scroll to current time on mount
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    if (currentHour >= HOURS_START && currentHour <= HOURS_END) {
      const scrollPosition = ((currentHour - HOURS_START) * HOUR_HEIGHT) + (currentMinutes / 60 * HOUR_HEIGHT) - 100;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollPosition),
          animated: true,
        });
      }, 100);
    }
  }, []);

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return isSameDay(eventDate, day);
    });
  };

  // Calculate event position and size
  const getEventStyle = (event: Event) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = event.endTime ? new Date(event.endTime) : new Date(eventStart.getTime() + 60 * 60 * 1000); // Default 1 hour

    const eventHour = eventStart.getHours();
    const eventMinute = eventStart.getMinutes();

    // Calculate top position
    const minutesFromStart = (eventHour - HOURS_START) * 60 + eventMinute;
    const top = (minutesFromStart / 60) * HOUR_HEIGHT;

    // Calculate height
    const durationMinutes = differenceInMinutes(eventEnd, eventStart);
    const height = (durationMinutes / 60) * HOUR_HEIGHT;

    return {
      top,
      height: Math.max(height, 30), // Minimum height
    };
  };

  // Render time labels
  const renderTimeLabels = () => {
    const hours = [];
    for (let hour = HOURS_START; hour <= HOURS_END; hour++) {
      hours.push(
        <View
          key={hour}
          style={[
            styles.timeLabel,
            {
              height: HOUR_HEIGHT,
              borderBottomColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <Text
            variant="labelSmall"
            style={[
              styles.timeLabelText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
          </Text>
        </View>
      );
    }
    return hours;
  };

  // Render current time indicator
  const renderCurrentTimeIndicator = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    if (currentHour < HOURS_START || currentHour > HOURS_END) {
      return null;
    }

    const minutesFromStart = (currentHour - HOURS_START) * 60 + currentMinutes;
    const top = (minutesFromStart / 60) * HOUR_HEIGHT;

    return (
      <View
        style={[
          styles.currentTimeLine,
          {
            top,
            backgroundColor: theme.colors.error,
          },
        ]}
      >
        <View
          style={[
            styles.currentTimeDot,
            {
              backgroundColor: theme.colors.error,
            },
          ]}
        />
      </View>
    );
  };

  // Render a single day column
  const renderDayColumn = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    const isTodayDate = isToday(day);

    return (
      <View key={day.toISOString()} style={styles.dayColumn}>
        {/* Day Header */}
        <View
          style={[
            styles.dayHeader,
            {
              backgroundColor: isTodayDate
                ? theme.colors.primaryContainer
                : theme.colors.surface,
            },
          ]}
        >
          <Text
            variant="labelSmall"
            style={[
              styles.dayName,
              {
                color: isTodayDate
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {format(day, 'EEE', { locale }).toUpperCase()}
          </Text>
          <Text
            variant="titleMedium"
            style={[
              styles.dayNumber,
              {
                color: isTodayDate
                  ? theme.colors.primary
                  : theme.colors.onSurface,
                fontWeight: isTodayDate ? '700' : '600',
              },
            ]}
          >
            {format(day, 'd')}
          </Text>
        </View>

        {/* Time Grid */}
        <View style={styles.timeGrid}>
          {/* Hour Lines */}
          {Array.from({ length: TOTAL_HOURS }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.hourLine,
                {
                  height: HOUR_HEIGHT,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.outlineVariant,
                },
              ]}
            />
          ))}

          {/* Events */}
          {dayEvents.map((event) => {
            const style = getEventStyle(event);
            const eventColor = getEventColor(event.type);

            return (
              <Pressable
                key={event.id}
                style={[
                  styles.eventBlock,
                  {
                    top: style.top,
                    height: style.height,
                    backgroundColor: eventColor,
                    borderLeftColor: darkenColor(eventColor, 20),
                  },
                ]}
                onPress={() => onEventPress?.(event)}
                testID={`${testID}-event-${event.id}`}
              >
                <Text
                  variant="labelSmall"
                  style={styles.eventTitle}
                  numberOfLines={2}
                >
                  {event.title}
                </Text>
                <Text
                  variant="labelSmall"
                  style={styles.eventTime}
                  numberOfLines={1}
                >
                  {format(new Date(event.startTime), 'HH:mm')}
                </Text>
              </Pressable>
            );
          })}

          {/* Current Time Indicator */}
          {isTodayDate && renderCurrentTimeIndicator()}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID={testID}>
      <View style={styles.content}>
        {/* Time Labels Column */}
        <View style={styles.timeLabelsColumn}>
          <View style={styles.timeLabelsHeader} />
          <ScrollView
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          >
            {renderTimeLabels()}
          </ScrollView>
        </View>

        {/* Days Scroll View */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.daysScrollView}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
          >
            {weekDays.map((day) => renderDayColumn(day))}
          </ScrollView>
        </ScrollView>
      </View>
    </View>
  );
}

// Helper function to get event color based on type
const getEventColor = (eventType: string): string => {
  const colors: { [key: string]: string } = {
    feeding: '#FFB3D1',
    exercise: '#B3FFD9',
    grooming: '#C8B3FF',
    play: '#FFDAB3',
    training: '#FFF3B3',
    vet_visit: '#FF9999',
    walk: '#B3E5FF',
    bath: '#E5B3FF',
    other: '#CCCCCC',
  };
  return colors[eventType] || colors.other;
};

// Helper function to darken a color
const darkenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  timeLabelsColumn: {
    width: 60,
  },
  timeLabelsHeader: {
    height: 60,
  },
  timeLabel: {
    paddingTop: 4,
    paddingRight: 8,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
  },
  timeLabelText: {
    fontSize: 11,
    fontWeight: '500',
  },
  daysScrollView: {
    flex: 1,
  },
  dayColumn: {
    width: DAY_WIDTH,
  },
  dayHeader: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 18,
  },
  timeGrid: {
    position: 'relative',
  },
  hourLine: {
    width: '100%',
  },
  eventBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 4,
    padding: 4,
    borderLeftWidth: 3,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  eventTitle: {
    fontWeight: '600',
    color: '#000',
    fontSize: 11,
  },
  eventTime: {
    color: '#000',
    opacity: 0.7,
    fontSize: 10,
    marginTop: 2,
  },
  currentTimeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    zIndex: 10,
  },
  currentTimeDot: {
    position: 'absolute',
    left: -4,
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default WeekView;
