import { useQuery, useQueryClient } from '@tanstack/react-query';
import { healthRecordService } from '../services/healthRecordService';
import type { CreateHealthRecordInput, HealthRecord, UpdateHealthRecordInput } from '../types';
import { useCreateResource, useDeleteResource, useUpdateResource } from './useCrud';

// Type-safe filters for health records
interface HealthRecordFilters {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  veterinarian?: string;
  sortBy?: 'date' | 'type' | 'veterinarian' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Query keys
export const healthRecordKeys = {
  all: ['health-records'] as const,
  lists: () => [...healthRecordKeys.all, 'list'] as const,
  list: (petId: string, filters?: HealthRecordFilters) =>
    [...healthRecordKeys.lists(), petId, filters] as const,
  details: () => [...healthRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...healthRecordKeys.details(), id] as const,
  vaccinations: (petId: string) => [...healthRecordKeys.all, 'vaccinations', petId] as const,
  upcoming: () => [...healthRecordKeys.all, 'upcoming'] as const,
  byType: (petId: string, type: string) => [...healthRecordKeys.lists(), petId, 'type', type] as const,
  byDateRange: (petId: string, dateFrom: string, dateTo: string) =>
    [...healthRecordKeys.lists(), petId, 'date-range', dateFrom, dateTo] as const,
};

// Get all health records for a pet with type-safe filters
export function useHealthRecords(petId: string, filters: HealthRecordFilters = {}) {
  return useQuery({
    queryKey: healthRecordKeys.list(petId, filters),
    queryFn: async () => {
      const result = await healthRecordService.getHealthRecordsByPetId(petId);
      if (!result.success) {
        throw new Error(result.error || 'Sağlık kayıtları yüklenemedi');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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

// Get a single health record by ID (renamed from useHealthRecordById for consistency)
export function useHealthRecord(id: string) {
  return useQuery({
    queryKey: healthRecordKeys.detail(id),
    queryFn: async () => {
      const result = await healthRecordService.getHealthRecordById(id);
      if (!result.success) {
        throw new Error(result.error || 'Sağlık kaydı yüklenemedi');
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
  });
}

// Get vaccinations only
export function useVaccinations(petId: string) {
  return useQuery({
    queryKey: healthRecordKeys.vaccinations(petId),
    queryFn: async () => {
      const result = await healthRecordService.getVaccinations(petId);
      if (!result.success) {
        throw new Error(result.error || 'Aşı kayıtları yüklenemedi');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!petId,
  });
}

// Get upcoming vaccinations
export function useUpcomingVaccinations() {
  return useQuery({
    queryKey: healthRecordKeys.upcoming(),
    queryFn: async () => {
      const result = await healthRecordService.getUpcomingRecords();
      if (!result.success) {
        throw new Error(result.error || 'Yaklaşan kayıtlar yüklenemedi');
      }
      return result.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 60 * 60 * 1000, // Refresh every hour
  });
}

// Get health records by type
export function useHealthRecordsByType(petId: string, type: string) {
  return useQuery({
    queryKey: healthRecordKeys.byType(petId, type),
    queryFn: async () => {
      const result = await healthRecordService.getHealthRecordsByType(petId, type);
      if (!result.success) {
        throw new Error(result.error || 'Sağlık kayıtları yüklenemedi');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!petId && !!type,
  });
}

// Get health records by date range (using existing service method)
export function useHealthRecordsByDateRange(petId: string, dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: healthRecordKeys.byDateRange(petId, dateFrom, dateTo),
    queryFn: async () => {
      const result = await healthRecordService.getHealthRecordsByPetId(petId);
      if (!result.success) {
        throw new Error(result.error || 'Sağlık kayıtları yüklenemedi');
      }
      // Filter by date range on client side
      const allRecords = result.data || [];
      return allRecords.filter((record: HealthRecord) => {
        const recordDate = new Date(record.date);
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        return recordDate >= fromDate && recordDate <= toDate;
      });
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!petId && !!dateFrom && !!dateTo,
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
