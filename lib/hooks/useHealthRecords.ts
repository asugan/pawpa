import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthRecordService } from '../services/healthRecordService';
import type { HealthRecord, CreateHealthRecordInput, UpdateHealthRecordInput } from '../types';

// Query keys
export const healthRecordKeys = {
  all: ['healthRecords'] as const,
  lists: () => [...healthRecordKeys.all, 'list'] as const,
  list: (petId?: string) => [...healthRecordKeys.lists(), petId] as const,
  details: () => [...healthRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...healthRecordKeys.details(), id] as const,
  vaccinations: (petId?: string) => [...healthRecordKeys.all, 'vaccinations', petId] as const,
  upcoming: () => [...healthRecordKeys.all, 'upcoming'] as const,
  byType: (petId: string, type: string) => [...healthRecordKeys.lists(), petId, type] as const,
};

// Get all health records for a pet
export function useHealthRecords(petId?: string) {
  return useQuery({
    queryKey: healthRecordKeys.list(petId),
    queryFn: async () => {
      if (!petId) return [];
      const result = await healthRecordService.getHealthRecordsByPetId(petId);
      if (!result.success) {
        throw new Error(result.error || 'Sağlık kayıtları yüklenemedi');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!petId,
  });
}

// Get a single health record by ID
export function useHealthRecordById(id?: string) {
  return useQuery({
    queryKey: healthRecordKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Health record ID is required');
      const result = await healthRecordService.getHealthRecordById(id);
      if (!result.success) {
        throw new Error(result.error || 'Sağlık kaydı yüklenemedi');
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
}

// Get vaccinations only
export function useVaccinations(petId?: string) {
  return useQuery({
    queryKey: healthRecordKeys.vaccinations(petId),
    queryFn: async () => {
      if (!petId) return [];
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

// Get single health record
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
    enabled: !!id,
  });
}

// Create health record mutation
export function useCreateHealthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHealthRecordInput) => healthRecordService.createHealthRecord(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate all health records queries
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.all });

        // Specifically invalidate the pet's health records
        if (variables.petId) {
          queryClient.invalidateQueries({ queryKey: healthRecordKeys.list(variables.petId) });
          queryClient.invalidateQueries({ queryKey: healthRecordKeys.vaccinations(variables.petId) });
        }

        // Invalidate upcoming vaccinations
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.upcoming() });
      }
    },
  });
}

// Update health record mutation
export function useUpdateHealthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHealthRecordInput }) =>
      healthRecordService.updateHealthRecord(id, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate the specific record
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.detail(variables.id) });

        // Invalidate all health records queries
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.all });

        // If we have the petId from the result, invalidate pet-specific queries
        if (result.data?.petId) {
          queryClient.invalidateQueries({ queryKey: healthRecordKeys.list(result.data.petId) });
          queryClient.invalidateQueries({ queryKey: healthRecordKeys.vaccinations(result.data.petId) });
        }

        // Invalidate upcoming vaccinations
        queryClient.invalidateQueries({ queryKey: healthRecordKeys.upcoming() });
      }
    },
  });
}

// Delete health record mutation
export function useDeleteHealthRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => healthRecordService.deleteHealthRecord(id),
    onSuccess: (_, id) => {
      // Remove the specific record from cache
      queryClient.removeQueries({ queryKey: healthRecordKeys.detail(id) });

      // Invalidate all health records queries
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.all });

      // Invalidate upcoming vaccinations
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.upcoming() });
    },
  });
}