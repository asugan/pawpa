import { Button, Card, Divider, Portal, SegmentedButtons, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import {
    Alert,
    Modal as RNModal,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { HEALTH_RECORD_ICONS, HEALTH_RECORD_TYPES, TURKCE_LABELS } from '../../constants';
import {
    useCreateHealthRecord,
    useUpdateHealthRecord
} from '../../lib/hooks/useHealthRecords';
import {
    formatValidationErrors,
    getHealthRecordSchema,
    type HealthRecordCreateInput,
} from '../../lib/schemas/healthRecordSchema';
import type { HealthRecord } from '../../lib/types';
import { SmartCurrencyInput } from './SmartCurrencyInput';
import { SmartDatePicker } from './SmartDatePicker';
import { SmartInput } from './SmartInput';

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
  initialData
}: HealthRecordFormProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [isLoading, setIsLoading] = useState(false);
  const createMutation = useCreateHealthRecord();
  const updateMutation = useUpdateHealthRecord();
  const isEditing = !!initialData;

  const [selectedType, setSelectedType] = useState(initialData?.type || 'checkup');

  const methods = useForm<any>({
    mode: 'onChange', // Enable validation onChange
    defaultValues: {
      petId,
      type: initialData?.type || 'checkup',
      title: initialData?.title || '',
      description: initialData?.description || '',
      date: initialData?.date || new Date().toISOString(),
      veterinarian: initialData?.veterinarian || '',
      clinic: initialData?.clinic || '',
      cost: initialData?.cost || undefined,
      notes: initialData?.notes || '',
      nextDueDate: initialData?.nextDueDate || undefined,
      // Vaccination specific fields
      vaccineName: initialData?.vaccineName || '',
      vaccineManufacturer: initialData?.vaccineManufacturer || '',
      batchNumber: initialData?.batchNumber || '',
      // Medication specific fields
      medicationName: initialData?.medicationName || '',
      dosage: initialData?.dosage || '',
      frequency: initialData?.frequency || '',
      startDate: initialData?.startDate || undefined,
      endDate: initialData?.endDate || undefined,
    },
  });

  const { control, handleSubmit, watch, reset, formState: { errors } } = methods;

  const watchedType = watch('type');
  const hasNextDueDate = watchedType === 'vaccination';

  // Reset form when initialData changes (for editing)
  React.useEffect(() => {
    if (visible && initialData) {
      reset({
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
        vaccineName: initialData.vaccineName || '',
        vaccineManufacturer: initialData.vaccineManufacturer || '',
        batchNumber: initialData.batchNumber || '',
        medicationName: initialData.medicationName || '',
        dosage: initialData.dosage || '',
        frequency: initialData.frequency || '',
        startDate: initialData.startDate || undefined,
        endDate: initialData.endDate || undefined,
      });
      setSelectedType(initialData.type);
    } else if (visible && !initialData) {
      // Reset to empty form for creating new record
      reset({
        petId,
        type: 'checkup',
        title: '',
        description: '',
        date: new Date().toISOString(),
        veterinarian: '',
        clinic: '',
        cost: undefined,
        notes: '',
        nextDueDate: undefined,
        vaccineName: '',
        vaccineManufacturer: '',
        batchNumber: '',
        medicationName: '',
        dosage: '',
        frequency: '',
        startDate: undefined,
        endDate: undefined,
      });
      setSelectedType('checkup');
    }
  }, [visible, initialData, reset, petId]);

  // Update selectedType when form type changes
  React.useEffect(() => {
    if (watchedType !== selectedType) {
      setSelectedType(watchedType);
    }
  }, [watchedType, selectedType]);

  const onSubmit = async (data: HealthRecordCreateInput) => {
    try {
      setIsLoading(true);

      // Manual validation based on current type
      const schema = getHealthRecordSchema(data.type);
      const validationResult = schema.safeParse(data);

      if (!validationResult.success) {
        const formattedErrors = formatValidationErrors(validationResult.error);
        const errorMessage = formattedErrors.map(err => err.message).join('\n');
        Alert.alert('Validasyon Hatası', errorMessage);
        return;
      }

      const validatedData = validationResult.data;
      // Convert undefined to null for backend compatibility and Date objects to ISO strings
      const apiData: any = {
        ...validatedData,
        date: validatedData.date.toISOString(),
        nextDueDate: validatedData.nextDueDate ? validatedData.nextDueDate.toISOString() : null,
      };

      // Add medication-specific dates if they exist
      if ('startDate' in validatedData && validatedData.startDate) {
        apiData.startDate = (validatedData.startDate as Date).toISOString();
      }
      if ('endDate' in validatedData && validatedData.endDate) {
        apiData.endDate = (validatedData.endDate as Date).toISOString();
      }

      if (isEditing && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: apiData
        });
      } else {
        const createData = {
          ...apiData,
          updatedAt: new Date().toISOString()
        };
        await createMutation.mutateAsync(createData);
      }

      onSuccess?.();
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Sağlık kaydı kaydedilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onCancel?.();
    }
  };

  return (
    <Portal>
      <RNModal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <FormProvider {...methods}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {isEditing ? 'Sağlık Kaydını Düzenle' : 'Yeni Sağlık Kaydı'}
              </Text>
              <Button
                mode="text"
                onPress={handleClose}
                disabled={isLoading}
              >
                Kapat
              </Button>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  {/* Record Type */}
                  <View style={styles.field}>
                    <Text style={styles.label}>Kayıt Türü</Text>
                    <Controller
                      control={control}
                      name="type"
                      render={({ field: { onChange, value } }) => (
                        <SegmentedButtons
                          value={value}
                          onValueChange={onChange}
                          buttons={Object.entries(HEALTH_RECORD_TYPES).map(([key, value]) => ({
                            value,
                            label: TURKCE_LABELS.HEALTH_RECORD_TYPES[key as keyof typeof TURKCE_LABELS.HEALTH_RECORD_TYPES],
                            icon: HEALTH_RECORD_ICONS[value as keyof typeof HEALTH_RECORD_ICONS],
                          }))}
                          style={styles.segmentedButtons}
                          density="small"
                        />
                      )}
                    />
                    {errors.type && (
                      <Text style={styles.errorText}>{errors.type.message as string}</Text>
                    )}
                  </View>

                  {/* Title */}
                  <SmartInput
                    name="title"
                    label="Başlık"
                    placeholder="Örn: Kuduz Aşısı"
                  />

                  {/* Description */}
                  <SmartInput
                    name="description"
                    label="Açıklama"
                    placeholder="Detaylı açıklama..."
                    multiline
                    numberOfLines={3}
                  />

                  {/* Date */}
                  <SmartDatePicker
                    name="date"
                    label="Tarih"
                    mode="date"
                    maximumDate={new Date()}
                  />

                  <Divider style={styles.divider} />

                  {/* Veterinarian & Clinic */}
                  <View style={styles.row}>
                    <View style={[styles.field, styles.halfField]}>
                      <SmartInput
                        name="veterinarian"
                        label="Veteriner"
                        placeholder="Dr. İsim"
                      />
                    </View>
                    <View style={[styles.field, styles.halfField]}>
                      <SmartInput
                        name="clinic"
                        label="Klinik"
                        placeholder="Klinik Adı"
                      />
                    </View>
                  </View>

                  {/* Cost */}
                  <SmartCurrencyInput
                    name="cost"
                    label="Maliyet"
                  />

                  {/* Vaccination Specific Fields */}
                  {watchedType === 'vaccination' && (
                    <>
                      <Divider style={styles.divider} />
                      <View style={styles.field}>
                        <Text style={styles.label}>Aşı Bilgileri</Text>
                      </View>

                      {/* Vaccine Name */}
                      <SmartInput
                        name="vaccineName"
                        label="Aşı Adı"
                        placeholder="Örn: Kuduz Aşısı"
                      />

                      {/* Vaccine Manufacturer */}
                      <SmartInput
                        name="vaccineManufacturer"
                        label="Aşı Üreticisi"
                        placeholder="Üretici firma"
                      />

                      {/* Batch Number */}
                      <SmartInput
                        name="batchNumber"
                        label="Parti Numarası"
                        placeholder="Örn: ABC123"
                      />

                      {/* Next Due Date */}
                      <SmartDatePicker
                        name="nextDueDate"
                        label="Sonraki Aşı Tarihi"
                        mode="date"
                        minimumDate={new Date()}
                      />
                    </>
                  )}

                  {/* Medication Specific Fields */}
                  {watchedType === 'medication' && (
                    <>
                      <Divider style={styles.divider} />
                      <View style={styles.field}>
                        <Text style={styles.label}>İlaç Bilgileri</Text>
                      </View>

                      {/* Medication Name */}
                      <SmartInput
                        name="medicationName"
                        label="İlaç Adı"
                        placeholder="Örn: Antibiyotik"
                      />

                      {/* Dosage and Frequency */}
                      <View style={styles.row}>
                        <View style={[styles.field, styles.halfField]}>
                          <SmartInput
                            name="dosage"
                            label="Doz"
                            placeholder="Örn: 10mg"
                          />
                        </View>
                        <View style={[styles.field, styles.halfField]}>
                          <SmartInput
                            name="frequency"
                            label="Sıklık"
                            placeholder="Örn: Günde 2 kez"
                          />
                        </View>
                      </View>

                      {/* Treatment Period */}
                      <View style={styles.row}>
                        <View style={[styles.field, styles.halfField]}>
                          <SmartDatePicker
                            name="startDate"
                            label="Başlangıç Tarihi"
                            mode="date"
                            maximumDate={new Date()}
                          />
                        </View>
                        <View style={[styles.field, styles.halfField]}>
                          <SmartDatePicker
                            name="endDate"
                            label="Bitiş Tarihi"
                            mode="date"
                          />
                        </View>
                      </View>
                    </>
                  )}

                  {/* Next Due Date for non-vaccination types (optional) */}
                  {watchedType !== 'vaccination' && hasNextDueDate && (
                    <SmartDatePicker
                      name="nextDueDate"
                      label="Sonraki Kontrol Tarihi"
                      mode="date"
                      minimumDate={new Date()}
                    />
                  )}

                  <Divider style={styles.divider} />

                  {/* Notes */}
                  <SmartInput
                    name="notes"
                    label="Notlar"
                    placeholder="Ek notlar..."
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </Card>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <Button
                  mode="outlined"
                  onPress={handleClose}
                  style={[styles.button, styles.cancelButton] as any}
                  disabled={isLoading}
                >
                  İptal
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit(onSubmit)}
                  style={[styles.button, styles.submitButton] as any}
                  disabled={isLoading}
                >
                  {isEditing ? 'Güncelle' : 'Kaydet'}
                </Button>
              </View>
            </ScrollView>
          </View>
        </FormProvider>
      </RNModal>
    </Portal>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: theme.colors.onSurface,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#FFB3D1',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});