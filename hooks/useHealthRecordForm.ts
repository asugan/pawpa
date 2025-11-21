import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Control, FieldErrors, FieldValues, Path, PathValue, useForm, UseFormReturn } from 'react-hook-form';
import {
  getHealthRecordSchema,
  type HealthRecordCreateInput,
} from '../lib/schemas/healthRecordSchema';
import { HealthRecord } from '../lib/types';

// Form hook types
export interface UseHealthRecordFormReturn {
  form: UseFormReturn<HealthRecordCreateInput>;
  control: Control<HealthRecordCreateInput>;
  errors: FieldErrors<HealthRecordCreateInput>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
  handleSubmit: (
    onSubmit: (data: HealthRecordCreateInput) => void | Promise<void>
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: (values?: HealthRecordCreateInput) => void;
  setValue: <K extends Path<HealthRecordCreateInput>>(name: K, value: PathValue<HealthRecordCreateInput, K>) => void;
  getValues: {
    (): HealthRecordCreateInput;
    <K extends keyof HealthRecordCreateInput>(name: K): HealthRecordCreateInput[K];
  };
  trigger: (name?: keyof HealthRecordCreateInput) => Promise<boolean>;
  watch: {
    (): HealthRecordCreateInput;
    <K extends keyof HealthRecordCreateInput>(name: K): HealthRecordCreateInput[K];
  };
}

// Main hook for health record form - handles both create and edit modes
export const useHealthRecordForm = (
  petId: string,
  initialData?: HealthRecord
): UseHealthRecordFormReturn => {
  // Default values - comprehensive for all health record types
  const defaultValues: HealthRecordCreateInput = React.useMemo(() => {
    return {
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
    } as HealthRecordCreateInput;
  }, [petId, initialData]);

  const form = useForm<HealthRecordCreateInput>({
    resolver: zodResolver(getHealthRecordSchema(defaultValues.type)),
    defaultValues,
    mode: 'onChange', // Validate on change for better UX
    reValidateMode: 'onChange',
  });

  return {
    form,
    control: form.control,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    touchedFields: form.formState.touchedFields,
    dirtyFields: form.formState.dirtyFields,
    handleSubmit: form.handleSubmit,
    reset: form.reset,
    setValue: form.setValue,
    getValues: form.getValues,
    trigger: form.trigger,
    watch: form.watch,
  };
};

export default useHealthRecordForm;
