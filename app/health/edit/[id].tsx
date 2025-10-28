import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Text,
  Card,
  Divider,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useHealthRecordById, useUpdateHealthRecord } from '../../../lib/hooks/useHealthRecords';
import { DateTimePicker } from '../../../components/DateTimePicker';
import { CurrencyInput } from '../../../components/CurrencyInput';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { HEALTH_RECORD_TYPES, TURKCE_LABELS } from '../../../constants';
import type { HealthRecord } from '../../../lib/types';
import {
  getHealthRecordSchema,
  formatValidationErrors,
  type HealthRecordUpdateInput
} from '../../../lib/schemas/healthRecordSchema';

export default function EditHealthRecordScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { data: healthRecord, isLoading: recordsLoading } = useHealthRecordById(id as string);
  const updateMutation = useUpdateHealthRecord();

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<any>({
    mode: 'onChange',
    defaultValues: {
      petId: '',
      type: 'checkup',
      title: '',
      description: '',
      date: new Date().toISOString(),
      veterinarian: '',
      clinic: '',
      cost: undefined,
      notes: '',
      nextDueDate: undefined,
      // Vaccination specific fields
      vaccineName: '',
      vaccineManufacturer: '',
      batchNumber: '',
      // Medication specific fields
      medicationName: '',
      dosage: '',
      frequency: '',
      startDate: undefined,
      endDate: undefined,
    },
  });

  // Reset form with health record data when it loads
  React.useEffect(() => {
    if (healthRecord) {
      reset({
        petId: healthRecord.petId,
        type: healthRecord.type || 'checkup',
        title: healthRecord.title || '',
        description: healthRecord.description || '',
        date: healthRecord.date || new Date().toISOString(),
        veterinarian: healthRecord.veterinarian || '',
        clinic: healthRecord.clinic || '',
        cost: healthRecord.cost || undefined,
        notes: healthRecord.notes || '',
        nextDueDate: healthRecord.nextDueDate || undefined,
        // Vaccination specific fields
        vaccineName: healthRecord.vaccineName || '',
        vaccineManufacturer: healthRecord.vaccineManufacturer || '',
        batchNumber: healthRecord.batchNumber || '',
        // Medication specific fields
        medicationName: healthRecord.medicationName || '',
        dosage: healthRecord.dosage || '',
        frequency: healthRecord.frequency || '',
        startDate: healthRecord.startDate || undefined,
        endDate: healthRecord.endDate || undefined,
      });
    }
  }, [healthRecord, reset]);

  const watchedType = watch('type');

  const onSubmit = async (data: any) => {
    if (!healthRecord) return;

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
      const updateData = {
        ...validatedData,
        id: healthRecord.id,
        nextDueDate: validatedData.nextDueDate || null,
      } as HealthRecordUpdateInput;

      const result = await updateMutation.mutateAsync(updateData);
      if (!result.success) {
        throw new Error(result.error || 'Kayıt güncellenemedi');
      }

      router.back();
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Sağlık kaydı güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (recordsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!healthRecord) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          title="Kayıt Bulunamadı"
          description="Düzenlenecek sağlık kaydı bulunamadı"
          icon="alert-circle"
          buttonText="Geri Dön"
          onButtonPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
        <IconButton
          icon="arrow-left"
          onPress={handleCancel}
        />
        <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
          Sağlık Kaydını Düzenle
        </Text>
        <View style={{ width: 48 }} />
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
                      style: { minWidth: 80 },
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
            {watchedType === 'vaccination' && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.field}>
                  <Text style={styles.label}>Aşı Bilgileri</Text>
                </View>

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
            {watchedType === 'medication' && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.field}>
                  <Text style={styles.label}>İlaç Bilgileri</Text>
                </View>

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
            onPress={handleCancel}
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
            Güncelle
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
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
    color: '#333',
  },
  input: {
    backgroundColor: '#f8f9fa',
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
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
});