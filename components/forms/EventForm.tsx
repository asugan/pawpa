import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme, Text, Button, Switch, Divider } from 'react-native-paper';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Event } from '../../lib/types';
import { eventSchema, getMinimumEventDateTime } from '../../lib/schemas/eventSchema';
import { createEventTypeOptions } from '../../constants';
import FormInput from './FormInput';
import FormDropdown from './FormDropdown';
import FormDateTimePicker from './FormDateTimePicker';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: any) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialPetId?: string;
  testID?: string;
}

export function EventForm({
  event,
  onSubmit,
  onCancel,
  loading = false,
  initialPetId,
  testID,
}: EventFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  // Form setup
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Default values
  const defaultValues = React.useMemo(() => ({
    title: event?.title || '',
    description: event?.description || '',
    petId: initialPetId || event?.petId || '',
    type: event?.type || 'other',
    startTime: event?.startTime ? event.startTime.slice(0, 16) : getMinimumEventDateTime(),
    endTime: event?.endTime ? event.endTime.slice(0, 16) : '',
    location: event?.location || '',
    reminder: event?.reminder || false,
    notes: event?.notes || '',
  }), [event, initialPetId]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
    setError,
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Watch form values for dynamic behavior
  const selectedPetId = useWatch({ control, name: 'petId' });
  const eventType = useWatch({ control, name: 'type' });

  // Event type options with i18n support
  const eventTypeOptions = React.useMemo(() =>
    createEventTypeOptions(t),
    [t]
  );

  // Pet options (mock data for now - should be replaced with actual pet data)
  const petOptions = React.useMemo(() => [
    { value: 'pet1', label: 'Fluffy (Kedi)' },
    { value: 'pet2', label: 'Buddy (Köpek)' },
  ], []);

  // Get selected pet details
  const selectedPet = React.useMemo(() =>
    petOptions.find(pet => pet.value === selectedPetId),
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
  const onFormSubmit = React.useCallback(async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log('Event form submitting:', data);

      // Additional validation for endTime
      if (data.endTime && data.startTime) {
        const startDate = new Date(data.startTime);
        const endDate = new Date(data.endTime);

        if (endDate <= startDate) {
          setError('endTime', {
            message: 'Bitiş zamanı başlangıçtan sonra olmalıdır',
          });
          return;
        }
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Event form submission error:', error);
      Alert.alert(
        'Hata',
        'Etkinlik kaydedilirken bir hata oluştu'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, setError]);

  // Form actions
  const handleCancel = React.useCallback(() => {
    if (isDirty) {
      Alert.alert(
        'Kaydedilmemiş Değişiklikler',
        'Yaptığınız değişiklikler kaybolacak. Devam etmek istiyor musunuz?',
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Değişiklikleri Sil',
            style: 'destructive',
            onPress: onCancel,
          },
        ]
      );
    } else {
      onCancel();
    }
  }, [isDirty, onCancel]);

  const isEditMode = !!event;

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
            {isEditMode ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Evcil hayvanınız için yeni bir etkinlik oluşturun
          </Text>
        </View>

        {/* Pet Selection */}
        <FormDropdown
          control={control}
          name="petId"
          label="Evcil Hayvan Seçin"
          required
          options={petOptions}
          placeholder="Evcil hayvan seçiniz"
          searchable
          testID="event-pet-dropdown"
        />

        {/* Selected Pet Display */}
        {selectedPet && (
          <View style={[styles.selectedPetDisplay, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[styles.selectedPetText, { color: theme.colors.onSurface }]}>
              Bu etkinlik: {selectedPet.label} için
            </Text>
          </View>
        )}

        {/* Event Type */}
        <FormDropdown
          control={control}
          name="type"
          label="Etkinlik Türü"
          required
          options={eventTypeOptions}
          placeholder="Etkinlik türü seçiniz"
          testID="event-type-dropdown"
        />

        {/* Event Type Suggestions */}
        {eventType && eventType !== 'other' && (
          <View style={[styles.suggestionsBox, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[styles.suggestionsTitle, { color: theme.colors.onSurface }]}>
              Öneriler
            </Text>
            <Text style={[styles.suggestionsText, { color: theme.colors.onSurfaceVariant }]}>
              {getEventTypeSuggestions()}
            </Text>
          </View>
        )}

        {/* Event Title */}
        <FormInput
          control={control}
          name="title"
          label="Etkinlik Başlığı"
          required
          placeholder="Etkinlik başlığını girin"
          maxLength={100}
          autoCapitalize="sentences"
          testID="event-title-input"
        />

        {/* Date and Time */}
        <FormDateTimePicker
          control={control}
          dateName="startTime"
          timeName="startTime"
          label="Başlangıç Tarihi ve Saati"
          required
          testID="event-start-datetime"
        />

        {/* End Date and Time (Optional) */}
        <FormDateTimePicker
          control={control}
          dateName="endTime"
          timeName="endTime"
          label="Bitiş Tarihi ve Saati"
          testID="event-end-datetime"
        />

        {/* Location */}
        <FormInput
          control={control}
          name="location"
          label="Konum"
          placeholder="Konum bilgisini girin"
          maxLength={200}
          testID="event-location-input"
        />

        {/* Description */}
        <FormInput
          control={control}
          name="description"
          label="Açıklama"
          placeholder="Etkinlik açıklamasını girin"
          multiline
          maxLength={500}
          testID="event-description-input"
        />

        {/* Reminder Toggle */}
        <View style={styles.switchContainer}>
          <View style={styles.switchContent}>
            <Text style={[styles.switchLabel, { color: theme.colors.onSurface }]}>
              Hatırlatıcı Etkinleştir
            </Text>
            <Text style={[styles.switchDescription, { color: theme.colors.onSurfaceVariant }]}>
              Etkinlikten önce bildirim alın
            </Text>
          </View>
          <Controller
            control={control}
            name="reminder"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                disabled={loading}
              />
            )}
          />
        </View>

        {/* Notes */}
        <FormInput
          control={control}
          name="notes"
          label="Notlar"
          placeholder="Ek notlarınızı buraya yazın"
          multiline
          maxLength={1000}
          testID="event-notes-input"
        />

        <Divider style={styles.divider} />

        {/* Form Actions */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            disabled={loading || isSubmitting}
            style={styles.cancelButton}
            testID="event-cancel-button"
          >
            İptal
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit(onFormSubmit)}
            disabled={!isValid || loading || isSubmitting}
            loading={isSubmitting}
            style={styles.submitButton}
            testID="event-submit-button"
          >
            {isEditMode ? 'Güncelle' : 'Oluştur'}
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
    padding: 16,
  },
  formContent: {
    gap: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 20,
  },
  selectedPetDisplay: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionsBox: {
    padding: 12,
    borderRadius: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  suggestionsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default EventForm;