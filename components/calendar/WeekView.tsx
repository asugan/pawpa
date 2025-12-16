import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  differenceInMinutes,
} from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Event } from '../../lib/types';
import { getEventColor } from '@/lib/utils/eventColors';

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  onEventPress?: (event: Event) => void;
  testID?: string;
}

const { width } = Dimensions.get('window');
const HOUR_HEIGHT = 60; // Height for each hour slot
const TIME_LABEL_WIDTH = 50; // Width for time labels column
const DAY_WIDTH = (width - TIME_LABEL_WIDTH) / 7; // Divide remaining width by 7 days
const HOURS_START = 0; // Start at midnight (00:00)
const HOURS_END = 23; // End at 11 PM (23:59)
const TOTAL_HOURS = HOURS_END - HOURS_START + 1;

export function WeekView({
  currentDate,
  events,
  onEventPress,
  testID,
}: WeekViewProps) {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
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
    // Extract UTC date portion to avoid timezone conversion issues
    const dayStr = day.toISOString().substring(0, 10);

    const filtered = events.filter((event) => {
      // Extract date portion from event startTime (ISO string)
      const eventDateStr = event.startTime.substring(0, 10);
      const matches = eventDateStr === dayStr;
      if (events.length > 0) {
        console.log(`🔍 WeekView Day ${dayStr}: Event "${event.title}" eventDateStr=${eventDateStr}, matches=${matches}`);
      }
      return matches;
    });
    if (events.length > 0) {
      console.log(`  WeekView ${dayStr}: ${filtered.length} events matched`);
    }
    return filtered;
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID={testID}>
      {/* Week Day Headers */}
      <View style={[styles.headerRow, { borderBottomColor: theme.colors.outlineVariant }]}>
        <View style={[styles.timeLabelsHeader, { width: TIME_LABEL_WIDTH }]} />
        {weekDays.map((day) => {
          const isTodayDate = isToday(day);
          return (
            <View
              key={day.toISOString()}
              style={[
                styles.dayHeaderCell,
                {
                  width: DAY_WIDTH,
                  borderLeftColor: theme.colors.outlineVariant,
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
                variant="titleSmall"
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
          );
        })}
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.weekContent}>
          {/* Time Labels Column */}
          <View style={[styles.timeLabelsColumn, { width: TIME_LABEL_WIDTH }]}>
            {renderTimeLabels()}
          </View>

          {/* Week Days Grid */}
          <View style={styles.daysContainer}>
            {weekDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isTodayDate = isToday(day);

              return (
                <View key={day.toISOString()} style={[styles.dayColumn, { width: DAY_WIDTH, borderLeftColor: theme.colors.outlineVariant }]}>
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
                      const eventColor = getEventColor(event.type, theme);

                      return (
                        <Pressable
                          key={event._id}
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
                          testID={`${testID}-event-${event._id}`}
                        >
                          <Text
                            variant="labelSmall"
                            style={[styles.eventTitle, { color: theme.colors.onSurface }]}
                            numberOfLines={2}
                          >
                            {event.title}
                          </Text>
                          {style.height > 30 && (
                            <Text
                              variant="labelSmall"
                              style={[styles.eventTime, { color: theme.colors.onSurface }]}
                              numberOfLines={1}
                            >
                              {format(new Date(event.startTime), 'HH:mm')}
                            </Text>
                          )}
                        </Pressable>
                      );
                    })}

                    {/* Current Time Indicator */}
                    {isTodayDate && renderCurrentTimeIndicator()}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

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
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  timeLabelsHeader: {
    height: 50,
  },
  dayHeaderCell: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
  },
  dayName: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 14,
  },
  scrollContent: {
    flex: 1,
  },
  weekContent: {
    flexDirection: 'row',
  },
  timeLabelsColumn: {
    // Width set dynamically
  },
  timeLabel: {
    height: HOUR_HEIGHT,
    paddingTop: 4,
    paddingRight: 4,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
  },
  timeLabelText: {
    fontSize: 10,
    fontWeight: '500',
  },
  daysContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  dayColumn: {
    // Width set dynamically
    borderLeftWidth: 1,
  },
  timeGrid: {
    position: 'relative',
  },
  hourLine: {
    width: '100%',
  },
  eventBlock: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderRadius: 3,
    padding: 2,
    borderLeftWidth: 2,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.5,
  },
  eventTitle: {
    fontWeight: '600',
    fontSize: 9,
  },
  eventTime: {
    opacity: 0.7,
    fontSize: 8,
    marginTop: 1,
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
