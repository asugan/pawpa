import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui';
import {  } from '@/components/ui';
import { useTheme } from '@/lib/theme';

export const PetCardSkeleton: React.FC = () => {
  const { theme } = useTheme();

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
      backgroundColor: theme.colors.surfaceVariant,
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    nameSkeleton: {
      width: '60%',
      height: 20,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 4,
      marginBottom: 6,
    },
    typeSkeleton: {
      width: '40%',
      height: 16,
      backgroundColor: theme.colors.surfaceVariant,
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
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 4,
    },
    badgeSkeleton: {
      width: 80,
      height: 24,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
  });

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar} />
          <View style={styles.textContainer}>
            <View style={styles.nameSkeleton} />
            <View style={styles.typeSkeleton} />
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoSkeleton} />
          <View style={styles.infoSkeleton} />
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoSkeleton} />
          <View style={styles.badgeSkeleton} />
        </View>
      </View>
    </Card>
  );
};