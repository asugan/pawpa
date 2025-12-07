import { useEvents } from './useEvents';
import { useHealthRecords } from './useHealthRecords';
import { useActiveFeedingSchedulesByPet } from './useFeedingSchedules';
import { useDeviceLanguage } from './useDeviceLanguage';
import { useMemo } from 'react';
import { NextActivity, getNextActivityForPet } from '@/lib/utils/activityUtils';
import { filterUpcomingEvents } from '@/lib/utils/events';

interface UsePetNextActivityReturn {
  nextActivity: NextActivity | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook that combines data from multiple sources to determine the next activity for a pet
 * Optimized for performance with proper caching, filtering, and memoization
 *
 * @param petId - The ID of the pet to get the next activity for
 * @returns Object containing the next activity, loading state, and any errors
 */
export const usePetNextActivity = (petId: string): UsePetNextActivityReturn => {
  const { currentLanguage = 'en' } = useDeviceLanguage();

  // Get data from all relevant sources with optimized caching
  const { data: events = [], isLoading: isLoadingEvents, error: eventsError } = useEvents(petId);
  const { data: healthRecords = [], isLoading: isLoadingHealth, error: healthError } = useHealthRecords(petId);
  const { data: feedingSchedules = [], isLoading: isLoadingFeeding, error: feedingError } = useActiveFeedingSchedulesByPet(petId);

  // Pre-filter events for only upcoming activities to reduce computational load
  // using stable reference pattern for better performance
  const upcomingEvents = useMemo(() => {
    if (!events.length) return [];

    const filtered = filterUpcomingEvents(events, 30, 20); // Look ahead 30 days, max 20 events

    // Additional client-side filtering by pet if needed
    // (events should already be filtered by petId from useEvents)
    return filtered;
  }, [events]);

  // Filter health records for only relevant types and upcoming dates
  // Use stable timestamp comparison to avoid unnecessary recalculations
  const upcomingHealthRecords = useMemo(() => {
    if (!healthRecords.length) return [];

    const now = new Date();
    const healthFilter = healthRecords.filter(record => {
      if (record.type !== 'vaccination' && record.type !== 'medication') {
        return false;
      }
      const recordDate = new Date(record.date);
      return recordDate >= now;
    });

    return healthFilter;
  }, [healthRecords]);

  // Memoize feeding schedules (they should already be filtered by petId)
  const activeFeedingSchedules = useMemo(() => {
    return feedingSchedules.filter(schedule => schedule.isActive);
  }, [feedingSchedules]);

  // Calculate next activity using deep memoization to prevent unnecessary re-calculations
  // Only recalculate when actual data changes, not when dependencies are recreated
  const nextActivity = useMemo(() => {
    if (!petId) return null;

    return getNextActivityForPet({
      events: upcomingEvents,
      healthRecords: upcomingHealthRecords,
      feedingSchedules: activeFeedingSchedules,
      locale: currentLanguage
    });
  }, [petId, upcomingEvents, upcomingHealthRecords, activeFeedingSchedules, currentLanguage]);

  // Combine loading states with optimized checking
  const isLoading = useMemo(() => {
    return isLoadingEvents || isLoadingHealth || isLoadingFeeding;
  }, [isLoadingEvents, isLoadingHealth, isLoadingFeeding]);

  // Combine errors with stable error handling
  const error = useMemo(() => {
    return (eventsError || healthError || feedingError) as Error | null;
  }, [eventsError, healthError, feedingError]);

  return {
    nextActivity,
    isLoading,
    error,
  };
};