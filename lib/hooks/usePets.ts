import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petService } from '../services/petService';
import type { Pet, CreatePetInput, UpdatePetInput } from '../types';

// Query keys
export const petKeys = {
  all: ['pets'] as const,
  lists: () => [...petKeys.all, 'list'] as const,
  list: (filters?: any) => [...petKeys.lists(), filters] as const,
  details: () => [...petKeys.all, 'detail'] as const,
  detail: (id: string) => [...petKeys.details(), id] as const,
  stats: () => [...petKeys.all, 'stats'] as const,
};

// Hook for fetching all pets
export function usePets(filters?: { type?: string; search?: string }) {
  return useQuery({
    queryKey: petKeys.list(filters),
    queryFn: () => {
      if (filters?.type) {
        return petService.getPetsByType(filters.type);
      }
      if (filters?.search) {
        return petService.searchPets(filters.search);
      }
      return petService.getPets();
    },
    select: (data) => data,
  });
}

// Hook for fetching a single pet
export function usePet(id: string) {
  return useQuery({
    queryKey: petKeys.detail(id),
    queryFn: () => petService.getPetById(id),
    enabled: !!id, // Only fetch if id exists
  });
}

// Hook for pet statistics
export function usePetStats() {
  return useQuery({
    queryKey: petKeys.stats(),
    queryFn: () => petService.getPetStats(),
  });
}

// Hook for creating a pet
export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePetInput) => petService.createPet(data),
    onSuccess: () => {
      // Invalidate and refetch pets list
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      queryClient.invalidateQueries({ queryKey: petKeys.stats() });
    },
  });
}

// Hook for updating a pet
export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePetInput }) =>
      petService.updatePet(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific pet and pets list
      queryClient.invalidateQueries({ queryKey: petKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      queryClient.invalidateQueries({ queryKey: petKeys.stats() });
    },
  });
}

// Hook for deleting a pet
export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => petService.deletePet(id),
    onSuccess: () => {
      // Invalidate pets list and stats
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      queryClient.invalidateQueries({ queryKey: petKeys.stats() });
    },
  });
}

// Hook for uploading pet photo
export function useUploadPetPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, photoUri }: { id: string; photoUri: string }) =>
      petService.uploadPetPhoto(id, photoUri),
    onSuccess: (_, { id }) => {
      // Invalidate specific pet data
      queryClient.invalidateQueries({ queryKey: petKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
    },
  });
}