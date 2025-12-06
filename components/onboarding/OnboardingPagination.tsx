import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme/hooks';

interface OnboardingPaginationProps {
  current: number;
  total: number;
  onDotPress: (index: number) => void;
  style?: any;
}

export const OnboardingPagination: React.FC<OnboardingPaginationProps> = ({
  current,
  total,
  onDotPress,
  style,
}) => {
  const theme = useTheme();

  const Dot = ({ index }: { index: number }) => {
    const isActive = index === current;
    
    const dotAnimatedStyle = useAnimatedStyle(() => {
      return {
        width: withSpring(isActive ? 24 : 8, {
          damping: 15,
          stiffness: 100,
        }),
        backgroundColor: withTiming(
          isActive ? theme.theme.colors.primary : theme.theme.colors.surfaceVariant,
          { duration: 300 }
        ),
      };
    });

    return (
      <TouchableOpacity
        style={styles.dotContainer}
        onPress={() => onDotPress(index)}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.dot, dotAnimatedStyle]} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }, (_, index) => (
        <Dot key={index} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dotContainer: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});