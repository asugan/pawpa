import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Modal as RNModal,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Text,
  Card,
  Divider,
  Switch,
  Portal,
  useTheme,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DateTimePicker } from '../../components/DateTimePicker';
import { CurrencyInput } from '../../components/CurrencyInput';
import { HEALTH_RECORD_TYPES, TURKCE_LABELS } from '../../constants';
import {
  useCreateHealthRecord,
  useUpdateHealthRecord
} from '../../lib/hooks/useHealthRecords';
import type { HealthRecord } from '../../lib/types';
import {
  HealthRecordCreateSchema,
  HealthRecordUpdateSchema,
  getHealthRecordSchema,
  formatValidationErrors,
  getFieldError,
  type HealthRecordCreateInput,
  type HealthRecordUpdateInput
} from '../../lib/schemas/healthRecordSchema';

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
  const theme = useTheme();
  const styles = getStyles(theme);
  const [isLoading, setIsLoading] = useState(false);
  const createMutation = useCreateHealthRecord();
  const updateMutation = useUpdateHealthRecord();
  const isEditing = !!initialData;

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(HealthRecordCreateSchema),
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

  const selectedType = watch('type');
  const hasNextDueDate = selectedType === 'vaccination';

  const onSubmit = async (data: HealthRecordCreateInput) => {
    try {
      setIsLoading(true);

      // Dynamic validation based on record type
      const schema = getHealthRecordSchema(data.type);
      const validationResult = schema.safeParse(data);

      if (!validationResult.success) {
        // Handle validation errors with proper formatting
        const formattedErrors = formatValidationErrors(validationResult.error);
        const errorMessage = formattedErrors.map(err => err.message).join('\n');
        Alert.alert('Validasyon Hatası', errorMessage);
        return;
      }

      if (isEditing && initialData) {
        const updateData = { ...validationResult.data, id: initialData.id } as HealthRecordUpdateInput;
        const result = await updateMutation.mutateAsync(updateData);
        if (!result.success) {
          throw new Error(result.error || 'Kayıt güncellenemedi');
        }
      } else {
        const result = await createMutation.mutateAsync(validationResult.data);
        if (!result.success) {
          throw new Error(result.error || 'Kayıt oluşturulamadı');
        }
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
              <Card.Content>
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
                          style: {
                            minWidth: 80,
                          },
                          textColor: theme.colors.onSurface,
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
                <View style={styles.field}>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Başlık *"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={!!errors.title}
                        style={styles.input}
                      />
                    )}
                  />
                  {errors.title && (
                    <Text style={styles.errorText}>{errors.title.message as string}</Text>
                  )}
                </View>

                {/* Description */}
                <View style={styles.field}>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Açıklama"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        numberOfLines={3}
                        style={styles.input}
                      />
                    )}
                  />
                </View>

                {/* Date */}
                <View style={styles.field}>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field: { onChange, value } }) => (
                      <DateTimePicker
                        value={value ? new Date(value) : new Date()}
                        onChange={(date) => onChange(date.toISOString())}
                        mode="date"
                        label="Tarih *"
                        error={!!errors.date}
                        errorText={errors.date?.message as string}
                        maximumDate={new Date()}
                      />
                    )}
                  />
                </View>

                <Divider style={styles.divider} />

                {/* Veterinarian & Clinic */}
                <View style={styles.row}>
                  <View style={[styles.field, styles.halfField]}>
                    <Controller
                      control={control}
                      name="veterinarian"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          label="Veteriner"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          style={styles.input}
                        />
                      )}
                    />
                  </View>
                  <View style={[styles.field, styles.halfField]}>
                    <Controller
                      control={control}
                      name="clinic"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          label="Klinik"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          style={styles.input}
                        />
                      )}
                    />
                  </View>
                </View>

                {/* Cost */}
                <View style={styles.field}>
                  <Controller
                    control={control}
                    name="cost"
                    render={({ field: { onChange, value } }) => (
                      <CurrencyInput
                        label="Maliyet (₺)"
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </View>

                {/* Vaccination Specific Fields */}
                {selectedType === 'vaccination' && (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.field}>
                      <Text style={styles.label}>Aşı Bilgileri</Text>
                    </View>

                    {/* Vaccine Name */}
                    <View style={styles.field}>
                      <Controller
                        control={control}
                        name="vaccineName"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            label="Aşı Adı *"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={!!errors.vaccineName}
                            style={styles.input}
                          />
                        )}
                      />
                      {errors.vaccineName && (
                        <Text style={styles.errorText}>{errors.vaccineName.message as string}</Text>
                      )}
                    </View>

                    {/* Vaccine Manufacturer */}
                    <View style={styles.field}>
                      <Controller
                        control={control}
                        name="vaccineManufacturer"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            label="Aşı Üreticisi"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            style={styles.input}
                          />
                        )}
                      />
                    </View>

                    {/* Batch Number */}
                    <View style={styles.field}>
                      <Controller
                        control={control}
                        name="batchNumber"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            label="Parti Numarası"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            style={styles.input}
                          />
                        )}
                      />
                    </View>

                    {/* Next Due Date */}
                    <View style={styles.field}>
                      <Controller
                        control={control}
                        name="nextDueDate"
                        render={({ field: { onChange, value } }) => (
                          <DateTimePicker
                            value={value ? new Date(value) : new Date()}
                            onChange={(date) => onChange(date.toISOString())}
                            mode="date"
                            label="Sonraki Aşı Tarihi *"
                            error={!!errors.nextDueDate}
                            errorText={errors.nextDueDate?.message as string}
                            minimumDate={new Date()}
                          />
                        )}
                      />
                    </View>
                  </>
                )}

                {/* Medication Specific Fields */}
                {selectedType === 'medication' && (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.field}>
                      <Text style={styles.label}>İlaç Bilgileri</Text>
                    </View>

                    {/* Medication Name */}
                    <View style={styles.field}>
                      <Controller
                        control={control}
                        name="medicationName"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            label="İlaç Adı *"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={!!errors.medicationName}
                            style={styles.input}
                          />
                        )}
                      />
                      {errors.medicationName && (
                        <Text style={styles.errorText}>{errors.medicationName.message as string}</Text>
                      )}
                    </View>

                    {/* Dosage and Frequency */}
                    <View style={styles.row}>
                      <View style={[styles.field, styles.halfField]}>
                        <Controller
                          control={control}
                          name="dosage"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              label="Doz *"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              error={!!errors.dosage}
                              style={styles.input}
                            />
                          )}
                        />
                        {errors.dosage && (
                          <Text style={styles.errorText}>{errors.dosage.message as string}</Text>
                        )}
                      </View>
                      <View style={[styles.field, styles.halfField]}>
                        <Controller
                          control={control}
                          name="frequency"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              label="Sıklık *"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              error={!!errors.frequency}
                              style={styles.input}
                            />
                          )}
                        />
                        {errors.frequency && (
                          <Text style={styles.errorText}>{errors.frequency.message as string}</Text>
                        )}
                      </View>
                    </View>

                    {/* Treatment Period */}
                    <View style={styles.row}>
                      <View style={[styles.field, styles.halfField]}>
                        <Text style={styles.label}>Başlangıç Tarihi</Text>
                        <Controller
                          control={control}
                          name="startDate"
                          render={({ field: { onChange, value } }) => (
                            <DateTimePicker
                              value={value ? new Date(value) : new Date()}
                              onChange={(date) => onChange(date.toISOString())}
                              mode="date"
                              maximumDate={new Date()}
                            />
                          )}
                        />
                      </View>
                      <View style={[styles.field, styles.halfField]}>
                        <Text style={styles.label}>Bitiş Tarihi</Text>
                        <Controller
                          control={control}
                          name="endDate"
                          render={({ field: { onChange, value } }) => (
                            <DateTimePicker
                              value={value ? new Date(value) : new Date()}
                              onChange={(date) => onChange(date.toISOString())}
                              mode="date"
                              error={!!errors.endDate}
                              errorText={errors.endDate?.message as string}
                            />
                          )}
                        />
                      </View>
                    </View>
                  </>
                )}

                {/* Next Due Date for non-vaccination types (optional) */}
                {selectedType !== 'vaccination' && hasNextDueDate && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Sonraki Kontrol Tarihi</Text>
                    <Controller
                      control={control}
                      name="nextDueDate"
                      render={({ field: { onChange, value } }) => (
                        <DateTimePicker
                          value={value ? new Date(value) : new Date()}
                          onChange={(date) => onChange(date.toISOString())}
                          mode="date"
                          minimumDate={new Date()}
                        />
                      )}
                    />
                  </View>
                )}

                <Divider style={styles.divider} />

                {/* Notes */}
                <View style={styles.field}>
                  <Controller
                    control={control}
                    name="notes"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Notlar"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        numberOfLines={4}
                        style={styles.input}
                      />
                    )}
                  />
                </View>
              </Card.Content>
            </Card>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={handleClose}
                style={[styles.button, styles.cancelButton]}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={[styles.button, styles.submitButton]}
                loading={isLoading}
                disabled={isLoading}
              >
                {isEditing ? 'Güncelle' : 'Kaydet'}
              </Button>
            </View>
          </ScrollView>
        </View>
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
  input: {
    backgroundColor: theme.colors.surface,
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