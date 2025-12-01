import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import {
  format,
  differenceInMinutes,
} from 'date-fns';
import { Event } from '../../lib/types';
import { getEventColor } from '@/lib/utils/eventColors';

interface DayViewProps {
  currentDate: Date;
  events: Event[];
  onEventPress?: (event: Event) => void;
  testID?: string;
}

const HOUR_HEIGHT = 80; // Height for each hour slot (larger than WeekView)
const HOURS_START = 0; // Start at midnight (00:00)
const HOURS_END = 23; // End at 11 PM (23:59)

export function DayView({
  currentDate,
  events,
  onEventPress,
  testID,
}: DayViewProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  // Filter events for the current day
  const dayEvents = useMemo(() => {
    console.log('🔍 DayView Filter Debug:');
    console.log('  currentDate:', currentDate);
    console.log('  total events:', events.length);

    // Extract UTC date portion to avoid timezone conversion issues
    const currentDateStr = currentDate.toISOString().substring(0, 10);
    console.log('  currentDateStr:', currentDateStr);

    const filtered = events
      .filter((event) => {
        // Extract date portion from event startTime (ISO string)
        const eventDateStr = event.startTime.substring(0, 10);
        const matches = eventDateStr === currentDateStr;
        console.log(`  Event "${event.title}": startTime=${event.startTime}, eventDateStr=${eventDateStr}, matches=${matches}`);
        return matches;
      })
      .sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });

    console.log('  ✅ Filtered events:', filtered.length);
    return filtered;
  }, [events, currentDate]);

  // Scroll to current time on mount (if viewing today)
  useEffect(() => {
    const now = new Date();
    // Check if currentDate is today using UTC date comparison
    const nowStr = now.toISOString().substring(0, 10);
    const currentDateStr = currentDate.toISOString().substring(0, 10);
    if (nowStr !== currentDateStr) return;

    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    if (currentHour >= HOURS_START && currentHour <= HOURS_END) {
      const scrollPosition =
        (currentHour - HOURS_START) * HOUR_HEIGHT +
        (currentMinutes / 60) * HOUR_HEIGHT -
        100;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollPosition),
          animated: true,
        });
      }, 100);
    }
  }, [currentDate]);

  // Calculate event position and size
  const getEventStyle = (event: Event) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = event.endTime
      ? new Date(event.endTime)
      : new Date(eventStart.getTime() + 60 * 60 * 1000); // Default 1 hour

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
      height: Math.max(height, 40), // Minimum height
    };
  };

  // Render current time indicator
  const renderCurrentTimeIndicator = () => {
    const now = new Date();
    // Check if currentDate is today using UTC date comparison
    const nowStr = now.toISOString().substring(0, 10);
    const currentDateStr = currentDate.toISOString().substring(0, 10);
    if (nowStr !== currentDateStr) return null;

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
        <Text
          variant="labelSmall"
          style={[
            styles.currentTimeText,
            {
              color: theme.colors.error,
            },
          ]}
        >
          {format(now, 'HH:mm')}
        </Text>
      </View>
    );
  };

  // Render time labels and grid
  const renderTimeGrid = () => {
    const hours = [];
    for (let hour = HOURS_START; hour <= HOURS_END; hour++) {
      hours.push(
        <View
          key={hour}
          style={[
            styles.hourRow,
            {
              height: HOUR_HEIGHT,
              borderBottomColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.timeLabel}>
            <Text
              variant="labelMedium"
              style={[
                styles.timeLabelText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
            </Text>
          </View>
          <View style={styles.hourContent} />
        </View>
      );
    }
    return hours;
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID={testID}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.timelineContainer}>
          {/* Time Grid */}
          {renderTimeGrid()}

          {/* Events Overlay */}
          <View style={styles.eventsOverlay}>
            {dayEvents.map((event) => {
              const style = getEventStyle(event);
              const eventColor = getEventColor(event.type, theme);

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
                  <View style={styles.eventContent}>
                    {/* Event Time */}
                    <Text
                      variant="labelSmall"
                      style={[styles.eventTime, { color: theme.colors.onSurface }]}
                      numberOfLines={1}
                    >
                      {format(new Date(event.startTime), 'HH:mm')}
                      {event.endTime &&
                        ` - ${format(new Date(event.endTime), 'HH:mm')}`}
                    </Text>

                    {/* Event Title */}
                    <Text
                      variant="titleSmall"
                      style={[styles.eventTitle, { color: theme.colors.onSurface }]}
                      numberOfLines={2}
                    >
                      {event.title}
                    </Text>

                    {/* Event Description */}
                    {event.description && style.height > 60 && (
                      <Text
                        variant="bodySmall"
                        style={[styles.eventDescription, { color: theme.colors.onSurface }]}
                        numberOfLines={2}
                      >
                        {event.description}
                      </Text>
                    )}

                    {/* Event Location */}
                    {event.location && style.height > 80 && (
                      <View style={styles.eventLocation}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <Text
                          variant="labelSmall"
                          style={[styles.locationText, { color: theme.colors.onSurface }]}
                          numberOfLines={1}
                        >
                          {event.location}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}

            {/* Current Time Indicator */}
            {renderCurrentTimeIndicator()}
          </View>
        </View>

        {/* Empty State */}
        {dayEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Text
              variant="bodyLarge"
              style={[
                styles.emptyStateText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {t('calendar.noEventsToday')}
            </Text>
          </View>
        )}
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
  scrollView: {
    flex: 1,
  },
  timelineContainer: {
    position: 'relative',
    paddingHorizontal: 16,
  },
  hourRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  timeLabel: {
    width: 60,
    paddingTop: 4,
    paddingRight: 8,
    alignItems: 'flex-end',
  },
  timeLabelText: {
    fontWeight: '500',
  },
  hourContent: {
    flex: 1,
  },
  eventsOverlay: {
    position: 'absolute',
    top: 0,
    left: 76, // 60 (time label) + 16 (padding)
    right: 16,
    bottom: 0,
  },
  eventBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 4,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  eventContent: {
    flex: 1,
  },
  eventTime: {
    fontWeight: '600',
    opacity: 0.7,
    fontSize: 11,
    marginBottom: 4,
  },
  eventTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  eventDescription: {
    opacity: 0.8,
    marginBottom: 4,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    opacity: 0.7,
    flex: 1,
  },
  currentTimeLine: {
    position: 'absolute',
    left: -76,
    right: 0,
    height: 2,
    zIndex: 10,
  },
  currentTimeDot: {
    position: 'absolute',
    left: 54,
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentTimeText: {
    position: 'absolute',
    left: -60,
    top: -8,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
  },
});

export default DayView;
