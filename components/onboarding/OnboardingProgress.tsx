import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme/hooks';

interface OnboardingProgressProps {
  current: number;
  total: number;
  style?: any;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  current,
  total,
  style,
}) => {
  const theme = useTheme();
  
  const progress = current / (total - 1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${progress * 100}%`, {
        duration: 300,
      }),
    };
  });

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { backgroundColor: theme.theme.colors.surfaceVariant }]}>
        <Animated.View 
          style={[
            styles.progress, 
            { backgroundColor: theme.theme.colors.primary },
            animatedStyle
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
    minWidth: 4,
  },
});