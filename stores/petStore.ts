import { create } from 'zustand';
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware';
import { Pet, CreatePetInput, UpdatePetInput } from '../lib/types';
import { petService } from '../lib/services';

// Types for actions and selectors
type PetActions = {
  // State setters
  setPets: (pets: Pet[]) => void;
  setSelectedPetId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // UI Actions
  selectPet: (id: string | null) => void;
  clearError: () => void;

  // Getters
  getSelectedPet: () => Pet | undefined;
  getPetsCount: () => number;
  getPetByIdLocal: (id: string) => Pet | undefined;
};

type PetThunks = {
  // Async operations
  loadPets: () => Promise<void>;
  createPet: (petData: CreatePetInput) => Promise<Pet>;
  updatePet: (id: string, updates: UpdatePetInput) => Promise<Pet>;
  deletePet: (id: string) => Promise<void>;
  refreshPets: () => Promise<void>;
  searchPets: (query: string) => Promise<Pet[]>;
  getPetsByType: (type: string) => Promise<Pet[]>;
};

interface PetStore extends PetActions, PetThunks {
  // State
  pets: Pet[];
  selectedPetId: string | null;
  isLoading: boolean;
  error: string | null;
}

  devtools(
      subscribeWithSelector(
        persist(
          (set, get) => ({
            // Initial state
            pets: [],
            selectedPetId: null,
            isLoading: false,
            error: null,

            // State setters
            setPets: (pets: Pet[]) => set({ pets, error: null }),
            setSelectedPetId: (id: string | null) => set({ selectedPetId: id }),
            setLoading: (loading: boolean) => set({ isLoading: loading }),
            setError: (error: string | null) => set({ error, isLoading: false }),

            // UI Actions
            selectPet: (id: string | null) => set({ selectedPetId: id }),
            clearError: () => set({ error: null }),

            // Async operations
            loadPets: async () => {
              set({ isLoading: true, error: null });
              try {
                const result = await petService.getPets();
                if (result.success && result.data) {
                  set({ pets: result.data, isLoading: false });
                  console.log(`✅ ${result.data.length} pets loaded successfully`);
                } else {
                  throw new Error(result.error || 'Failed to load pets');
                }
              } catch (error) {
                console.error('❌ Load pets error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to load pets';
                set({ error: errorMessage, isLoading: false });
              }
            },

            createPet: async (petData: CreatePetInput) => {
              set({ isLoading: true, error: null });
              try {
                const result = await petService.createPet(petData);
                if (result.success && result.data) {
                  // Optimistic update
                  set(state => ({
                    pets: [result.data!, ...state.pets],
                    isLoading: false
                  }));
                  console.log('✅ Pet created successfully:', result.data.id);
                  return result.data;
                } else {
                  throw new Error(result.error || 'Failed to create pet');
                }
              } catch (error) {
                console.error('❌ Create pet error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to create pet';
                set({ error: errorMessage, isLoading: false });
                throw errorMessage;
              }
            },

            updatePet: async (id: string, updates: UpdatePetInput) => {
              set({ isLoading: true, error: null });
              try {
                const result = await petService.updatePet(id, updates);
                if (result.success && result.data) {
                  // Update pet in state
                  set(state => ({
                    pets: state.pets.map(pet =>
                      pet.id === id ? result.data! : pet
                    ),
                    isLoading: false
                  }));
                  console.log('✅ Pet updated successfully:', id);
                  return result.data;
                } else {
                  throw new Error(result.error || 'Failed to update pet');
                }
              } catch (error) {
                console.error('❌ Update pet error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to update pet';
                set({ error: errorMessage, isLoading: false });
                throw errorMessage;
              }
            },

            deletePet: async (id: string) => {
              set({ isLoading: true, error: null });
              try {
                const result = await petService.deletePet(id);
                if (result.success) {
                  // Remove pet from state
                  set(state => ({
                    pets: state.pets.filter(pet => pet.id !== id),
                    selectedPetId: state.selectedPetId === id ? null : state.selectedPetId,
                    isLoading: false
                  }));
                  console.log('✅ Pet deleted successfully:', id);
                } else {
                  throw new Error(result.error || 'Failed to delete pet');
                }
              } catch (error) {
                console.error('❌ Delete pet error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to delete pet';
                set({ error: errorMessage, isLoading: false });
                throw errorMessage;
              }
            },

            getPetById: async (id: string) => {
              try {
                const result = await petService.getPetById(id);
                if (result.success && result.data) {
                  return result.data;
                }
                return null;
              } catch (error) {
                console.error('❌ Get pet by ID error:', error);
                return null;
              }
            },

            refreshPets: async () => {
              await get().loadPets();
            },

            searchPets: async (query: string) => {
              try {
                const result = await petService.searchPets(query);
                if (result.success && result.data) {
                  return result.data;
                }
                throw new Error(result.error || 'Search failed');
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
                }
                throw new Error(result.error || 'Failed to load pets by type');
              } catch (error) {
                console.error('❌ Get pets by type error:', error);
                return [];
              }
            },

            // Getters (memoized through selectors)
            getSelectedPet: () => {
              const { selectedPetId, pets } = get();
              return selectedPetId ? pets.find(pet => pet.id === selectedPetId) : undefined;
            },

            getPetsCount: () => {
              return get().pets.length;
            },

            getPetByIdLocal: (id: string) => {
              const { pets } = get();
              return pets.find(pet => pet.id === id);
            },
          }),
          {
            name: 'pet-storage',
            // Only persist UI state, not API data
            partialize: (state) => ({
              selectedPetId: state.selectedPetId,
              theme: (state as any).theme, // if theme is stored here
            }),
            version: 1,
          }
        )
      ),
      {
        name: 'pet-store',
      }
    )
  )
);