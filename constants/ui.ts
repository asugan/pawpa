import { gradients, gradientsDark } from '@/lib/theme';

export const getGradientColors = (color: string, isDark: boolean, theme: any): readonly [string, string] => {
  const gradientSet = isDark ? gradientsDark : gradients;

  // Match color to gradient
  if (color === theme.colors.primary) return gradientSet.primary;
  if (color === theme.colors.secondary) return gradientSet.secondary;
  if (color === theme.colors.tertiary) return gradientSet.tertiary;
  if (color.toLowerCase().includes('ff') || color.toLowerCase().includes('fb')) {
    return gradientSet.accent;
  }

  // Default: create gradient from color
  return [color, color + 'CC'] as const;
};
