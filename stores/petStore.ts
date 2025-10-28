import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Pet, CreatePetInput, UpdatePetInput } from '../lib/types';
import { petService } from '../lib/services/petService';

interface PetStore {
  pets: Pet[];
  selectedPetId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions - Gerçek veritabanı operasyonları
  loadPets: () => Promise<void>;
  createPet: (petData: CreatePetInput) => Promise<Pet>;
  updatePet: (id: string, updates: UpdatePetInput) => Promise<Pet>;
  deletePet: (id: string) => Promise<void>;
  getPetById: (id: string) => Promise<Pet | null>;

  // Local state actions
  selectPet: (id: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Getters
  getSelectedPet: () => Pet | undefined;
  getPetsCount: () => number;

  // Additional utility methods
  refreshPets: () => Promise<void>;
  searchPets: (query: string) => Promise<Pet[]>;
  getPetsByType: (type: string) => Promise<Pet[]>;
}

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      pets: [],
      selectedPetId: null,
      isLoading: false,
      error: null,

      // Veritabanından petleri yükle
      loadPets: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await petService.getPets();
          if (result.success && result.data) {
            set({ pets: result.data, isLoading: false });
            console.log(`✅ ${result.data.length} pets loaded from database`);
          } else {
            throw new Error(result.error || 'Petler yüklenemedi');
          }
        } catch (error) {
          console.error('❌ Load pets error:', error);
          set({
            error: error instanceof Error ? error.message : 'Petler yüklenemedi',
            isLoading: false
          });
        }
      },

      // Yeni pet oluştur
      createPet: async (petData: CreatePetInput) => {
        set({ isLoading: true, error: null });
        try {
          const result = await petService.createPet(petData);
          if (result.success && result.data) {
            // Pet'i state'e ekle (optimistic update)
            set(state => ({
              pets: [result.data!, ...state.pets],
              isLoading: false
            }));
            console.log('✅ Pet created successfully:', result.data.id);
            return result.data;
          } else {
            throw new Error(result.error || 'Pet oluşturulamadı');
          }
        } catch (error) {
          console.error('❌ Create pet error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Pet oluşturulamadı';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      // Pet güncelle
      updatePet: async (id: string, updates: UpdatePetInput) => {
        set({ isLoading: true, error: null });
        try {
          const result = await petService.updatePet(id, updates);
          if (result.success && result.data) {
            // State'deki pet'i güncelle
            set(state => ({
              pets: state.pets.map(pet =>
                pet.id === id ? result.data! : pet
              ),
              isLoading: false
            }));
            console.log('✅ Pet updated successfully:', id);
            return result.data;
          } else {
            throw new Error(result.error || 'Pet güncellenemedi');
          }
        } catch (error) {
          console.error('❌ Update pet error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Pet güncellenemedi';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      // Pet sil
      deletePet: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await petService.deletePet(id);
          if (result.success) {
            // State'den pet'i kaldır
            set(state => ({
              pets: state.pets.filter(pet => pet.id !== id),
              selectedPetId: state.selectedPetId === id ? null : state.selectedPetId,
              isLoading: false
            }));
            console.log('✅ Pet deleted successfully:', id);
          } else {
            throw new Error(result.error || 'Pet silinemedi');
          }
        } catch (error) {
          console.error('❌ Delete pet error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Pet silinemedi';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      // ID'ye göre pet getir
      getPetById: async (id: string) => {
        try {
          const result = await petService.getPetById(id);
          if (result.success && result.data) {
            return result.data;
          } else {
            return null;
          }
        } catch (error) {
          console.error('❌ Get pet by ID error:', error);
          return null;
        }
      },

      // Local state actions
      selectPet: (id) => {
        set({ selectedPetId: id });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      // Getters
      getSelectedPet: () => {
        const { selectedPetId, pets } = get();
        return selectedPetId ? pets.find((pet) => pet.id === selectedPetId) : undefined;
      },

      getPetsCount: () => {
        return get().pets.length;
      },

      // Additional utility methods
      refreshPets: async () => {
        await get().loadPets();
      },

      searchPets: async (query: string) => {
        try {
          const result = await petService.searchPets(query);
          if (result.success && result.data) {
            return result.data;
          } else {
            throw new Error(result.error || 'Arama başarısız');
          }
        } catch (error) {
          console.error('❌ Search pets error:', error);
          return [];
        }
      },

      getPetsByType: async (type: string) => {
        try {
          const result = await petService.getPetsByType(type);
          if (result.success && result.data) {
            return result.data;
          } else {
            throw new Error(result.error || 'Petler yüklenemedi');
          }
        } catch (error) {
          console.error('❌ Get pets by type error:', error);
          return [];
        }
      },
    }),
    {
      name: 'pet-storage',
      // Sadece selectedPetId'yi persist yap, petleri veritabanından yükle
      partialize: (state) => ({
        selectedPetId: state.selectedPetId,
      }),
    }
  )
);