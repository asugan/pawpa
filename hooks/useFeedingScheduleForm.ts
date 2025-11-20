import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Control, FieldErrors, useForm, UseFormReturn } from 'react-hook-form';
import { DAYS_OF_WEEK } from '../constants';
import {
  feedingScheduleFormSchema,
  type FeedingScheduleFormData,
} from '../lib/schemas/feedingScheduleSchema';
import { FeedingSchedule } from '../lib/types';

// Form hook types
export interface UseFeedingScheduleFormReturn {
  form: UseFormReturn<FeedingScheduleFormData>;
  control: Control<FeedingScheduleFormData>;
  errors: FieldErrors<FeedingScheduleFormData>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
  handleSubmit: (
    onSubmit: (data: FeedingScheduleFormData) => void | Promise<void>
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: (values?: FeedingScheduleFormData) => void;
  setValue: (name: keyof FeedingScheduleFormData, value: any) => void;
  getValues: (name?: keyof FeedingScheduleFormData) => FeedingScheduleFormData | any;
  trigger: (name?: keyof FeedingScheduleFormData) => Promise<boolean>;
  watch: (name?: keyof FeedingScheduleFormData) => FeedingScheduleFormData | any;
}

// Main hook for feeding schedule form - handles both create and edit modes
export const useFeedingScheduleForm = (
  schedule?: FeedingSchedule,
  initialPetId?: string
): UseFeedingScheduleFormReturn => {
  // Default values
  const defaultValues: FeedingScheduleFormData = React.useMemo(() => {
    if (schedule) {
      // Edit mode: parse existing schedule
      const daysArray = schedule.days
        .split(',')
        .map((d) => d.trim()) as Array<(typeof DAYS_OF_WEEK)[keyof typeof DAYS_OF_WEEK]>;

      return {
        petId: schedule.petId,
        time: schedule.time,
        foodType: schedule.foodType as any,
        amount: schedule.amount,
        daysArray,
        isActive: schedule.isActive ?? true,
      };
    } else {
      // Create mode: use defaults
      return {
        petId: initialPetId || '',
        time: '08:00',
        foodType: 'dry_food' as any,
        amount: '',
        daysArray: [],
        isActive: true,
      };
    }
  }, [schedule, initialPetId]);

  const form = useForm<FeedingScheduleFormData>({
    resolver: zodResolver(feedingScheduleFormSchema),
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

export default useFeedingScheduleForm;
