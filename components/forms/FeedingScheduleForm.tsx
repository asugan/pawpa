import { Text } from '@/components/ui';
import { useFeedingScheduleForm } from '@/hooks/useFeedingScheduleForm';
import { useTheme } from '@/lib/theme';
import React from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { createFoodTypeOptions } from '../../constants';
import { type FeedingScheduleFormData } from '../../lib/schemas/feedingScheduleSchema';
import { FeedingSchedule, Pet } from '../../lib/types';
import { FormActions } from './FormActions';
import { FormSection } from './FormSection';
import { SmartDatePicker } from './SmartDatePicker';
import { SmartDayPicker } from './SmartDayPicker';
import { SmartDropdown } from './SmartDropdown';
import { SmartInput } from './SmartInput';
import { SmartSwitch } from './SmartSwitch';

interface FeedingScheduleFormProps {
  schedule?: FeedingSchedule;
  onSubmit: (data: FeedingScheduleFormData) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialPetId?: string;
  pets?: Pet[];
  testID?: string;
}

export function FeedingScheduleForm({
  schedule,
  onSubmit,
  onCancel,
  loading = false,
  initialPetId,
  pets = [],
  testID,
}: FeedingScheduleFormProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Use the custom hook for form management
  const { form, control, handleSubmit, isDirty } = useFeedingScheduleForm(schedule, initialPetId);

  // Watch form values for dynamic behavior
  const selectedPetId = useWatch({ control, name: 'petId' });
  const foodType = useWatch({ control, name: 'foodType' });

  // Food type options with i18n support
  const foodTypeOptions = React.useMemo(
    () => createFoodTypeOptions((key: string) => t(key)),
    [t]
  );

  // Pet options from real pet data
  const petOptions = React.useMemo(
    () =>
      pets.map((pet) => ({
        value: pet.id,
        label: `${pet.name} (${t(`petTypes.${pet.type}`)})`,
      })),
    [pets, t]
  );

  // Get selected pet details
  const selectedPet = React.useMemo(
    () => petOptions.find((pet) => pet.value === selectedPetId),
    [petOptions, selectedPetId]
  );

  // Food type specific suggestions
  const getFoodTypeSuggestion = () => {
    switch (foodType) {
      case 'dry_food':
        return t('feedingSchedule.suggestions.dryFood');
      case 'wet_food':
        return t('feedingSchedule.suggestions.wetFood');
      case 'raw_food':
        return t('feedingSchedule.suggestions.rawFood');
      case 'homemade':
        return t('feedingSchedule.suggestions.homemade');
      case 'treats':
        return t('feedingSchedule.suggestions.treats');
      case 'supplements':
        return t('feedingSchedule.suggestions.supplements');
      default:
        return t('feedingSchedule.suggestions.default');
    }
  };

  // Handle form submission
  const onFormSubmit = React.useCallback(
    async (data: FeedingScheduleFormData) => {
      try {
        setIsSubmitting(true);
        console.log('Feeding schedule form submitting:', data);

        console.log('Form data:', data);

        await onSubmit(data);
      } catch (error) {
        console.error('Feeding schedule form submission error:', error);
        Alert.alert(t('common.error'), t('feedingSchedule.errors.submitFailed'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, t]
  );

  // Form actions
  const handleCancel = React.useCallback(() => {
    if (isDirty) {
      Alert.alert(t('common.unsavedChanges'), t('common.unsavedChangesMessage'), [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.discard'),
          style: 'destructive',
          onPress: onCancel,
        },
      ]);
    } else {
      onCancel();
    }
  }, [isDirty, onCancel, t]);

  const isEditMode = !!schedule;

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
          title={isEditMode ? t('feedingSchedule.editTitle') : t('feedingSchedule.createTitle')}
          subtitle={t('feedingSchedule.subtitle')}
        >
          {/* Pet Selection */}
          <SmartDropdown
            name="petId"
            required
            options={petOptions}
            placeholder={t('feedingSchedule.placeholders.selectPet')}
            label={t('feedingSchedule.fields.pet')}
            testID={`${testID}-pet`}
          />

          {selectedPet && (
            <View style={[styles.infoBox, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
                {t('feedingSchedule.selectedPet')}: {selectedPet.label}
              </Text>
            </View>
          )}
        </FormSection>

        {/* Schedule Details */}
        <FormSection
          title={t('feedingSchedule.sections.scheduleDetails')}
          subtitle={t('feedingSchedule.sections.scheduleDetailsSubtitle')}
        >
          {/* Time Picker */}
          <SmartDatePicker
            name="time"
            required
            label={t('feedingSchedule.fields.time')}
            mode="time"
            outputFormat="iso-time"
            testID={`${testID}-time`}
          />

          {/* Food Type Dropdown */}
          <SmartDropdown
            name="foodType"
            required
            options={foodTypeOptions}
            placeholder={t('feedingSchedule.placeholders.selectFoodType')}
            label={t('feedingSchedule.fields.foodType')}
            testID={`${testID}-food-type`}
          />

          {/* Food type suggestion */}
          <View style={[styles.suggestionBox, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Text style={styles.suggestionIcon}>💡</Text>
            <Text
              variant="bodySmall"
              style={[styles.suggestionText, { color: theme.colors.onSecondaryContainer }]}
            >
              {getFoodTypeSuggestion()}
            </Text>
          </View>

          {/* Amount Input */}
          <SmartInput
            name="amount"
            required
            placeholder={t('feedingSchedule.placeholders.amount')}
            testID={`${testID}-amount`}
          />
        </FormSection>

        {/* Days Selection */}
        <FormSection
          title={t('feedingSchedule.fields.days')}
          subtitle={t('feedingSchedule.daysHelp')}
        >
          <SmartDayPicker name="daysArray" showQuickSelect testID={testID} />
        </FormSection>

        {/* Settings */}
        <FormSection title={t('feedingSchedule.sections.settings')}>
          <SmartSwitch
            name="isActive"
            label={t('feedingSchedule.fields.isActive')}
            description={t('feedingSchedule.isActiveHelp')}
            testID={`${testID}-active-switch`}
          />
        </FormSection>

        {/* Form Actions */}
        <FormActions
          onCancel={handleCancel}
          onSubmit={handleSubmit(onFormSubmit)}
          submitLabel={isEditMode ? t('common.update') : t('common.create')}
          cancelLabel={t('common.cancel')}
          loading={isSubmitting}
          disabled={loading}
          testID={testID}
        />
      </ScrollView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: -8, // Adjust spacing after SmartDropdown
  },
  suggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: -8, // Adjust spacing after SmartDropdown
  },
  suggestionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  suggestionText: {
    flex: 1,
    lineHeight: 18,
  },
});

export default FeedingScheduleForm;
