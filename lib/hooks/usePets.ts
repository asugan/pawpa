import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petService } from '../services/petService';
import type { Pet, CreatePetInput, UpdatePetInput } from '../types';

// Type-safe filters for pets
interface PetFilters {
  search?: string;
  type?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'type';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
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
      const result = await petService.getPets();
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

  return useMutation({
    mutationFn: (data: CreatePetInput) => petService.createPet(data).then(res => res.data),
    onMutate: async (newPet) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: petKeys.lists() });

      // Snapshot the previous value
      const previousPets = queryClient.getQueryData(petKeys.list({}));

      // Optimistically update to the new value
      const tempPet = {
        ...newPet,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Pet;

      queryClient.setQueryData(petKeys.list({}), (old: Pet[] | undefined) =>
        old ? [...old, tempPet] : [tempPet]
      );

      return { previousPets };
    },
    onError: (err, newPet, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPets) {
        queryClient.setQueryData(petKeys.list({}), context.previousPets);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      queryClient.invalidateQueries({ queryKey: petKeys.stats() });
    },
  });
}

// Hook for updating a pet with optimistic updates
export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePetInput }) =>
      petService.updatePet(id, data).then(res => res.data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: petKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: petKeys.lists() });

      const previousPet = queryClient.getQueryData(petKeys.detail(id));

      // Update the pet in cache with new data
      queryClient.setQueryData(petKeys.detail(id), (old: Pet | undefined) =>
        old ? { ...old, ...data, updatedAt: new Date().toISOString() } : undefined
      );

      // Update the pet in the list
      queryClient.setQueriesData({ queryKey: petKeys.lists() }, (old: Pet[] | undefined) => {
        if (!old) return old;
        return old.map(pet =>
          pet.id === id ? { ...pet, ...data, updatedAt: new Date().toISOString() } : pet
        );
      });

      return { previousPet };
    },
    onError: (err, variables, context) => {
      if (context?.previousPet) {
        queryClient.setQueryData(petKeys.detail(variables.id), context.previousPet);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: petKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      queryClient.invalidateQueries({ queryKey: petKeys.stats() });
    },
  });
}

// Hook for deleting a pet with optimistic updates
export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => petService.deletePet(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: petKeys.lists() });

      const previousPets = queryClient.getQueryData(petKeys.list({}));

      // Remove the deleted pet from cache
      queryClient.setQueryData(petKeys.list({}), (old: Pet[] | undefined) =>
        old?.filter(pet => pet.id !== id)
      );

      return { previousPets };
    },
    onError: (err, id, context) => {
      if (context?.previousPets) {
        queryClient.setQueryData(petKeys.list({}), context.previousPets);
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove the deleted pet from cache
      queryClient.removeQueries({ queryKey: petKeys.detail(deletedId) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      queryClient.invalidateQueries({ queryKey: petKeys.stats() });
    },
  });
}

// Hook for uploading pet photo with optimistic updates
export function useUploadPetPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, photoUri }: { id: string; photoUri: string }) =>
      petService.uploadPetPhoto(id, photoUri).then(res => res.data),
    onMutate: async ({ id, photoUri }) => {
      await queryClient.cancelQueries({ queryKey: petKeys.detail(id) });

      const previousPet = queryClient.getQueryData(petKeys.detail(id));

      // Update the pet with new photo URL
      queryClient.setQueryData(petKeys.detail(id), (old: Pet | undefined) =>
        old ? { ...old, profilePhoto: photoUri, updatedAt: new Date().toISOString() } : undefined
      );

      // Update the pet in the list
      queryClient.setQueriesData({ queryKey: petKeys.lists() }, (old: Pet[] | undefined) => {
        if (!old) return old;
        return old.map(pet =>
          pet.id === id ? { ...pet, profilePhoto: photoUri, updatedAt: new Date().toISOString() } : pet
        );
      });

      return { previousPet };
    },
    onError: (err, variables, context) => {
      if (context?.previousPet) {
        queryClient.setQueryData(petKeys.detail(variables.id), context.previousPet);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: petKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
    },
  });
}

// Export type for external use
export type { PetFilters };