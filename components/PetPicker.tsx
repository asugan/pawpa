import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Chip, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { usePets } from '@/lib/hooks/usePets';
import { Pet } from '@/lib/types';
import { getReadableTextColor } from '@/lib/utils/colorContrast';
import { getPetTypeColor, getPetTypeIcon } from '@/lib/utils/petTypeVisuals';

interface PetPickerBaseProps {
  selectedPetId?: string | null;
  onSelect: (petId: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  pets: Pet[];
  disabled?: boolean;
  testID?: string;
  isLoading?: boolean;
  showAllOption?: boolean;
  allLabel?: string;
  onSelectAll?: () => void;
}

export const PetPickerBase: React.FC<PetPickerBaseProps> = ({
  selectedPetId,
  onSelect,
  label,
  error,
  required = false,
  pets,
  disabled = false,
  testID,
  isLoading = false,
  showAllOption = false,
  allLabel,
  onSelectAll,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.container}>
        {label && (
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]}>
            {label}{required ? ' *' : ''}
          </Text>
        )}
        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (pets.length === 0) {
    return (
      <View style={styles.container}>
        {label && (
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]}>
            {label}{required ? ' *' : ''}
          </Text>
        )}
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          {t('pets.noPetsYet')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]}>
          {label}{required ? ' *' : ''}
        </Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
        testID={testID}
      >
        {showAllOption && (
          <Chip
            selected={!selectedPetId}
            onPress={() => onSelectAll?.()}
            style={[
              styles.chip,
              !selectedPetId && { backgroundColor: theme.colors.primary },
            ]}
            textStyle={{
              color: !selectedPetId
                ? getReadableTextColor(
                    theme.colors.primary,
                    theme.colors.onPrimary,
                    theme.colors.onSurface
                  )
                : theme.colors.onSurface,
            }}
            mode={!selectedPetId ? 'flat' : 'outlined'}
            disabled={disabled || !onSelectAll}
          >
            {allLabel || t('common.all')}
          </Chip>
        )}
        {pets.map((pet) => {
          const isSelected = selectedPetId === pet._id;
          const chipColor = getPetTypeColor(pet.type);
          const selectedTextColor = getReadableTextColor(
            chipColor,
            theme.colors.onPrimary,
            theme.colors.onSurface
          );
          const iconColor = isSelected ? selectedTextColor : theme.colors.onSurface;

          return (
            <Chip
              key={pet._id}
              selected={isSelected}
              onPress={() => onSelect(pet._id)}
              style={[
                styles.chip,
                isSelected && { backgroundColor: chipColor },
              ]}
              icon={({ size }) => (
                <Ionicons
                  name={getPetTypeIcon(pet.type)}
                  size={size}
                  color={iconColor}
                />
              )}
              textStyle={{ color: iconColor }}
              mode={isSelected ? 'flat' : 'outlined'}
              disabled={disabled}
              accessibilityLabel={`${pet.name} (${t(`petTypes.${pet.type}`, pet.type)})`}
            >
              {pet.name}
            </Chip>
          );
        })}
      </ScrollView>
      {error && (
        <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

interface PetPickerProps extends Omit<PetPickerBaseProps, 'pets' | 'isLoading'> {
  pets?: Pet[];
  isLoading?: boolean;
}

const PetPicker: React.FC<PetPickerProps> = ({ pets, isLoading, ...props }) => {
  const { data: fetchedPets = [], isLoading: isPetsLoading } = usePets();
  const resolvedPets = pets ?? fetchedPets;
  const loading = isLoading ?? (!pets && isPetsLoading);

  return (
    <PetPickerBase
      {...props}
      pets={resolvedPets}
      isLoading={loading}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    marginRight: 8,
  },
  error: {
    marginTop: 4,
    marginLeft: 4,
  },
});

export default PetPicker;
