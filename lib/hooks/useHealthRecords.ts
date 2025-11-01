import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthRecordService } from '../services/healthRecordService';
import type { HealthRecord, CreateHealthRecordInput, UpdateHealthRecordInput } from '../types';

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
      return allRecords.filter(record => {
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

  return useMutation({
    mutationFn: (data: CreateHealthRecordInput) =>
      healthRecordService.createHealthRecord(data),
    onMutate: async (newRecord) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: healthRecordKeys.lists() });

      // Snapshot the previous value
      const previousRecords = queryClient.getQueryData(healthRecordKeys.list(newRecord.petId, {}));

      // Optimistically update to the new value
      const tempRecord = {
        ...newRecord,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as HealthRecord;

      queryClient.setQueryData(healthRecordKeys.list(newRecord.petId, {}), (old: HealthRecord[] | undefined) =>
        old ? [...old, tempRecord] : [tempRecord]
      );

      // Update vaccinations if it's a vaccination
      if (tempRecord.type === 'vaccination') {
        queryClient.setQueryData(healthRecordKeys.vaccinations(newRecord.petId), (old: HealthRecord[] | undefined) =>
          old ? [...old, tempRecord] : [tempRecord]
        );
      }

      return { previousRecords };
    },
    onError: (err, newRecord, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRecords) {
        queryClient.setQueryData(healthRecordKeys.list(newRecord.petId, {}), context.previousRecords);
      }
    },
    onSettled: (result, error, variables) => {
      // Always refetch after error or success
      if (result?.data) {
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.list(result.data.petId) });
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.lists() });

        if (result.data.type === 'vaccination') {
          queryClient.invalidateQueries({ queryKey: healthRecordKeys.vaccinations(result.data.petId) });
          queryClient.invalidateQueries({ queryKey: healthRecordKeys.upcoming() });
        }
      } else if (variables && !error) {
        // Fallback to using input variables if no error and no data returned
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.list(variables.petId) });
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.lists() });
      }
    },
  });
}

// Update health record mutation with optimistic updates
export function useUpdateHealthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHealthRecordInput }) =>
      healthRecordService.updateHealthRecord(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: healthRecordKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: healthRecordKeys.lists() });

      const previousRecord = queryClient.getQueryData(healthRecordKeys.detail(id));

      // Update the record in cache with new data
      queryClient.setQueryData(healthRecordKeys.detail(id), (old: HealthRecord | undefined) =>
        old ? { ...old, ...data, updatedAt: new Date().toISOString() } : undefined
      );

      // Update the record in all lists
      queryClient.setQueriesData({ queryKey: healthRecordKeys.lists() }, (old: HealthRecord[] | undefined) => {
        if (!old) return old;
        return old.map(record =>
          record.id === id ? { ...record, ...data, updatedAt: new Date().toISOString() } : record
        );
      });

      return { previousRecord };
    },
    onError: (err, variables, context) => {
      if (context?.previousRecord) {
        queryClient.setQueryData(healthRecordKeys.detail(variables.id), context.previousRecord);
      }
    },
    onSettled: (result, error, variables) => {
      if (result?.data) {
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.detail(result.data.id) });
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.lists() });

        if (result.data.type === 'vaccination') {
          queryClient.invalidateQueries({ queryKey: healthRecordKeys.vaccinations(result.data.petId) });
          queryClient.invalidateQueries({ queryKey: healthRecordKeys.upcoming() });
        }
      } else if (variables && !error) {
        // Fallback to using input variables if no error and no data returned
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.lists() });
      }
    },
  });
}

// Delete health record mutation with optimistic updates
export function useDeleteHealthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => healthRecordService.deleteHealthRecord(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: healthRecordKeys.lists() });

      // Get the record to be deleted for cache updates
      const recordToDelete = queryClient.getQueryData(healthRecordKeys.detail(id)) as HealthRecord;

      // Remove the deleted record from all lists
      queryClient.setQueriesData({ queryKey: healthRecordKeys.lists() }, (old: HealthRecord[] | undefined) =>
        old?.filter(record => record.id !== id)
      );

      // Remove from vaccinations if it was a vaccination
      if (recordToDelete?.type === 'vaccination') {
        queryClient.setQueriesData({ queryKey: healthRecordKeys.vaccinations('') }, (old: HealthRecord[] | undefined) =>
          old?.filter(record => record.id !== id)
        );
      }

      queryClient.setQueryData(healthRecordKeys.upcoming(), (old: HealthRecord[] | undefined) =>
        old?.filter(record => record.id !== id)
      );

      return { recordToDelete };
    },
    onSuccess: (_, deletedId) => {
      // Remove the deleted record from cache
      queryClient.removeQueries({ queryKey: healthRecordKeys.detail(deletedId) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.upcoming() });
    },
  });
}

// Export type for external use
export type { HealthRecordFilters };