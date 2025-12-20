import { TranslationFunction } from '@/lib/types';

// Event Type Icons
export const EVENT_TYPE_ICONS = {
  feeding: 'food',
  exercise: 'run',
  grooming: 'content-cut',
  play: 'tennis',
  training: 'school',
  vet_visit: 'hospital',
  walk: 'walk',
  bath: 'water',
  vaccination: 'needle',
  medication: 'pill',
  other: 'calendar',
} as const;

// Helper function to get event type icon
export const getEventTypeIcon = (eventType: string): string => {
  return EVENT_TYPE_ICONS[eventType as keyof typeof EVENT_TYPE_ICONS] || EVENT_TYPE_ICONS.other;
};

// Helper function to get event type label with i18n support
export const getEventTypeLabel = (eventType: string, t: TranslationFunction): string => {
  try {
    return t(`eventTypes.${eventType}`, eventType);
  } catch {
    return eventType;
  }
};

// Event type specific default durations (in minutes)
export const EVENT_TYPE_DEFAULT_DURATIONS = {
  feeding: 30,
  exercise: 60,
  grooming: 90,
  play: 45,
  training: 60,
  vet_visit: 120,
  walk: 30,
  bath: 45,
  vaccination: 30,
  medication: 30,
  other: 60,
} as const;

// Event type specific reminder defaults (in minutes before event)
export const EVENT_TYPE_DEFAULT_REMINDERS = {
  feeding: 15,
  exercise: 30,
  grooming: 60,
  play: 15,
  training: 30,
  vet_visit: 1440, // 24 hours
  walk: 15,
  bath: 30,
  vaccination: 1440, // 24 hours
  medication: 60,
  other: 60,
} as const;
