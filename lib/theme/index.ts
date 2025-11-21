// Theme system exports
export { useTheme } from "./hooks";
export { lightTheme, darkTheme } from "./themes";
export { lightColors, darkColors, lightGradients, darkGradients } from "./colors";
export { fonts } from "./fonts";

// Re-export Zustand store for direct access if needed
export { useThemeStore } from "@/stores/themeStore";

// Re-export types
export type {
  Theme,
  ThemeMode,
  ThemeColors,
  ThemeFonts,
  ThemeContextValue,
  FontVariant,
  GradientColors,
} from "./types";
