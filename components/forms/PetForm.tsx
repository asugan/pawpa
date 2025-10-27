import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme, Text, Button } from 'react-native-paper';
import { Pet } from '../../lib/types';
import { PetCreateInput } from '../../lib/schemas/petSchema';
import { usePetForm } from '../../hooks/usePetForm';
import { PET_TYPE_OPTIONS, GENDER_OPTIONS } from '../../constants';
import FormInput from './FormInput';
import FormDropdown from './FormDropdown';
import FormDatePicker from './FormDatePicker';
import FormWeightInput from './FormWeightInput';

interface PetFormProps {
  pet?: Pet;
  onSubmit: (data: PetCreateInput) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  testID?: string;
}

export function PetForm({
  pet,
  onSubmit,
  onCancel,
  loading = false,
  testID,
}: PetFormProps) {
  const theme = useTheme();
  const { control, handleSubmit, errors, isSubmitting, isValid } = usePetForm(pet);

  const onFormSubmit = React.useCallback(async (data: PetCreateInput) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Pet form submission error:', error);
    }
  }, [onSubmit]);

  const isEditMode = !!pet;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      testID={testID}
    >
      <View style={styles.formContent}>
        {/* Form Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            {isEditMode ? 'Pet Düzenle' : 'Yeni Pet Ekle'}
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Lütfen evcil dostunuzun bilgilerini giriniz
          </Text>
        </View>

        {/* Pet Name */}
        <FormInput
          control={control}
          name="name"
          label="Pet Adı"
          required
          placeholder="Örn: Max, Luna, Patis"
          maxLength={50}
          autoCapitalize="words"
          testID="pet-name-input"
        />

        {/* Pet Type */}
        <FormDropdown
          control={control}
          name="type"
          label="Tür"
          required
          options={PET_TYPE_OPTIONS}
          placeholder="Pet türünü seçin"
          searchable
          testID="pet-type-dropdown"
        />

        {/* Pet Breed */}
        <FormInput
          control={control}
          name="breed"
          label="Cins"
          placeholder="Örn: Golden Retriever, Siyam, Van kedisi"
          maxLength={100}
          autoCapitalize="words"
          testID="pet-breed-input"
        />

        {/* Gender */}
        <FormDropdown
          control={control}
          name="gender"
          label="Cinsiyet"
          options={GENDER_OPTIONS}
          placeholder="Cinsiyet seçin (opsiyonel)"
          testID="pet-gender-dropdown"
        />

        {/* Birth Date */}
        <FormDatePicker
          control={control}
          name="birthDate"
          label="Doğum Tarihi"
          placeholder="Doğum tarihi seçin (opsiyonel)"
          testID="pet-birthdate-picker"
        />

        {/* Weight */}
        <FormWeightInput
          control={control}
          name="weight"
          label="Kilo"
          placeholder="Kilo girin (opsiyonel)"
          min={0.1}
          max={200}
          step={0.1}
          testID="pet-weight-input"
        />

        {/* Profile Photo - Placeholder for Phase 3 */}
        <View style={[styles.photoPlaceholder, { borderColor: theme.colors.outline }]}>
          <Text style={[styles.photoPlaceholderText, { color: theme.colors.onSurfaceVariant }]}>
            📷 Fotoğraf yükleme Phase 3'te eklenecek
          </Text>
        </View>

        {/* Form Actions */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onCancel}
            disabled={loading}
            style={[styles.actionButton, styles.cancelButton]}
            contentStyle={styles.buttonContent}
            testID="cancel-button"
          >
            İptal
          </Button>

          <Button
            mode="contained"
            onPress={handleSubmit(onFormSubmit)}
            loading={loading}
            disabled={!isValid || loading}
            style={[styles.actionButton, styles.submitButton]}
            contentStyle={styles.buttonContent}
            testID="submit-button"
          >
            {isEditMode ? 'Güncelle' : 'Ekle'}
          </Button>
        </View>

        {/* Form Status */}
        {!isValid && (
          <View style={[styles.statusContainer, { backgroundColor: theme.colors.errorContainer }]}>
            <Text style={[styles.statusText, { color: theme.colors.onErrorContainer }]}>
              Lütfen zorunlu alanları doldurunuz
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formContent: {
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    textAlign: 'center',
    fontFamily: 'System',
  },
  photoPlaceholder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
  },
  photoPlaceholderText: {
    fontSize: 14,
    fontFamily: 'System',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    borderColor: undefined,
  },
  submitButton: {
    backgroundColor: undefined,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  statusContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default PetForm;