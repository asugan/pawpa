import { Text } from '@/components/ui';
import { useEventForm } from '@/hooks/useEventForm';
import { useTheme } from '@/lib/theme';
import React from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { createEventTypeOptions } from '../../constants';
import {
  transformFormDataToAPI,
  type EventFormData,
} from '../../lib/schemas/eventSchema';
import { Event, Pet } from '../../lib/types';
import { FormActions } from './FormActions';
import { FormSection } from './FormSection';
import { SmartDateTimePicker } from './SmartDateTimePicker';
import { SmartDropdown } from './SmartDropdown';
import { SmartInput } from './SmartInput';
import { SmartSwitch } from './SmartSwitch';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: any) => void | Promise<void>;
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

  // Event type options with i18n support
  const eventTypeOptions = React.useMemo(() => createEventTypeOptions(t), [t]);

  // Pet options from real pet data
  const petOptions = React.useMemo(
    () =>
      pets.map((pet) => ({
        value: pet.id,
        label: `${pet.name} (${pet.type})`,
      })),
    [pets]
  );

  // Get selected pet details
  const selectedPet = React.useMemo(
    () => petOptions.find((pet) => pet.value === selectedPetId),
    [petOptions, selectedPetId]
  );

  // Event type specific validation and suggestions
  const getEventTypeSuggestions = () => {
    switch (eventType) {
      case 'feeding':
        return 'Öğün zamanı için mama miktarını ve türünü belirtin';
      case 'vet_visit':
        return 'Veteriner randevusu için klinik adı ve adresini ekleyin';
      case 'exercise':
      case 'walk':
        return 'Egzersiz süresini ve yapılacak aktiviteleri belirtin';
      case 'grooming':
        return 'Bakım için neler yapılacağını not edin';
      case 'play':
        return 'Oyun zamanı için oyuncakları ve aktiviteleri belirtin';
      case 'training':
        return 'Eğitim için öğreneceği komutları yazın';
      case 'bath':
        return 'Banyo zamanı için gerekli malzemeleri not edin';
      default:
        return 'Etkinlik detaylarını belirtin';
    }
  };

  // Handle form submission
  const onFormSubmit = React.useCallback(
    async (data: EventFormData) => {
      try {
        setIsSubmitting(true);
        console.log('Event form submitting:', data);

        // Transform form data to API format
        const submitData = transformFormDataToAPI(data);
        console.log('Transformed data for API:', submitData);

        await onSubmit(submitData);
      } catch (error) {
        console.error('Event form submission error:', error);
        Alert.alert('Hata', 'Etkinlik kaydedilirken bir hata oluştu');
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit]
  );

  // Form actions
  const handleCancel = React.useCallback(() => {
    if (isDirty) {
      Alert.alert('Kaydedilmemiş Değişiklikler', 'Değişiklikleri kaydetmeden çıkmak istiyor musunuz?', [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çık',
          style: 'destructive',
          onPress: onCancel,
        },
      ]);
    } else {
      onCancel();
    }
  }, [isDirty, onCancel]);

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
          title={isEditMode ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}
          subtitle="Evcil hayvanınız için etkinlik oluşturun"
        >
          {/* Pet Selection */}
          <SmartDropdown
            name="petId"
            required
            options={petOptions}
            placeholder="Evcil hayvan seçin"
            label="Evcil Hayvan"
            testID={`${testID}-pet`}
          />

          {selectedPet && (
            <View style={[styles.selectedPetDisplay, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text style={{ color: theme.colors.onPrimaryContainer }}>
                Seçili: {selectedPet.label}
              </Text>
            </View>
          )}
        </FormSection>

        {/* Event Details */}
        <FormSection title="Etkinlik Bilgileri">
          {/* Title */}
          <SmartInput
            name="title"
            required
            placeholder="Etkinlik başlığı"
            label="Başlık"
            testID={`${testID}-title`}
          />

          {/* Event Type */}
          <SmartDropdown
            name="type"
            required
            options={eventTypeOptions}
            placeholder="Etkinlik türü seçin"
            label="Etkinlik Türü"
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
            placeholder="Etkinlik açıklaması (opsiyonel)"
            label="Açıklama"
            multiline
            numberOfLines={3}
            testID={`${testID}-description`}
          />
        </FormSection>

        {/* DateTime & Location */}
        <FormSection title="Zaman ve Konum">
          {/* Start DateTime */}
          <SmartDateTimePicker
            name="startDate"
            timeName="startTime"
            required
            label="Başlangıç Zamanı"
            testID={`${testID}-start`}
          />

          {/* End DateTime */}
          <SmartDateTimePicker
            name="endDate"
            timeName="endTime"
            label="Bitiş Zamanı (opsiyonel)"
            testID={`${testID}-end`}
          />

          {/* Location */}
          <SmartInput
            name="location"
            placeholder="Konum (opsiyonel)"
            label="Konum"
            testID={`${testID}-location`}
          />
        </FormSection>

        {/* Additional Options */}
        <FormSection title="Ek Seçenekler">
          {/* Reminder Switch */}
          <SmartSwitch
            name="reminder"
            label="Hatırlatıcı Etkinleştir"
            description="Etkinlikten önce bildirim alın"
            disabled={loading || isSubmitting}
            testID={`${testID}-reminder`}
          />

          {/* Notes */}
          <SmartInput
            name="notes"
            placeholder="Ek notlarınızı buraya yazın"
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
          submitLabel={isEditMode ? 'Güncelle' : 'Oluştur'}
          cancelLabel="İptal"
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
});

export default EventForm;
