import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui';
import { useTheme } from '@/lib/theme';

// Static styles defined outside component to prevent recreation on every render
const styles = StyleSheet.create({
  cardContent: {
    padding: 16,
  },
  card: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  nameSkeleton: {
    width: '60%',
    height: 20,
    borderRadius: 4,
    marginBottom: 6,
  },
  typeSkeleton: {
    width: '40%',
    height: 16,
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoSkeleton: {
    width: '30%',
    height: 14,
    borderRadius: 4,
  },
  badgeSkeleton: {
    width: 80,
    height: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
});

export const PetCardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceVariant }]} />
          <View style={styles.textContainer}>
            <View style={[styles.nameSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
            <View style={[styles.typeSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={[styles.infoSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
          <View style={[styles.infoSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
        </View>

        <View style={styles.infoRow}>
          <View style={[styles.infoSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
          <View style={[styles.badgeSkeleton, { backgroundColor: theme.colors.surfaceVariant }]} />
        </View>
      </View>
    </Card>
  );
};