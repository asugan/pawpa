import { EVENT_TYPES } from './index';

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
  other: 'calendar',
} as const;

// Event Type Colors (Rainbow Pastel Theme)
export const EVENT_TYPE_COLORS = {
  feeding: '#FFB3D1',   // Pink
  exercise: '#B3FFD9',  // Mint
  grooming: '#C8B3FF', // Lavender
  play: '#FFDAB3',     // Peach
  training: '#FFF3B3', // Yellow
  vet_visit: '#FF9999', // Red
  walk: '#B3E5FF',     // Sky Blue
  bath: '#E5B3FF',     // Purple
  other: '#CCCCCC',    // Gray
} as const;

// Helper function to get event type icon
export const getEventTypeIcon = (eventType: string): string => {
  return EVENT_TYPE_ICONS[eventType as keyof typeof EVENT_TYPE_ICONS] || EVENT_TYPE_ICONS.other;
};

// Helper function to get event type color
export const getEventTypeColor = (eventType: string): string => {
  return EVENT_TYPE_COLORS[eventType as keyof typeof EVENT_TYPE_COLORS] || EVENT_TYPE_COLORS.other;
};

// Helper function to get event type label with i18n support
export const getEventTypeLabel = (eventType: string, t: any): string => {
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
  other: 60,
} as const;