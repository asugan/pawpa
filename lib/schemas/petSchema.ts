import { z } from 'zod';
import { toUTCWithOffset, isValidUTCISOString } from '@/lib/utils/dateConversion';

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
      message: 'Doğum tarihi geçersiz format. UTC formatında olmalı'
    })
    .refine(validateBirthDate, {
      message: "Doğum tarihi gelecekte veya 30 yıldan eski olamaz"
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
      message: "Photo must be a valid image file or URL"
    })
});

// Full Pet schema including server-side fields
export const PetSchema = BasePetSchema.extend({
  id: z.string().uuid(),
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
      message: 'Geçerli bir tarih giriniz'
    })
    .refine((val) => {
      const date = val instanceof Date ? val : new Date(val);
      const now = new Date();
      const minDate = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());
      return date <= now && date >= minDate;
    }, {
      message: "Doğum tarihi gelecekte veya 30 yıldan eski olamaz"
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
    message: "Pet name (min 2 chars) and type are required",
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
      message: 'Geçerli bir tarih giriniz'
    })
    .refine((val) => {
      if (!val) return true; // Optional field
      const date = val instanceof Date ? val : new Date(val);
      const now = new Date();
      const minDate = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());
      return date <= now && date >= minDate;
    }, {
      message: "Doğum tarihi gelecekte veya 30 yıldan eski olamaz"
    })
    .optional(),
});

// Schema for updating an existing pet (with transformation)
export const PetUpdateSchema = BasePetSchema.partial();

// Type exports for TypeScript
export type Pet = z.infer<typeof PetSchema>;
export type PetCreateInput = z.infer<typeof PetCreateSchema>;
export type PetUpdateInput = z.infer<typeof PetUpdateSchema>;
export type PetCreateFormInput = z.infer<typeof PetCreateFormSchema>;
export type PetUpdateFormInput = z.infer<typeof PetUpdateFormSchema>;

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