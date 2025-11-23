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
      <Card style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: '#4B5563', borderWidth: 1 }]}>
        <View style={styles.cardContent}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface, marginBottom: 12 }]}>
            {t('home.healthOverview')}
          </Text>

          <View style={styles.statusRow}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('health.generalStatus')}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${theme.colors.primary}33` }]}>
              <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '500' }}>
                {t('health.good')}
              </Text>
            </View>
          </View>

          <View style={[styles.progressBarContainer, { backgroundColor: '#4B5563' }]}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.primary, width: '90%' }]} />
          </View>
        </View>
      </Card>
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
  sectionTitle: {
    fontWeight: '700',
  },
  section: {
    marginBottom: 12,
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
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