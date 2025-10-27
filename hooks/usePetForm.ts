import { useForm, Control, UseFormReturn, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pet } from '../lib/types';
import { PetCreateSchema, PetUpdateSchema, PetCreateInput, PetUpdateInput } from '../lib/schemas/petSchema';

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

// Main hook for pet form - for creating new pets
export const usePetForm = (pet?: Pet): UsePetFormReturn => {
  const form = useForm<PetCreateInput>({
    resolver: zodResolver(PetCreateSchema),
    defaultValues: pet ? {
      name: pet.name || '',
      type: (pet.type as any) || '',
      breed: pet.breed || '',
      birthDate: pet.birthDate ? new Date(pet.birthDate) : undefined,
      weight: pet.weight || undefined,
      gender: (pet.gender as any) || undefined,
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
      type: (pet.type as any) || '',
      breed: pet.breed || '',
      birthDate: pet.birthDate ? new Date(pet.birthDate) : undefined,
      weight: pet.weight || undefined,
      gender: (pet.gender as any) || undefined,
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
export const validatePetName = (name: string): string | null => {
  if (!name || name.trim().length < 2) {
    return 'İsim en az 2 karakter olmalıdır';
  }
  if (name.length > 50) {
    return 'İsim en fazla 50 karakter olabilir';
  }
  const turkishNameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/;
  if (!turkishNameRegex.test(name.trim())) {
    return 'İsim sadece harf ve Türkçe karakterler içerebilir (ç, ğ, ı, ö, ş, ü)';
  }
  return null;
};

export const validatePetWeight = (weight: number | undefined): string | null => {
  if (weight === undefined || weight === null) {
    return null; // Weight is optional
  }
  if (isNaN(weight)) {
    return 'Lütfen geçerli bir kilo değeri giriniz';
  }
  if (weight <= 0) {
    return 'Kilo pozitif bir sayı olmalıdır';
  }
  if (weight < 0.1) {
    return 'Kilo en az 0.1 kg olmalıdır';
  }
  if (weight > 200) {
    return 'Kilo 200 kg\'den az olmalıdır';
  }
  return null;
};

export const validateBirthDate = (date: Date | undefined): string | null => {
  if (!date) {
    return null; // Birth date is optional
  }
  if (isNaN(date.getTime())) {
    return 'Lütfen geçerli bir doğum tarihi seçiniz';
  }
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());

  if (date > now) {
    return 'Doğum tarihi gelecek bir tarih olamaz';
  }
  if (date < minDate) {
    return 'Doğum tarihi 30 yıldan eski olamaz';
  }
  return null;
};

// Form validation hook for real-time validation
export const usePetFormValidation = () => {
  const validateField = (fieldName: keyof PetCreateInput, value: any): string | null => {
    switch (fieldName) {
      case 'name':
        return validatePetName(value as string);
      case 'weight':
        return validatePetWeight(value as number | undefined);
      case 'birthDate':
        return validateBirthDate(value as Date | undefined);
      default:
        return null;
    }
  };

  const validateForm = (data: PetCreateInput): Record<string, string> => {
    const errors: Record<string, string> = {};

    const nameError = validatePetName(data.name);
    if (nameError) errors.name = nameError;

    const weightError = validatePetWeight(data.weight);
    if (weightError) errors.weight = weightError;

    const birthDateError = validateBirthDate(data.birthDate);
    if (birthDateError) errors.birthDate = birthDateError;

    return errors;
  };

  return {
    validateField,
    validateForm
  };
};

export default usePetForm;