import { Avatar, Surface, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Pet } from '../lib/types';

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
  const { theme } = useTheme();
  const { t } = useTranslation();

  const getPetTypeLabel = (type: string) => {
    const typeKey = type.toLowerCase();
    return t(typeKey, type); // Fallback to original type if translation not found
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

  // Determine ring color based on upcoming activities
  const getRingColor = () => {
    if (upcomingVaccinations > 0) return theme.colors.accent; // Orange for vaccinations
    return theme.colors.primary; // Cyan for general
  };

  // Get next activity text
  const getNextActivity = () => {
    if (upcomingVaccinations > 0) {
      return { label: t('health.vaccination'), time: '10.05', color: theme.colors.accent };
    }
    if (upcomingEvents > 0) {
      return { label: t('events.feeding'), time: '18:00', color: theme.colors.primary };
    }
    return null;
  };

  const nextActivity = getNextActivity();

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <Surface
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: '#4B5563',
            borderWidth: 1,
          },
        ]}
        elevation={2}
      >
        <View style={[styles.content, { padding: 12 }]}>
          <View style={styles.horizontalLayout}>
            {/* Avatar */}
            <View style={[styles.avatarRing, { borderColor: getRingColor(), borderWidth: 2 }]}>
              {pet.profilePhoto ? (
                <Avatar.Image
                  size={56}
                  source={{ uri: pet.profilePhoto }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text
                  label={pet.name.charAt(0).toUpperCase()}
                  size={56}
                  style={[styles.avatar, { backgroundColor: getPetTypeColor(pet.type) }]}
                  labelStyle={{ color: theme.colors.onPrimary, fontSize: 24, fontWeight: 'bold' }}
                />
              )}
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
              <Text
                variant="titleMedium"
                style={[styles.name, { color: theme.colors.onSurface }]}
                numberOfLines={1}
              >
                {pet.name}
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.typeText, { color: theme.colors.onSurfaceVariant }]}
              >
                {getPetTypeLabel(pet.type)}
              </Text>
            </View>

            {/* Next Activity */}
            {nextActivity && (
              <View style={styles.activityContainer}>
                <Text
                  variant="bodySmall"
                  style={[styles.activityLabel, { color: theme.colors.onSurfaceVariant }]}
                >
                  {t('home.nextActivity')}:
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.activityText, { color: nextActivity.color }]}
                  numberOfLines={1}
                >
                  {nextActivity.label} ({nextActivity.time})
                </Text>
              </View>
            )}
          </View>
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
  },
  horizontalLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    marginBottom: 2,
  },
  typeText: {
    fontSize: 14,
  },
  activityContainer: {
    alignItems: 'flex-end',
  },
  activityLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  activityText: {
    fontWeight: '600',
    fontSize: 14,
  },
});

export default PetCard;