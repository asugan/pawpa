import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { petService } from '../services';
import type { Pet, CreatePetInput, UpdatePetInput } from '../types';

// ============================================================================
// QUERY KEYS - Centralized and structured
// ============================================================================

export const petKeys = {
  all: ['pets'] as const,
  lists: () => [...petKeys.all, 'list'] as const,
  list: (filters?: PetFilters) => [...petKeys.lists(), filters] as const,
  details: () => [...petKeys.all, 'detail'] as const,
  detail: (id: string) => [...petKeys.details(), id] as const,
  stats: () => [...petKeys.all, 'stats'] as const,
  infinite: () => [...petKeys.all, 'infinite'] as const,
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface PetFilters {
  type?: string;
  search?: string;
  gender?: 'MALE' | 'FEMALE';
  age?: { min?: number; max?: number };
}

export interface PetQueryOptions<T = Pet[]> {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  retry?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  select?: (data: Pet[]) => T;
}

// ============================================================================
// DEFAULT QUERY OPTIONS
// ============================================================================

export const DEFAULT_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: (failureCount: number, error: any) => {
    // Don't retry on 404s
    if (error?.status === 404) return false;
    // Don't retry on network errors (retry 3 times)
    if (error?.message?.includes('Network Error')) return failureCount < 3;
    // Retry other errors 2 times
    return failureCount < 2;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnWindowFocus: true,
  refetchOnMount: true,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Base query hook for all pets with optional filters
 */
export function usePets(filters?: PetFilters, options: PetQueryOptions = {}) {
  return useQuery({
    queryKey: petKeys.list(filters),
    queryFn: async () => {
      try {
        let result;

        if (filters?.type) {
          result = await petService.getPetsByType(filters.type);
        } else if (filters?.search) {
          result = await petService.searchPets(filters.search);
        } else if (filters?.gender || filters?.age) {
          // Would need a new service method for advanced filtering
          result = await petService.getPets();
        } else {
          result = await petService.getPets();
        }

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch pets');
        }

        return result.data;
      } catch (error) {
        console.error('❌ Use pets query error:', error);
        throw error; // Re-throw for React Query to handle
      }
    },
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
    enabled: options.enabled !== false,
  });
}

/**
 * Get a single pet by ID
 */
export function usePet(id: string, options: PetQueryOptions<Pet> = {}) {
  return useQuery({
    queryKey: petKeys.detail(id),
    queryFn: async () => {
      if (!id) throw new Error('Pet ID is required');

      const result = await petService.getPetById(id);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Pet not found');
      }
      return result.data;
    },
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
    enabled: !!id && options.enabled !== false,
  });
}

/**
 * Get pets by type with optimized caching
 */
export function usePetsByType(type: string, options: PetQueryOptions = {}) {
  return usePets({ type }, {
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
    staleTime: 10 * 60 * 1000, // 10 minutes for type-based queries
  });
}

/**
 * Search pets with debouncing considerations
 */
export function useSearchPets(query: string, options: PetQueryOptions = {}) {
  return usePets(
    {
      search: query?.length >= 2 ? query : undefined,
    },
    {
      ...DEFAULT_QUERY_OPTIONS,
      ...options,
      staleTime: 2 * 60 * 1000, // 2 minutes for search
      retry: 1, // Less retries for search
      enabled: query?.length >= 2,
    }
  );
}

/**
 * Pet statistics hook
 */
export function usePetStats(options: PetQueryOptions = {}) {
  return useQuery({
    queryKey: petKeys.stats(),
    queryFn: async () => {
      const result = await petService.getPetStats();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch pet statistics');
      }
      return result.data;
    },
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
    staleTime: 15 * 60 * 1000, // 15 minutes for stats
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a new pet with optimistic updates
 */
export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePetInput) => petService.createPet(data),
    onMutate: async (newPetData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: petKeys.lists() });

      // Get current pets for rollback
      const previousPets = queryClient.getQueryData<Pet[]>(petKeys.lists());

      // Optimistically update the cache
      const newPet = {
        ...newPetData,
        id: `optimistic-${Date.now()}`, // Temporary ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Pet;

      queryClient.setQueryData<Pet[]>(petKeys.lists(), (old) =>
        old ? [newPet, ...old] : []
      );

      return { previousPets };
    },
    onSuccess: (result, variables, context) => {
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create pet');
      }

      // Replace optimistic pet with real data
      queryClient.setQueryData<Pet[]>(
        petKeys.lists(),
        (old) => old ? [result.data!, ...old.filter(pet => !pet.id.startsWith('optimistic-'))] : []
      );

      // Invalidate and refetch other queries
      queryClient.invalidateQueries({ queryKey: petKeys.stats() });
      queryClient.refetchQueries({ queryKey: petKeys.lists() });

      console.log('✅ Pet created successfully:', result.data.id);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousPets) {
        queryClient.setQueryData<Pet[]>(petKeys.lists(), context.previousPets);
      }

      console.error('❌ Create pet error:', error);
    },
    onSettled: () => {
      // Refresh the list to ensure consistency
      queryClient.refetchQueries({ queryKey: petKeys.lists() });
    },
  });
}

/**
 * Update a pet with optimistic updates and error handling
 */
export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePetInput }) =>
      petService.updatePet(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: petKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: petKeys.lists() });

      // Get current data for rollback
      const previousPet = queryClient.getQueryData<Pet>(petKeys.detail(id));
      const previousPets = queryClient.getQueryData<Pet[]>(petKeys.lists());

      // Optimistic update
      const updatedPet = {
        ...previousPet,
        ...data,
        id, // Ensure ID is preserved
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Pet>(petKeys.detail(id), updatedPet);

      if (previousPets) {
        queryClient.setQueryData<Pet[]>(
          petKeys.lists(),
          (old) => old?.map(pet => pet.id === id ? updatedPet : pet)
        );
      }

      return { previousPet, previousPets };
    },
    onSuccess: (result, variables, context) => {
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update pet');
      }

      // Update optimistic data with real response
      queryClient.setQueryData<Pet>(petKeys.detail(variables.id), result.data);

      queryClient.setQueryData<Pet[]>(
        petKeys.lists(),
        (old) => old?.map(pet => pet.id === variables.id ? result.data! : pet)
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: petKeys.stats() });

      console.log('✅ Pet updated successfully:', variables.id);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousPet) {
        queryClient.setQueryData<Pet>(petKeys.detail(variables.id), context.previousPet);
      }
      if (context?.previousPets) {
        queryClient.setQueryData<Pet[]>(petKeys.lists(), context.previousPets);
      }

      console.error('❌ Update pet error:', error);
    },
  });
}

/**
 * Delete a pet with optimistic updates
 */
export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => petService.deletePet(id),
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: petKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: petKeys.lists() });

      // Get current data for rollback
      const previousPets = queryClient.getQueryData<Pet[]>(petKeys.lists());
      const previousPet = queryClient.getQueryData<Pet>(petKeys.detail(id));

      // Optimistic update - remove from cache
      queryClient.setQueryData<Pet[]>(
        petKeys.lists(),
        (old) => old?.filter(pet => pet.id !== id) || []
      );

      queryClient.setQueryData<Pet>(petKeys.detail(id), undefined);

      return { previousPets, previousPet };
    },
    onSuccess: (result, deletedId, context) => {
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete pet');
      }

      // Clean up deleted pet from all related queries
      queryClient.removeQueries({ queryKey: petKeys.detail(deletedId) });

      // Invalidate list and stats
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      queryClient.invalidateQueries({ queryKey: petKeys.stats() });

      console.log('✅ Pet deleted successfully:', deletedId);
    },
    onError: (error, deletedId, context) => {
      // Rollback optimistic update
      if (context?.previousPets) {
        queryClient.setQueryData<Pet[]>(petKeys.lists(), context.previousPets);
      }
      if (context?.previousPet) {
        queryClient.setQueryData<Pet>(petKeys.detail(deletedId), context.previousPet);
      }

      console.error('❌ Delete pet error:', error);
    },
    onSettled: (deletedId) => {
      // Refresh the list to ensure consistency
      if (deletedId) {
        queryClient.refetchQueries({ queryKey: petKeys.lists() });
      }
    },
  });
}

/**
 * Upload pet photo
 */
export function useUploadPetPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, photoUri }: { id: string; photoUri: string }) =>
      petService.uploadPetPhoto(id, photoUri),
    onSuccess: (result, { id }) => {
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to upload photo');
      }

      // Update the pet's photo in cache
      queryClient.setQueryData<Pet>(petKeys.detail(id), result.data);

      // Invalidate list to update any avatar displays
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });

      console.log('✅ Pet photo uploaded successfully:', id);
    },
    onError: (error, variables) => {
      console.error('❌ Upload pet photo error:', error);
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Utility hook for cache invalidation
 */
export function usePetCache() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.all });
    },
    invalidateList: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
    },
    invalidatePet: (id: string) => {
      queryClient.invalidateQueries({ queryKey: petKeys.detail(id) });
    },
    invalidateStats: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.stats() });
    },
    removePet: (id: string) => {
      queryClient.removeQueries({ queryKey: petKeys.detail(id) });
    },
    setPetData: (id: string, data: Pet) => {
      queryClient.setQueryData<Pet>(petKeys.detail(id), data);
    },
    setPetsData: (data: Pet[]) => {
      queryClient.setQueryData<Pet[]>(petKeys.lists(), data);
    },
  };
}

/**
 * Hook to check if pet data is stale
 */
export function usePetDataStale() {
  const { isStale: arePetsStale } = useQuery({
    queryKey: petKeys.lists(),
    queryFn: () => Promise.resolve([]), // Don't actually fetch
    initialData: [],
  });

  const { isStale: isStatsStale } = useQuery({
    queryKey: petKeys.stats(),
    queryFn: () => Promise.resolve({}), // Don't actually fetch
    initialData: {},
  });

  return {
    arePetsStale,
    isStatsStale,
    isAnyDataStale: arePetsStale || isStatsStale,
  };
}