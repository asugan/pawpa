import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Card } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useNextFeedingWithDetails } from '@/lib/hooks/useFeedingSchedules';
import { formatTimeForDisplay } from '@/lib/schemas/feedingScheduleSchema';
import { Ionicons } from '@expo/vector-icons';

export function NextFeedingWidget() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  // Use combined hook for all feeding details
  const {
    schedule: nextSchedule,
    pet,
    nextFeedingTime,
    isLoading,
  } = useNextFeedingWithDetails(i18n.language);

  const handlePress = () => {
    router.push('/(tabs)/feeding');
  };

  // Loading state
  if (isLoading) {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: '#4B5563' }]}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '33' }]}>
            <Ionicons name="restaurant" size={28} color={theme.colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('feedingSchedule.nextFeeding')}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('common.loading')}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  // No feeding schedules
  if (!nextSchedule || !nextFeedingTime) {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: '#4B5563' }]}>
        <Pressable onPress={handlePress} style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '33' }]}>
            <Ionicons name="restaurant" size={28} color={theme.colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('feedingSchedule.nextFeeding')}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('feedingSchedule.noNextFeeding')}
            </Text>
          </View>
        </Pressable>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: '#4B5563' }]}>
      <Pressable onPress={handlePress} style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '33' }]}>
          <Ionicons name="restaurant" size={28} color={theme.colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
            {t('feedingSchedule.nextFeeding')}
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
            {formatTimeForDisplay(nextSchedule.time)} - {pet?.name}
          </Text>
        </View>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
});

export default NextFeedingWidget;
