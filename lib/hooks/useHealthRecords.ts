import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { healthRecordService } from '../services/healthRecordService';
import type { CreateHealthRecordInput, HealthRecord, UpdateHealthRecordInput } from '../types';
import { CACHE_TIMES } from '../config/queryConfig';
import { useCreateResource, useDeleteResource, useUpdateResource } from './useCrud';
import { createQueryKeys } from './core/createQueryKeys';
import { useResource } from './core/useResource';
import { useResources } from './core/useResources';
import { useConditionalQuery } from './core/useConditionalQuery';

// Type-safe filters for health records
interface HealthRecordFilters {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  veterinarian?: string;
  sortBy?: 'date' | 'type' | 'veterinarian' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Query keys factory
const baseHealthRecordKeys = createQueryKeys('health-records');

// Extended query keys with custom keys
export const healthRecordKeys = {
  ...baseHealthRecordKeys,
  list: (petId: string, filters?: HealthRecordFilters) =>
    [...baseHealthRecordKeys.lists(), petId, filters] as const,
  vaccinations: (petId: string) => [...baseHealthRecordKeys.all, 'vaccinations', petId] as const,
  upcoming: () => [...baseHealthRecordKeys.all, 'upcoming'] as const,
  byType: (petId: string, type: string) => [...baseHealthRecordKeys.all, 'type', petId, type] as const,
  byDateRange: (petId: string, dateFrom: string, dateTo: string) =>
    [...baseHealthRecordKeys.all, 'date-range', petId, dateFrom, dateTo] as const,
};

// Get all health records for a pet with type-safe filters
// Note: This hook has complex client-side sorting logic,
// so it uses useQuery directly instead of generic hooks
export function useHealthRecords(petId: string, filters: HealthRecordFilters = {}) {
  return useQuery({
    queryKey: healthRecordKeys.list(petId, filters),
    queryFn: async () => {
      const result = await healthRecordService.getHealthRecordsByPetId(petId);
      if (!result.success) {
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || 'Sağlık kayıtları yüklenemedi';
        throw new Error(errorMessage);
      }
      return result.data || [];
    },
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!petId,
    select: (data) => {
      // Apply client-side sorting if specified
      if (filters.sortBy) {
        return [...data].sort((a, b) => {
          const aValue = a[filters.sortBy!];
          const bValue = b[filters.sortBy!];

          if (aValue === undefined || bValue === undefined) return 0;

          if (filters.sortOrder === 'desc') {
            return String(bValue) > String(aValue) ? 1 : String(bValue) < String(aValue) ? -1 : 0;
          }
          return String(aValue) > String(bValue) ? 1 : String(aValue) < String(bValue) ? -1 : 0;
        });
      }
      return data;
    },
  });
}

// Get a single health record by ID
export function useHealthRecord(id: string) {
  return useResource<HealthRecord>({
    queryKey: healthRecordKeys.detail(id),
    queryFn: () => healthRecordService.getHealthRecordById(id),
    staleTime: CACHE_TIMES.LONG,
    enabled: !!id,
    errorMessage: 'Sağlık kaydı yüklenemedi',
  });
}

// Get vaccinations only
export function useVaccinations(petId: string) {
  return useConditionalQuery<HealthRecord[]>({
    queryKey: healthRecordKeys.vaccinations(petId),
    queryFn: () => healthRecordService.getVaccinations(petId),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!petId,
    defaultValue: [],
    errorMessage: 'Aşı kayıtları yüklenemedi',
  });
}

// Get upcoming vaccinations
export function useUpcomingVaccinations() {
  return useResources<HealthRecord>({
    queryKey: healthRecordKeys.upcoming(),
    queryFn: () => healthRecordService.getUpcomingRecords(),
    staleTime: CACHE_TIMES.LONG,
    refetchInterval: 60 * 60 * 1000, // Refresh every hour
  });
}

// Get all health records for all pets (for homepage overview)
export function useAllPetsHealthRecords(petIds: string[]) {
  const queries = useQueries({
    queries: petIds.map(petId => ({
      queryKey: healthRecordKeys.list(petId),
      queryFn: async () => {
        const result = await healthRecordService.getHealthRecordsByPetId(petId);
        if (!result.success) {
          return [];
        }
        return result.data || [];
      },
      staleTime: CACHE_TIMES.MEDIUM,
      enabled: !!petId,
    })),
  });

  // Combine all results from all pets
  const allRecords = queries
    .filter(q => q.data && Array.isArray(q.data))
    .flatMap(q => q.data as HealthRecord[])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return {
    data: allRecords,
    isLoading: queries.some(q => q.isLoading),
    isError: queries.some(q => q.isError),
  };
}

// Get health records by type
export function useHealthRecordsByType(petId: string, type: string) {
  return useConditionalQuery<HealthRecord[]>({
    queryKey: healthRecordKeys.byType(petId, type),
    queryFn: () => healthRecordService.getHealthRecordsByType(petId, type),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!petId && !!type,
    defaultValue: [],
    errorMessage: 'Sağlık kayıtları yüklenemedi',
  });
}

// Get health records by date range (using existing service method)
export function useHealthRecordsByDateRange(petId: string, dateFrom: string, dateTo: string) {
  return useConditionalQuery<HealthRecord[]>({
    queryKey: healthRecordKeys.byDateRange(petId, dateFrom, dateTo),
    queryFn: () => healthRecordService.getHealthRecordsByPetId(petId),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!petId && !!dateFrom && !!dateTo,
    defaultValue: [],
    errorMessage: 'Sağlık kayıtları yüklenemedi',
    select: (allRecords) => {
      // Filter by date range on client side
      return allRecords.filter((record: HealthRecord) => {
        const recordDate = new Date(record.date);
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        return recordDate >= fromDate && recordDate <= toDate;
      });
    },
  });
}

// Create health record mutation with optimistic updates
export function useCreateHealthRecord() {
  const queryClient = useQueryClient();

  return useCreateResource<HealthRecord, CreateHealthRecordInput>(
    (data) => healthRecordService.createHealthRecord(data).then(res => res.data!),
    {
      listQueryKey: healthRecordKeys.lists(),
      onSuccess: (newRecord) => {
        // Update vaccinations if it's a vaccination
        if (newRecord.type === 'vaccination') {
          queryClient.setQueryData(healthRecordKeys.vaccinations(newRecord.petId), (old: HealthRecord[] | undefined) =>
            old ? [...old, newRecord] : [newRecord]
          );
        }
      },
      onSettled: (newRecord) => {
        if (newRecord) {
          queryClient.invalidateQueries({ queryKey: healthRecordKeys.list(newRecord.petId) });
          queryClient.invalidateQueries({ queryKey: healthRecordKeys.lists() });

          if (newRecord.type === 'vaccination') {
            queryClient.invalidateQueries({ queryKey: healthRecordKeys.vaccinations(newRecord.petId) });
            queryClient.invalidateQueries({ queryKey: healthRecordKeys.upcoming() });
          }
        }
      },
    }
  );
}

// Update health record mutation with optimistic updates
export function useUpdateHealthRecord() {
  const queryClient = useQueryClient();

  return useUpdateResource<HealthRecord, UpdateHealthRecordInput>(
    ({ id, data }) => healthRecordService.updateHealthRecord(id, data).then(res => res.data!),
    {
      listQueryKey: healthRecordKeys.lists(),
      detailQueryKey: healthRecordKeys.detail,
      onSettled: (data) => {
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.lists() });
        if (data) {
            queryClient.invalidateQueries({ queryKey: healthRecordKeys.detail(data.id) });
            if (data.type === 'vaccination') {
                queryClient.invalidateQueries({ queryKey: healthRecordKeys.vaccinations(data.petId) });
                queryClient.invalidateQueries({ queryKey: healthRecordKeys.upcoming() });
            }
        }
      },
    }
  );
}

// Delete health record mutation with optimistic updates
export function useDeleteHealthRecord() {
  const queryClient = useQueryClient();

  return useDeleteResource<HealthRecord>(
    (id) => healthRecordService.deleteHealthRecord(id).then(res => res.data),
    {
      listQueryKey: healthRecordKeys.lists(),
      detailQueryKey: healthRecordKeys.detail,
      onSuccess: (data, id) => {
         // Remove from vaccinations if it was a vaccination
         // Note: Hard to know if it was vaccination without fetching, but we can invalidate.
         // Or if we had the object. useDeleteResource doesn't return the object usually unless we fetch it first.
         // The original code fetched it in onMutate.
         // The generic hook fetches list in onMutate but not detail unless we provide detailQueryKey.
         // But we can't easily access the deleted item in onSuccess unless the mutation returns it.
         // The generic hook returns what mutationFn returns.
         // So if deleteHealthRecord returns the deleted record, we are good.
         // If it returns ID, we can't check type.
         // So we should just invalidate vaccinations and upcoming.
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.lists() });
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.upcoming() });
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.vaccinations('') }); // Invalidate all vaccinations potentially
      },
    }
  );
}

// Export type for external use
export type { HealthRecordFilters };
