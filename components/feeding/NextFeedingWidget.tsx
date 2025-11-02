import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme, Text, Card, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useNextFeeding } from '@/lib/hooks/useFeedingSchedules';
import { usePets } from '@/lib/hooks/usePets';
import { formatTimeForDisplay, getNextFeedingTime } from '@/lib/schemas/feedingScheduleSchema';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, gradientsDark } from '@/lib/theme';

export function NextFeedingWidget() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const locale = i18n.language === 'tr' ? tr : enUS;

  // Fetch next feeding
  const { data: nextFeedingSchedule = null, isLoading } = useNextFeeding();

  // Fetch pets for display
  const { data: pets = [] } = usePets();

  // Calculate next feeding time
  const nextFeedingTime = nextFeedingSchedule ? getNextFeedingTime([nextFeedingSchedule]) : null;
  const nextSchedule = nextFeedingSchedule;

  // Get pet details
  const pet = nextSchedule ? pets.find(p => p.id === nextSchedule.petId) : null;

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
        <Card.Content style={styles.content}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('common.loading')}
          </Text>
        </Card.Content>
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
            <Card.Content style={styles.content}>
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
            </Card.Content>
          </LinearGradient>
        </Pressable>
      </Card>
    );
  }

  // Calculate time until next feeding
  const timeUntil = formatDistanceToNow(nextFeedingTime, { addSuffix: true, locale });

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={theme.dark ? ['#1A1F26', '#252B35'] : ['#FFFFFF', '#FAFAFA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <Card.Content style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
                🍽️ {t('feedingSchedule.nextFeeding')}
              </Text>
              <IconButton
                icon="arrow-right"
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
          </Card.Content>
        </LinearGradient>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
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
