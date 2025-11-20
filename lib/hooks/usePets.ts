import { useQuery, useQueryClient } from '@tanstack/react-query';
import { petService } from '../services/petService';
import type { CreatePetInput, Pet, UpdatePetInput } from '../types';
import { CACHE_TIMES } from '../config/queryConfig';
import { useCreateResource, useDeleteResource, useUpdateResource } from './useCrud';
import { createQueryKeys } from './core/createQueryKeys';
import { useResource } from './core/useResource';
import { useConditionalQuery } from './core/useConditionalQuery';

// Type-safe filters for pets
interface PetFilters {
  search?: string;
  type?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'type';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Query keys factory
const basePetKeys = createQueryKeys('pets');

// Extended query keys with custom keys
export const petKeys = {
  ...basePetKeys,
  stats: () => [...basePetKeys.all, 'stats'] as const,
  byType: (type: string) => [...basePetKeys.all, 'type', type] as const,
};

// Hook for fetching all pets with type-safe filters
// Note: This hook has complex conditional logic and client-side sorting,
// so it uses useQuery directly instead of generic hooks
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
    staleTime: CACHE_TIMES.MEDIUM,
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
  return useConditionalQuery<Pet[]>({
    queryKey: petKeys.search(query),
    queryFn: () => petService.searchPets(query),
    staleTime: CACHE_TIMES.SHORT,
    enabled: !!query && query.trim().length > 0,
    defaultValue: [],
    errorMessage: 'Arama yapılamadı',
  });
}

// Hook for pets by type
export function usePetsByType(type: string) {
  return useConditionalQuery<Pet[]>({
    queryKey: petKeys.byType(type),
    queryFn: () => petService.getPetsByType(type),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!type,
    defaultValue: [],
    errorMessage: 'Evcil hayvanlar yüklenemedi',
  });
}

// Hook for fetching a single pet
export function usePet(id: string) {
  return useResource<Pet>({
    queryKey: petKeys.detail(id),
    queryFn: () => petService.getPetById(id),
    staleTime: CACHE_TIMES.LONG,
    enabled: !!id,
    errorMessage: 'Pet yüklenemedi',
  });
}

// Hook for pet statistics
export function usePetStats() {
  return useQuery({
    queryKey: petKeys.stats(),
    queryFn: () => petService.getPetStats(),
    staleTime: CACHE_TIMES.LONG,
    refetchInterval: CACHE_TIMES.MEDIUM,
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
