import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface FormRowProps {
  children: React.ReactNode;
  gap?: number;
  style?: any;
}

/**
 * FormRow component for horizontal field layouts.
 * On mobile: stacks fields vertically
 * On tablet+: displays fields side-by-side
 */
export const FormRow = ({ children, gap = 12, style }: FormRowProps) => {
  const { isMobile } = useResponsiveLayout();

  const childrenArray = React.Children.toArray(children);

  return (
    <View
      style={[
        styles.container,
        isMobile ? styles.mobileContainer : styles.tabletContainer,
        !isMobile && { gap },
        style,
      ]}
    >
      {childrenArray.map((child, index) => (
        <View key={index} style={isMobile ? styles.mobileItem : styles.tabletItem}>
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  mobileContainer: {
    flexDirection: 'column',
  },
  tabletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mobileItem: {
    width: '100%',
  },
  tabletItem: {
    flex: 1,
  },
});
