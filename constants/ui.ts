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

/**
 * Viewport breakpoints for responsive layouts
 * Mobile: 320px - 767px (horizontal scroll)
 * Tablet: 768px - 1024px (grid layout 2-3 columns)
 * Desktop: >= 1024px (currently uses tablet layout)
 */
export const BREAKPOINTS = {
  MOBILE_MAX: 767,
  TABLET_MIN: 768,
  TABLET_MAX: 1024,
} as const;

/**
 * StatCard component constraints
 */
export const STAT_CARD_CONSTRAINTS = {
  MIN_WIDTH: 160,              // FR-008: minimum card width
  MIN_FONT_SIZE: 12,           // SC-004: minimum readable font size
  MIN_TOUCH_TARGET: 44,        // Accessibility: minimum touch target
  MAX_TITLE_LINES: 2,          // FR-004: truncation after 2 lines
  CARD_GAP: 12,                // SC-007: minimum gap between cards
  CARD_BORDER_RADIUS: 12,      // Existing design system
  CARD_BORDER_WIDTH: 1,        // Existing design system
} as const;

/**
 * Viewport constraints
 */
export const VIEWPORT_CONSTRAINTS = {
  MIN_SUPPORTED: 320,          // Clarification: minimum supported viewport
  MAX_OPTIMIZED: 1024,         // Clarification: maximum optimized viewport
} as const;

/**
 * Performance targets
 */
export const PERFORMANCE_TARGETS = {
  SCROLL_RESPONSE_MS: 300,     // SC-003: maximum scroll response time
  TARGET_FPS: 60,              // Smooth animations
  LAYOUT_TRANSITION_MS: 200,   // Smooth breakpoint transitions
} as const;
