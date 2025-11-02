import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// Vibrant Candy Color Palette (Light Mode)
const lightColors = {
  // Ana Renkler (Candy Colors)
  primary: "#FF6B9D",        // 🍭 Bright Pink (şeker pembe)
  secondary: "#00E5A0",      // 🍃 Vibrant Mint (canlı nane)
  tertiary: "#A855F7",       // 💜 Electric Lavender (elektrik mor)
  accent: "#FFB347",         // 🍊 Orange Candy (portakal şeker)

  // Durum Renkleri
  success: "#10B981",        // ✅ Bright Green
  warning: "#F59E0B",        // ⚠️ Golden Yellow
  error: "#EF4444",          // ❌ Bright Red
  info: "#3B82F6",           // ℹ️ Bright Blue

  // Yüzeyler
  background: "#FFFFFF",     // Beyaz
  surface: "#FAFAFA",        // Çok hafif gri
  surfaceVariant: "#F5F5F5", // Hafif gri

  // Metin Renkleri
  onPrimary: "#FFFFFF",
  onSecondary: "#FFFFFF",
  onTertiary: "#FFFFFF",
  onAccent: "#FFFFFF",
  onBackground: "#1F2937",   // Koyu gri (siyah yerine)
  onSurface: "#374151",      // Orta koyu gri
  onSurfaceVariant: "#6B7280", // Orta gri
  onError: "#FFFFFF",
  onSuccess: "#FFFFFF",
  onWarning: "#FFFFFF",
};

// Neon/Glow Color Palette (Dark Mode)
const darkColors = {
  // Ana Renkler (Neon/Glow Effect)
  primary: "#FF4A8B",        // 💗 Neon Pink (parlak pembe)
  secondary: "#00D696",      // 💚 Bright Mint (parlak nane)
  tertiary: "#C084FC",       // 💜 Neon Lavender (parlak mor)
  accent: "#FB923C",         // 🟠 Orange Glow (turuncu ışık)

  // Durum Renkleri (Daha parlak)
  success: "#34D399",        // ✅ Neon Green
  warning: "#FBBF24",        // ⚠️ Bright Gold
  error: "#F87171",          // ❌ Bright Red
  info: "#60A5FA",           // ℹ️ Bright Blue

  // Yüzeyler (Saf siyah değil!)
  background: "#0F1419",     // Çok koyu gri (glow için)
  surface: "#1A1F26",        // Koyu gri (background'dan açık)
  surfaceVariant: "#252B35", // Orta koyu gri

  // Metin Renkleri (Daha parlak)
  onPrimary: "#FFFFFF",
  onSecondary: "#000000",
  onTertiary: "#000000",
  onAccent: "#000000",
  onBackground: "#F9FAFB",   // Çok açık gri (beyaza yakın)
  onSurface: "#E5E7EB",      // Açık gri
  onSurfaceVariant: "#D1D5DB", // Orta açık gri
  onError: "#FFFFFF",
  onSuccess: "#000000",
  onWarning: "#000000",
};

// Gradient tanımları (light mode için)
export const gradients = {
  primary: ["#FF6B9D", "#FF8FAB"] as const,      // Pink gradient
  secondary: ["#00E5A0", "#00F5AE"] as const,    // Mint gradient
  tertiary: ["#A855F7", "#C084FC"] as const,     // Purple gradient
  accent: ["#FFB347", "#FFC870"] as const,       // Orange gradient
};

// Dark mode gradients (daha parlak)
export const gradientsDark = {
  primary: ["#FF4A8B", "#FF6B9D"] as const,
  secondary: ["#00D696", "#00E5A0"] as const,
  tertiary: ["#C084FC", "#D8B4FE"] as const,
  accent: ["#FB923C", "#FDBA74"] as const,
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  roundness: 20, // Softer, more candy-like corners
  fonts: {
    ...MD3LightTheme.fonts,
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontSize: 32,
      fontWeight: "700" as const,
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontSize: 28,
      fontWeight: "600" as const,
    },
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontSize: 16,
      fontWeight: "400" as const,
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontSize: 14,
      fontWeight: "400" as const,
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  roundness: 20, // Softer, more candy-like corners
  fonts: {
    ...MD3DarkTheme.fonts,
    headlineLarge: {
      ...MD3DarkTheme.fonts.headlineLarge,
      fontSize: 32,
      fontWeight: "700" as const,
    },
    headlineMedium: {
      ...MD3DarkTheme.fonts.headlineMedium,
      fontSize: 28,
      fontWeight: "600" as const,
    },
    bodyLarge: {
      ...MD3DarkTheme.fonts.bodyLarge,
      fontSize: 16,
      fontWeight: "400" as const,
    },
    bodyMedium: {
      ...MD3DarkTheme.fonts.bodyMedium,
      fontSize: 14,
      fontWeight: "400" as const,
    },
  },
};

export type ThemeMode = "light" | "dark";
