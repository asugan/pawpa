import { Event, HealthRecord, FeedingSchedule } from '@/lib/types';
import { dateUtils } from './date';
import { formatDistanceToNow, format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

export interface NextActivity {
  label: string;
  time: string;
  color: string;
  priority: number;
  type: 'vaccination' | 'medication' | 'vet' | 'feeding' | 'event';
  originalData?: Event | HealthRecord | FeedingSchedule;
}

export interface ActivityCalculationParams {
  events: Event[];
  healthRecords: HealthRecord[];
  feedingSchedules: FeedingSchedule[];
  locale?: string;
}

/**
 * Calculate the priority score for an activity type
 * Lower numbers indicate higher priority (1 = highest priority)
 */
export const calculateActivityPriority = (activityType: NextActivity['type']): number => {
  switch (activityType) {
    case 'vaccination':
    case 'medication':
      return 1; // Highest priority - health critical
    case 'vet':
      return 2; // High priority - health important
    case 'feeding':
      return 3; // Medium priority - routine care
    case 'event':
      return 4; // Lowest priority - general activities
    default:
      return 5;
  }
};

/**
 * Format activity time based on locale and proximity to current time
 * Simplified and more robust to avoid invalid date errors
 */
export const formatActivityTime = (time: Date, locale: string = 'en'): string => {
  // Validate input date first
  if (!time || isNaN(time.getTime())) {
    return '';
  }

  const dateLocale = locale === 'tr' ? tr : enUS;
  const now = new Date();

  // If the activity is within the next 24 hours, show relative time
  const hoursDiff = time.getTime() - now.getTime();
  const hoursAbs = Math.abs(hoursDiff);

  if (hoursAbs <= 24 * 60 * 60 * 1000) { // Within 24 hours
    try {
      return formatDistanceToNow(time, {
        addSuffix: true,
        locale: dateLocale
      });
    } catch (error) {
      console.warn('Error formatting relative time:', error);
      return time.toLocaleTimeString(dateLocale === enUS ? 'en-US' : 'tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  // Otherwise show absolute time
  try {
    return format(time, 'MMM d, HH:mm', {
      locale: dateLocale
    });
  } catch (error) {
    console.warn('Error formatting absolute time:', error);
    // Fallback to native date formatting
    return time.toLocaleDateString(dateLocale === enUS ? 'en-US' : 'tr-TR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

/**
 * Get the next activity for a pet based on all available data
 */
export const getNextActivityForPet = ({
  events,
  healthRecords,
  feedingSchedules,
  locale = 'en'
}: ActivityCalculationParams): NextActivity | null => {
  const now = new Date();
  const activities: NextActivity[] = [];

  // Process health records (vaccinations and medications)
  const upcomingHealthRecords = healthRecords
    .filter(record => {
      if (record.type !== 'vaccination' && record.type !== 'medication') {
        return false;
      }

      const recordDate = new Date(record.date);
      // Validate the date is valid and in the future
      return !isNaN(recordDate.getTime()) && recordDate >= now;
    })
    .map(record => {
      const recordDate = new Date(record.date);
      return {
        type: record.type as NextActivity['type'],
        label: record.type === 'vaccination' ? 'Vaccination' : 'Medication',
        time: formatActivityTime(recordDate, locale),
        priority: calculateActivityPriority(record.type as NextActivity['type']),
        color: record.type === 'vaccination' ? '#FF6B35' : '#F7931E', // Orange tones
        originalData: record
      };
    })
    .filter(activity => activity.time !== ''); // Remove activities with invalid time formatting

  activities.push(...upcomingHealthRecords);

  // Process events (vet appointments and other events)
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.startTime);
      // Validate the date is valid and in the future
      return !isNaN(eventDate.getTime()) && eventDate >= now;
    })
    .map(event => {
      const eventDate = new Date(event.startTime);
      const isVetAppointment = event.type.toLowerCase().includes('vet') ||
                               event.title.toLowerCase().includes('vet');

      return {
        type: isVetAppointment ? 'vet' : 'event',
        label: event.title,
        time: formatActivityTime(eventDate, locale),
        priority: calculateActivityPriority(isVetAppointment ? 'vet' : 'event'),
        color: isVetAppointment ? '#9C27B0' : '#2196F3', // Purple for vet, blue for events
        originalData: event
      } as NextActivity;
    })
    .filter(activity => activity.time !== ''); // Remove activities with invalid time formatting

  activities.push(...upcomingEvents);

  // Process feeding schedules
  const activeFeedingSchedules = feedingSchedules
    .filter(schedule => schedule.isActive);

  if (activeFeedingSchedules.length > 0) {
    // Calculate next feeding times for each active schedule
    const now = new Date();
    const nextFeedings = activeFeedingSchedules
      .map(schedule => {
        // Get the next feeding time based on the schedule
        const scheduleTime = new Date(schedule.time);

        // Validate the schedule time is valid
        if (isNaN(scheduleTime.getTime())) {
          return null;
        }

        let nextFeedingTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          scheduleTime.getHours(),
          scheduleTime.getMinutes()
        );

        // If the time has passed today, schedule for tomorrow
        if (nextFeedingTime <= now) {
          nextFeedingTime = new Date(nextFeedingTime.getTime() + 24 * 60 * 60 * 1000);
        }

        return {
          schedule,
          nextTime: nextFeedingTime
        };
      })
      .filter(feeding => feeding !== null); // Remove invalid feeding schedules

    if (nextFeedings.length > 0) {
      // Find the soonest feeding time
      const soonestFeeding = nextFeedings.reduce((soonest, current) =>
        current!.nextTime < soonest!.nextTime ? current : soonest
      );

      const feedingTime = formatActivityTime(soonestFeeding!.nextTime, locale);
      if (feedingTime !== '') { // Only add if time formatting is valid
        activities.push({
          type: 'feeding',
          label: 'Feeding',
          time: feedingTime,
          priority: calculateActivityPriority('feeding'),
          color: '#4CAF50', // Green for feeding
          originalData: soonestFeeding!.schedule
        } as NextActivity);
      }
    }
  }

  // Sort by priority (ascending) and then by time (ascending)
  activities.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }

    // If priorities are equal, sort by time
    const timeA = a.originalData ?
      ('startTime' in a.originalData ? new Date(a.originalData.startTime) :
       'date' in a.originalData ? new Date(a.originalData.date) :
       'time' in a.originalData ? new Date(a.originalData.time) : new Date()) :
      new Date();

    const timeB = b.originalData ?
      ('startTime' in b.originalData ? new Date(b.originalData.startTime) :
       'date' in b.originalData ? new Date(b.originalData.date) :
       'time' in b.originalData ? new Date(b.originalData.time) : new Date()) :
      new Date();

    return timeA.getTime() - timeB.getTime();
  });

  return activities.length > 0 ? activities[0] : null;
};