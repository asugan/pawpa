import { useWindowDimensions } from 'react-native';

/**
 * Responsive sizing hook for mobile-first design
 *
 * Breakpoints:
 * - Mobile: < 600px
 * - Tablet: 600px - 900px
 * - Desktop: >= 900px
 *
 * @returns Responsive size values and breakpoint flags
 */
export interface ResponsiveSize {
  // Breakpoint flags
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;

  // Responsive values
  cardPadding: number;
  avatarSize: number;
  iconSize: number;
  gap: number;
  scrollPadding: number;
}

export const useResponsiveSize = (): ResponsiveSize => {
  const { width } = useWindowDimensions();

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 900;
  const isDesktop = width >= 900;

  return {
    // Breakpoints
    isMobile,
    isTablet,
    isDesktop,
    width,

    // Responsive values
    cardPadding: isMobile ? 12 : 16,
    avatarSize: isMobile ? 60 : 85,
    iconSize: isMobile ? 40 : 56,
    gap: isMobile ? 8 : 12,
    scrollPadding: isMobile ? 12 : 16,
  };
};
