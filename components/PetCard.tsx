import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Avatar, useTheme } from 'react-native-paper';
import { Pet } from '../lib/types';
import { PET_TYPE_LABELS } from '../constants';

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

  const getAgeText = (birthDate: Date | null | undefined) => {
    if (!birthDate) return 'Yaş bilinmiyor';

    const today = new Date();
    const birth = new Date(birthDate);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());

    if (months < 12) {
      return `${months} ay`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years} yıl ${remainingMonths} ay` : `${years} yıl`;
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
              {PET_TYPE_LABELS[pet.type as keyof typeof PET_TYPE_LABELS] || pet.type} • {pet.breed || 'Bilinmiyor'}
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
                Düzenle
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
                Sil
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