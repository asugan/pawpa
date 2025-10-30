import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { ThemeMode } from '../lib/theme';

interface ThemeStore {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isDarkMode: () => boolean;
  getThemeClass: () => string;
}

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        themeMode: 'light',

        toggleTheme: () => {
          set((state) => {
            const newTheme = state.themeMode === 'light' ? 'dark' : 'light';
            console.log(`🎨 Theme toggled to: ${newTheme}`);
            return { themeMode: newTheme };
          });
        },

        setTheme: (mode: ThemeMode) => {
          set({ themeMode: mode });
          console.log(`🎨 Theme set to: ${mode}`);
        },

        isDarkMode: () => {
          return get().themeMode === 'dark';
        },

        getThemeClass: () => {
          return `theme-${get().themeMode}`;
        },
      }),
      {
        name: 'theme-storage',
        version: 1,
        partialize: (state) => ({
          themeMode: state.themeMode,
        }),
      }
    ),
    {
      name: 'theme-store',
    }
  )
);