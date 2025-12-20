import { Button, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { createGenderOptions, createPetTypeOptions } from '../../constants';
import { usePetForm } from '../../hooks/usePetForm';
import { PetCreateFormInput } from '../../lib/schemas/petSchema';
import { Pet } from '../../lib/types';
import { FormSection } from './FormSection';
import { FormWeightInput } from './FormWeightInput';
import { SmartDatePicker } from './SmartDatePicker';
import { SmartDropdown } from './SmartDropdown';
import { SmartInput } from './SmartInput';
import { SmartPetPhotoPicker } from './SmartPetPhotoPicker';

interface PetFormProps {
  pet?: Pet;
  onSubmit: (data: PetCreateFormInput) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  testID?: string;
}

export function PetForm({ pet, onSubmit, onCancel, loading = false, testID }: PetFormProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { form, handleSubmit, isValid } = usePetForm(pet);

  const [currentStep, setCurrentStep] = React.useState(0);
  const [showStepError, setShowStepError] = React.useState(false);

  const onFormSubmit = React.useCallback(
    async (data: PetCreateFormInput) => {
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

  const steps = React.useMemo(
    () => [
      {
        key: 'basic',
        title: t('forms.petForm.steps.basicInfo'),
        fields: ['name', 'type', 'breed'] as (keyof PetCreateFormInput)[],
      },
      {
        key: 'details',
        title: t('forms.petForm.steps.physicalDetails'),
        fields: ['gender', 'birthDate', 'weight'] as (keyof PetCreateFormInput)[],
      },
      {
        key: 'photo',
        title: t('forms.petForm.steps.photo'),
        fields: ['profilePhoto'] as (keyof PetCreateFormInput)[],
      },
    ],
    [t]
  );

  const totalSteps = steps.length;
  const isFinalStep = currentStep === totalSteps - 1;

  const handleNextStep = React.useCallback(async () => {
    const isStepValid = await form.trigger(steps[currentStep].fields);
    if (!isStepValid) {
      setShowStepError(true);
      return;
    }
    setShowStepError(false);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [form, steps, currentStep, totalSteps]);

  const handleBackStep = React.useCallback(() => {
    setShowStepError(false);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleFinalSubmit = React.useCallback(async () => {
    const isFormValid = await form.trigger();
    if (!isFormValid) {
      setShowStepError(true);
      return;
    }
    setShowStepError(false);
    handleSubmit(onFormSubmit)();
  }, [form, handleSubmit, onFormSubmit]);

  return (
    <FormProvider {...form}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="always"
        testID={testID}
      >
        <View style={styles.stepHeader}>
          <Text style={[styles.stepTitle, { color: theme.colors.onBackground }]}>
            {steps[currentStep].title}
          </Text>
          <Text style={[styles.stepCounter, { color: theme.colors.onSurfaceVariant }]}>
            {t('forms.petForm.stepIndicator', { current: currentStep + 1, total: totalSteps })}
          </Text>
          <View style={styles.stepDots}>
            {steps.map((step, index) => (
              <View
                key={step.key}
                style={[
                  styles.stepDot,
                  { backgroundColor: theme.colors.primary + '33' },
                  index === currentStep && { backgroundColor: theme.colors.primary },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Form Header */}
        {currentStep === 0 && (
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
        )}

        {currentStep === 1 && (
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
        )}

        {currentStep === 2 && (
          <FormSection title={t('forms.petForm.sections.photo')}>
            <SmartPetPhotoPicker name="profilePhoto" disabled={loading} />
          </FormSection>
        )}

        <View style={styles.actions}>
          {currentStep === 0 ? (
            <Button
              mode="outlined"
              onPress={onCancel}
              disabled={loading}
              style={styles.actionButton}
              testID={testID ? `${testID}-cancel` : 'pet-form-cancel'}
            >
              {t('pets.cancel')}
            </Button>
          ) : (
            <Button
              mode="outlined"
              onPress={handleBackStep}
              disabled={loading}
              style={styles.actionButton}
              testID={testID ? `${testID}-back` : 'pet-form-back'}
            >
              {t('common.back')}
            </Button>
          )}
          {isFinalStep ? (
            <Button
              mode="contained"
              onPress={handleFinalSubmit}
              disabled={loading}
              loading={loading}
              style={styles.actionButton}
              testID={testID ? `${testID}-submit` : 'pet-form-submit'}
            >
              {isEditMode ? t('pets.update') : t('pets.add')}
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleNextStep}
              disabled={loading}
              style={styles.actionButton}
              testID={testID ? `${testID}-next` : 'pet-form-next'}
            >
              {t('common.next')}
            </Button>
          )}
        </View>

        {/* Form Status */}
        {!isValid && showStepError && (
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
  stepHeader: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepCounter: {
    fontSize: 13,
    marginBottom: 12,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    height: 6,
    width: 24,
    borderRadius: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
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
