import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme, Text, Button } from 'react-native-paper';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pet } from '../../lib/types';
import { PetCreateInput } from '../../lib/schemas/petSchema';
import { usePetForm } from '../../hooks/usePetForm';
import { createPetTypeOptions, createGenderOptions } from '../../constants';
import FormInput from './FormInput';
import FormDropdown from './FormDropdown';
import FormDatePicker from './FormDatePicker';
import FormWeightInput from './FormWeightInput';
import { PetPhotoPicker } from './PetPhotoPicker';

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
  const { t } = useTranslation();
  const theme = useTheme();
  const { control, handleSubmit, errors, isSubmitting, isValid, watch, trigger } = usePetForm(pet);

  // Watch the pet type for the PetPhotoPicker
  const petType = watch('type');

  // Track if user has attempted to submit the form
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false);

  
  
  const onFormSubmit = React.useCallback(async (data: PetCreateInput) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Pet form submission error:', error);
    }
  }, [onSubmit]);

  const isEditMode = !!pet;

  // Create dropdown options using i18n helper functions
  const petTypeOptions = React.useMemo(() => createPetTypeOptions(t), [t]);
  const genderOptions = React.useMemo(() => createGenderOptions(t), [t]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="always"
      removeClippedSubviews={false}
      testID={testID}
    >
      <View style={styles.formContent}>
        {/* Form Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            {isEditMode ? t('forms.petForm.editPet') : t('forms.petForm.addNewPet')}
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('forms.petForm.subtitle')}
          </Text>
        </View>

        {/* Pet Name */}
        <FormInput
          control={control}
          name="name"
          label={t('forms.petForm.petName')}
          required
          placeholder={t('forms.petForm.petNamePlaceholder')}
          maxLength={50}
          autoCapitalize="words"
          testID="pet-name-input"
        />

        {/* Pet Type */}
        <FormDropdown
          control={control}
          name="type"
          label={t('forms.petForm.type')}
          required
          options={petTypeOptions}
          placeholder={t('forms.petForm.typePlaceholder')}
          searchable
          testID="pet-type-dropdown"
        />

        {/* Pet Breed */}
        <FormInput
          control={control}
          name="breed"
          label={t('forms.petForm.breed')}
          placeholder={t('forms.petForm.breedPlaceholder')}
          maxLength={100}
          autoCapitalize="words"
          testID="pet-breed-input"
        />

        {/* Gender */}
        <FormDropdown
          control={control}
          name="gender"
          label={t('forms.petForm.gender')}
          options={genderOptions}
          placeholder={t('forms.petForm.genderPlaceholder')}
          testID="pet-gender-dropdown"
        />

        {/* Birth Date */}
        <FormDatePicker
          control={control}
          name="birthDate"
          label={t('forms.petForm.birthDate')}
          placeholder={t('forms.petForm.birthDatePlaceholder')}
          testID="pet-birthdate-picker"
        />

        {/* Weight */}
        <FormWeightInput
          control={control}
          name="weight"
          label={t('forms.petForm.weight')}
          placeholder={t('forms.petForm.weightPlaceholder')}
          min={0.1}
          max={200}
          step={0.1}
          testID="pet-weight-input"
        />

        {/* Profile Photo */}
        <Controller
          control={control}
          name="profilePhoto"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <PetPhotoPicker
              value={value}
              onChange={onChange}
              petType={petType}
              disabled={loading}
            />
          )}
        />

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
            {t('pets.cancel')}
          </Button>

          <Button
            mode="contained"
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            onPress={async () => {
              setHasAttemptedSubmit(true);
              handleSubmit(onFormSubmit)();
            }}
            loading={loading}
            disabled={loading}
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
            testID="submit-button"
          >
            {isEditMode ? t('pets.update') : t('pets.add')}
          </Button>
        </View>

        {/* Form Status */}
        {!isValid && hasAttemptedSubmit && (
          <View style={[styles.statusContainer, { backgroundColor: theme.colors.errorContainer }]}>
            <Text style={[styles.statusText, { color: theme.colors.onErrorContainer }]}>
              {t('pets.pleaseFillRequiredFields')}
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