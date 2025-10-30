import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthRecordService } from '../services';
import type { HealthRecord, CreateHealthRecordInput, UpdateHealthRecordInput } from '../types';

// ============================================================================
// QUERY KEYS - Centralized and structured
// ============================================================================

export const healthRecordKeys = {
  all: ['healthRecords'] as const,
  lists: () => [...healthRecordKeys.all, 'list'] as const,
  list: (petId?: string) => [...healthRecordKeys.lists(), petId] as const,
  details: () => [...healthRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...healthRecordKeys.details(), id] as const,
  vaccinations: (petId?: string) => [...healthRecordKeys.all, 'vaccinations', petId] as const,
  upcoming: () => [...healthRecordKeys.all, 'upcoming'] as const,
  byType: (petId: string, type: string) => [...healthRecordKeys.lists(), petId, type] as const,
  byPetAndType: (petId: string, type: string) => [...healthRecordKeys.byType(petId, type)] as const,
} as const;

// ============================================================================
// TYPES
// ============================================================================

export type HealthRecordType = 'vaccination' | 'checkup' | 'surgery' | 'medication' | 'other';

export interface HealthRecordFilters {
  petId?: string;
  type?: HealthRecordType;
  dateFrom?: string;
  dateTo?: string;
  upcoming?: boolean;
}

export interface HealthRecordQueryOptions<T = HealthRecord[]> {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  retry?: number;
  refetchOnWindowFocus?: boolean;
  select?: (data: HealthRecord[]) => T;
}

// ============================================================================
// DEFAULT QUERY OPTIONS
// ============================================================================

export const HEALTH_RECORD_DEFAULT_OPTIONS = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: (failureCount: number, error: any) => {
    // Don't retry on 404s
    if (error?.status === 404) return false;
    // Retry other errors 2 times
    return failureCount < 2;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnWindowFocus: true,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all health records for a pet
 */
export function useHealthRecords(petId?: string, options: HealthRecordQueryOptions = {}) {
  return useQuery({
    queryKey: healthRecordKeys.list(petId),
    queryFn: async () => {
      if (!petId) return [];

      try {
        const result = await healthRecordService.getHealthRecordsByPetId(petId);
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch health records');
        }
        return result.data;
      } catch (error) {
        console.error('❌ Use health records error:', error);
        throw error;
      }
    },
    ...HEALTH_RECORD_DEFAULT_OPTIONS,
    ...options,
    enabled: !!petId && options.enabled !== false,
  });
}

/**
 * Get a single health record by ID
 */
export function useHealthRecordById(id?: string, options: HealthRecordQueryOptions<HealthRecord> = {}) {
  return useQuery({
    queryKey: healthRecordKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Health record ID is required');

      try {
        const result = await healthRecordService.getHealthRecordById(id);
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Health record not found');
        }
        return result.data;
      } catch (error) {
        console.error('❌ Use health record by ID error:', error);
        throw error;
      }
    },
    ...HEALTH_RECORD_DEFAULT_OPTIONS,
    ...options,
    enabled: !!id && options.enabled !== false,
    staleTime: 30 * 60 * 1000, // 30 minutes for single records
  });
}

/**
 * Get vaccinations only
 */
export function useVaccinations(petId?: string, options: HealthRecordQueryOptions = {}) {
  return useQuery({
    queryKey: healthRecordKeys.vaccinations(petId),
    queryFn: async () => {
      if (!petId) return [];

      try {
        const result = await healthRecordService.getVaccinations(petId);
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch vaccinations');
        }
        return result.data;
      } catch (error) {
        console.error('❌ Use vaccinations error:', error);
        throw error;
      }
    },
    ...HEALTH_RECORD_DEFAULT_OPTIONS,
    ...options,
    enabled: !!petId && options.enabled !== false,
    staleTime: 10 * 60 * 1000, // 10 minutes for vaccinations
  });
}

/**
 * Get upcoming health records (vaccinations, checkups, etc.)
 */
export function useUpcomingVaccinations(options: HealthRecordQueryOptions = {}) {
  return useQuery({
    queryKey: healthRecordKeys.upcoming(),
    queryFn: async () => {
      try {
        const result = await healthRecordService.getUpcomingRecords();
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch upcoming records');
        }
        return result.data;
      } catch (error) {
        console.error('❌ Use upcoming vaccinations error:', error);
        throw error;
      }
    },
    ...HEALTH_RECORD_DEFAULT_OPTIONS,
    ...options,
    staleTime: 15 * 60 * 1000, // 15 minutes for upcoming records
  });
}

/**
 * Get health records by type
 */
export function useHealthRecordsByType(
  petId: string,
  type: HealthRecordType,
  options: HealthRecordQueryOptions = {}
) {
  return useQuery({
    queryKey: healthRecordKeys.byPetAndType(petId, type),
    queryFn: async () => {
      if (!petId || !type) return [];

      try {
        const result = await healthRecordService.getHealthRecordsByType(petId, type);
        if (!result.success || !result.data) {
          throw new Error(result.error || `Failed to fetch ${type} records`);
        }
        return result.data;
      } catch (error) {
        console.error(`❌ Use health records by type (${type}) error:`, error);
        throw error;
      }
    },
    ...HEALTH_RECORD_DEFAULT_OPTIONS,
    ...options,
    enabled: !!petId && !!type && options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes for type-based queries
  });
}

/**
 * Optimized hook for pet's health overview
 */
export function usePetHealthOverview(petId?: string) {
  const healthRecords = useHealthRecords(petId, {
    select: (records) => {
      // Transform records for better display
      return {
        totalRecords: records.length,
        vaccinations: records.filter(r => r.type === 'vaccination').length,
        checkups: records.filter(r => r.type === 'checkup').length,
        upcoming: records.filter(r => r.nextDueDate && new Date(r.nextDueDate) > new Date()).length,
        latestRecord: records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0],
      };
    },
  });

  const vaccinations = useVaccinations(petId);

  return {
    healthRecords,
    vaccinations,
    overview: healthRecords.data,
    isLoading: healthRecords.isLoading || vaccinations.isLoading,
    isError: healthRecords.isError || vaccinations.isError,
  };
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create health record with optimistic updates
 */
export function useCreateHealthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHealthRecordInput) => healthRecordService.createHealthRecord(data),
    onMutate: async (newRecord) => {
      // Cancel any outgoing refetches
      if (newRecord.petId) {
        await queryClient.cancelQueries({ queryKey: healthRecordKeys.list(newRecord.petId) });
        await queryClient.cancelQueries({ queryKey: healthRecordKeys.vaccinations(newRecord.petId) });
      }
      await queryClient.cancelQueries({ queryKey: healthRecordKeys.upcoming() });

      // Get current data for rollback
      const previousRecords = newRecord.petId
        ? queryClient.getQueryData<HealthRecord[]>(healthRecordKeys.list(newRecord.petId))
        : undefined;
      const previousUpcoming = queryClient.getQueryData<HealthRecord[]>(healthRecordKeys.upcoming());

      // Create optimistic record
      const optimisticRecord: HealthRecord = {
        ...newRecord,
        id: `optimistic-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      if (newRecord.petId) {
        queryClient.setQueryData<HealthRecord[]>(
          healthRecordKeys.list(newRecord.petId),
          (old) => old ? [...old, optimisticRecord] : []
        );

        // If it's a vaccination, also update vaccinations list
        if (newRecord.type === 'vaccination') {
          queryClient.setQueryData<HealthRecord[]>(
            healthRecordKeys.vaccinations(newRecord.petId),
            (old) => old ? [...old, optimisticRecord] : []
          );
        }
      }

      queryClient.setQueryData<HealthRecord[]>(
        healthRecordKeys.upcoming(),
        (old) => old ? [...old, optimisticRecord] : []
      );

      return { previousRecords, previousUpcoming };
    },
    onSuccess: (result, newRecord, context) => {
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create health record');
      }

      // Replace optimistic data with real response
      const realRecord = result.data;

      if (newRecord.petId) {
        queryClient.setQueryData<HealthRecord[]>(
          healthRecordKeys.list(newRecord.petId),
          (old) => old ? [...old.filter(r => !r.id.startsWith('optimistic-')), realRecord] : []
        );

        if (newRecord.type === 'vaccination') {
          queryClient.setQueryData<HealthRecord[]>(
            healthRecordKeys.vaccinations(newRecord.petId),
            (old) => old ? [...old.filter(r => !r.id.startsWith('optimistic-')), realRecord] : []
          );
        }
      }

      queryClient.setQueryData<HealthRecord[]>(
        healthRecordKeys.upcoming(),
        (old) => old ? [...old.filter(r => !r.id.startsWith('optimistic-')), realRecord] : []
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.all });

      console.log('✅ Health record created successfully:', realRecord.id);
    },
    onError: (error, newRecord, context) => {
      // Rollback optimistic updates
      if (context?.previousRecords && newRecord.petId) {
        queryClient.setQueryData<HealthRecord[]>(
          healthRecordKeys.list(newRecord.petId),
          context.previousRecords
        );
      }
      if (context?.previousUpcoming) {
        queryClient.setQueryData<HealthRecord[]>(
          healthRecordKeys.upcoming(),
          context.previousUpcoming
        );
      }

      console.error('❌ Create health record error:', error);
    },
  });
}

/**
 * Update health record with optimistic updates
 */
export function useUpdateHealthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHealthRecordInput }) =>
      healthRecordService.updateHealthRecord(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: healthRecordKeys.detail(id) });
      if (data.petId) {
        await queryClient.cancelQueries({ queryKey: healthRecordKeys.list(data.petId) });
        await queryClient.cancelQueries({ queryKey: healthRecordKeys.vaccinations(data.petId) });
      }
      await queryClient.cancelQueries({ queryKey: healthRecordKeys.upcoming() });

      // Get current data for rollback
      const previousRecord = queryClient.getQueryData<HealthRecord>(healthRecordKeys.detail(id));
      const previousRecords = data.petId
        ? queryClient.getQueryData<HealthRecord[]>(healthRecordKeys.list(data.petId))
        : undefined;
      const previousVaccinations = data.petId && data.type === 'vaccination'
        ? queryClient.getQueryData<HealthRecord[]>(healthRecordKeys.vaccinations(data.petId))
        : undefined;
      const previousUpcoming = queryClient.getQueryData<HealthRecord[]>(healthRecordKeys.upcoming());

      // Create optimistic update
      const updatedRecord: HealthRecord = {
        ...previousRecord!,
        ...data,
        id,
        updatedAt: new Date().toISOString(),
      };

      // Optimistic updates
      queryClient.setQueryData<HealthRecord>(healthRecordKeys.detail(id), updatedRecord);

      if (data.petId) {
        queryClient.setQueryData<HealthRecord[]>(
          healthRecordKeys.list(data.petId),
          (old) => old?.map(r => r.id === id ? updatedRecord : r)
        );

        if (data.type === 'vaccination') {
          queryClient.setQueryData<HealthRecord[]>(
            healthRecordKeys.vaccinations(data.petId),
            (old) => old?.map(r => r.id === id ? updatedRecord : r)
          );
        }
      }

      queryClient.setQueryData<HealthRecord[]>(
        healthRecordKeys.upcoming(),
        (old) => old?.map(r => r.id === id ? updatedRecord : r)
      );

      return {
        previousRecord,
        previousRecords,
        previousVaccinations,
        previousUpcoming,
      };
    },
    onSuccess: (result, { id, data }, context) => {
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update health record');
      }

      // Update with real response
      const realRecord = result.data;

      queryClient.setQueryData<HealthRecord>(healthRecordKeys.detail(id), realRecord);

      if (data.petId) {
        queryClient.setQueryData<HealthRecord[]>(
          healthRecordKeys.list(data.petId),
          (old) => old?.map(r => r.id === id ? realRecord : r)
        );

        if (data.type === 'vaccination') {
          queryClient.setQueryData<HealthRecord[]>(
            healthRecordKeys.vaccinations(data.petId),
            (old) => old?.map(r => r.id === id ? realRecord : r)
          );
        }
      }

      queryClient.setQueryData<HealthRecord[]>(
        healthRecordKeys.upcoming(),
        (old) => old?.map(r => r.id === id ? realRecord : r)
      );

      // Invalidate other queries
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.all });

      console.log('✅ Health record updated successfully:', id);
    },
    onError: (error, { id, data }, context) => {
      // Rollback optimistic updates
      if (context?.previousRecord) {
        queryClient.setQueryData<HealthRecord>(healthRecordKeys.detail(id), context.previousRecord);
      }
      if (context?.previousRecords && data.petId) {
        queryClient.setQueryData<HealthRecord[]>(
          healthRecordKeys.list(data.petId),
          context.previousRecords
        );
      }
      if (context?.previousVaccinations && data.petId) {
        queryClient.setQueryData<HealthRecord[]>(
          healthRecordKeys.vaccinations(data.petId),
          context.previousVaccinations
        );
      }
      if (context?.previousUpcoming) {
        queryClient.setQueryData<HealthRecord[]>(
          healthRecordKeys.upcoming(),
          context.previousUpcoming
        );
      }

      console.error('❌ Update health record error:', error);
    },
  });
}

/**
 * Delete health record with optimistic updates
 */
export function useDeleteHealthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => healthRecordService.deleteHealthRecord(id),
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: healthRecordKeys.detail(id) });

      // Get current data for rollback
      const previousRecord = queryClient.getQueryData<HealthRecord>(healthRecordKeys.detail(id));

      // Find all queries that contain this record and get their current data
      const allQueries = queryClient.getQueriesData({ queryKey: healthRecordKeys.all });
      const affectedQueries: Array<{
        queryKey: readonly string[];
        previousData: any;
      }> = [];

      allQueries.forEach(([queryKey, data]) => {
        if (Array.isArray(data)) {
          const filteredData = data.filter((r: HealthRecord) => r.id !== id);
          if (filteredData.length !== data.length) {
            affectedQueries.push({
              queryKey: queryKey as readonly string[],
              previousData: data,
            });
          }
        }
      });

      // Optimistic update - remove from all caches
      affectedQueries.forEach(({ queryKey }) => {
        queryClient.setQueryData(queryKey, (old: any) =>
          Array.isArray(old) ? old.filter((r: HealthRecord) => r.id !== id) : old
        );
      });

      return { previousRecord, affectedQueries };
    },
    onSuccess: (result, deletedId, context) => {
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete health record');
      }

      // Clean up deleted record from cache
      queryClient.removeQueries({ queryKey: healthRecordKeys.detail(deletedId) });

      // Invalidate all health records queries
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.all });

      console.log('✅ Health record deleted successfully:', deletedId);
    },
    onError: (error, deletedId, context) => {
      // Rollback optimistic updates
      if (context?.affectedQueries) {
        context.affectedQueries.forEach(({ queryKey, previousData }) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
      if (context?.previousRecord) {
        queryClient.setQueryData<HealthRecord>(healthRecordKeys.detail(deletedId), context.previousRecord);
      }

      console.error('❌ Delete health record error:', error);
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Utility hook for health record cache management
 */
export function useHealthRecordCache() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.all });
    },
    invalidatePet: (petId: string) => {
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.list(petId) });
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.vaccinations(petId) });
    },
    invalidateRecord: (id: string) => {
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.detail(id) });
    },
    invalidateUpcoming: () => {
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.upcoming() });
    },
    removeRecord: (id: string) => {
      queryClient.removeQueries({ queryKey: healthRecordKeys.detail(id) });
    },
    setRecordData: (id: string, data: HealthRecord) => {
      queryClient.setQueryData<HealthRecord>(healthRecordKeys.detail(id), data);
    },
    setRecordsData: (petId: string, data: HealthRecord[]) => {
      queryClient.setQueryData<HealthRecord[]>(healthRecordKeys.list(petId), data);
    },
  };
}

/**
 * Hook to check if health record data is stale
 */
export function useHealthRecordDataStale(petId?: string) {
  const { isStale: areRecordsStale } = useQuery({
    queryKey: healthRecordKeys.list(petId),
    queryFn: () => Promise.resolve([]),
    initialData: [],
  });

  const { isStale: areVaccinationsStale } = useQuery({
    queryKey: healthRecordKeys.vaccinations(petId),
    queryFn: () => Promise.resolve([]),
    initialData: [],
  });

  const { isStale: areUpcomingStale } = useQuery({
    queryKey: healthRecordKeys.upcoming(),
    queryFn: () => Promise.resolve([]),
    initialData: [],
  });

  return {
    areRecordsStale,
    areVaccinationsStale,
    areUpcomingStale,
    isAnyDataStale: areRecordsStale || areVaccinationsStale || areUpcomingStale,
  };
}