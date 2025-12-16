import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import { usePets } from '@/lib/hooks/usePets';
import type { Pet } from '@/lib/types';

interface PetSelectorProps {
  selectedPetId?: string;
  onPetSelect: (petId: string) => void;
  error?: string;
}

export function PetSelector({ selectedPetId, onPetSelect, error }: PetSelectorProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: pets = [], isLoading: petsLoading } = usePets();

  if (petsLoading) {
    return (
      <View style={styles.container}>
        <Text variant="labelMedium" style={styles.label}>
          {t('common.selectPet')}
        </Text>
        <Text variant="bodySmall" style={[styles.helperText, { color: theme.colors.outline }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (pets.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="labelMedium" style={styles.label}>
          {t('common.selectPet')} *
        </Text>
        <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
          {t('errors.noPets')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="labelMedium" style={styles.label}>
        {t('common.selectPet')} *
      </Text>
      <View style={styles.petChips}>
        {pets.map((pet: Pet) => (
          <Chip
            key={pet._id}
            selected={selectedPetId === pet._id}
            onPress={() => onPetSelect(pet._id)}
            style={[
              styles.chip,
              selectedPetId === pet._id && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            textStyle={[
              styles.chipText,
              selectedPetId === pet._id && {
                color: theme.colors.onPrimary,
              },
            ]}
          >
            {pet.name}
          </Chip>
        ))}
      </View>
      {error && (
        <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  petChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  chipText: {
    fontSize: 14,
  },
  helperText: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    marginTop: 4,
  },
});