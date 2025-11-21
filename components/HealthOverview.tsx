import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button,  } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Event } from '@/lib/types';
import { ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, gradientsDark } from '@/lib/theme';

interface HealthOverviewProps {
  todayEvents?: Event[];
  upcomingVaccinations?: any[];
  loading?: boolean;
  error?: string;
}

const HealthOverview: React.FC<HealthOverviewProps> = ({
  todayEvents = [],
  upcomingVaccinations = [],
  loading,
  error
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            {t('home.healthOverview')}
          </Text>
        </View>
        <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              {t('common.loading')}
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            {t('home.healthOverview')}
          </Text>
          <Button
            mode="text"
            onPress={() => router.push('/(tabs)/health')}
            compact
            textColor={theme.colors.primary}
          >
            {t('common.viewAll')}
          </Button>
        </View>
        <Card style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={styles.errorContent}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={24}
              color={theme.colors.error}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.error, marginTop: 8 }}>
              {error}
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          {t('home.healthOverview')}
        </Text>
        <Button
          mode="text"
          onPress={() => router.push('/(tabs)/health')}
          compact
          textColor={theme.colors.primary}
        >
          {t('common.viewAll')}
        </Button>
      </View>

      {todayEvents.length > 0 && (
        <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.emojiIcon}>📅</Text>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('home.todaySchedule')}
              </Text>
            </View>
            {todayEvents.slice(0, 3).map((event) => (
              <View key={event.id} style={[styles.eventItem, { borderLeftColor: theme.colors.tertiary }]}>
                <LinearGradient
                  colors={theme.dark ? gradientsDark.primary : gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.eventTimeContainer}
                >
                  <Text variant="bodySmall" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    {new Date(event.startTime).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </LinearGradient>
                <View style={styles.eventDetails}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                    {event.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {event.petId ? t('events.forPet') : ''}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              </View>
            ))}
            {todayEvents.length > 3 && (
              <Button
                mode="text"
                onPress={() => router.push('/(tabs)/calendar')}
                compact
                textColor={theme.colors.primary}
                style={styles.viewMoreButton}
              >
                {t('home.viewMoreEvents', { count: todayEvents.length - 3 })}
              </Button>
            )}
          </View>
        </Card>
      )}

      {upcomingVaccinations.length > 0 && (
        <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.emojiIcon}>💉</Text>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('health.upcomingVaccinations')}
              </Text>
            </View>
            {upcomingVaccinations.slice(0, 3).map((vaccination) => (
              <View key={vaccination.id} style={[styles.eventItem, { borderLeftColor: theme.colors.secondary }]}>
                <LinearGradient
                  colors={theme.dark ? gradientsDark.secondary : gradients.secondary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.vaccinationIconContainer}
                >
                  <Text style={styles.vaccinationEmoji}>💉</Text>
                </LinearGradient>
                <View style={styles.eventDetails}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                    {vaccination.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {new Date(vaccination.date).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              </View>
            ))}
            {upcomingVaccinations.length > 3 && (
              <Button
                mode="text"
                onPress={() => router.push('/(tabs)/health')}
                compact
                textColor={theme.colors.primary}
                style={styles.viewMoreButton}
              >
                {t('home.viewMoreVaccinations', { count: upcomingVaccinations.length - 3 })}
              </Button>
            )}
          </View>
        </Card>
      )}

      {todayEvents.length === 0 && upcomingVaccinations.length === 0 && (
        <Card style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={styles.emptyContent}>
            <Text style={styles.bigEmoji}>✨</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
              {t('home.noHealthActivities')}
            </Text>
          </View>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    padding: 16,
  },
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  section: {
    marginBottom: 12,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  emojiIcon: {
    fontSize: 20,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  errorContent: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  bigEmoji: {
    fontSize: 48,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 12,
    gap: 12,
    borderLeftWidth: 3,
  },
  eventTimeContainer: {
    minWidth: 60,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vaccinationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vaccinationEmoji: {
    fontSize: 16,
  },
  eventDetails: {
    flex: 1,
    gap: 2,
  },
  viewMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 0,
  },
});

export default HealthOverview;