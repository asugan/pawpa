import { feedingScheduleService } from '@/lib/services/feedingScheduleService';
import { ApiResponse, CreateFeedingScheduleInput, FeedingSchedule, UpdateFeedingScheduleInput } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCreateResource, useDeleteResource, useUpdateResource } from './useCrud';

// Query keys for feeding schedules
export const feedingScheduleKeys = {
  all: ['feeding-schedules'] as const,
  lists: () => [...feedingScheduleKeys.all, 'list'] as const,
  list: (petId: string) => [...feedingScheduleKeys.lists(), petId] as const,
  details: () => [...feedingScheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...feedingScheduleKeys.details(), id] as const,
  active: () => [...feedingScheduleKeys.all, 'active'] as const,
  today: () => [...feedingScheduleKeys.all, 'today'] as const,
  next: () => [...feedingScheduleKeys.all, 'next'] as const,
  activeByPet: (petId: string) => [...feedingScheduleKeys.lists(), petId, 'active'] as const,
};

// Hooks
export const useFeedingSchedules = (petId: string) => {
  return useQuery({
    queryKey: feedingScheduleKeys.list(petId),
    queryFn: () => feedingScheduleService.getFeedingSchedulesByPetId(petId).then((res: ApiResponse<FeedingSchedule[]>) => res.data || []),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!petId,
  });
};

export const useFeedingSchedule = (id: string) => {
  return useQuery({
    queryKey: feedingScheduleKeys.detail(id),
    queryFn: () => feedingScheduleService.getFeedingScheduleById(id).then((res: ApiResponse<FeedingSchedule>) => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
  });
};

export const useActiveFeedingSchedules = () => {
  return useQuery({
    queryKey: feedingScheduleKeys.active(),
    queryFn: () => feedingScheduleService.getActiveFeedingSchedules().then((res: ApiResponse<FeedingSchedule[]>) => res.data || []),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

export const useTodayFeedingSchedules = () => {
  return useQuery({
    queryKey: feedingScheduleKeys.today(),
    queryFn: () => feedingScheduleService.getTodayFeedingSchedules().then((res: ApiResponse<FeedingSchedule[]>) => res.data || []),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
};

export const useNextFeeding = () => {
  return useQuery({
    queryKey: feedingScheduleKeys.next(),
    queryFn: () => feedingScheduleService.getNextFeeding().then((res: ApiResponse<FeedingSchedule | null>) => res.data || null),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  });
};

export const useActiveFeedingSchedulesByPet = (petId: string) => {
  return useQuery({
    queryKey: feedingScheduleKeys.activeByPet(petId),
    queryFn: () => feedingScheduleService.getActiveFeedingSchedulesByPet(petId).then((res: ApiResponse<FeedingSchedule[]>) => res.data || []),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!petId,
  });
};

// Mutations
export const useCreateFeedingSchedule = () => {
  const queryClient = useQueryClient();

  return useCreateResource<FeedingSchedule, CreateFeedingScheduleInput>(
    (data) => feedingScheduleService.createFeedingSchedule(data).then(res => res.data!),
    {
      listQueryKey: feedingScheduleKeys.lists(),
      onSuccess: (newSchedule) => {
        // Update active schedules if it's active
        if (newSchedule.isActive) {
          queryClient.setQueryData(feedingScheduleKeys.active(), (old: FeedingSchedule[] | undefined) =>
            old ? [...old, newSchedule] : [newSchedule]
          );

          queryClient.setQueryData(feedingScheduleKeys.activeByPet(newSchedule.petId), (old: FeedingSchedule[] | undefined) =>
            old ? [...old, newSchedule] : [newSchedule]
          );
        }
      },
      onSettled: (newSchedule) => {
        if (newSchedule) {
          queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.list(newSchedule.petId) });
          queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.lists() });
          queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.active() });
          queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.today() });
          queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.next() });
        }
      },
    }
  );
};

export const useUpdateFeedingSchedule = () => {
  const queryClient = useQueryClient();

  return useUpdateResource<FeedingSchedule, UpdateFeedingScheduleInput>(
    ({ id, data }) => feedingScheduleService.updateFeedingSchedule(id, data).then(res => res.data!),
    {
      listQueryKey: feedingScheduleKeys.lists(),
      detailQueryKey: feedingScheduleKeys.detail,
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.lists() });
        queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.active() });
        queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.today() });
        queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.next() });
      },
    }
  );
};

export const useDeleteFeedingSchedule = () => {
  const queryClient = useQueryClient();

  return useDeleteResource<FeedingSchedule>(
    (id) => feedingScheduleService.deleteFeedingSchedule(id).then(res => res.data),
    {
      listQueryKey: feedingScheduleKeys.lists(),
      detailQueryKey: feedingScheduleKeys.detail,
      onSuccess: (data, id) => {
        // Remove from active schedules
        queryClient.setQueryData(feedingScheduleKeys.active(), (old: FeedingSchedule[] | undefined) =>
          old?.filter(schedule => schedule.id !== id)
        );

        queryClient.setQueryData(feedingScheduleKeys.today(), (old: FeedingSchedule[] | undefined) =>
          old?.filter(schedule => schedule.id !== id)
        );

        queryClient.setQueryData(feedingScheduleKeys.next(), (old: FeedingSchedule[] | undefined) =>
          old?.filter(schedule => schedule.id !== id)
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.lists() });
        queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.active() });
        queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.today() });
        queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.next() });
      },
    }
  );
};

export const useToggleFeedingSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      feedingScheduleService.toggleFeedingSchedule(id, isActive).then((res: ApiResponse<FeedingSchedule>) => res.data),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: feedingScheduleKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: feedingScheduleKeys.lists() });

      const previousSchedule = queryClient.getQueryData(feedingScheduleKeys.detail(id));

      // Update the schedule in cache
      queryClient.setQueryData(feedingScheduleKeys.detail(id), (old: FeedingSchedule | undefined) =>
        old ? { ...old, isActive, updatedAt: new Date().toISOString() } : undefined
      );

      // Update the schedule in all lists
      queryClient.setQueriesData({ queryKey: feedingScheduleKeys.lists() }, (old: FeedingSchedule[] | undefined) => {
        if (!old) return old;
        return old.map(schedule =>
          schedule.id === id ? { ...schedule, isActive, updatedAt: new Date().toISOString() } : schedule
        );
      });

      // Add or remove from active schedules based on the new state
      if (isActive) {
        const schedule = queryClient.getQueryData(feedingScheduleKeys.detail(id)) as FeedingSchedule;
        if (schedule) {
          queryClient.setQueryData(feedingScheduleKeys.active(), (old: FeedingSchedule[] | undefined) =>
            old ? [...old.filter(s => s.id !== id), schedule] : [schedule]
          );
        }
      } else {
        queryClient.setQueryData(feedingScheduleKeys.active(), (old: FeedingSchedule[] | undefined) =>
          old?.filter(schedule => schedule.id !== id)
        );
      }

      return { previousSchedule };
    },
    onError: (err, variables, context) => {
      if (context?.previousSchedule) {
        queryClient.setQueryData(feedingScheduleKeys.detail(variables.id), context.previousSchedule);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.active() });
      queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.today() });
      queryClient.invalidateQueries({ queryKey: feedingScheduleKeys.next() });
    },
  });
};