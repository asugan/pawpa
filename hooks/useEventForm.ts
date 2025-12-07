import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Control, FieldErrors, Path, PathValue, useForm, UseFormReturn } from 'react-hook-form';
import {
  eventFormSchema,
  type EventFormData,
} from '../lib/schemas/eventSchema';
import { Event } from '../lib/types';
import { toISODateString, toTimeString } from '../lib/utils/dateConversion';

// Form hook types
export interface UseEventFormReturn {
  form: UseFormReturn<EventFormData>;
  control: Control<EventFormData>;
  errors: FieldErrors<EventFormData>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
  handleSubmit: (
    onSubmit: (data: EventFormData) => void | Promise<void>
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: (values?: EventFormData) => void;
  setValue: <K extends Path<EventFormData>>(name: K, value: PathValue<EventFormData, K>) => void;
  getValues: (name?: keyof EventFormData) => EventFormData[keyof EventFormData] | EventFormData;
  trigger: (name?: keyof EventFormData) => Promise<boolean>;
  watch: (name?: keyof EventFormData) => EventFormData[keyof EventFormData] | EventFormData;
}

// Main hook for event form - handles both create and edit modes
export const useEventForm = (event?: Event, initialPetId?: string): UseEventFormReturn => {
  // Default values - parse datetime for date/time pickers
  const defaultValues: EventFormData = React.useMemo(() => {
    // Parse dates to local time objects
    const startDateTime = event?.startTime
      ? new Date(event.startTime)
      : new Date(Date.now() + 60000); // Now + 1 minute

    const endDateTime = event?.endTime ? new Date(event.endTime) : null;

    const startDate = toISODateString(startDateTime) || '';
    const startTime = toTimeString(startDateTime) || '';
    
    const endDate = endDateTime ? toISODateString(endDateTime) : '';
    const endTime = endDateTime ? toTimeString(endDateTime) : '';

    return {
      title: event?.title || '',
      description: event?.description || '',
      petId: initialPetId || event?.petId || '',
      type: event?.type || 'other',
      startDate,
      startTime,
      endDate: endDate || undefined,
      endTime: endTime || undefined,
      location: event?.location || undefined,
      reminder: event?.reminder ?? false,
      notes: event?.notes || undefined,
    };
  }, [event, initialPetId]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
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

export default useEventForm;
