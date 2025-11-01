import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme, Text, Button, Switch, Divider, Chip } from 'react-native-paper';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { FeedingSchedule, Pet } from '../../lib/types';
import {
  feedingScheduleFormSchema,
  transformFormDataToAPI,
  type FeedingScheduleFormData
} from '../../lib/schemas/feedingScheduleSchema';
import { createFoodTypeOptions, DAYS_OF_WEEK } from '../../constants';
import FormInput from './FormInput';
import FormDropdown from './FormDropdown';
import FormTimePicker from './FormTimePicker';

interface FeedingScheduleFormProps {
  schedule?: FeedingSchedule;
  onSubmit: (data: any) => void | Promise<void>;
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
  const theme = useTheme();

  // Form setup
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Default values
  const defaultValues = React.useMemo((): FeedingScheduleFormData => {
    if (schedule) {
      // Edit mode: parse existing schedule
      const daysArray = schedule.days.split(',').map(d => d.trim()) as Array<typeof DAYS_OF_WEEK[keyof typeof DAYS_OF_WEEK]>;

      return {
        petId: schedule.petId,
        time: schedule.time,
        foodType: schedule.foodType as any,
        amount: schedule.amount,
        daysArray,
        isActive: schedule.isActive ?? true,
      };
    } else {
      // Create mode: use defaults
      return {
        petId: initialPetId || '',
        time: '08:00',
        foodType: 'dry_food' as any,
        amount: '',
        daysArray: [],
        isActive: true,
      };
    }
  }, [schedule, initialPetId]);

  // React Hook Form setup with Zod validation
  const {
    control,
    handleSubmit,
    formState: { isDirty, errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(feedingScheduleFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Watch form values for dynamic behavior
  const selectedPetId = useWatch({ control, name: 'petId' });
  const foodType = useWatch({ control, name: 'foodType' });
  const selectedDays = useWatch({ control, name: 'daysArray' });

  // Food type options with i18n support
  const foodTypeOptions = React.useMemo(() =>
    createFoodTypeOptions((key: string) => t(key)),
    [t]
  );

  // Pet options from real pet data
  const petOptions = React.useMemo(() =>
    pets.map(pet => ({
      value: pet.id,
      label: `${pet.name} (${t(`petTypes.${pet.type}`)})`,
    })),
    [pets, t]
  );

  // Get selected pet details
  const selectedPet = React.useMemo(() =>
    petOptions.find(pet => pet.value === selectedPetId),
    [petOptions, selectedPetId]
  );

  // Days of the week for selection
  const daysOfWeek = React.useMemo(() => [
    { value: DAYS_OF_WEEK.MONDAY, label: t('days.monday') },
    { value: DAYS_OF_WEEK.TUESDAY, label: t('days.tuesday') },
    { value: DAYS_OF_WEEK.WEDNESDAY, label: t('days.wednesday') },
    { value: DAYS_OF_WEEK.THURSDAY, label: t('days.thursday') },
    { value: DAYS_OF_WEEK.FRIDAY, label: t('days.friday') },
    { value: DAYS_OF_WEEK.SATURDAY, label: t('days.saturday') },
    { value: DAYS_OF_WEEK.SUNDAY, label: t('days.sunday') },
  ], [t]);

  // Handle day selection
  const toggleDay = (day: typeof DAYS_OF_WEEK[keyof typeof DAYS_OF_WEEK]) => {
    const currentDays = selectedDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];

    setValue('daysArray', newDays, { shouldValidate: true, shouldDirty: true });
  };

  // Quick select all days
  const selectAllDays = () => {
    const allDays = Object.values(DAYS_OF_WEEK);
    setValue('daysArray', allDays, { shouldValidate: true, shouldDirty: true });
  };

  // Quick select weekdays
  const selectWeekdays = () => {
    const weekdays = [
      DAYS_OF_WEEK.MONDAY,
      DAYS_OF_WEEK.TUESDAY,
      DAYS_OF_WEEK.WEDNESDAY,
      DAYS_OF_WEEK.THURSDAY,
      DAYS_OF_WEEK.FRIDAY,
    ];
    setValue('daysArray', weekdays, { shouldValidate: true, shouldDirty: true });
  };

  // Quick select weekends
  const selectWeekends = () => {
    const weekends = [DAYS_OF_WEEK.SATURDAY, DAYS_OF_WEEK.SUNDAY];
    setValue('daysArray', weekends, { shouldValidate: true, shouldDirty: true });
  };

  // Clear day selection
  const clearDays = () => {
    setValue('daysArray', [], { shouldValidate: true, shouldDirty: true });
  };

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
  const onFormSubmit = React.useCallback(async (data: FeedingScheduleFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Feeding schedule form submitting:', data);

      // Transform form data to API format
      const submitData = transformFormDataToAPI(data);

      console.log('Transformed data for API:', submitData);

      await onSubmit(submitData);
    } catch (error) {
      console.error('Feeding schedule form submission error:', error);
      Alert.alert(
        t('common.error'),
        t('feedingSchedule.errors.submitFailed')
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, t]);

  // Form actions
  const handleCancel = React.useCallback(() => {
    if (isDirty) {
      Alert.alert(
        t('common.unsavedChanges'),
        t('common.unsavedChangesMessage'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.discard'),
            style: 'destructive',
            onPress: onCancel,
          },
        ]
      );
    } else {
      onCancel();
    }
  }, [isDirty, onCancel, t]);

  const isEditMode = !!schedule;

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
            {isEditMode ? t('feedingSchedule.editTitle') : t('feedingSchedule.createTitle')}
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('feedingSchedule.subtitle')}
          </Text>
        </View>

        {/* Pet Selection */}
        <FormDropdown
          control={control}
          name="petId"
          label={t('feedingSchedule.fields.pet')}
          required
          options={petOptions}
          placeholder={t('feedingSchedule.placeholders.selectPet')}
          testID={`${testID}-pet`}
        />

        {selectedPet && (
          <View style={[styles.infoBox, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
              {t('feedingSchedule.selectedPet')}: {selectedPet.label}
            </Text>
          </View>
        )}

        <Divider style={styles.divider} />

        {/* Time Picker */}
        <FormTimePicker
          control={control}
          name="time"
          label={t('feedingSchedule.fields.time')}
          required
          placeholder={t('feedingSchedule.placeholders.selectTime')}
          minuteInterval={15}
          testID={`${testID}-time`}
        />

        {/* Food Type Dropdown */}
        <FormDropdown
          control={control}
          name="foodType"
          label={t('feedingSchedule.fields.foodType')}
          required
          options={foodTypeOptions}
          placeholder={t('feedingSchedule.placeholders.selectFoodType')}
          testID={`${testID}-food-type`}
        />

        {/* Food type suggestion */}
        <View style={[styles.suggestionBox, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Text style={styles.suggestionIcon}>💡</Text>
          <Text variant="bodySmall" style={[styles.suggestionText, { color: theme.colors.onSecondaryContainer }]}>
            {getFoodTypeSuggestion()}
          </Text>
        </View>

        {/* Amount Input */}
        <FormInput
          control={control}
          name="amount"
          label={t('feedingSchedule.fields.amount')}
          required
          placeholder={t('feedingSchedule.placeholders.amount')}
          testID={`${testID}-amount`}
        />

        <Divider style={styles.divider} />

        {/* Days Selection */}
        <View style={styles.daysSection}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {t('feedingSchedule.fields.days')} *
          </Text>
          <Text variant="bodySmall" style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('feedingSchedule.daysHelp')}
          </Text>

          {/* Quick select buttons */}
          <View style={styles.quickSelectContainer}>
            <Button
              mode="outlined"
              compact
              onPress={selectAllDays}
              style={styles.quickSelectButton}
            >
              {t('feedingSchedule.quickSelect.all')}
            </Button>
            <Button
              mode="outlined"
              compact
              onPress={selectWeekdays}
              style={styles.quickSelectButton}
            >
              {t('feedingSchedule.quickSelect.weekdays')}
            </Button>
            <Button
              mode="outlined"
              compact
              onPress={selectWeekends}
              style={styles.quickSelectButton}
            >
              {t('feedingSchedule.quickSelect.weekends')}
            </Button>
            <Button
              mode="outlined"
              compact
              onPress={clearDays}
              style={styles.quickSelectButton}
            >
              {t('feedingSchedule.quickSelect.clear')}
            </Button>
          </View>

          {/* Day chips */}
          <Controller
            control={control}
            name="daysArray"
            render={({ field, fieldState }) => (
              <View>
                <View style={styles.daysChipContainer}>
                  {daysOfWeek.map((day) => {
                    const isSelected = selectedDays?.includes(day.value) ?? false;
                    return (
                      <Chip
                        key={day.value}
                        mode={isSelected ? 'flat' : 'outlined'}
                        selected={isSelected}
                        onPress={() => toggleDay(day.value)}
                        style={[
                          styles.dayChip,
                          isSelected && {
                            backgroundColor: theme.colors.primaryContainer,
                          }
                        ]}
                        textStyle={[
                          styles.dayChipText,
                          isSelected && { color: theme.colors.onPrimaryContainer }
                        ]}
                        testID={`${testID}-day-${day.value}`}
                      >
                        {day.label}
                      </Chip>
                    );
                  })}
                </View>

                {fieldState.error && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {fieldState.error.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Active Switch */}
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {t('feedingSchedule.fields.isActive')}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t('feedingSchedule.isActiveHelp')}
                </Text>
              </View>
              <Switch
                value={field.value}
                onValueChange={field.onChange}
                color={theme.colors.primary}
                testID={`${testID}-active-switch`}
              />
            </View>
          )}
        />

        {/* Form Actions */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            disabled={loading || isSubmitting}
            style={styles.cancelButton}
            testID={`${testID}-cancel`}
          >
            {t('common.cancel')}
          </Button>

          <Button
            mode="contained"
            onPress={handleSubmit(onFormSubmit)}
            loading={loading || isSubmitting}
            disabled={loading || isSubmitting}
            style={styles.submitButton}
            testID={`${testID}-submit`}
          >
            {isEditMode ? t('common.update') : t('common.create')}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  formContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 20,
  },
  divider: {
    marginVertical: 20,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  suggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  suggestionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  suggestionText: {
    flex: 1,
    lineHeight: 18,
  },
  daysSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    marginBottom: 12,
    lineHeight: 18,
  },
  quickSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickSelectButton: {
    flex: 1,
    minWidth: 70,
  },
  daysChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    marginBottom: 8,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default FeedingScheduleForm;
