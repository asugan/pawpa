import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, IconButton, Chip, Switch } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import { FeedingSchedule } from '../../lib/types';
import { formatTimeForDisplay } from '../../lib/schemas/feedingScheduleSchema';

interface FeedingScheduleCardProps {
  schedule: FeedingSchedule;
  onPress?: (schedule: FeedingSchedule) => void;
  onEdit?: (schedule: FeedingSchedule) => void;
  onDelete?: (schedule: FeedingSchedule) => void;
  onToggleActive?: (schedule: FeedingSchedule, isActive: boolean) => void;
  showPetInfo?: boolean;
  showActions?: boolean;
  compact?: boolean;
  testID?: string;
}

export function FeedingScheduleCard({
  schedule,
  onPress,
  onEdit,
  onDelete,
  onToggleActive,
  showPetInfo = true,
  showActions = true,
  compact = false,
  testID,
}: FeedingScheduleCardProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Parse days string into array
  const daysArray = schedule.days.split(',').map(d => d.trim());

  // Format days for display
  const formatDays = () => {
    if (daysArray.length === 7) {
      return t('feedingSchedule.everyday');
    }

    // Show first 3 days, then "+ X more" if there are more
    const displayDays = daysArray.slice(0, 3).map(day =>
      t(`days.${day.toLowerCase()}`)
    );

    if (daysArray.length > 3) {
      displayDays.push(`+${daysArray.length - 3}`);
    }

    return displayDays.join(', ');
  };

  const handlePress = React.useCallback(() => {
    onPress?.(schedule);
  }, [onPress, schedule]);

  const handleEdit = React.useCallback((e: any) => {
    e.stopPropagation();
    onEdit?.(schedule);
  }, [onEdit, schedule]);

  const handleDelete = React.useCallback((e: any) => {
    e.stopPropagation();
    onDelete?.(schedule);
  }, [onDelete, schedule]);

  const handleToggleActive = React.useCallback((e: any) => {
    e.stopPropagation();
    onToggleActive?.(schedule, !schedule.isActive);
  }, [onToggleActive, schedule]);

  const cardStyle = compact ? styles.compactCard : styles.card;
  const contentStyle = compact ? styles.compactContent : styles.content;

  // Color based on food type
  const getFoodTypeColor = () => {
    const colors: Record<string, string> = {
      dry_food: '#FFA07A', // Light Salmon
      wet_food: '#87CEEB', // Sky Blue
      raw_food: '#FFB6C1', // Light Pink
      homemade: '#98FB98', // Pale Green
      treats: '#FFD700', // Gold
      supplements: '#DDA0DD', // Plum
      other: '#D3D3D3', // Light Gray
    };
    return colors[schedule.foodType] || theme.colors.primary;
  };

  const foodTypeColor = getFoodTypeColor();

  return (
    <Pressable
      onPress={handlePress}
      style={[
        cardStyle,
        {
          backgroundColor: theme.colors.surface,
          borderColor: schedule.isActive ? foodTypeColor : theme.colors.surfaceDisabled,
          borderWidth: 2,
          opacity: schedule.isActive ? 1 : 0.6,
        }
      ]}
      testID={testID}
    >
      <View style={contentStyle}>
        {/* Header with time and food type */}
        <View style={styles.header}>
          <View style={styles.timeContainer}>
            <View
              style={[
                styles.timeIcon,
                { backgroundColor: foodTypeColor }
              ]}
            >
              <Text style={styles.timeIconText}>🍽️</Text>
            </View>
            <View style={styles.timeInfo}>
              <Text
                variant="headlineSmall"
                style={[styles.time, { color: theme.colors.onSurface }]}
              >
                {formatTimeForDisplay(schedule.time)}
              </Text>
              <Text
                variant="labelMedium"
                style={[styles.foodTypeLabel, { color: foodTypeColor }]}
              >
                {t(`foodTypes.${schedule.foodType}`)}
              </Text>
            </View>
          </View>

          {/* Active toggle */}
          {showActions && onToggleActive && (
            <View style={styles.switchContainer}>
              <Switch
                value={schedule.isActive}
                onValueChange={handleToggleActive}
                color={theme.colors.primary}
                testID={`${testID}-toggle`}
              />
            </View>
          )}
        </View>

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountIcon}>📏</Text>
          <Text
            variant="bodyLarge"
            style={[styles.amount, { color: theme.colors.onSurface }]}
          >
            {schedule.amount}
          </Text>
        </View>

        {/* Days (if not compact) */}
        {!compact && (
          <View style={styles.daysContainer}>
            {daysArray.map((day, index) => (
              <Chip
                key={index}
                mode="flat"
                compact
                textStyle={[
                  styles.dayChipText,
                  { color: theme.colors.onSurfaceVariant }
                ]}
                style={[
                  styles.dayChip,
                  { backgroundColor: theme.colors.surfaceVariant }
                ]}
              >
                {t(`days.${day.toLowerCase()}`).substring(0, 3)}
              </Chip>
            ))}
          </View>
        )}

        {/* Compact days text */}
        {compact && (
          <Text
            variant="bodySmall"
            style={[styles.daysText, { color: theme.colors.onSurfaceVariant }]}
          >
            {formatDays()}
          </Text>
        )}

        {/* Pet Information */}
        {showPetInfo && (
          <View style={styles.petInfo}>
            <Chip
              mode="flat"
              compact
              textStyle={[
                styles.petChipText,
                { color: theme.colors.onSurfaceVariant }
              ]}
              style={[
                styles.petChip,
                { backgroundColor: theme.colors.surfaceVariant }
              ]}
            >
              🐾 {t('feedingSchedule.forPet')}
            </Chip>
          </View>
        )}

        {/* Footer with status and actions */}
        <View style={styles.footer}>
          {/* Status indicator */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: schedule.isActive
                    ? theme.colors.primary
                    : theme.colors.surfaceDisabled
                }
              ]}
            />
            <Text
              variant="labelSmall"
              style={[
                styles.statusText,
                {
                  color: schedule.isActive
                    ? theme.colors.primary
                    : theme.colors.surfaceDisabled
                }
              ]}
            >
              {schedule.isActive
                ? t('feedingSchedule.active')
                : t('feedingSchedule.inactive')
              }
            </Text>
          </View>

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
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timeIconText: {
    fontSize: 20,
  },
  timeInfo: {
    flex: 1,
  },
  time: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  foodTypeLabel: {
    fontWeight: '600',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  switchContainer: {
    marginLeft: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  amount: {
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  dayChip: {
    height: 28,
    marginRight: 4,
    marginBottom: 4,
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  daysText: {
    marginBottom: 12,
    fontWeight: '500',
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
  },
});

export default FeedingScheduleCard;
