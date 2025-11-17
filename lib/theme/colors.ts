import { ThemeColors, GradientColors } from "./types";

// Vibrant Candy Color Palette (Light Mode)
export const lightColors: ThemeColors = {
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
  surfaceDisabled: "#E5E7EB", // Disabled state

  // Container colors
  primaryContainer: "#FFE5EC",      // Light pink container
  secondaryContainer: "#CCFFF0",    // Light mint container
  tertiaryContainer: "#F3E8FF",     // Light purple container
  errorContainer: "#FEE2E2",        // Light red container

  // Outline colors
  outline: "#9CA3AF",               // Gray outline
  outlineVariant: "#D1D5DB",        // Lighter outline

  // Inverse colors
  inversePrimary: "#FF4A8B",        // Inverse primary
  inverseSurface: "#1F2937",        // Dark surface for inverse
  inverseOnSurface: "#F9FAFB",      // Light text on inverse surface

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
  onPrimaryContainer: "#831843",    // Dark text on light pink
  onSecondaryContainer: "#004D40",  // Dark text on light mint
  onTertiaryContainer: "#4C1D95",   // Dark text on light purple
  onErrorContainer: "#991B1B",      // Dark text on light red
};

// Neon/Glow Color Palette (Dark Mode)
export const darkColors: ThemeColors = {
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
  surfaceDisabled: "#374151", // Disabled state

  // Container colors
  primaryContainer: "#831843",      // Dark pink container
  secondaryContainer: "#004D40",    // Dark mint container
  tertiaryContainer: "#4C1D95",     // Dark purple container
  errorContainer: "#991B1B",        // Dark red container

  // Outline colors
  outline: "#6B7280",               // Gray outline
  outlineVariant: "#4B5563",        // Darker outline

  // Inverse colors
  inversePrimary: "#FFB3D9",        // Light pink for inverse
  inverseSurface: "#F9FAFB",        // Light surface for inverse
  inverseOnSurface: "#1F2937",      // Dark text on inverse

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
  onPrimaryContainer: "#FFE5EC",    // Light text on dark pink
  onSecondaryContainer: "#CCFFF0",  // Light text on dark mint
  onTertiaryContainer: "#F3E8FF",   // Light text on dark purple
  onErrorContainer: "#FEE2E2",      // Light text on dark red
};

// Gradient tanımları (light mode için)
export const lightGradients: GradientColors = {
  primary: ["#FF6B9D", "#FF8FAB"],      // Pink gradient
  secondary: ["#00E5A0", "#00F5AE"],    // Mint gradient
  tertiary: ["#A855F7", "#C084FC"],     // Purple gradient
  accent: ["#FFB347", "#FFC870"],       // Orange gradient
};

// Dark mode gradients (daha parlak)
export const darkGradients: GradientColors = {
  primary: ["#FF4A8B", "#FF6B9D"],
  secondary: ["#00D696", "#00E5A0"],
  tertiary: ["#C084FC", "#D8B4FE"],
  accent: ["#FB923C", "#FDBA74"],
};
