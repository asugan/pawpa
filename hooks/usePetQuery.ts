import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { petService } from '../lib/services/petService';
import { Pet, CreatePetInput, UpdatePetInput } from '../lib/types';

// Query keys for React Query cache
export const PET_KEYS = {
  all: ['pets'] as const,
  lists: () => [...PET_KEYS.all, 'list'] as const,
  list: (filters?: string) => [...PET_KEYS.lists(), filters] as const,
  details: () => [...PET_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PET_KEYS.details(), id] as const,
  stats: () => [...PET_KEYS.all, 'stats'] as const,
};

// Default query options
const DEFAULT_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

/**
 * Tüm petleri getiren hook
 */
export const usePets = () => {
  return useQuery<Pet[]>({
    queryKey: PET_KEYS.lists(),
    queryFn: async () => {
      const result = await petService.getPets();
      if (!result.success) {
        throw new Error(result.error || 'Petler yüklenemedi');
      }
      return result.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

/**
 * ID'ye göre tek bir pet getiren hook
 */
export const usePet = (id: string) => {
  return useQuery<Pet>({
    queryKey: PET_KEYS.detail(id),
    queryFn: async () => {
      const result = await petService.getPetById(id);
      if (!result.success) {
        throw new Error(result.error || 'Pet yüklenemedi');
      }
      return result.data!;
    },
    enabled: !!id, // ID boş ise sorgu çalışmaz
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

/**
 * Türe göre petleri getiren hook
 */
export const usePetsByType = (type: string) => {
  return useQuery<Pet[]>({
    queryKey: PET_KEYS.list(`type:${type}`),
    queryFn: async () => {
      const result = await petService.getPetsByType(type);
      if (!result.success) {
        throw new Error(result.error || 'Petler yüklenemedi');
      }
      return result.data!;
    },
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

/**
 * Pet arama hook'u
 */
export const useSearchPets = (query: string) => {
  return useQuery<Pet[]>({
    queryKey: PET_KEYS.list(`search:${query}`),
    queryFn: async () => {
      const result = await petService.searchPets(query);
      if (!result.success) {
        throw new Error(result.error || 'Arama başarısız');
      }
      return result.data!;
    },
    enabled: !!query && query.length >= 2, // En az 2 karakter ise arama yap
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

/**
 * Pet istatistiklerini getiren hook
 */
export const usePetStats = () => {
  return useQuery<any>({
    queryKey: PET_KEYS.stats(),
    queryFn: async () => {
      const result = await petService.getPetStats();
      if (!result.success) {
        throw new Error(result.error || 'İstatistikler yüklenemedi');
      }
      return result.data!;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });
};

/**
 * Yeni pet oluşturma mutation'ı
 */
export const useCreatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePetInput) => {
      const result = await petService.createPet(data);
      if (!result.success) {
        throw new Error(result.error || 'Pet oluşturulamadı');
      }
      return result.data!;
    },
    onSuccess: (newPet) => {
      // Pet listesini güncelle
      queryClient.invalidateQueries({ queryKey: PET_KEYS.lists() });

      // Pet detayını cache'e ekle
      queryClient.setQueryData(PET_KEYS.detail(newPet.id), newPet);

      // İstatistikleri güncelle
      queryClient.invalidateQueries({ queryKey: PET_KEYS.stats() });

      console.log('✅ Pet created and cache updated');
    },
    onError: (error) => {
      console.error('❌ Create pet mutation error:', error);
    },
  });
};

/**
 * Pet güncelleme mutation'ı
 */
export const useUpdatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePetInput }) => {
      const result = await petService.updatePet(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Pet güncellenemedi');
      }
      return result.data!;
    },
    onMutate: async ({ id, data }) => {
      // Optimistic update - önce UI'ı güncelle
      await queryClient.cancelQueries({ queryKey: PET_KEYS.detail(id) });

      const previousPet = queryClient.getQueryData<Pet>(PET_KEYS.detail(id));

      queryClient.setQueryData(PET_KEYS.detail(id), (old: Pet | undefined) =>
        old ? { ...old, ...data, updatedAt: new Date() } : undefined
      );

      return { previousPet };
    },
    onError: (error, variables, context) => {
      // Hata durumunda eski veriyi geri yükle
      if (context?.previousPet) {
        queryClient.setQueryData(PET_KEYS.detail(variables.id), context.previousPet);
      }
      console.error('❌ Update pet mutation error:', error);
    },
    onSuccess: (updatedPet) => {
      // Pet listesini güncelle
      queryClient.invalidateQueries({ queryKey: PET_KEYS.lists() });

      // Pet detayını güncelle
      queryClient.setQueryData(PET_KEYS.detail(updatedPet.id), updatedPet);

      // İstatistikleri güncelle
      queryClient.invalidateQueries({ queryKey: PET_KEYS.stats() });

      console.log('✅ Pet updated and cache updated');
    },
  });
};

/**
 * Pet silme mutation'ı
 */
export const useDeletePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await petService.deletePet(id);
      if (!result.success) {
        throw new Error(result.error || 'Pet silinemedi');
      }
      return id;
    },
    onMutate: async (id) => {
      // Optimistic update - pet'i listeden kaldır
      await queryClient.cancelQueries({ queryKey: PET_KEYS.lists() });

      const previousPets = queryClient.getQueryData<Pet[]>(PET_KEYS.lists());

      queryClient.setQueryData(PET_KEYS.lists(), (old: Pet[] | undefined) =>
        old?.filter(pet => pet.id !== id) || []
      );

      return { previousPets };
    },
    onError: (error, id, context) => {
      // Hata durumunda eski veriyi geri yükle
      if (context?.previousPets) {
        queryClient.setQueryData(PET_KEYS.lists(), context.previousPets);
      }
      console.error('❌ Delete pet mutation error:', error);
    },
    onSuccess: (deletedId) => {
      // Pet detayını cache'ten kaldır
      queryClient.removeQueries({ queryKey: PET_KEYS.detail(deletedId) });

      // Pet listesini tamamen yenile
      queryClient.invalidateQueries({ queryKey: PET_KEYS.lists() });

      // İstatistikleri güncelle
      queryClient.invalidateQueries({ queryKey: PET_KEYS.stats() });

      console.log('✅ Pet deleted and cache updated');
    },
  });
};

/**
 * Cache invalidasyon için utility hook
 */
export const useInvalidatePets = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: PET_KEYS.all });
    },
    invalidateList: () => {
      queryClient.invalidateQueries({ queryKey: PET_KEYS.lists() });
    },
    invalidatePet: (id: string) => {
      queryClient.invalidateQueries({ queryKey: PET_KEYS.detail(id) });
    },
    invalidateStats: () => {
      queryClient.invalidateQueries({ queryKey: PET_KEYS.stats() });
    },
  };
};