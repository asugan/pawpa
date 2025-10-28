import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, Button, Avatar, Badge, Surface, useTheme } from 'react-native-paper';
import { Pet } from '../lib/types';
import { useTranslation } from 'react-i18next';
import { MD3Colors } from 'react-native-paper/lib/typescript/src/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PetCardProps {
  pet: Pet;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  upcomingEvents?: number;
  upcomingVaccinations?: number;
}

const PetCard: React.FC<PetCardProps> = ({
  pet,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
  upcomingEvents = 0,
  upcomingVaccinations = 0,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getPetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cat':
        return 'cat';
      case 'dog':
        return 'dog';
      case 'bird':
        return 'bird';
      case 'fish':
        return 'fish';
      case 'rabbit':
        return 'rabbit';
      case 'hamster':
        return 'hamster';
      case 'reptile':
        return 'lizard';
      default:
        return 'paw';
    }
  };

  const getPetTypeLabel = (type: string) => {
    const typeKey = type.toLowerCase();
    return t(typeKey, type); // Fallback to original type if translation not found
  };

  const getAgeText = (birthDate: string | Date | null | undefined) => {
    if (!birthDate) return t('pets.ageUnknown');

    const today = new Date();
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : new Date(birthDate);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());

    if (months < 12) {
      return `${months} ${t('pets.months')}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years} ${t('pets.years')} ${remainingMonths} ${t('pets.months')}` : `${years} ${t('pets.years')}`;
    }
  };

  const getPetTypeColor = (type: string): string => {
    const typeColors = {
      cat: theme.colors.secondary,
      dog: theme.colors.tertiary,
      bird: theme.colors.primary,
      fish: theme.colors.inversePrimary,
      rabbit: theme.colors.secondaryContainer,
      hamster: theme.colors.tertiaryContainer,
      reptile: theme.colors.surfaceVariant,
      default: theme.colors.primary,
    };
    return typeColors[type.toLowerCase() as keyof typeof typeColors] || typeColors.default;
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <Surface
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: getPetTypeColor(pet.type),
            borderWidth: 1,
          },
        ]}
        elevation={3}
      >
        <View style={styles.content}>
          {/* Header with avatar and basic info */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {pet.profilePhoto ? (
                <Avatar.Image
                  size={70}
                  source={{ uri: pet.profilePhoto }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text
                  size={70}
                  label={getInitials(pet.name)}
                  style={[styles.avatar, { backgroundColor: getPetTypeColor(pet.type) }]}
                  labelStyle={{ color: theme.colors.onPrimary, fontSize: 24, fontWeight: 'bold' }}
                />
              )}
            </View>
            <View style={styles.textContainer}>
              <Text variant="titleLarge" style={[styles.name, { color: theme.colors.onSurface }]}>
                {pet.name}
              </Text>
              <View style={styles.typeContainer}>
                <Text variant="bodyMedium" style={[styles.type, { color: getPetTypeColor(pet.type) }]}>
                  {getPetTypeLabel(pet.type)}
                </Text>
                {pet.breed && (
                  <Text variant="bodyMedium" style={[styles.breed, { color: theme.colors.onSurfaceVariant }]}>
                    • {pet.breed}
                  </Text>
                )}
              </View>
              <Text variant="bodyMedium" style={[styles.age, { color: theme.colors.onSurfaceVariant }]}>
                {getAgeText(pet.birthDate)}
              </Text>
            </View>
          </View>

          {/* Status badges */}
          <View style={styles.badgesContainer}>
            {(upcomingEvents > 0 || upcomingVaccinations > 0) && (
              <View style={styles.badgesRow}>
                {upcomingEvents > 0 && (
                  <View style={[styles.miniBadge, { backgroundColor: theme.colors.tertiaryContainer }]}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={12}
                      color={theme.colors.onTertiaryContainer}
                    />
                    <Text style={[styles.miniBadgeText, { color: theme.colors.onTertiaryContainer }]}>
                      {upcomingEvents}
                    </Text>
                  </View>
                )}
                {upcomingVaccinations > 0 && (
                  <View style={[styles.miniBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <MaterialCommunityIcons
                      name="needle"
                      size={12}
                      color={theme.colors.onSecondaryContainer}
                    />
                    <Text style={[styles.miniBadgeText, { color: theme.colors.onSecondaryContainer }]}>
                      {upcomingVaccinations}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Action buttons */}
          {showActions && (
            <View style={styles.actions}>
              {onEdit && (
                <Button
                  mode="outlined"
                  compact
                  icon="pencil"
                  textColor={theme.colors.primary}
                  style={styles.actionButton}
                  onPress={onEdit}
                >
                  {t('pets.edit')}
                </Button>
              )}
              {onDelete && (
                <Button
                  mode="outlined"
                  compact
                  icon="delete"
                  textColor={theme.colors.error}
                  style={[styles.actionButton, { borderColor: theme.colors.error }]}
                  onPress={onDelete}
                >
                  {t('pets.delete')}
                </Button>
              )}
            </View>
          )}
        </View>
      </Surface>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  card: {
    marginHorizontal: 0,
    marginVertical: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    borderWidth: 3,
    borderColor: 'white',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
    marginBottom: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  type: {
    fontWeight: '600',
  },
  breed: {
    fontWeight: '400',
  },
  age: {
    fontSize: 14,
  },
  badgesContainer: {
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  miniBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
});

export default PetCard;