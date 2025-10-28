import { useForm, Control, UseFormReturn, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pet } from '../lib/types';
import { PetCreateSchema, PetUpdateSchema, PetCreateInput, PetUpdateInput } from '../lib/schemas/petSchema';
import { createZodI18nErrorMap } from '../lib/schemas/createZodI18n';

// Form hook types
export interface UsePetFormReturn {
  form: UseFormReturn<PetCreateInput>;
  control: Control<PetCreateInput>;
  errors: FieldErrors<PetCreateInput>;
  isSubmitting: boolean;
  isValid: boolean;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
  handleSubmit: (onSubmit: (data: PetCreateInput) => void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: (values?: PetCreateInput) => void;
  setValue: (name: keyof PetCreateInput, value: any) => void;
  getValues: (name?: keyof PetCreateInput) => PetCreateInput | any;
  trigger: (name?: keyof PetCreateInput) => Promise<boolean>;
  watch: (name?: keyof PetCreateInput) => PetCreateInput | any;
}

// Update form hook types
export interface UsePetUpdateFormReturn {
  form: UseFormReturn<PetUpdateInput>;
  control: Control<PetUpdateInput>;
  errors: FieldErrors<PetUpdateInput>;
  isSubmitting: boolean;
  isValid: boolean;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
  handleSubmit: (onSubmit: (data: PetUpdateInput) => void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: (values?: PetUpdateInput) => void;
  setValue: (name: keyof PetUpdateInput, value: any) => void;
  getValues: (name?: keyof PetUpdateInput) => PetUpdateInput | any;
  trigger: (name?: keyof PetUpdateInput) => Promise<boolean>;
  watch: (name?: keyof PetUpdateInput) => PetUpdateInput | any;
}

// Helper function to normalize pet type from database to form values
const normalizePetType = (type: string): string => {
  const typeLower = type.toLowerCase();
  const typeMap: Record<string, string> = {
    'köpek': 'dog',
    'kedi': 'cat',
    'kuş': 'bird',
    'balık': 'fish',
    'tavşan': 'rabbit',
    'hamster': 'hamster',
    'sürüngen': 'reptile',
    'diğer': 'other'
  };

  // If it's already in English format, return as is
  if (['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'reptile', 'other'].includes(typeLower)) {
    return typeLower;
  }

  // Otherwise map from Turkish to English
  return typeMap[typeLower] || typeLower;
};

// Helper function to normalize gender from database to form values
const normalizeGender = (gender: string): string => {
  const genderLower = gender.toLowerCase();
  const genderMap: Record<string, string> = {
    'erkek': 'male',
    'dişi': 'female',
    'diğer': 'other'
  };

  // If it's already in English format, return as is
  if (['male', 'female', 'other'].includes(genderLower)) {
    return genderLower;
  }

  // Otherwise map from Turkish to English
  return genderMap[genderLower] || genderLower;
};

// Main hook for pet form - for creating new pets
export const usePetForm = (pet?: Pet): UsePetFormReturn => {
  const form = useForm<PetCreateInput>({
    resolver: zodResolver(PetCreateSchema),
    defaultValues: pet ? {
      name: pet.name || '',
      type: normalizePetType(pet.type) || '',
      breed: pet.breed || '',
      birthDate: pet.birthDate ? new Date(pet.birthDate) : undefined,
      weight: pet.weight || undefined,
      gender: pet.gender ? normalizeGender(pet.gender) : undefined,
      profilePhoto: pet.profilePhoto || ''
    } : {
      name: '',
      type: '',
      breed: '',
      birthDate: undefined,
      weight: undefined,
      gender: undefined,
      profilePhoto: ''
    },
    mode: 'onChange', // Validate on change for better UX
    reValidateMode: 'onChange'
  });

  return {
    form: form as UseFormReturn<PetCreateInput>,
    control: form.control as Control<PetCreateInput>,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
    touchedFields: form.formState.touchedFields,
    dirtyFields: form.formState.dirtyFields,
    handleSubmit: form.handleSubmit as any,
    reset: form.reset,
    setValue: form.setValue,
    getValues: form.getValues,
    trigger: form.trigger,
    watch: form.watch
  };
};

// Hook for updating existing pets
export const usePetUpdateForm = (pet: Pet): UsePetUpdateFormReturn => {
  const form = useForm<PetUpdateInput>({
    resolver: zodResolver(PetUpdateSchema),
    defaultValues: {
      name: pet.name || '',
      type: normalizePetType(pet.type) || '',
      breed: pet.breed || '',
      birthDate: pet.birthDate ? new Date(pet.birthDate) : undefined,
      weight: pet.weight || undefined,
      gender: pet.gender ? normalizeGender(pet.gender) : undefined,
      profilePhoto: pet.profilePhoto || ''
    },
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  return {
    form,
    control: form.control,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
    touchedFields: form.formState.touchedFields,
    dirtyFields: form.formState.dirtyFields,
    handleSubmit: form.handleSubmit,
    reset: form.reset,
    setValue: form.setValue,
    getValues: form.getValues,
    trigger: form.trigger,
    watch: form.watch
  };
};

// Utility hook for form field validation states
export const useFormFieldState = (fieldName: keyof PetCreateInput, control: Control<PetCreateInput>) => {
  const fieldState = control.getFieldState(fieldName);

  return {
    error: fieldState.error,
    isTouched: fieldState.isTouched,
    isDirty: fieldState.isDirty,
    isValid: fieldState.invalid === false,
    hasError: !!fieldState.error
  };
};

// Validation helper functions
export const validatePetName = (name: string, t: (key: string) => string): string | null => {
  if (!name || name.trim().length < 2) {
    return t('forms.validation.nameMinLength');
  }
  if (name.length > 50) {
    return t('forms.validation.nameMaxLength');
  }
  const turkishNameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/;
  if (!turkishNameRegex.test(name.trim())) {
    return t('forms.validation.nameInvalidChars');
  }
  return null;
};

export const validatePetWeight = (weight: number | undefined, t: (key: string) => string): string | null => {
  if (weight === undefined || weight === null) {
    return null; // Weight is optional
  }
  if (isNaN(weight)) {
    return t('forms.validation.weightRequired');
  }
  if (weight <= 0) {
    return t('forms.validation.weightPositive');
  }
  if (weight < 0.1) {
    return t('forms.validation.weightMin');
  }
  if (weight > 200) {
    return t('forms.validation.weightMax');
  }
  return null;
};

export const validateBirthDate = (date: Date | undefined, t: (key: string) => string): string | null => {
  if (!date) {
    return null; // Birth date is optional
  }
  if (isNaN(date.getTime())) {
    return t('forms.validation.birthDateRequired');
  }
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());

  if (date > now) {
    return t('forms.validation.birthDateFuture');
  }
  if (date < minDate) {
    return t('forms.validation.birthDateMaxAge');
  }
  return null;
};

// Form validation hook for real-time validation
export const usePetFormValidation = (t: (key: string) => string) => {
  const validateField = (fieldName: keyof PetCreateInput, value: any): string | null => {
    switch (fieldName) {
      case 'name':
        return validatePetName(value as string, t);
      case 'weight':
        return validatePetWeight(value as number | undefined, t);
      case 'birthDate':
        return validateBirthDate(value as Date | undefined, t);
      default:
        return null;
    }
  };

  const validateForm = (data: PetCreateInput): Record<string, string> => {
    const errors: Record<string, string> = {};

    const nameError = validatePetName(data.name, t);
    if (nameError) errors.name = nameError;

    const weightError = validatePetWeight(data.weight, t);
    if (weightError) errors.weight = weightError;

    const birthDateError = validateBirthDate(data.birthDate, t);
    if (birthDateError) errors.birthDate = birthDateError;

    return errors;
  };

  return {
    validateField,
    validateForm
  };
};

export default usePetForm;