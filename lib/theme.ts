// Legacy theme.ts - now re-exports from new theme system
// This file is kept for backward compatibility during migration

export {
  useTheme,
  lightTheme,
  darkTheme,
  lightColors,
  darkColors,
  lightGradients as gradients,
  darkGradients as gradientsDark,
  fonts,
} from "./theme/index";

export type { Theme, ThemeMode, ThemeColors } from "./theme/index";
