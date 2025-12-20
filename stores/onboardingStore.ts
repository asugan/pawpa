import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  hasHydrated: boolean;
}

interface OnboardingActions {
  setHasSeenOnboarding: (value: boolean) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  setHasHydrated: (value: boolean) => void;
}

type OnboardingStore = OnboardingState & OnboardingActions;

/**
 * Zustand store for onboarding state management
 * Persists hasSeenOnboarding to prevent showing onboarding again
 */
export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      // Initial state
      hasSeenOnboarding: false,
      hasHydrated: false,

      // Actions
      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),

      skipOnboarding: () => {
        set({ hasSeenOnboarding: true });
      },

      resetOnboarding: () => {
        set({ hasSeenOnboarding: false });
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: '@petopia_onboarding_storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist hasSeenOnboarding
      partialize: (state) => ({ hasSeenOnboarding: state.hasSeenOnboarding }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
