import { useQuery, useQueryClient } from '@tanstack/react-query';
import { petService } from '../services/petService';
import type { CreatePetInput, Pet, UpdatePetInput } from '../types';
import { useCreateResource, useDeleteResource, useUpdateResource } from './useCrud';

// Type-safe filters for pets
interface PetFilters {
  search?: string;
  type?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'type';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Query keys
export const petKeys = {
  all: ['pets'] as const,
  lists: () => [...petKeys.all, 'list'] as const,
  list: (filters: PetFilters) => [...petKeys.lists(), filters] as const,
  details: () => [...petKeys.all, 'detail'] as const,
  detail: (id: string) => [...petKeys.details(), id] as const,
  stats: () => [...petKeys.all, 'stats'] as const,
  search: (query: string) => [...petKeys.all, 'search', query] as const,
  byType: (type: string) => [...petKeys.all, 'type', type] as const,
};

// Hook for fetching all pets with type-safe filters
export function usePets(filters: PetFilters = {}) {
  return useQuery<Pet[]>({
    queryKey: petKeys.list(filters),
    queryFn: async () => {
      if (filters?.type) {
        const result = await petService.getPetsByType(filters.type);
        if (!result.success) {
          throw new Error(result.error || 'Evcil hayvanlar yüklenemedi');
        }
        return result.data || [];
      }
      if (filters?.search) {
        const result = await petService.searchPets(filters.search);
        if (!result.success) {
          throw new Error(result.error || 'Evcil hayvanlar yüklenemedi');
        }
        return result.data || [];
      }
      // Pass pagination parameters to service
      const paginationParams = {
        page: filters.page,
        limit: filters.limit,
      };
      const result = await petService.getPets(paginationParams);
      if (!result.success) {
        throw new Error(result.error || 'Evcil hayvanlar yüklenemedi');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      // Apply client-side sorting if specified
      if (filters.sortBy) {
        return [...data].sort((a, b) => {
          const aValue = a[filters.sortBy!];
          const bValue = b[filters.sortBy!];

          if (filters.sortOrder === 'desc') {
            return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
          }
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        });
      }
      return data;
    },
  });
}

// Hook for searching pets
export function useSearchPets(query: string) {
  return useQuery<Pet[]>({
    queryKey: petKeys.search(query),
    queryFn: async () => {
      if (!query.trim()) return [];
      const result = await petService.searchPets(query);
      if (!result.success) {
        throw new Error(result.error || 'Arama yapılamadı');
      }
      return result.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!query && query.trim().length > 0,
  });
}

// Hook for pets by type
export function usePetsByType(type: string) {
  return useQuery<Pet[]>({
    queryKey: petKeys.byType(type),
    queryFn: async () => {
      if (!type) return [];
      const result = await petService.getPetsByType(type);
      if (!result.success) {
        throw new Error(result.error || 'Evcil hayvanlar yüklenemedi');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!type,
  });
}

// Hook for fetching a single pet
export function usePet(id: string) {
  return useQuery<Pet>({
    queryKey: petKeys.detail(id),
    queryFn: async () => {
      const result = await petService.getPetById(id);
      if (!result.success) {
        throw new Error(result.error || 'Pet yüklenemedi');
      }
      return result.data!;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id, // Only fetch if id exists
  });
}

// Hook for pet statistics
export function usePetStats() {
  return useQuery({
    queryKey: petKeys.stats(),
    queryFn: () => petService.getPetStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

// Hook for creating a pet with optimistic updates
export function useCreatePet() {
  const queryClient = useQueryClient();
  
  return useCreateResource<Pet, CreatePetInput>(
    (data) => petService.createPet(data).then(res => res.data!),
    {
      listQueryKey: petKeys.lists(),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: petKeys.stats() });
      }
    }
  );
}

// Hook for updating a pet with optimistic updates
export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useUpdateResource<Pet, UpdatePetInput>(
    ({ id, data }) => petService.updatePet(id, data).then(res => res.data!),
    {
      listQueryKey: petKeys.lists(),
      detailQueryKey: petKeys.detail,
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: petKeys.stats() });
      }
    }
  );
}

// Hook for deleting a pet with optimistic updates
export function useDeletePet() {
  const queryClient = useQueryClient();

  return useDeleteResource<Pet>(
    (id) => petService.deletePet(id).then(res => res.data),
    {
      listQueryKey: petKeys.lists(),
      detailQueryKey: petKeys.detail,
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: petKeys.stats() });
      }
    }
  );
}

// Hook for uploading pet photo with optimistic updates
export function useUploadPetPhoto() {
  const queryClient = useQueryClient();

  return useUpdateResource<Pet, { profilePhoto: string }>(
    ({ id, data }) => petService.uploadPetPhoto(id, data.profilePhoto).then(res => res.data!),
    {
      listQueryKey: petKeys.lists(),
      detailQueryKey: petKeys.detail,
    }
  );
}

// Export type for external use
export type { PetFilters };
