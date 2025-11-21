import { Card, Portal, Text } from '@/components/ui';
import { useHealthRecordForm } from '@/hooks/useHealthRecordForm';
import { useTheme } from '@/lib/theme';
import React, { useState } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { Alert, Modal as RNModal, ScrollView, StyleSheet, View } from 'react-native';
import { HEALTH_RECORD_ICONS, HEALTH_RECORD_TYPES, TURKCE_LABELS } from '../../constants';
import { useCreateHealthRecord, useUpdateHealthRecord } from '../../lib/hooks/useHealthRecords';
import {
  formatValidationErrors,
  getHealthRecordSchema,
  type HealthRecordCreateInput,
} from '../../lib/schemas/healthRecordSchema';
import type { HealthRecord } from '../../lib/types';
import { FormActions } from './FormActions';
import { FormRow } from './FormRow';
import { FormSection } from './FormSection';
import { SmartCurrencyInput } from './SmartCurrencyInput';
import { SmartDatePicker } from './SmartDatePicker';
import { SmartInput } from './SmartInput';
import { SmartSegmentedButtons } from './SmartSegmentedButtons';

interface HealthRecordFormProps {
  petId: string;
  visible: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: HealthRecord;
}

export function HealthRecordForm({
  petId,
  visible,
  onSuccess,
  onCancel,
  initialData,
}: HealthRecordFormProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [isLoading, setIsLoading] = useState(false);
  const createMutation = useCreateHealthRecord();
  const updateMutation = useUpdateHealthRecord();
  const isEditing = !!initialData;

  // Use the custom hook for form management
  const { form, control, handleSubmit, reset, watch } = useHealthRecordForm(petId, initialData);

  // Watch form values for conditional rendering
  const watchedType = watch('type');
  const hasNextDueDate = watchedType === 'vaccination';

  // Reset form when modal visibility changes
  React.useEffect(() => {
    if (visible) {
      reset(
        initialData
          ? ({
              petId,
              type: initialData.type,
              title: initialData.title || '',
              description: initialData.description || '',
              date: initialData.date,
              veterinarian: initialData.veterinarian || '',
              clinic: initialData.clinic || '',
              cost: initialData.cost || undefined,
              notes: initialData.notes || '',
              nextDueDate: initialData.nextDueDate || undefined,
            } as HealthRecordCreateInput)
          : undefined
      );
    }
  }, [visible, initialData, reset, petId]);

  const onSubmit = async (data: HealthRecordCreateInput) => {
    try {
      setIsLoading(true);

      // Manual validation based on current type
      const schema = getHealthRecordSchema(data.type);
      const validationResult = schema.safeParse(data);

      if (!validationResult.success) {
        const formattedErrors = formatValidationErrors(validationResult.error);
        const errorMessage = formattedErrors.map((err) => err.message).join('\n');
        Alert.alert('Validasyon Hatası', errorMessage);
        return;
      }

      if (isEditing && initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: validationResult.data,
        });
      } else {
        await createMutation.mutateAsync(validationResult.data);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Health record form error:', error);
      Alert.alert('Hata', 'Sağlık kaydı kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  // Segmented buttons options
  const recordTypeButtons = Object.entries(HEALTH_RECORD_TYPES).map(([key, value]) => ({
    value,
    label: TURKCE_LABELS.HEALTH_RECORD_TYPES[key as keyof typeof TURKCE_LABELS.HEALTH_RECORD_TYPES],
    icon: HEALTH_RECORD_ICONS[value as keyof typeof HEALTH_RECORD_ICONS],
  }));

  return (
    <Portal>
      <RNModal visible={visible} animationType="slide" onRequestClose={handleCancel}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <FormProvider {...form}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  {/* Form Header */}
                  <FormSection
                    title={isEditing ? 'Sağlık Kaydını Düzenle' : 'Yeni Sağlık Kaydı'}
                    subtitle="Evcil hayvanınızın sağlık kayıtlarını yönetin"
                  >
                    {/* Record Type */}
                    <SmartSegmentedButtons
                      name="type"
                      buttons={recordTypeButtons}
                      density="small"
                    />

                    {/* Title */}
                    <SmartInput
                      name="title"
                      required
                      placeholder="Kayıt başlığı"
                      label="Başlık"
                    />

                    {/* Description */}
                    <SmartInput
                      name="description"
                      placeholder="Açıklama (opsiyonel)"
                      label="Açıklama"
                      multiline
                      numberOfLines={3}
                    />
                  </FormSection>

                  {/* Date Information */}
                  <FormSection title="Tarih Bilgileri">
                    <SmartDatePicker name="date" required label="Kayıt Tarihi" mode="date" />

                    {hasNextDueDate && (
                      <SmartDatePicker
                        name="nextDueDate"
                        label="Sonraki Randevu Tarihi"
                        mode="date"
                      />
                    )}
                  </FormSection>

                  {/* Vaccination Specific Fields */}
                  {watchedType === 'vaccination' && (
                    <FormSection title="Aşı Bilgileri">
                      <SmartInput name="vaccineName" required label="Aşı Adı" placeholder="Aşı adı" />
                      <SmartInput
                        name="vaccineManufacturer"
                        label="Üretici"
                        placeholder="Üretici firma"
                      />
                      <SmartInput name="batchNumber" label="Lot Numarası" placeholder="Lot numarası" />
                    </FormSection>
                  )}

                  {/* Medication Specific Fields */}
                  {watchedType === 'medication' && (
                    <FormSection title="İlaç Bilgileri">
                      <SmartInput
                        name="medicationName"
                        required
                        label="İlaç Adı"
                        placeholder="İlaç adı"
                      />
                      <FormRow>
                        <SmartInput name="dosage" label="Doz" placeholder="Doz miktarı" />
                        <SmartInput name="frequency" label="Sıklık" placeholder="Kullanım sıklığı" />
                      </FormRow>
                      <FormRow>
                        <SmartDatePicker name="startDate" label="Başlangıç" mode="date" />
                        <SmartDatePicker name="endDate" label="Bitiş" mode="date" />
                      </FormRow>
                    </FormSection>
                  )}

                  {/* Veterinarian and Clinic */}
                  <FormSection title="Veteriner Bilgileri">
                    <FormRow>
                      <SmartInput name="veterinarian" label="Veteriner" placeholder="Veteriner adı" />
                      <SmartInput name="clinic" label="Klinik" placeholder="Klinik adı" />
                    </FormRow>
                  </FormSection>

                  {/* Cost */}
                  <FormSection title="Maliyet">
                    <SmartCurrencyInput name="cost" label="Maliyet" placeholder="0.00" />
                  </FormSection>

                  {/* Notes */}
                  <FormSection title="Notlar">
                    <SmartInput
                      name="notes"
                      placeholder="Ek notlar"
                      multiline
                      numberOfLines={4}
                    />
                  </FormSection>

                  {/* Form Actions */}
                  <FormActions
                    onCancel={handleCancel}
                    onSubmit={handleSubmit(onSubmit)}
                    submitLabel={isEditing ? 'Güncelle' : 'Kaydet'}
                    cancelLabel="İptal"
                    loading={isLoading}
                    showDivider={false}
                  />
                </View>
              </Card>
            </ScrollView>
          </FormProvider>
        </View>
      </RNModal>
    </Portal>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      paddingTop: 50,
    },
    content: {
      flex: 1,
    },
    card: {
      margin: 16,
      elevation: 4,
    },
    cardContent: {
      padding: 16,
    },
  });
