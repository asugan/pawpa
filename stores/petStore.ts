import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Pet, CreatePetInput } from '../lib/types';

interface PetStore {
  pets: Pet[];
  selectedPetId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addPet: (pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  selectPet: (id: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;

  // Getters
  getPetById: (id: string) => Pet | undefined;
  getSelectedPet: () => Pet | undefined;
  getPetsCount: () => number;
}

export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      pets: [],
      selectedPetId: null,
      isLoading: false,
      error: null,

      addPet: (petData: CreatePetInput) => {
        set((state) => ({
          pets: [
            ...state.pets,
            {
              ...petData,
              id: Date.now().toString(), // Simple ID generation for now
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          error: null,
        }));
      },

      updatePet: (id, updates) => {
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === id
              ? { ...pet, ...updates, updatedAt: new Date() }
              : pet
          ),
          error: null,
        }));
      },

      deletePet: (id) => {
        set((state) => ({
          pets: state.pets.filter((pet) => pet.id !== id),
          selectedPetId: state.selectedPetId === id ? null : state.selectedPetId,
          error: null,
        }));
      },

      selectPet: (id) => {
        set({ selectedPetId: id });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      getPetById: (id) => {
        return get().pets.find((pet) => pet.id === id);
      },

      getSelectedPet: () => {
        const { selectedPetId, pets } = get();
        return selectedPetId ? pets.find((pet) => pet.id === selectedPetId) : undefined;
      },

      getPetsCount: () => {
        return get().pets.length;
      },
    }),
    {
      name: 'pet-storage',
    }
  )
);