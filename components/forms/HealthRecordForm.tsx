import { Button, Text } from '@/components/ui';
import { useHealthRecordForm } from '@/hooks/useHealthRecordForm';
import { useTheme } from '@/lib/theme';
import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { Alert, Modal as RNModal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { HEALTH_RECORD_ICONS, HEALTH_RECORD_TYPES, TURKCE_LABELS } from '../../constants';
import { useCreateHealthRecord, useUpdateHealthRecord } from '../../lib/hooks/useHealthRecords';
import {
  formatValidationErrors,
  getHealthRecordSchema,
  type HealthRecordCreateFormInput,
} from '../../lib/schemas/healthRecordSchema';
import type { HealthRecord } from '../../lib/types';
import { FormActions } from './FormActions';
import { FormRow } from './FormRow';
import { FormSection } from './FormSection';
import { SmartCurrencyInput } from './SmartCurrencyInput';
import { SmartDatePicker } from './SmartDatePicker';
import { SmartInput } from './SmartInput';
import { SmartSegmentedButtons } from './SmartSegmentedButtons';
import { PetSelector } from './PetSelector';

interface HealthRecordFormProps {
  petId?: string;
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
  const { form, handleSubmit, reset, watch } = useHealthRecordForm(petId || '', initialData);

  const getEmptyFormValues = React.useCallback((): HealthRecordCreateFormInput => ({
    petId: petId || '',
    type: 'checkup',
    title: '',
    description: '',
    date: new Date(),
    veterinarian: '',
    clinic: '',
    cost: undefined,
    notes: '',
  }), [petId]);

  // Reset form when modal visibility changes
  React.useEffect(() => {
    if (visible) {
      if (initialData) {
        reset({
          petId: initialData.petId,
          type: initialData.type,
          title: initialData.title || '',
          description: initialData.description || '',
          date: initialData.date,
          veterinarian: initialData.veterinarian || '',
          clinic: initialData.clinic || '',
          cost: initialData.cost || undefined,
          notes: initialData.notes || '',
        } as HealthRecordCreateFormInput);
      } else {
        reset(getEmptyFormValues());
      }
    }
  }, [visible, initialData, reset, getEmptyFormValues]);

  const onSubmit = async (data: HealthRecordCreateFormInput) => {
    try {
      setIsLoading(true);

      const normalizedData: HealthRecordCreateFormInput = {
        ...data,
        cost: data.cost ?? undefined,
      };

      // Manual validation based on current type
      const schema = getHealthRecordSchema(normalizedData.type);
      const validationResult = schema.safeParse(normalizedData);

      if (!validationResult.success) {
        const formattedErrors = formatValidationErrors(validationResult.error);
        const errorMessage = formattedErrors.map((err) => err.message).join('\n');
        Alert.alert(t('forms.validation.error'), errorMessage);
        return;
      }

      if (isEditing && initialData?._id) {
        await updateMutation.mutateAsync({
          _id: initialData._id,
          data: validationResult.data,
        });
      } else {
        await createMutation.mutateAsync(validationResult.data);
        reset(getEmptyFormValues());
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
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {isEditing ? t('healthRecords.editTitle') : t('healthRecords.createTitle')}
          </Text>
          <Button mode="text" onPress={handleCancel} disabled={isLoading} compact>
            {t('common.close')}
          </Button>
        </View>
        <FormProvider {...form}>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Pet Selection */}
            {!isEditing && (
              <FormSection title={t('healthRecords.petSelection')}>
                <PetSelector
                  selectedPetId={watch('petId')}
                  onPetSelect={(petId) => form.setValue('petId', petId)}
                  error={form.formState.errors.petId?.message}
                />
              </FormSection>
            )}

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
            </FormSection>

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
          </ScrollView>
        </FormProvider>
      </SafeAreaView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
});
