import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Text } from '@/components/ui';
import { PET_TYPES } from '@/constants';
import { useTheme } from '@/lib/theme';

interface PetTypePickerProps {
  selectedType?: string | null;
  onSelect: (type: string) => void;
  label?: string;
  error?: string;
  testID?: string;
}

const getPetTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'cat':
      return 'paw';
    case 'dog':
      return 'paw';
    case 'bird':
      return 'leaf';
    case 'fish':
      return 'fish';
    case 'rabbit':
      return 'paw';
    case 'hamster':
      return 'paw';
    case 'reptile':
      return 'fish';
    default:
      return 'paw';
  }
};

const getPetTypeColor = (type: string): string => {
  switch (type) {
    case 'dog':
      return '#FFB3D1';
    case 'cat':
      return '#B3FFD9';
    case 'bird':
      return '#C8B3FF';
    case 'rabbit':
      return '#FFDAB3';
    case 'hamster':
      return '#FFF3B3';
    case 'fish':
      return '#87CEEB';
    case 'reptile':
      return '#98FB98';
    default:
      return '#FFB3D1';
  }
};

const PetTypePicker: React.FC<PetTypePickerProps> = ({
  selectedType,
  onSelect,
  label,
  error,
  testID,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const petTypes = Object.values(PET_TYPES);

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]}>
          {label}
        </Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
        testID={testID}
      >
        {petTypes.map((type) => {
          const isSelected = selectedType === type;

          return (
            <Chip
              key={type}
              selected={isSelected}
              onPress={() => onSelect(type)}
              style={[
                styles.chip,
                isSelected && { backgroundColor: getPetTypeColor(type) },
              ]}
              icon={getPetTypeIcon(type)}
              textColor={theme.colors.onSurface}
              mode={isSelected ? 'flat' : 'outlined'}
            >
              {t(`petTypes.${type}`, type)}
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

export default PetTypePicker;
