import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { usePets } from '@/lib/hooks/usePets';

interface HealthOverviewProps {
  upcomingVaccinations?: any[];
  loading?: boolean;
}

const HealthOverview: React.FC<HealthOverviewProps> = ({
  upcomingVaccinations = [],
  loading,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: pets } = usePets();

  // Get pet name by id
  const getPetName = (petId: string) => {
    const pet = pets?.find(p => p.id === petId);
    return pet?.name || '';
  };

  // Format date to DD.MM.YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Determine icon and color based on record type
  const getIconInfo = (type: string, isUpcoming: boolean) => {
    if (type === 'vaccination' && isUpcoming) {
      return { name: 'alert-circle' as const, color: '#FF7F50' }; // Orange for upcoming vaccination
    }
    return { name: 'checkmark-circle' as const, color: '#00ADB5' }; // Teal for completed
  };

  // Combine vaccinations into health items for display
  const healthItems = upcomingVaccinations.slice(0, 3).map((item, index) => ({
    id: item.id || index,
    title: item.title || item.name || t('health.vaccination'),
    petId: item.petId,
    date: item.nextDueDate || item.date,
    type: 'vaccination',
    isUpcoming: true,
  }));

  if (loading) {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: '#4B5563' }]}>
        <View style={styles.content}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('home.healthOverview')}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('common.loading')}
          </Text>
        </View>
      </Card>
    );
  }

  if (healthItems.length === 0) {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: '#4B5563' }]}>
        <View style={styles.content}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('home.healthOverview')}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('health.noRecords')}
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: '#4B5563' }]}>
      <View style={styles.content}>
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          {t('home.healthOverview')}
        </Text>

        <View style={styles.list}>
          {healthItems.map((item) => {
            const iconInfo = getIconInfo(item.type, item.isUpcoming);
            const petName = getPetName(item.petId);

            return (
              <View key={item.id} style={styles.healthItem}>
                <View style={[styles.iconCircle, { backgroundColor: iconInfo.color + '33' }]}>
                  <Ionicons name={iconInfo.name} size={20} color={iconInfo.color} />
                </View>
                <View style={styles.healthInfo}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                    {item.title}{petName ? ` - ${petName}` : ''}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatDate(item.date)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: '700',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthInfo: {
    flex: 1,
  },
});

export default HealthOverview;
