import { useThemeStore } from "@/stores/themeStore";
import { ThemeContextValue } from "./types";

/**
 * Hook to access theme state and actions
 * Now backed by Zustand store for consistency with other stores
 */
export const useTheme = (): ThemeContextValue => {
  const { theme, isDark, toggleTheme, setTheme } = useThemeStore();

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };
};
