import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';

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
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.errorContainer }]}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color={theme.colors.onErrorContainer}
              />
            </View>
            <Text variant="headlineMedium" style={{ color: theme.colors.error, fontWeight: 'bold' }}>
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
    <Pressable onPress={onPress} style={styles.pressable}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <MaterialCommunityIcons
              name={icon}
              size={24}
              color={color}
            />
          </View>
          <Text variant="headlineMedium" style={{ color, fontWeight: 'bold' }}>
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
    elevation: 2,
    borderRadius: 12,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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