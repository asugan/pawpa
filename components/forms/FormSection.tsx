import { useTheme } from '@/lib/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: any;
}

export const FormSection = ({ title, subtitle, children, style }: FormSectionProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    gap: 0, // Smart components handle their own spacing
  },
});
