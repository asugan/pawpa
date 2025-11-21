import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { lightTheme, darkTheme } from '@/lib/theme/themes';
import type { ThemeMode, Theme } from '@/lib/theme/types';

export interface ThemeState {
  themeMode: ThemeMode;
  theme: Theme;
  isDark: boolean;
}

export interface ThemeActions {
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      // Initial state
      themeMode: 'light',
      theme: lightTheme,
      isDark: false,

      // Actions
      toggleTheme: () => {
        const currentMode = get().themeMode;
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        const newTheme = newMode === 'light' ? lightTheme : darkTheme;

        set({
          themeMode: newMode,
          theme: newTheme,
          isDark: newMode === 'dark',
        });

        console.log(`🎨 Theme toggled to: ${newMode}`);
      },

      setTheme: (mode: ThemeMode) => {
        const newTheme = mode === 'light' ? lightTheme : darkTheme;

        set({
          themeMode: mode,
          theme: newTheme,
          isDark: mode === 'dark',
        });

        console.log(`🎨 Theme set to: ${mode}`);
      },
    }),
    {
      name: 'theme-storage',
      // Only persist the mode, derive the rest on rehydration
      partialize: (state) => ({
        themeMode: state.themeMode,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore full theme after rehydration
        if (state) {
          const mode = state.themeMode;
          state.theme = mode === 'light' ? lightTheme : darkTheme;
          state.isDark = mode === 'dark';
        }
      },
    }
  )
);