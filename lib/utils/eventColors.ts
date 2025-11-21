import { Theme } from '@/lib/theme/types';

/**
 * Gets the color for a specific event type from the theme
 * @param eventType - The type of event (feeding, exercise, grooming, etc.)
 * @param theme - The current theme object
 * @returns The color string for the event type
 */
export const getEventColor = (eventType: string, theme: Theme): string => {
  const eventColorMap: { [key: string]: keyof typeof theme.colors } = {
    feeding: 'eventFeeding',
    exercise: 'eventExercise',
    grooming: 'eventGrooming',
    play: 'eventPlay',
    training: 'eventTraining',
    vet_visit: 'eventVetVisit',
    walk: 'eventWalk',
    bath: 'eventBath',
    other: 'eventOther',
  };

  const colorKey = eventColorMap[eventType] || eventColorMap.other;
  return theme.colors[colorKey as keyof typeof theme.colors] as string;
};

/**
 * Gets the text color for event content based on the theme
 * @param theme - The current theme object
 * @returns The text color string (uses theme.colors.onSurface)
 */
export const getEventTextColor = (theme: Theme): string => {
  return theme.colors.onSurface;
};
