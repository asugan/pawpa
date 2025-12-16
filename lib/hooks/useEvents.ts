import { eventService } from '@/lib/services/eventService';
import { CreateEventInput, Event, UpdateEventInput } from '@/lib/types';
import { CACHE_TIMES } from '@/lib/config/queryConfig';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateResource, useDeleteResource, useUpdateResource } from './useCrud';
import { createQueryKeys } from './core/createQueryKeys';
import { useResource } from './core/useResource';
import { useResources } from './core/useResources';
import { useConditionalQuery } from './core/useConditionalQuery';
import { useMemo } from 'react';
import { filterUpcomingEvents, groupEventsByTime, EventGroups } from '@/lib/utils/events';

// Query keys factory
const baseEventKeys = createQueryKeys('events');

// Extended query keys with custom keys
export const eventKeys = {
  ...baseEventKeys,
  calendar: (date: string) => [...baseEventKeys.all, 'calendar', date] as const,
  upcoming: () => [...baseEventKeys.all, 'upcoming'] as const,
  today: () => [...baseEventKeys.all, 'today'] as const,
  type: (petId: string, type: string) => [...baseEventKeys.all, 'type', petId, type] as const,
};

// Hooks
export const useEvents = (petId: string) => {
  return useResources<Event>({
    queryKey: eventKeys.list({ petId }),
    queryFn: () => eventService.getEventsByPetId(petId),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!petId,
  });
};

export const useEvent = (id: string) => {
  return useResource<Event>({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventService.getEventById(id),
    staleTime: CACHE_TIMES.LONG,
    enabled: !!id,
  });
};

export const useCalendarEvents = (date: string, options?: { enabled?: boolean }) => {
  return useConditionalQuery<Event[]>({
    queryKey: eventKeys.calendar(date),
    queryFn: () => eventService.getEventsByDate(date),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: options?.enabled !== undefined ? (options.enabled && !!date) : !!date,
    defaultValue: [],
  });
};

export const useUpcomingEvents = () => {
  return useResources<Event>({
    queryKey: eventKeys.upcoming(),
    queryFn: () => eventService.getUpcomingEvents(),
    staleTime: CACHE_TIMES.SHORT,
    refetchInterval: CACHE_TIMES.MEDIUM,
  });
};

export const useTodayEvents = () => {
  return useResources<Event>({
    queryKey: eventKeys.today(),
    queryFn: () => eventService.getTodayEvents(),
    staleTime: CACHE_TIMES.VERY_SHORT,
    refetchInterval: CACHE_TIMES.VERY_SHORT,
  });
};

/**
 * Combined hook that provides filtered and grouped upcoming events
 * Combines useUpcomingEvents with filtering and grouping logic
 *
 * @param daysToShow - Number of days to show from now (default: 7)
 * @param maxEvents - Maximum number of events to return (default: 5)
 * @returns Object containing:
 *   - upcomingEvents: Filtered array of events
 *   - eventGroups: Events grouped by time categories (now, today, tomorrow, thisWeek)
 *   - isLoading: Loading state
 *   - refetch: Function to refetch the data
 */
export const useGroupedUpcomingEvents = (daysToShow: number = 7, maxEvents: number = 5) => {
  const { data: allEvents = [], isLoading, refetch } = useUpcomingEvents();

  const upcomingEvents = useMemo(() => {
    return filterUpcomingEvents(allEvents, daysToShow, maxEvents);
  }, [allEvents, daysToShow, maxEvents]);

  const eventGroups = useMemo(() => {
    return groupEventsByTime(upcomingEvents);
  }, [upcomingEvents]);

  return {
    upcomingEvents,
    eventGroups,
    isLoading,
    refetch,
  };
};

export const useEventsByType = (petId: string, type: string) => {
  return useResources<Event>({
    queryKey: eventKeys.type(petId, type),
    queryFn: () => eventService.getEventsByPetId(petId),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!petId && !!type,
    select: (events) => events.filter((event: Event) => event.type === type),
  });
};

// Mutations
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useCreateResource<Event, CreateEventInput>(
    (data) => eventService.createEvent(data).then(res => res.data!),
    {
      listQueryKey: eventKeys.lists(),
      onSuccess: (newEvent) => {
        // Also update calendar and today events if applicable
        const eventDate = newEvent.startTime.split('T')[0];
        const today = new Date().toISOString().split('T')[0];

        if (eventDate === today) {
          queryClient.setQueryData(eventKeys.today(), (old: Event[] | undefined) =>
            old ? [...old, newEvent] : [newEvent]
          );
        }

        queryClient.setQueryData(eventKeys.calendar(eventDate), (old: Event[] | undefined) =>
          old ? [...old, newEvent] : [newEvent]
        );
      },
      onSettled: (newEvent) => {
        if (newEvent) {
          queryClient.invalidateQueries({ queryKey: eventKeys.list({ petId: newEvent.petId }) });
          queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
          queryClient.invalidateQueries({ queryKey: eventKeys.upcoming() });
          queryClient.invalidateQueries({ queryKey: eventKeys.today() });

          // Invalidate calendar for the event date
          const eventDate = newEvent.startTime.split('T')[0];
          queryClient.invalidateQueries({ queryKey: eventKeys.calendar(eventDate) });
        }
      },
    }
  );
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useUpdateResource<Event, UpdateEventInput>(
    ({ _id, data }) => eventService.updateEvent(_id, data).then(res => res.data!),
    {
      listQueryKey: eventKeys.lists(),
      detailQueryKey: eventKeys.detail,
      onSettled: (data, error, variables) => {
        queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables._id) });
        queryClient.invalidateQueries({ queryKey: eventKeys.lists() });

        // Invalidate calendar queries if date changed
        if (variables.data.startTime) {
          const eventDate = variables.data.startTime.split('T')[0];
          queryClient.invalidateQueries({ queryKey: eventKeys.calendar(eventDate) });
        }
      },
    }
  );
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useDeleteResource<Event>(
    (id) => eventService.deleteEvent(id).then(res => res.data),
    {
      listQueryKey: eventKeys.lists(),
      detailQueryKey: eventKeys.detail,
      onSuccess: (data, id) => {
         // Remove from calendar and today events
         // Note: This is a bit tricky since we don't have the event object here easily without fetching it first.
         // But useDeleteResource does optimistic updates on the list.
         // For specific lists like calendar/today, we might need to invalidate them.
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
        queryClient.invalidateQueries({ queryKey: eventKeys.upcoming() });
        queryClient.invalidateQueries({ queryKey: eventKeys.today() });
        queryClient.invalidateQueries({ queryKey: eventKeys.calendar('') }); // Invalidate all calendars potentially
      },
    }
  );
};