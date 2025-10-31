import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme, Text, IconButton, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { format, isToday, isTomorrow, isYesterday, formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Event } from '../lib/types';
import { getEventTypeIcon, getEventTypeColor, getEventTypeLabel } from '../constants/eventIcons';

interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  showPetInfo?: boolean;
  showActions?: boolean;
  compact?: boolean;
  testID?: string;
}

export function EventCard({
  event,
  onPress,
  onEdit,
  onDelete,
  showPetInfo = true,
  showActions = true,
  compact = false,
  testID,
}: EventCardProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language === 'tr' ? tr : enUS;

  // Format event date and time
  const formatEventDateTime = () => {
    const eventDate = new Date(event.startTime);

    if (isToday(eventDate)) {
      return t('eventCard.today');
    } else if (isTomorrow(eventDate)) {
      return t('eventCard.tomorrow');
    } else if (isYesterday(eventDate)) {
      return t('eventCard.yesterday');
    } else {
      return format(eventDate, 'dd MMMM yyyy', { locale });
    }
  };

  const formatEventTime = () => {
    const startDate = new Date(event.startTime);
    const startTime = format(startDate, 'HH:mm', { locale });

    if (event.endTime) {
      const endDate = new Date(event.endTime);
      const endTime = format(endDate, 'HH:mm', { locale });
      return `${startTime} - ${endTime}`;
    }

    return startTime;
  };

  const getRelativeTime = () => {
    const eventDate = new Date(event.startTime);
    const now = new Date();
    const distance = formatDistanceToNow(eventDate, { addSuffix: true, locale });
    return distance;
  };

  const eventTypeColor = getEventTypeColor(event.type);
  const eventTypeIcon = getEventTypeIcon(event.type);
  const eventTypeLabel = getEventTypeLabel(event.type, t);

  const handlePress = React.useCallback(() => {
    onPress?.(event);
  }, [onPress, event]);

  const handleEdit = React.useCallback((e: any) => {
    e.stopPropagation();
    onEdit?.(event);
  }, [onEdit, event]);

  const handleDelete = React.useCallback((e: any) => {
    e.stopPropagation();
    onDelete?.(event);
  }, [onDelete, event]);

  const cardStyle = compact ? styles.compactCard : styles.card;
  const contentStyle = compact ? styles.compactContent : styles.content;

  return (
    <Pressable
      onPress={handlePress}
      style={[
        cardStyle,
        {
          backgroundColor: theme.colors.surface,
          borderColor: eventTypeColor,
          borderWidth: 2,
        }
      ]}
      testID={testID}
    >
      <View style={contentStyle}>
        {/* Header with event type and time */}
        <View style={styles.header}>
          <View style={styles.eventTypeContainer}>
            <View
              style={[
                styles.eventTypeIcon,
                { backgroundColor: eventTypeColor }
              ]}
            >
              <Text style={styles.eventTypeIconText}>
                {eventTypeIcon}
              </Text>
            </View>
            <View style={styles.eventTypeInfo}>
              <Text
                variant="labelMedium"
                style={[styles.eventTypeLabel, { color: eventTypeColor }]}
              >
                {eventTypeLabel}
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.relativeTime, { color: theme.colors.onSurfaceVariant }]}
              >
                {getRelativeTime()}
              </Text>
            </View>
          </View>

          <View style={styles.timeContainer}>
            <Text
              variant="labelMedium"
              style={[styles.dateTime, { color: theme.colors.onSurface }]}
            >
              {formatEventDateTime()}
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.time, { color: theme.colors.onSurface }]}
            >
              {formatEventTime()}
            </Text>
          </View>
        </View>

        {/* Event Title */}
        <Text
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.onSurface }]}
          numberOfLines={compact ? 1 : 2}
        >
          {event.title}
        </Text>

        {/* Description (if not compact) */}
        {!compact && event.description && (
          <Text
            variant="bodyMedium"
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={2}
          >
            {event.description}
          </Text>
        )}

        {/* Location (if provided) */}
        {event.location && !compact && (
          <View style={styles.locationContainer}>
            <Text style={[styles.locationIcon, { color: theme.colors.onSurfaceVariant }]}>
              📍
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.location, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              {event.location}
            </Text>
          </View>
        )}

        {/* Pet Information */}
        {showPetInfo && (
          <View style={styles.petInfo}>
            <Chip
              mode="flat"
              textStyle={[
                styles.petChipText,
                { color: theme.colors.onSurfaceVariant }
              ]}
              style={[
                styles.petChip,
                { backgroundColor: theme.colors.surfaceVariant }
              ]}
            >
              🐾 {t('eventCard.forPet')}
            </Chip>
          </View>
        )}

        {/* Footer with reminder and actions */}
        <View style={styles.footer}>
          {/* Reminder indicator */}
          {event.reminder && (
            <View style={styles.reminderContainer}>
              <Text style={styles.reminderIcon}>🔔</Text>
              <Text
                variant="labelSmall"
                style={[styles.reminderText, { color: theme.colors.onSurfaceVariant }]}
              >
                {t('eventCard.reminderSet')}
              </Text>
            </View>
          )}

          {/* Action buttons */}
          {showActions && (
            <View style={styles.actions}>
              {onEdit && (
                <IconButton
                  icon="pencil"
                  size={20}
                  iconColor={theme.colors.primary}
                  onPress={handleEdit}
                  testID={`${testID}-edit`}
                />
              )}
              {onDelete && (
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor={theme.colors.error}
                  onPress={handleDelete}
                  testID={`${testID}-delete`}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  compactCard: {
    borderRadius: 12,
    marginBottom: 8,
    marginHorizontal: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  content: {
    padding: 16,
  },
  compactContent: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  eventTypeIconText: {
    fontSize: 16,
  },
  eventTypeInfo: {
    flex: 1,
  },
  eventTypeLabel: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  relativeTime: {
    fontSize: 11,
    marginTop: 1,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  dateTime: {
    fontWeight: '500',
  },
  time: {
    fontWeight: '400',
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    lineHeight: 20,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  location: {
    fontSize: 13,
    flex: 1,
  },
  petInfo: {
    marginBottom: 8,
  },
  petChip: {
    height: 28,
    alignSelf: 'flex-start',
  },
  petChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  reminderText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
  },
});

export default EventCard;