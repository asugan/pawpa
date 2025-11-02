import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, gradientsDark } from '../lib/theme';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  onPress: () => void;
  loading?: boolean;
  error?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  onPress,
  loading,
  error
}) => {
  const theme = useTheme();

  // Gradient helper - detect which gradient to use based on color
  const getGradientColors = (color: string): string[] => {
    const isDark = theme.dark;
    const gradientSet = isDark ? gradientsDark : gradients;

    // Match color to gradient
    if (color === theme.colors.primary) return gradientSet.primary;
    if (color === theme.colors.secondary) return gradientSet.secondary;
    if (color === theme.colors.tertiary) return gradientSet.tertiary;
    if (color.toLowerCase().includes('ff') || color.toLowerCase().includes('fb')) {
      return gradientSet.accent;
    }

    // Default: create gradient from color
    return [color, color + 'CC'];
  };

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.content, styles.loadingContent]}>
          <ActivityIndicator size="small" color={color} />
          <View style={styles.loadingPlaceholder}>
            <View style={[styles.placeholderLine, { backgroundColor: theme.colors.surfaceVariant }]} />
            <View style={[styles.placeholderLine, { backgroundColor: theme.colors.surfaceVariant, width: '60%' }]} />
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        <Card style={[styles.card, { borderColor: theme.colors.error, borderWidth: 1 }]}>
          <Card.Content style={styles.content}>
            <LinearGradient
              colors={[theme.colors.error, theme.colors.error + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <MaterialCommunityIcons
                name="alert-circle"
                size={36}
                color="#FFFFFF"
              />
            </LinearGradient>
            <Text variant="headlineMedium" style={{ color: theme.colors.error, fontWeight: '800' }}>
                --
            </Text>
            <Text variant="bodyMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              {title}
            </Text>
          </Card.Content>
        </Card>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
      ]}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <LinearGradient
            colors={getGradientColors(color)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <MaterialCommunityIcons
              name={icon}
              size={36}
              color="#FFFFFF"
            />
          </LinearGradient>
          <Text variant="headlineMedium" style={{ color, fontWeight: '800' }}>
            {value}
          </Text>
          <Text variant="bodyMedium" style={styles.title}>
            {title}
          </Text>
        </Card.Content>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    marginHorizontal: 4,
  },
  card: {
    elevation: 5,
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  loadingContent: {
    justifyContent: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingPlaceholder: {
    width: '100%',
    gap: 6,
  },
  placeholderLine: {
    height: 8,
    borderRadius: 4,
    width: '80%',
    alignSelf: 'center',
  },
});

export default StatCard;