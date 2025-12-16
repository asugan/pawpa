import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useUpcomingEvents } from '@/lib/hooks/useEvents';
import { usePets } from '@/lib/hooks/usePets';

// Event type to icon mapping
const getEventIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'vet_visit':
      return 'medkit';
    case 'grooming':
      return 'cut';
    case 'walk':
      return 'footsteps';
    case 'training':
      return 'school';
    case 'feeding':
      return 'restaurant';
    case 'exercise':
      return 'fitness';
    case 'play':
      return 'game-controller';
    case 'bath':
      return 'water';
    default:
      return 'calendar';
  }
};

// Event type to color mapping
const getEventColor = (type: string): string => {
  switch (type) {
    case 'vet_visit':
      return '#EF4444'; // Red
    case 'grooming':
      return '#8B5CF6'; // Purple
    case 'walk':
      return '#10B981'; // Green
    case 'training':
      return '#F59E0B'; // Amber
    case 'feeding':
      return '#00ADB5'; // Teal
    case 'exercise':
      return '#3B82F6'; // Blue
    case 'play':
      return '#EC4899'; // Pink
    case 'bath':
      return '#06B6D4'; // Cyan
    default:
      return '#6B7280'; // Gray
  }
};

export function UpcomingEventsSection() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: events, isLoading } = useUpcomingEvents();
  const { data: pets } = usePets();

  // Get pet name by id
  const getPetName = (petId: string) => {
    const pet = pets?.find(p => p._id === petId);
    return pet?.name || '';
  };

  // Format date to DD.MM - HH:mm
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month} - ${hours}:${minutes}`;
  };

  if (isLoading) {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: '#4B5563' }]}>
        <View style={styles.content}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('events.upcoming')}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('common.loading')}
          </Text>
        </View>
      </Card>
    );
  }

  const upcomingEvents = events?.slice(0, 3) || [];

  if (upcomingEvents.length === 0) {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: '#4B5563' }]}>
        <View style={styles.content}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('events.upcoming')}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('events.noUpcomingEvents')}
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: '#4B5563' }]}>
      <View style={styles.content}>
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          {t('events.upcoming')}
        </Text>

        <View style={styles.list}>
          {upcomingEvents.map((event) => {
            const iconName = getEventIcon(event.type);
            const iconColor = getEventColor(event.type);
            const petName = getPetName(event.petId);

            return (
              <View key={event._id} style={styles.eventItem}>
                <View style={[styles.iconCircle, { backgroundColor: iconColor + '33' }]}>
                  <Ionicons name={iconName} size={20} color={iconColor} />
                </View>
                <View style={styles.eventInfo}>
                  <View style={styles.eventHeader}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
                      {event.title}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {formatDateTime(event.startTime)}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {petName}{event.description ? ` - ${event.description}` : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
}

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
    gap: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
    gap: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default UpcomingEventsSection;
