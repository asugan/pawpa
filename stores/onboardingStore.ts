import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  currentScreen: number;
  isAnimating: boolean;
  totalScreens: number;
}

interface OnboardingActions {
  setHasSeenOnboarding: (value: boolean) => void;
  nextScreen: () => void;
  previousScreen: () => void;
  goToScreen: (screenIndex: number) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  setAnimating: (animating: boolean) => void;
}

type OnboardingStore = OnboardingState & OnboardingActions;

/**
 * Zustand store for onboarding state management
 * Persists hasSeenOnboarding to prevent showing onboarding again
 */
export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      hasSeenOnboarding: false,
      currentScreen: 0,
      isAnimating: false,
      totalScreens: 4,

      // Actions
      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),
      
      nextScreen: () => {
        const { currentScreen, totalScreens } = get();
        if (currentScreen < totalScreens - 1) {
          set({ currentScreen: currentScreen + 1, isAnimating: true });
          setTimeout(() => set({ isAnimating: false }), 300);
        }
      },
      
      previousScreen: () => {
        const { currentScreen } = get();
        if (currentScreen > 0) {
          set({ currentScreen: currentScreen - 1, isAnimating: true });
          setTimeout(() => set({ isAnimating: false }), 300);
        }
      },
      
      goToScreen: (screenIndex) => {
        const { totalScreens } = get();
        if (screenIndex >= 0 && screenIndex < totalScreens) {
          set({ currentScreen: screenIndex, isAnimating: true });
          setTimeout(() => set({ isAnimating: false }), 300);
        }
      },
      
      skipOnboarding: () => {
        set({ 
          hasSeenOnboarding: true, 
          currentScreen: 0,
          isAnimating: false 
        });
      },
      
      resetOnboarding: () => {
        set({ 
          hasSeenOnboarding: false, 
          currentScreen: 0,
          isAnimating: false 
        });
      },
      
      setAnimating: (animating) => set({ isAnimating: animating }),
    }),
    {
      name: '@pawpa_onboarding_storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist hasSeenOnboarding, reset other values on app start
      partialize: (state) => ({ hasSeenOnboarding: state.hasSeenOnboarding }),
      // Rehydrate with default values for non-persisted state
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.currentScreen = 0;
          state.isAnimating = false;
          state.totalScreens = 4;
        }
      },
    }
  )
);