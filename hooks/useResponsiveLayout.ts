import { useWindowDimensions } from 'react-native';

export interface ResponsiveLayout {
  columns: number;
  spacing: number;
  cardWidth: number;
  isTablet: boolean;
  isMobile: boolean;
}

export const useResponsiveLayout = (maxColumns: number = 2): ResponsiveLayout => {
  const { width } = useWindowDimensions();

  // Breakpoints
  const isMobile = width < 768;
  const isTablet = width >= 768;

  // Calculate columns based on screen width
  let columns = 1;
  if (isTablet) {
    columns = Math.min(maxColumns, Math.floor(width / 350)); // 350px minimum card width
  }

  // Calculate spacing
  const spacing = isMobile ? 16 : 24;

  // Calculate card width
  const totalSpacing = spacing * (columns + 1);
  const availableWidth = width - totalSpacing;
  const cardWidth = Math.floor(availableWidth / columns);

  return {
    columns,
    spacing,
    cardWidth,
    isTablet,
    isMobile,
  };
};