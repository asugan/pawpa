import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeMode } from '../lib/theme';

export interface ThemeStore {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isDarkMode: () => boolean;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      themeMode: 'light',
      toggleTheme: () => {
        set((state) => ({
          themeMode: state.themeMode === 'light' ? 'dark' : 'light',
        }));
      },
      setTheme: (mode: ThemeMode) => {
        set({ themeMode: mode });
      },
      isDarkMode: () => {
        return get().themeMode === 'dark';
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);