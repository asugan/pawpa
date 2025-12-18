import { Text } from '@/components/ui';
import { useEventForm } from '@/hooks/useEventForm';
import { useTheme } from '@/lib/theme';
import React from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { createEventTypeOptions } from '../../constants';
import { type EventFormData } from '../../lib/schemas/eventSchema';
import { Event, Pet } from '../../lib/types';
import { FormActions } from './FormActions';
import { FormSection } from './FormSection';
import { SmartDateTimePicker } from './SmartDateTimePicker';
import { SmartDropdown } from './SmartDropdown';
import { SmartInput } from './SmartInput';
import { SmartSwitch } from './SmartSwitch';
import { REMINDER_PRESETS, ReminderPresetKey } from '@/constants/reminders';
import { requestNotificationPermissions } from '@/lib/services/notificationService';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: EventFormData) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialPetId?: string;
  pets?: Pet[];
  testID?: string;
}

export function EventForm({
  event,
  onSubmit,
  onCancel,
  loading = false,
  initialPetId,
  pets = [],
  testID,
}: EventFormProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Use the custom hook for form management
  const { form, control, handleSubmit, isDirty } = useEventForm(event, initialPetId);

  // Watch form values for dynamic behavior
  const selectedPetId = useWatch({ control, name: 'petId' });
  const eventType = useWatch({ control, name: 'type' });
  const reminderEnabled = useWatch({ control, name: 'reminder' });

  // Event type options with i18n support
  const eventTypeOptions = React.useMemo(() => createEventTypeOptions(t), [t]);

  // Pet options from real pet data
  const petOptions = React.useMemo(
    () =>
      pets.map((pet) => ({
        value: pet._id,
        label: `${pet.name} (${pet.type})`,
      })),
    [pets]
  );

  const reminderPresetOptions = React.useMemo(
    () =>
      (Object.keys(REMINDER_PRESETS) as ReminderPresetKey[]).map((key) => ({
        value: key,
        label: t(REMINDER_PRESETS[key].labelKey),
      })),
    [t]
  );

  // Get selected pet details
  const selectedPet = React.useMemo(
    () => petOptions.find((pet) => pet.value === selectedPetId),
    [petOptions, selectedPetId]
  );

  // Event type specific validation and suggestions
  const getEventTypeSuggestions = () => {
    return t(`eventForm.suggestions.${eventType || 'default'}`);
  };

  React.useEffect(() => {
    if (reminderEnabled) {
      requestNotificationPermissions();
    }
  }, [reminderEnabled]);

  // Handle form submission
  const onFormSubmit = React.useCallback(
    async (data: EventFormData) => {
      try {
        setIsSubmitting(true);
        console.log('Event form submitting:', data);

        await onSubmit(data);
      } catch (error) {
        console.error('Event form submission error:', error);
        Alert.alert(t('common.error'), t('events.saveError'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, t]
  );

  // Form actions
  const handleCancel = React.useCallback(() => {
    if (isDirty) {
      Alert.alert(t('common.unsavedChanges'), t('common.unsavedChangesMessageShort'), [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('events.exit'),
          style: 'destructive',
          onPress: onCancel,
        },
      ]);
    } else {
      onCancel();
    }
  }, [isDirty, onCancel, t]);

  const isEditMode = !!event;

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
          title={isEditMode ? t('events.editTitle') : t('events.createTitle')}
          subtitle={t('events.createSubtitle')}
        >
          {/* Pet Selection */}
          <SmartDropdown
            name="petId"
            required
            options={petOptions}
            placeholder={t('events.selectPet')}
            label={t('events.pet')}
            testID={`${testID}-pet`}
          />

          {selectedPet && (
            <View style={[styles.selectedPetDisplay, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text style={{ color: theme.colors.onPrimaryContainer }}>
                {t('common.selected')}: {selectedPet.label}
              </Text>
            </View>
          )}
        </FormSection>

        {/* Event Details */}
        <FormSection title={t('events.eventDetails')}>
          {/* Title */}
          <SmartInput
            name="title"
            required
            placeholder={t('events.titlePlaceholder')}
            label={t('events.title')}
            testID={`${testID}-title`}
          />

          {/* Event Type */}
          <SmartDropdown
            name="type"
            required
            options={eventTypeOptions}
            placeholder={t('events.typePlaceholder')}
            label={t('events.type')}
            testID={`${testID}-type`}
          />

          {/* Event type suggestions */}
          <View style={[styles.suggestionsBox, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Text
              variant="bodySmall"
              style={[styles.suggestionsText, { color: theme.colors.onSecondaryContainer }]}
            >
              💡 {getEventTypeSuggestions()}
            </Text>
          </View>

          {/* Description */}
          <SmartInput
            name="description"
            placeholder={t('events.descriptionPlaceholder')}
            label={t('events.description')}
            multiline
            numberOfLines={3}
            testID={`${testID}-description`}
          />
        </FormSection>

        {/* DateTime & Location */}
        <FormSection title={t('common.dateTime')}>
          {/* Start DateTime */}
          <SmartDateTimePicker
            dateName="startDate"
            timeName="startTime"
            required
            label={t('events.startTime')}
            testID={`${testID}-start`}
          />

          {/* End DateTime */}
          <SmartDateTimePicker
            dateName="endDate"
            timeName="endTime"
            label={t('events.endTime')}
            testID={`${testID}-end`}
          />

          {/* Location */}
          <SmartInput
            name="location"
            placeholder={t('events.locationPlaceholder')}
            label={t('events.locationField')}
            testID={`${testID}-location`}
          />
        </FormSection>

        {/* Additional Options */}
        <FormSection title={t('common.additionalOptions')}>
          {/* Reminder Switch */}
          <SmartSwitch
            name="reminder"
            label={t('events.enableReminder')}
            description={t('events.reminderDescription')}
            disabled={loading || isSubmitting}
            testID={`${testID}-reminder`}
          />

          {reminderEnabled && (
            <View style={styles.reminderPresetContainer}>
              <SmartDropdown
                name="reminderPreset"
                options={reminderPresetOptions}
                placeholder={t('events.reminderPresetPlaceholder', 'Choose reminder cadence')}
                label={t('events.reminderPresetLabel', 'Reminder cadence')}
                required
                testID={`${testID}-reminder-preset`}
              />
              <Text
                variant="bodySmall"
                style={[styles.reminderHelper, { color: theme.colors.onSurfaceVariant }]}
              >
                {t('events.reminderPresetDescription', 'We will schedule multiple reminders automatically')}
              </Text>
            </View>
          )}

          {/* Notes */}
          <SmartInput
            name="notes"
            placeholder={t('events.notesPlaceholder')}
            multiline
            numberOfLines={3}
            maxLength={1000}
            testID={`${testID}-notes`}
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
    padding: 16,
    paddingBottom: 40,
  },
  selectedPetDisplay: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: -8, // Adjust spacing after SmartDropdown
  },
  suggestionsBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: -8, // Adjust spacing after SmartDropdown
  },
  suggestionsText: {
    lineHeight: 18,
  },
  reminderPresetContainer: {
    marginTop: 12,
    gap: 4,
  },
  reminderHelper: {
    lineHeight: 16,
  },
});

export default EventForm;
