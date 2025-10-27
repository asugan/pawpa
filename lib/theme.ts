import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Rainbow Pastel Color Palette
const lightColors = {
  primary: '#FFB3D1',      // Soft Pink
  secondary: '#B3FFD9',    // Mint Green
  tertiary: '#C8B3FF',     // Lavender
  accent: '#FFDAB3',       // Peach
  surface: '#FFF3B3',      // Light Yellow
  background: '#FFFFFF',   // White
  onPrimary: '#FFFFFF',    // White text on primary
  onSecondary: '#333333',  // Dark text on secondary
  onTertiary: '#FFFFFF',   // White text on tertiary
  onAccent: '#333333',     // Dark text on accent
  onSurface: '#333333',    // Dark text on surface
  onBackground: '#333333', // Dark text on background
  error: '#FF6B6B',        // Soft Red
  onError: '#FFFFFF',      // White text on error
  success: '#B3FFD9',      // Mint Green
  onSuccess: '#333333',    // Dark text on success
  warning: '#FFDAB3',      // Peach
  onWarning: '#333333',    // Dark text on warning
};

const darkColors = {
  primary: '#E91E63',      // Deeper Pink for dark mode
  secondary: '#4CAF50',    // Deeper Mint
  tertiary: '#9C27B0',     // Deeper Lavender
  accent: '#FF9800',       // Deeper Peach
  surface: '#2C2C2C',      // Dark surface
  background: '#121212',   // Dark background
  onPrimary: '#FFFFFF',    // White text on primary
  onSecondary: '#FFFFFF',  // White text on secondary
  onTertiary: '#FFFFFF',   // White text on tertiary
  onAccent: '#FFFFFF',     // White text on accent
  onSurface: '#FFFFFF',    // White text on surface
  onBackground: '#FFFFFF', // White text on background
  error: '#CF6679',        // Lighter Red for dark mode
  onError: '#000000',      // Black text on error
  success: '#81C784',      // Lighter Mint
  onSuccess: '#000000',    // Black text on success
  warning: '#FFB74D',      // Lighter Peach
  onWarning: '#000000',    // Black text on warning
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  roundness: 16, // Softer corners for cute look
  fonts: {
    ...MD3LightTheme.fonts,
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontSize: 32,
      fontWeight: '700' as const,
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontSize: 28,
      fontWeight: '600' as const,
    },
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontSize: 16,
      fontWeight: '400' as const,
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontSize: 14,
      fontWeight: '400' as const,
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  roundness: 16, // Softer corners for cute look
  fonts: {
    ...MD3DarkTheme.fonts,
    headlineLarge: {
      ...MD3DarkTheme.fonts.headlineLarge,
      fontSize: 32,
      fontWeight: '700' as const,
    },
    headlineMedium: {
      ...MD3DarkTheme.fonts.headlineMedium,
      fontSize: 28,
      fontWeight: '600' as const,
    },
    bodyLarge: {
      ...MD3DarkTheme.fonts.bodyLarge,
      fontSize: 16,
      fontWeight: '400' as const,
    },
    bodyMedium: {
      ...MD3DarkTheme.fonts.bodyMedium,
      fontSize: 14,
      fontWeight: '400' as const,
    },
  },
};

export type ThemeMode = 'light' | 'dark';