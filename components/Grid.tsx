import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

interface GridProps {
  children: React.ReactNode;
  maxColumns?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const Grid: React.FC<GridProps> = ({
  children,
  maxColumns = 2,
  style,
  contentContainerStyle,
}) => {
  const { columns, spacing } = useResponsiveLayout(maxColumns);

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: spacing,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    item: {
      width: '100%',
      marginBottom: spacing,
    },
  });

  // Convert children to array and map them into grid items
  const childrenArray = React.Children.toArray(children);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.grid, contentContainerStyle]}>
        {childrenArray.map((child, index) => {
          // For tablets, calculate width for each column
          const isTabletItem = columns > 1;
          const itemWidth = isTabletItem ? `${100 / columns - 2}%` : '100%';

          return (
            <View
              key={index}
              style={[
                styles.item,
                isTabletItem && {
                  width: itemWidth as any,
                  maxWidth: `${100 / columns}%` as any,
                },
              ]}
            >
              {child}
            </View>
          );
        })}
      </View>
    </View>
  );
};