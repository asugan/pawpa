import { Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { createGenderOptions, createPetTypeOptions } from '../../constants';
import { usePetForm } from '../../hooks/usePetForm';
import { PetCreateInput } from '../../lib/schemas/petSchema';
import { Pet } from '../../lib/types';
import { FormActions } from './FormActions';
import { FormSection } from './FormSection';
import { FormWeightInput } from './FormWeightInput';
import { SmartDatePicker } from './SmartDatePicker';
import { SmartDropdown } from './SmartDropdown';
import { SmartInput } from './SmartInput';
import { SmartPetPhotoPicker } from './SmartPetPhotoPicker';

interface PetFormProps {
  pet?: Pet;
  onSubmit: (data: PetCreateInput) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  testID?: string;
}

export function PetForm({ pet, onSubmit, onCancel, loading = false, testID }: PetFormProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { form, handleSubmit, isValid } = usePetForm(pet);

  // Track if user has attempted to submit the form
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false);

  const onFormSubmit = React.useCallback(
    async (data: PetCreateInput) => {
      try {
        await onSubmit(data);
      } catch (error) {
        console.error('Pet form submission error:', error);
      }
    },
    [onSubmit]
  );

  const isEditMode = !!pet;

  // Create dropdown options using i18n helper functions
  const petTypeOptions = React.useMemo(() => createPetTypeOptions(t), [t]);
  const genderOptions = React.useMemo(() => createGenderOptions(t), [t]);

  return (
    <FormProvider {...form}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="always"
        testID={testID}
      >
        {/* Form Header */}
        <FormSection
          title={isEditMode ? t('forms.petForm.editPet') : t('forms.petForm.addNewPet')}
          subtitle={t('forms.petForm.subtitle')}
        >
          {/* Pet Name */}
          <SmartInput
            name="name"
            required
            placeholder={t('forms.petForm.petNamePlaceholder')}
            maxLength={50}
            autoCapitalize="words"
            testID="pet-name-input"
          />

          {/* Pet Type */}
          <SmartDropdown
            name="type"
            required
            options={petTypeOptions}
            placeholder={t('forms.petForm.typePlaceholder')}
            label={t('forms.petForm.type')}
            searchable
            testID="pet-type-dropdown"
          />

          {/* Pet Breed */}
          <SmartInput
            name="breed"
            placeholder={t('forms.petForm.breedPlaceholder')}
            maxLength={100}
            autoCapitalize="words"
            testID="pet-breed-input"
          />
        </FormSection>

        {/* Physical Details */}
        <FormSection title={t('forms.petForm.sections.physicalDetails')}>
          {/* Gender */}
          <SmartDropdown
            name="gender"
            options={genderOptions}
            placeholder={t('forms.petForm.genderPlaceholder')}
            label={t('forms.petForm.gender')}
            testID="pet-gender-dropdown"
          />

          {/* Birth Date */}
          <SmartDatePicker
            name="birthDate"
            label={t('forms.petForm.birthDate')}
            testID="pet-birthdate-picker"
          />

          {/* Weight */}
          <FormWeightInput
            control={form.control}
            name="weight"
            placeholder={t('forms.petForm.weightPlaceholder')}
            min={0.1}
            max={200}
            step={0.1}
            testID="pet-weight-input"
          />
        </FormSection>

        {/* Profile Photo */}
        <FormSection title={t('forms.petForm.sections.photo')}>
          <SmartPetPhotoPicker name="profilePhoto" disabled={loading} />
        </FormSection>

        {/* Form Actions */}
        <FormActions
          onCancel={onCancel}
          onSubmit={async () => {
            setHasAttemptedSubmit(true);
            handleSubmit(onFormSubmit)();
          }}
          submitLabel={isEditMode ? t('pets.update') : t('pets.add')}
          cancelLabel={t('pets.cancel')}
          loading={loading}
          disabled={loading}
          showDivider={false}
          testID={testID}
        />

        {/* Form Status */}
        {!isValid && hasAttemptedSubmit && (
          <View style={[styles.statusContainer, { backgroundColor: theme.colors.errorContainer }]}>
            <Text style={[styles.statusText, { color: theme.colors.onErrorContainer }]}>
              {t('pets.pleaseFillRequiredFields')}
            </Text>
          </View>
        )}
      </ScrollView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
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
