import { useQueryClient } from '@tanstack/react-query';
import { petKeys } from './usePets';
import { healthRecordKeys } from './useHealthRecords';
import { eventKeys } from './useEvents';
import { feedingScheduleKeys } from './useFeedingSchedules';

export function usePrefetchData() {
  const queryClient = useQueryClient();

  const prefetchPetDetails = (petId: string) => {
    queryClient.prefetchQuery({
      queryKey: petKeys.detail(petId),
      queryFn: () => import('@/lib/services/petService').then(m => m.petService.getPetById(petId)),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const prefetchPetHealthRecords = (petId: string) => {
    queryClient.prefetchQuery({
      queryKey: healthRecordKeys.list(petId),
      queryFn: () => import('@/lib/services/healthRecordService').then(m => m.healthRecordService.getHealthRecordsByPetId(petId)),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const prefetchPetEvents = (petId: string) => {
    queryClient.prefetchQuery({
      queryKey: eventKeys.list(petId),
      queryFn: () => import('@/lib/services/eventService').then(m => m.eventService.getEventsByPetId(petId)),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const prefetchPetFeedingSchedules = (petId: string) => {
    queryClient.prefetchQuery({
      queryKey: feedingScheduleKeys.list(petId),
      queryFn: () => import('@/lib/services/feedingScheduleService').then(m => m.feedingScheduleService.getFeedingSchedulesByPetId(petId)),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };

  const prefetchRelatedData = (petId: string) => {
    prefetchPetDetails(petId);
    prefetchPetHealthRecords(petId);
    prefetchPetEvents(petId);
    prefetchPetFeedingSchedules(petId);
  };

  const prefetchUpcomingEvents = () => {
    queryClient.prefetchQuery({
      queryKey: eventKeys.upcoming(),
      queryFn: () => import('@/lib/services/eventService').then(m => m.eventService.getUpcomingEvents()),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };

  const prefetchTodayEvents = () => {
    queryClient.prefetchQuery({
      queryKey: eventKeys.today(),
      queryFn: () => import('@/lib/services/eventService').then(m => m.eventService.getTodayEvents()),
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  const prefetchActiveFeedingSchedules = () => {
    queryClient.prefetchQuery({
      queryKey: feedingScheduleKeys.active(),
      queryFn: () => import('@/lib/services/feedingScheduleService').then(m => m.feedingScheduleService.getActiveFeedingSchedules()),
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  const prefetchUpcomingVaccinations = () => {
    queryClient.prefetchQuery({
      queryKey: healthRecordKeys.upcoming(),
      queryFn: () => import('@/lib/services/healthRecordService').then(m => m.healthRecordService.getUpcomingRecords()),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Smart prefetching based on user context
  const prefetchForPetDetailsView = (petId: string) => {
    prefetchRelatedData(petId);
    prefetchUpcomingVaccinations();
  };

  const prefetchForHealthTab = () => {
    prefetchUpcomingVaccinations();
    prefetchTodayEvents();
  };

  const prefetchForCalendarTab = (date?: string) => {
    prefetchTodayEvents();
    if (date && date !== new Date().toISOString().split('T')[0]) {
      queryClient.prefetchQuery({
        queryKey: eventKeys.calendar(date),
        queryFn: () => import('@/lib/services/eventService').then(m => m.eventService.getEventsByDate(date)),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    }
  };

  return {
    prefetchPetDetails,
    prefetchPetHealthRecords,
    prefetchPetEvents,
    prefetchPetFeedingSchedules,
    prefetchRelatedData,
    prefetchUpcomingEvents,
    prefetchTodayEvents,
    prefetchActiveFeedingSchedules,
    prefetchUpcomingVaccinations,
    prefetchForPetDetailsView,
    prefetchForHealthTab,
    prefetchForCalendarTab,
  };
}