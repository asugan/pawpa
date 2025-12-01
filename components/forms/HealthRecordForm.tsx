import { Card, Portal } from '@/components/ui';
import { useHealthRecordForm } from '@/hooks/useHealthRecordForm';
import { useTheme } from '@/lib/theme';
import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { Alert, Modal as RNModal, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const createMutation = useCreateHealthRecord();
  const updateMutation = useUpdateHealthRecord();
  const isEditing = !!initialData;

  // Use the custom hook for form management
  const { form, handleSubmit, reset, watch } = useHealthRecordForm(petId, initialData);

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
        Alert.alert(t('forms.validation.error'), errorMessage);
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
      Alert.alert(t('common.error'), t('healthRecords.saveError'));
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
                    title={isEditing ? t('healthRecords.editTitle') : t('healthRecords.createTitle')}
                    subtitle={t('healthRecords.createSubtitle')}
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
                      placeholder={t('healthRecords.titlePlaceholder')}
                      label={t('healthRecords.titleField')}
                    />

                    {/* Description */}
                    <SmartInput
                      name="description"
                      placeholder={t('healthRecords.descriptionPlaceholder')}
                      label={t('healthRecords.descriptionField')}
                      multiline
                      numberOfLines={3}
                    />
                  </FormSection>

                  {/* Date Information */}
                  <FormSection title={t('common.dateInformation')}>
                    <SmartDatePicker name="date" required label={t('healthRecords.recordDate')} mode="date" />

                    {hasNextDueDate && (
                      <SmartDatePicker
                        name="nextDueDate"
                        label={t('healthRecords.nextAppointmentDate')}
                        mode="date"
                      />
                    )}
                  </FormSection>

                  {/* Vaccination Specific Fields */}
                  {watchedType === 'vaccination' && (
                    <FormSection title={t('healthRecords.vaccinationInfo')}>
                      <SmartInput name="vaccineName" required label={t('healthRecords.vaccinationNameLabel')} placeholder={t('healthRecords.vaccinationNameLabel')} />
                      <SmartInput
                        name="vaccineManufacturer"
                        label={t('healthRecords.manufacturerLabel')}
                        placeholder={t('healthRecords.manufacturerPlaceholder')}
                      />
                      <SmartInput name="batchNumber" label={t('healthRecords.batchNumberLabel')} placeholder={t('healthRecords.batchNumberPlaceholder')} />
                    </FormSection>
                  )}

                  {/* Medication Specific Fields */}
                  {watchedType === 'medication' && (
                    <FormSection title={t('healthRecords.medicationInfo')}>
                      <SmartInput
                        name="medicationName"
                        required
                        label={t('healthRecords.medicationName')}
                        placeholder={t('healthRecords.medicationNamePlaceholder')}
                      />
                      <FormRow>
                        <SmartInput name="dosage" label={t('healthRecords.dosageLabel')} placeholder={t('healthRecords.dosagePlaceholder')} />
                        <SmartInput name="frequency" label={t('healthRecords.frequencyLabel')} placeholder={t('healthRecords.frequencyPlaceholder')} />
                      </FormRow>
                      <FormRow>
                        <SmartDatePicker name="startDate" label={t('healthRecords.start')} mode="date" />
                        <SmartDatePicker name="endDate" label={t('healthRecords.end')} mode="date" />
                      </FormRow>
                    </FormSection>
                  )}

                  {/* Veterinarian and Clinic */}
                  <FormSection title={t('healthRecords.veterinarianInfo')}>
                    <FormRow>
                      <SmartInput name="veterinarian" label={t('healthRecords.veterinarianLabel')} placeholder={t('healthRecords.veterinarianPlaceholder')} />
                      <SmartInput name="clinic" label={t('healthRecords.clinicLabel')} placeholder={t('healthRecords.clinicPlaceholder')} />
                    </FormRow>
                  </FormSection>

                  {/* Cost */}
                  <FormSection title={t('healthRecords.cost')}>
                    <SmartCurrencyInput name="cost" label={t('healthRecords.cost')} placeholder={t('healthRecords.costPlaceholder')} />
                  </FormSection>

                  {/* Notes */}
                  <FormSection title={t('common.notes')}>
                    <SmartInput
                      name="notes"
                      placeholder={t('healthRecords.notesPlaceholder')}
                      multiline
                      numberOfLines={4}
                    />
                  </FormSection>

                  {/* Form Actions */}
                  <FormActions
                    onCancel={handleCancel}
                    onSubmit={handleSubmit(onSubmit)}
                    submitLabel={isEditing ? t('common.update') : t('common.save')}
                    cancelLabel={t('common.cancel')}
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

const styles = StyleSheet.create({
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
