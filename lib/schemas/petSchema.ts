import { z } from 'zod';
import { PET_TYPES, PET_GENDERS } from '../../constants/index';

// Pet type values for validation
const PET_TYPES_VALUES = Object.values(PET_TYPES);
const GENDER_VALUES = Object.values(PET_GENDERS);

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
    .min(2, "İsim en az 2 karakter olmalıdır")
    .max(50, "İsim en fazla 50 karakter olabilir")
    .refine(validateTurkishName, {
      message: "İsim sadece harf ve Türkçe karakterler içerebilir (ç, ğ, ı, ö, ş, ü)"
    })
    .transform(val => val.trim()),

  type: z.enum(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'] as const, {
    errorMap: () => ({ message: "Lütfen geçerli bir pet türü seçiniz" })
  }),

  breed: z
    .string()
    .max(100, "Cins bilgisi en fazla 100 karakter olabilir")
    .optional()
    .transform(val => val?.trim() || undefined),

  birthDate: z
    .date({
      errorMap: () => ({ message: "Lütfen geçerli bir doğum tarihi seçiniz" })
    })
    .refine(validateBirthDate, {
      message: "Doğum tarihi gelecek bir tarih veya 30 yıldan eski olamaz"
    })
    .optional(),

  weight: z
    .number({
      errorMap: () => ({ message: "Lütfen geçerli bir kilo değeri giriniz" })
    })
    .positive("Kilo pozitif bir sayı olmalıdır")
    .min(0.1, "Kilo en az 0.1 kg olmalıdır")
    .max(200, "Kilo 200 kg'den az olmalıdır")
    .optional(),

  gender: z.enum(['male', 'female', 'other'] as const, {
    errorMap: () => ({ message: "Lütfen geçerli bir cinsiyet seçiniz" })
  }).optional(),

  profilePhoto: z
    .string()
    .url("Geçerli bir fotoğraf URL'i giriniz")
    .optional()
    .or(z.literal('').transform(() => undefined))
});

// Schema for creating a new pet
export const PetCreateSchema = BasePetSchema.refine(
  (data) => data.name && data.type,
  {
    message: "Pet adı ve türü zorunludur",
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