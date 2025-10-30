import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Event } from '@/lib/types';
import { ActivityIndicator } from 'react-native';

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
  const theme = useTheme();
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
          <Card.Content style={styles.loadingContent}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              {t('common.loading')}
            </Text>
          </Card.Content>
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
          <Card.Content style={styles.errorContent}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={24}
              color={theme.colors.error}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.error, marginTop: 8 }}>
              {error}
            </Text>
          </Card.Content>
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
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="calendar-today"
                size={20}
                color={theme.colors.tertiary}
              />
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('home.todaySchedule')}
              </Text>
            </View>
            {todayEvents.slice(0, 3).map((event) => (
              <View key={event.id} style={styles.eventItem}>
                <View style={styles.eventTimeContainer}>
                  <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                    {new Date(event.startTime).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
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
          </Card.Content>
        </Card>
      )}

      {upcomingVaccinations.length > 0 && (
        <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="needle"
                size={20}
                color={theme.colors.secondary}
              />
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('health.upcomingVaccinations')}
              </Text>
            </View>
            {upcomingVaccinations.slice(0, 3).map((vaccination) => (
              <View key={vaccination.id} style={styles.eventItem}>
                <View style={styles.vaccinationIconContainer}>
                  <MaterialCommunityIcons
                    name="needle"
                    size={16}
                    color={theme.colors.secondary}
                  />
                </View>
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
          </Card.Content>
        </Card>
      )}

      {todayEvents.length === 0 && upcomingVaccinations.length === 0 && (
        <Card style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content style={styles.emptyContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={32}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
              {t('home.noHealthActivities')}
            </Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  eventTimeContainer: {
    minWidth: 50,
    alignItems: 'flex-start',
  },
  vaccinationIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
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