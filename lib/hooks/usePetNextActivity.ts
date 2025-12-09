import { useEvents } from './useEvents';
import { useHealthRecords } from './useHealthRecords';
import { useActiveFeedingSchedulesByPet } from './useFeedingSchedules';
import { useDeviceLanguage } from './useDeviceLanguage';
import { useMemo } from 'react';
import { NextActivity, getNextActivityForPet } from '@/lib/utils/activityUtils';


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

  // Calculate next activity using deep memoization to prevent unnecessary re-calculations
  // The filtering logic is now centralized in getNextActivityForPet to ensure consistency and correctness
  const nextActivity = useMemo(() => {
    if (!petId) return null;

    return getNextActivityForPet({
      events,
      healthRecords,
      feedingSchedules,
      locale: currentLanguage
    });
  }, [petId, events, healthRecords, feedingSchedules, currentLanguage]);

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