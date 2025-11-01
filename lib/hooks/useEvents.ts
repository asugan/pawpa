import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/lib/services/eventService';
import { Event, CreateEventInput, UpdateEventInput, ApiResponse } from '@/lib/types';

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

  return useMutation<Event | undefined, Error, CreateEventInput, { previousEvents?: Event[] }>({
    mutationFn: (eventData: CreateEventInput) =>
      eventService.createEvent(eventData).then((res: ApiResponse<Event>) => res.data),
    onMutate: async (newEvent) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: eventKeys.lists() });

      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData<Event[]>(eventKeys.list(newEvent.petId));

      // Optimistically update to the new value
      const tempEvent = {
        ...newEvent,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Event;

      queryClient.setQueryData(eventKeys.list(newEvent.petId), (old: Event[] | undefined) =>
        old ? [...old, tempEvent] : [tempEvent]
      );

      // Also update calendar and today events if applicable
      const eventDate = newEvent.startTime.split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      if (eventDate === today) {
        queryClient.setQueryData(eventKeys.today(), (old: Event[] | undefined) =>
          old ? [...old, tempEvent] : [tempEvent]
        );
      }

      queryClient.setQueryData(eventKeys.calendar(eventDate), (old: Event[] | undefined) =>
        old ? [...old, tempEvent] : [tempEvent]
      );

      return { previousEvents };
    },
    onError: (err, newEvent, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousEvents) {
        queryClient.setQueryData(eventKeys.list(newEvent.petId), context.previousEvents);
      }
    },
    onSettled: (newEvent?: Event) => {
      // Always refetch after error or success
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
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventInput }) =>
      eventService.updateEvent(id, data).then((res: ApiResponse<Event>) => res.data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: eventKeys.lists() });

      const previousEvent = queryClient.getQueryData(eventKeys.detail(id));

      // Update the event in cache with new data
      queryClient.setQueryData(eventKeys.detail(id), (old: Event | undefined) =>
        old ? { ...old, ...data, updatedAt: new Date().toISOString() } : undefined
      );

      // Update the event in the list
      queryClient.setQueriesData({ queryKey: eventKeys.lists() }, (old: Event[] | undefined) => {
        if (!old) return old;
        return old.map(event =>
          event.id === id ? { ...event, ...data, updatedAt: new Date().toISOString() } : event
        );
      });

      return { previousEvent };
    },
    onError: (err, variables, context) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(eventKeys.detail(variables.id), context.previousEvent);
      }
    },
    onSettled: (result, error, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });

      // Invalidate calendar queries if date changed
      if (variables.data.startTime) {
        const eventDate = variables.data.startTime.split('T')[0];
        queryClient.invalidateQueries({ queryKey: eventKeys.calendar(eventDate) });
      }
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.lists() });

      // Get the event to be deleted for cache updates
      const eventToDelete = queryClient.getQueryData(eventKeys.detail(id)) as Event;

      // Remove the deleted event from all lists
      queryClient.setQueriesData({ queryKey: eventKeys.lists() }, (old: Event[] | undefined) =>
        old?.filter(event => event.id !== id)
      );

      // Remove from calendar and today events
      queryClient.setQueriesData({ queryKey: eventKeys.calendar('') }, (old: Event[] | undefined) =>
        old?.filter(event => event.id !== id)
      );

      queryClient.setQueryData(eventKeys.today(), (old: Event[] | undefined) =>
        old?.filter(event => event.id !== id)
      );

      queryClient.setQueryData(eventKeys.upcoming(), (old: Event[] | undefined) =>
        old?.filter(event => event.id !== id)
      );

      return { eventToDelete };
    },
    onSuccess: (_, deletedId) => {
      // Remove the deleted event from cache
      queryClient.removeQueries({ queryKey: eventKeys.detail(deletedId) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: eventKeys.today() });
    },
  });
};