import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Avatar, useTheme } from 'react-native-paper';
import { Pet } from '../lib/types';
import { useTranslation } from 'react-i18next';

interface PetCardProps {
  pet: Pet;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const PetCard: React.FC<PetCardProps> = ({
  pet,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
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

  const getAgeText = (birthDate: Date | null | undefined) => {
    if (!birthDate) return t('pets.ageUnknown');

    const today = new Date();
    const birth = new Date(birthDate);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());

    if (months < 12) {
      return `${months} ${t('pets.months')}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years} ${t('pets.years')} ${remainingMonths} ${t('pets.months')}` : `${years} ${t('pets.years')}`;
    }
  };

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.petInfo}>
          <Avatar.Icon
            size={48}
            icon={getPetIcon(pet.type)}
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          />
          <View style={styles.textContainer}>
            <Text variant="titleMedium" style={[styles.name, { color: theme.colors.onSurface }]}>
              {pet.name}
            </Text>
            <Text variant="bodyMedium" style={[styles.details, { color: theme.colors.onSurfaceVariant }]}>
              {getPetTypeLabel(pet.type)} • {pet.breed || 'Unknown'}
            </Text>
            <Text variant="bodySmall" style={[styles.age, { color: theme.colors.onSurfaceVariant }]}>
              {getAgeText(pet.birthDate)}
            </Text>
          </View>
        </View>

        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <Button
                mode="outlined"
                compact
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
                textColor={theme.colors.error}
                style={[styles.actionButton, { borderColor: theme.colors.error }]}
                onPress={onDelete}
              >
                {t('pets.delete')}
              </Button>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 4,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    marginBottom: 2,
  },
  details: {
    marginBottom: 2,
  },
  age: {
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
});

export default PetCard;