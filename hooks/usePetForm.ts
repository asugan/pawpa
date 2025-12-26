import { zodResolver } from '@hookform/resolvers/zod';
import { Control, FieldErrors, Path, PathValue, useForm, UseFormReturn } from 'react-hook-form';
import { PetCreateInput, PetCreateSchema, PetCreateFormInput, PetCreateFormSchema, PetUpdateInput, PetUpdateSchema, PetUpdateFormInput, PetUpdateFormSchema } from '../lib/schemas/petSchema';
import { FormHandlerReturn, Pet, PetGender, PetType } from '../lib/types';

// Form hook types
export interface UsePetFormReturn {
  form: UseFormReturn<PetCreateFormInput>;
  control: Control<PetCreateFormInput>;
  errors: FieldErrors<PetCreateFormInput>;
  isSubmitting: boolean;
  isValid: boolean;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
  handleSubmit: (onSubmit: (data: PetCreateFormInput) => void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: (values?: PetCreateFormInput) => void;
  setValue: <K extends Path<PetCreateFormInput>>(name: K, value: PathValue<PetCreateFormInput, K>) => void;
  getValues: (name?: keyof PetCreateFormInput) => PetCreateFormInput[keyof PetCreateFormInput] | PetCreateFormInput;
  trigger: (name?: keyof PetCreateFormInput) => Promise<boolean>;
  watch: (name?: keyof PetCreateFormInput) => PetCreateFormInput[keyof PetCreateFormInput] | PetCreateFormInput;
}

// Update form hook types
export interface UsePetUpdateFormReturn {
  form: UseFormReturn<PetUpdateFormInput>;
  control: Control<PetUpdateFormInput>;
  errors: FieldErrors<PetUpdateFormInput>;
  isSubmitting: boolean;
  isValid: boolean;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
  handleSubmit: (onSubmit: (data: PetUpdateFormInput) => void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: (values?: PetUpdateFormInput) => void;
  setValue: <K extends Path<PetUpdateFormInput>>(name: K, value: PathValue<PetUpdateFormInput, K>) => void;
  getValues: (name?: keyof PetUpdateFormInput) => PetUpdateFormInput[keyof PetUpdateFormInput] | PetUpdateFormInput;
  trigger: (name?: keyof PetUpdateFormInput) => Promise<boolean>;
  watch: (name?: keyof PetUpdateFormInput) => PetUpdateFormInput[keyof PetUpdateFormInput] | PetUpdateFormInput;
}

// Helper function to normalize pet type from database to form values
const normalizePetType = (type: string): PetType => {
  const typeLower = type.toLowerCase();
  const typeMap: Record<string, PetType> = {
    'köpek': 'dog',
    'kedi': 'cat',
    'kuş': 'bird',
    'balık': 'fish',
    'tavşan': 'rabbit',
    'hamster': 'hamster',
    'sürüngen': 'reptile',
    'diğer': 'other'
  };

  const validTypes: PetType[] = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'reptile', 'other'];

  // If it's already in English format, return as is
  if (validTypes.includes(typeLower as PetType)) {
    return typeLower as PetType;
  }

  // Otherwise map from Turkish to English
  return typeMap[typeLower] || 'other';
};

// Helper function to normalize gender from database to form values
const normalizeGender = (gender: string): PetGender => {
  const genderLower = gender.toLowerCase();
  const genderMap: Record<string, PetGender> = {
    'erkek': 'male',
    'dişi': 'female',
    'diğer': 'other'
  };

  const validGenders: PetGender[] = ['male', 'female', 'other'];

  // If it's already in English format, return as is
  if (validGenders.includes(genderLower as PetGender)) {
    return genderLower as PetGender;
  }

  // Otherwise map from Turkish to English
  return genderMap[genderLower] || 'other';
};

// Main hook for pet form - for creating new pets
export const usePetForm = (pet?: Pet): UsePetFormReturn => {
  const form = useForm<PetCreateFormInput>({
    resolver: zodResolver(PetCreateFormSchema()),
    defaultValues: pet ? {
      name: pet.name || '',
      type: normalizePetType(pet.type),
      breed: pet.breed || '',
      birthDate: pet.birthDate || undefined, // Keep as ISO string
      weight: pet.weight || undefined,
      gender: pet.gender ? normalizeGender(pet.gender) : undefined,
      profilePhoto: pet.profilePhoto || ''
    } : {
      name: '',
      type: 'other',
      breed: '',
      birthDate: undefined,
      weight: undefined,
      gender: undefined,
      profilePhoto: ''
    },
    mode: 'all', // Validate on change and blur for better UX
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

// Hook for updating existing pets
export const usePetUpdateForm = (pet: Pet): UsePetUpdateFormReturn => {
  const form = useForm<PetUpdateFormInput>({
    resolver: zodResolver(PetUpdateFormSchema()),
    defaultValues: {
      name: pet.name || '',
      type: normalizePetType(pet.type),
      breed: pet.breed || '',
      birthDate: pet.birthDate || undefined, // Keep as ISO string
      weight: pet.weight || undefined,
      gender: pet.gender ? normalizeGender(pet.gender) : undefined,
      profilePhoto: pet.profilePhoto || ''
    },
    mode: 'all',
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

// Form validation hook for real-time validation - DEPRECATED: Zod schema handles this now
// Keeping it empty or removing it would be best, but for now removing the implementation to avoid confusion
// and rely on Zod.
export const usePetFormValidation = (t: (key: string) => string) => {
  return {
    validateField: () => null,
    validateForm: () => ({})
  };
};

export default usePetForm;
