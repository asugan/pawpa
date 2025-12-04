import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustandStorage';

// UI State interface - sadece client-side state
export interface PetUIState {
  selectedPetId: string | null;
  isCreatingPet: boolean;
  filterStatus: 'all' | 'active' | 'inactive';
  sortBy: 'name' | 'createdAt' | 'lastUpdated';
  searchQuery: string;
}

export interface PetUIActions {
  setSelectedPet: (petId: string | null) => void;
  setCreatingPet: (isCreating: boolean) => void;
  setFilterStatus: (status: PetUIState['filterStatus']) => void;
  setSortBy: (sortBy: PetUIState['sortBy']) => void;
  setSearchQuery: (query: string) => void;
  clearPetUI: () => void;
}

// ✅ Sadece client-side state için UI store
export const usePetUIStore = create<PetUIState & PetUIActions>()(
  persist(
    (set) => ({
      // Initial state
      selectedPetId: null,
      isCreatingPet: false,
      filterStatus: 'all',
      sortBy: 'name',
      searchQuery: '',

      // Actions
      setSelectedPet: (petId) => set({ selectedPetId: petId }),
      setCreatingPet: (isCreating) => set({ isCreatingPet: isCreating }),
      setFilterStatus: (filterStatus) => set({ filterStatus }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      clearPetUI: () => set({
        selectedPetId: null,
        isCreatingPet: false,
        filterStatus: 'all',
        sortBy: 'name',
        searchQuery: ''
      })
    }),
    {
      name: 'pet-ui-storage',
      storage: zustandStorage,
      partialize: (state) => ({
        selectedPetId: state.selectedPetId,
        filterStatus: state.filterStatus,
        sortBy: state.sortBy
      })
    }
  )
);