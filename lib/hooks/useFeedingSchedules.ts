import { feedingScheduleService } from '@/lib/services/feedingScheduleService';
import { ApiResponse, CreateFeedingScheduleInput, FeedingSchedule, UpdateFeedingScheduleInput } from '@/lib/types';
import { CACHE_TIMES } from '@/lib/config/queryConfig';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCreateResource, useDeleteResource, useUpdateResource } from './useCrud';
import { createQueryKeys } from './core/createQueryKeys';
import { useResource } from './core/useResource';
import { useResources } from './core/useResources';
import { useConditionalQuery } from './core/useConditionalQuery';

// Query keys factory
const baseFeedingScheduleKeys = createQueryKeys('feeding-schedules');

// Extended query keys with custom keys
export const feedingScheduleKeys = {
  ...baseFeedingScheduleKeys,
  active: () => [...baseFeedingScheduleKeys.all, 'active'] as const,
  today: () => [...baseFeedingScheduleKeys.all, 'today'] as const,
  next: () => [...baseFeedingScheduleKeys.all, 'next'] as const,
  activeByPet: (petId: string) => [...baseFeedingScheduleKeys.all, 'active', petId] as const,
};

// Hooks
export const useFeedingSchedules = (petId: string) => {
  return useConditionalQuery<FeedingSchedule[]>({
    queryKey: feedingScheduleKeys.list(petId),
    queryFn: () => feedingScheduleService.getFeedingSchedulesByPetId(petId),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!petId,
    defaultValue: [],
  });
};

export const useFeedingSchedule = (id: string) => {
  return useResource<FeedingSchedule>({
    queryKey: feedingScheduleKeys.detail(id),
    queryFn: () => feedingScheduleService.getFeedingScheduleById(id),
    staleTime: CACHE_TIMES.LONG,
    enabled: !!id,
  });
};

export const useActiveFeedingSchedules = () => {
  return useResources<FeedingSchedule>({
    queryKey: feedingScheduleKeys.active(),
    queryFn: () => feedingScheduleService.getActiveFeedingSchedules(),
    staleTime: CACHE_TIMES.SHORT,
    refetchInterval: CACHE_TIMES.MEDIUM,
  });
};

export const useTodayFeedingSchedules = () => {
  return useResources<FeedingSchedule>({
    queryKey: feedingScheduleKeys.today(),
    queryFn: () => feedingScheduleService.getTodayFeedingSchedules(),
    staleTime: CACHE_TIMES.VERY_SHORT,
    refetchInterval: CACHE_TIMES.VERY_SHORT,
  });
};

export const useNextFeeding = () => {
  return useConditionalQuery<FeedingSchedule | null>({
    queryKey: feedingScheduleKeys.next(),
    queryFn: () => feedingScheduleService.getNextFeeding(),
    staleTime: CACHE_TIMES.VERY_SHORT,
    refetchInterval: CACHE_TIMES.VERY_SHORT * 2, // Refresh every minute
    defaultValue: null,
  });
};

export const useActiveFeedingSchedulesByPet = (petId: string) => {
  return useConditionalQuery<FeedingSchedule[]>({
    queryKey: feedingScheduleKeys.activeByPet(petId),
    queryFn: () => feedingScheduleService.getActiveFeedingSchedulesByPet(petId),
    staleTime: CACHE_TIMES.SHORT,
    enabled: !!petId,
    defaultValue: [],
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