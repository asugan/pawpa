import { Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StepHeaderProps {
  title: string;
  counterLabel: string;
  currentStep: number;
  totalSteps: number;
  testID?: string;
}

export function StepHeader({
  title,
  counterLabel,
  currentStep,
  totalSteps,
  testID,
}: StepHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container} testID={testID}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>{title}</Text>
      <Text style={[styles.counter, { color: theme.colors.onSurfaceVariant }]}>
        {counterLabel}
      </Text>
      <View style={styles.dots}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={`step-dot-${index}`}
            style={[
              styles.dot,
              { backgroundColor: theme.colors.primary + '33' },
              index === currentStep && { backgroundColor: theme.colors.primary },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  counter: {
    fontSize: 13,
    marginBottom: 12,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 6,
    width: 24,
    borderRadius: 3,
  },
});
