import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Control, FieldErrors, Path, PathValue, useForm, UseFormReturn } from 'react-hook-form';
import {
  BudgetCreateInput,
  BudgetCreateSchema,
} from '../lib/schemas/budgetSchema';
import { BudgetLimit, BudgetPeriod, Currency } from '../lib/types';

// Form hook types
export interface UseBudgetFormReturn {
  form: UseFormReturn<BudgetCreateInput>;
  control: Control<BudgetCreateInput>;
  errors: FieldErrors<BudgetCreateInput>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
  handleSubmit: (
    onSubmit: (data: BudgetCreateInput) => void | Promise<void>
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: (values?: BudgetCreateInput) => void;
  setValue: <K extends Path<BudgetCreateInput>>(name: K, value: PathValue<BudgetCreateInput, K>) => void;
  getValues: (name?: keyof BudgetCreateInput) => BudgetCreateInput | any;
  trigger: (name?: keyof BudgetCreateInput) => Promise<boolean>;
  watch: (name?: keyof BudgetCreateInput) => BudgetCreateInput | any;
}

// Main hook for budget form - handles both create and edit modes
export const useBudgetForm = (
  petId: string,
  initialData?: BudgetLimit
): UseBudgetFormReturn => {
  // Default values
  const defaultValues: BudgetCreateInput = React.useMemo(() => {
    return {
      petId,
      category: initialData?.category || null,
      amount: initialData?.amount || 0,
      currency: (initialData?.currency as Currency) || ('TRY' as Currency),
      period: (initialData?.period || 'monthly') as BudgetPeriod,
      alertThreshold: initialData?.alertThreshold || 0.8,
      isActive: initialData?.isActive ?? true,
    };
  }, [petId, initialData]);

  const form = useForm<BudgetCreateInput>({
    resolver: zodResolver(BudgetCreateSchema),
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

export default useBudgetForm;
