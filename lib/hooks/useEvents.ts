import { eventService } from '@/lib/services/eventService';
import { ApiResponse, CreateEventInput, Event, UpdateEventInput } from '@/lib/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCreateResource, useDeleteResource, useUpdateResource } from './useCrud';

// Query keys for events
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (petId: string) => [...eventKeys.lists(), petId] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  calendar: (date: string) => [...eventKeys.all, 'calendar', date] as const,
  upcoming: () => [...eventKeys.all, 'upcoming'] as const,
  today: () => [...eventKeys.all, 'today'] as const,
  type: (petId: string, type: string) => [...eventKeys.lists(), petId, 'type', type] as const,
};

// Hooks
export const useEvents = (petId: string) => {
  return useQuery({
    queryKey: eventKeys.list(petId),
    queryFn: () => eventService.getEventsByPetId(petId).then((res: ApiResponse<Event[]>) => res.data || []),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!petId,
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventService.getEventById(id).then((res: ApiResponse<Event>) => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
  });
};

export const useCalendarEvents = (date: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: eventKeys.calendar(date),
    queryFn: () => eventService.getEventsByDate(date).then((res: ApiResponse<Event[]>) => res.data || []),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== undefined ? (options.enabled && !!date) : !!date,
  });
};

export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: eventKeys.upcoming(),
    queryFn: () => eventService.getUpcomingEvents().then((res: ApiResponse<Event[]>) => res.data || []),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

export const useTodayEvents = () => {
  return useQuery({
    queryKey: eventKeys.today(),
    queryFn: () => eventService.getTodayEvents().then((res: ApiResponse<Event[]>) => res.data || []),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refresh every minute
  });
};

export const useEventsByType = (petId: string, type: string) => {
  return useQuery({
    queryKey: eventKeys.type(petId, type),
    queryFn: async () => {
      const response = await eventService.getEventsByPetId(petId);
      const events = response.data || [];
      return events.filter((event: Event) => event.type === type);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!petId && !!type,
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
          queryClient.invalidateQueries({ queryKey: eventKeys.list(newEvent.petId) });
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
    ({ id, data }) => eventService.updateEvent(id, data).then(res => res.data!),
    {
      listQueryKey: eventKeys.lists(),
      detailQueryKey: eventKeys.detail,
      onSettled: (data, error, variables) => {
        queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
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