import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Card, IconButton } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useNextFeedingWithDetails } from '@/lib/hooks/useFeedingSchedules';
import { formatTimeForDisplay } from '@/lib/schemas/feedingScheduleSchema';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, gradientsDark } from '@/lib/theme';

export function NextFeedingWidget() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  // Use combined hook for all feeding details
  const {
    schedule: nextSchedule,
    pet,
    nextFeedingTime,
    timeUntil,
    isLoading,
  } = useNextFeedingWithDetails(i18n.language);

  const handlePress = () => {
    router.push('/(tabs)/feeding');
  };

  const handleAddPress = () => {
    // Navigate to feeding tab where user can add via modal
    router.push('/(tabs)/feeding');
  };

  // Loading state
  if (isLoading) {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.content}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('common.loading')}
          </Text>
        </View>
      </Card>
    );
  }

  // No feeding schedules
  if (!nextSchedule || !nextFeedingTime) {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Pressable onPress={handleAddPress}>
          <LinearGradient
            colors={theme.dark ? ['#1A1F26', '#252B35'] : ['#FFFFFF', '#FAFAFA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                  🍽️ {t('feedingSchedule.nextFeeding')}
                </Text>
              </View>

              <View style={styles.emptyContainer}>
                <Text style={styles.bigEmoji}>🍖</Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
                >
                  {t('feedingSchedule.noNextFeeding')}
                </Text>
                <Text
                  variant="bodySmall"
                  style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}
                >
                  {t('feedingSchedule.addFirstSchedule')}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={theme.dark ? ['#1A1F26', '#252B35'] : ['#FFFFFF', '#FAFAFA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                🍽️ {t('feedingSchedule.nextFeeding')}
              </Text>
              <IconButton
                icon="arrow-forward"
                size={20}
                iconColor={theme.colors.onSurfaceVariant}
                onPress={handlePress}
              />
            </View>

            {/* Next Feeding Info */}
            <View style={styles.feedingInfo}>
              {/* Time */}
              <LinearGradient
                colors={theme.dark ? gradientsDark.accent : gradients.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.timeContainer}
              >
                <Text variant="headlineSmall" style={[styles.time, { color: '#FFFFFF' }]}>
                  {formatTimeForDisplay(nextSchedule.time)}
                </Text>
                <Text variant="bodySmall" style={[styles.timeUntil, { color: '#FFFFFF' }]}>
                  {timeUntil}
                </Text>
              </LinearGradient>

              {/* Details */}
              <View style={styles.details}>
                {/* Pet */}
                {pet && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🐾</Text>
                    <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.onSurface }]}>
                      {pet.name}
                    </Text>
                  </View>
                )}

                {/* Food Type */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>🥘</Text>
                  <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.onSurface }]}>
                    {t(`foodTypes.${nextSchedule.foodType}`)}
                  </Text>
                </View>

                {/* Amount */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📏</Text>
                  <Text variant="bodyMedium" style={[styles.detailText, { color: theme.colors.onSurface }]}>
                    {nextSchedule.amount}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    marginHorizontal: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 20,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
  },
  feedingInfo: {
    gap: 12,
  },
  timeContainer: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  time: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  timeUntil: {
    marginTop: 4,
    fontWeight: '700',
    opacity: 0.9,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    fontSize: 20,
  },
  detailText: {
    fontWeight: '500',
    flex: 1,
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  bigEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    textAlign: 'center',
  },
});

export default NextFeedingWidget;
