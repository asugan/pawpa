import { z } from 'zod';
import { PET_TYPES, PET_GENDERS } from '../../constants/index';
import { t, createZodI18nErrorMap } from './createZodI18n';

// Custom validation regex for Turkish characters
const TURKISH_NAME_REGEX = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/;

// Custom validation functions
const validateBirthDate = (date: Date) => {
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate()); // 30 years ago
  return date <= now && date >= minDate;
};

const validateTurkishName = (name: string) => {
  return TURKISH_NAME_REGEX.test(name.trim());
};

// Base pet schema for common validations
const BasePetSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(TURKISH_NAME_REGEX)
    .transform(val => val.trim()),

  type: z.enum(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'] as const),

  breed: z
    .string()
    .max(100)
    .optional()
    .transform(val => val?.trim() || undefined),

  birthDate: z
    .date()
    .refine(validateBirthDate, {
      message: t('forms.validation.birthDateFuture')
    })
    .optional(),

  weight: z
    .number()
    .positive()
    .min(0.1)
    .max(200)
    .optional(),

  gender: z.enum(['male', 'female', 'other'] as const).optional(),

  profilePhoto: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined))
    .refine((val) => {
      if (!val) return true; // Optional field
      // Local URI veya URL formatı kontrolü
      return val.startsWith('file://') || val.startsWith('/') ||
             val.startsWith('data:image/') || val.startsWith('http');
    }, {
      message: t('forms.validation.photoInvalid')
    })
});

// Schema for creating a new pet
export const PetCreateSchema = BasePetSchema.refine(
  (data: any) => data.name && data.type,
  {
    message: t('forms.validation.petNameAndTypeRequired'),
    path: ["type"]
  }
);

// Schema for updating an existing pet (all fields optional)
export const PetUpdateSchema = BasePetSchema.partial();

// Type exports for TypeScript
export type PetCreateInput = z.infer<typeof PetCreateSchema>;
export type PetUpdateInput = z.infer<typeof PetUpdateSchema>;

// Validation error type for better error handling
export type ValidationError = {
  path: string[];
  message: string;
};

// Helper function to format validation errors
export const formatValidationErrors = (error: z.ZodError): ValidationError[] => {
  return error.errors.map(err => ({
    path: err.path.map(String),
    message: err.message
  }));
};

// Custom validation rules specific to Turkey
export const TurkishPetValidations = {
  // Validate Turkish Identification Number (for future use)
  validateTurkishID: (tckn: string): boolean => {
    if (tckn.length !== 11) return false;
    if (!/^\d+$/.test(tckn)) return false;
    // Additional TC validation logic can be added here
    return true;
  },

  // Validate Turkish phone format (for future use)
  validateTurkishPhone: (phone: string): boolean => {
    const phoneRegex = /^(\+90|0)?[5-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Validate Turkish postal code (for future use)
  validateTurkishPostalCode: (postalCode: string): boolean => {
    const postalCodeRegex = /^\d{5}$/;
    return postalCodeRegex.test(postalCode);
  }
};