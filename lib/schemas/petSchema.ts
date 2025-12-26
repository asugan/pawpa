import { z } from 'zod';
import { toUTCWithOffset, isValidUTCISOString } from '@/lib/utils/dateConversion';
import { objectIdSchema, t } from './createZodI18n';

// Custom validation regex for Turkish characters
const TURKISH_NAME_REGEX = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/;

// Custom validation functions
const validateBirthDate = (dateString: string) => {
  // Ensure the date is valid UTC ISO string
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;

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
    .min(2, t('forms.validation.pet.nameMin'))
    .max(50, t('forms.validation.pet.nameMax'))
    .regex(TURKISH_NAME_REGEX, t('forms.validation.pet.nameInvalidChars'))
    .transform(val => val.trim()),

  type: z.enum(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'] as const, {
    message: t('forms.validation.pet.typeRequired'),
  }),

  breed: z
    .string()
    .max(100, t('forms.validation.pet.breedMax'))
    .optional()
    .transform(val => val?.trim() || undefined),

  birthDate: z
    .union([z.string(), z.date()])
    .transform((val): string => {
      // If it's a Date object, convert to UTC ISO
      if (val instanceof Date) {
        return toUTCWithOffset(val);
      }
      // If it's a string without timezone info, convert to UTC
      if (typeof val === 'string') {
        if (!val.endsWith('Z') && !val.includes('+')) {
          return toUTCWithOffset(new Date(val));
        }
        return val;
      }
      throw new Error('Invalid date type');
    })
    .refine((val) => isValidUTCISOString(val), {
      message: t('forms.validation.pet.birthDateUtcInvalid'),
    })
    .refine(validateBirthDate, {
      message: t('forms.validation.pet.birthDateRange'),
    })
    .optional(),

  weight: z
    .number()
    .positive(t('forms.validation.pet.weightPositive'))
    .min(0.1, t('forms.validation.pet.weightMin'))
    .max(200, t('forms.validation.pet.weightMax'))
    .optional(),

  gender: z
    .enum(['male', 'female', 'other'] as const, {
      message: t('forms.validation.pet.genderRequired'),
    })
    .optional(),

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
      message: t('forms.validation.pet.photoInvalid'),
    })
});

// Full Pet schema including server-side fields
export const PetSchema = BasePetSchema.extend({
  _id: objectIdSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for form input (before transformation)
export const PetCreateFormSchema = BasePetSchema.extend({
  birthDate: z
    .union([z.string(), z.date()])
    .refine((val) => {
      if (val instanceof Date) return !isNaN(val.getTime());
      if (typeof val === 'string') {
        const date = new Date(val);
        return !isNaN(date.getTime());
      }
      return false;
    }, {
      message: t('forms.validation.pet.birthDateInvalid'),
    })
    .refine((val) => {
      const date = val instanceof Date ? val : new Date(val);
      const now = new Date();
      const minDate = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());
      return date <= now && date >= minDate;
    }, {
      message: t('forms.validation.pet.birthDateRange'),
    })
    .optional(),
});

// Schema for creating a new pet (with transformation)
export const PetCreateSchema = BasePetSchema.refine(
  (data: z.infer<typeof BasePetSchema>) => {
    const nameValid = data.name && data.name.trim().length >= 2;
    const typeValid = !!data.type;
    return nameValid && typeValid;
  },
  {
    message: t('forms.validation.pet.nameAndTypeRequired'),
    path: ["name"]
  }
);

// Schema for updating an existing pet form (before transformation)
export const PetUpdateFormSchema = BasePetSchema.partial().extend({
  birthDate: z
    .union([z.string(), z.date()])
    .refine((val) => {
      if (!val) return true; // Optional field
      if (val instanceof Date) return !isNaN(val.getTime());
      if (typeof val === 'string') {
        const date = new Date(val);
        return !isNaN(date.getTime());
      }
      return false;
    }, {
      message: t('forms.validation.pet.birthDateInvalid'),
    })
    .refine((val) => {
      if (!val) return true; // Optional field
      const date = val instanceof Date ? val : new Date(val);
      const now = new Date();
      const minDate = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());
      return date <= now && date >= minDate;
    }, {
      message: t('forms.validation.pet.birthDateRange'),
    })
    .optional(),
});

// Schema for updating an existing pet (with transformation)
export const PetUpdateSchema = BasePetSchema.partial();

// Type exports for TypeScript
export type Pet = z.infer<typeof PetSchema>;
export type PetCreateInput = z.infer<typeof PetCreateSchema>;
export type PetUpdateInput = z.infer<typeof PetUpdateSchema>;
export type PetCreateFormInput = z.input<typeof PetCreateFormSchema>;
export type PetUpdateFormInput = z.input<typeof PetUpdateFormSchema>;

// Validation error type for better error handling
export type ValidationError = {
  path: string[];
  message: string;
};

// Helper function to format validation errors
export const formatValidationErrors = (error: z.ZodError): ValidationError[] => {
  return error.issues.map(err => ({
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
