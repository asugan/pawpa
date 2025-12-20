import { z } from 'zod';
import { toUTCWithOffset, isValidUTCISOString } from '@/lib/utils/dateConversion';
import { objectIdSchema } from './createZodI18n';
// import { createZodI18nErrorMap } from './createZodI18n';

// Custom validation regex for Turkish characters
const TURKISH_TEXT_REGEX = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/;
const TURKISH_CLINIC_REGEX = /^[a-zA-Z0-zA-Z0-9çÇğĞıİöÖşŞüÜ\s.,'-]+$/;

// Custom validation functions
const validateHealthDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate()); // 30 years ago
  return date <= now && date >= minDate;
};


const validateVeterinarianName = (name: string | undefined) => {
  if (!name || name.trim() === '') return true; // Optional field
  return TURKISH_TEXT_REGEX.test(name.trim());
};

const validateClinicName = (name: string | undefined) => {
  if (!name || name.trim() === '') return true; // Optional field
  return TURKISH_CLINIC_REGEX.test(name.trim());
};

// Health record type enum for Zod
const HealthRecordTypeEnum = z.enum([
  'checkup',
  'visit',
  'surgery',
  'dental',
  'grooming',
  'other'
]);

// Base health record schema for common validations
const BaseHealthRecordSchema = z.object({
  petId: objectIdSchema.refine(() => true, { message: 'Pet seçilmesi zorunludur' }),

  type: HealthRecordTypeEnum,

  title: z
    .string()
    .min(2, 'Başlık en az 2 karakter olmalı')
    .max(100, 'Başlık en fazla 100 karakter olabilir')
    .transform(val => val.trim()),

  description: z
    .string()
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional()
    .transform(val => val?.trim() || undefined),

  date: z
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
      message: 'Sağlık kayıt tarihi geçersiz format. UTC formatında olmalı'
    })
    .refine(validateHealthDate, {
      message: 'Tarih gelecekte olamaz'
    }),

  veterinarian: z
    .string()
    .max(100, 'Veteriner adı en fazla 100 karakter olabilir')
    .optional()
    .refine(validateVeterinarianName, {
      message: 'Veteriner adı geçersiz karakterler içeriyor'
    })
    .transform(val => val?.trim() || undefined),

  clinic: z
    .string()
    .max(100, 'Klinik adı en fazla 100 karakter olabilir')
    .optional()
    .refine(validateClinicName, {
      message: 'Klinik adı geçersiz karakterler içeriyor'
    })
    .transform(val => val?.trim() || undefined),

  cost: z
    .number()
    .nonnegative('Maliyet negatif olamaz')
    .max(50000, 'Maliyet en fazla 50000 olabilir')
    .optional()
    .transform(val => val === undefined ? undefined : parseFloat(val.toFixed(2))),

  notes: z
    .string()
    .max(2000, 'Notlar en fazla 2000 karakter olabilir')
    .optional()
    .transform(val => val?.trim() || undefined),
});

// Base schema for form input (before transformation)
const BaseHealthRecordFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Başlık zorunludur')
    .max(100, 'Başlık en fazla 100 karakter olabilir')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-_.,!?()]+$/, 'Başlık geçersiz karakterler içeriyor'),

  type: z.enum(['visit', 'other', 'grooming', 'checkup', 'surgery', 'dental'] as const),

  date: z
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
      return date <= now;
    }, {
      message: 'Tarih gelecekte olamaz'
    }),

  description: z
    .string()
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional()
    .transform(val => val?.trim() || undefined),

  petId: objectIdSchema.refine(() => true, { message: 'Evcil hayvan seçimi zorunludur' }),

  veterinarian: z
    .string()
    .max(100)
    .optional()
    .transform(val => val?.trim() || undefined),

  clinic: z
    .string()
    .max(100)
    .optional()
    .transform(val => val?.trim() || undefined),

  cost: z
    .number()
    .positive()
    .max(100000)
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(2000, 'Notlar en fazla 2000 karakter olabilir')
    .optional()
    .transform(val => val?.trim() || undefined),
});

// Schema for form input (before transformation)
export const HealthRecordCreateFormSchema = BaseHealthRecordFormSchema;

// Schema for updating an existing health record form (before transformation)
export const HealthRecordUpdateFormSchema = BaseHealthRecordFormSchema.partial();

// Full HealthRecord schema including server-side fields
export const HealthRecordSchema = BaseHealthRecordSchema.extend({
  _id: objectIdSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for creating a new health record
export const HealthRecordCreateSchema = BaseHealthRecordSchema;

// Schema for updating an existing health record (all fields optional)
// Note: ID is handled separately in the mutation function, not in the schema
export const HealthRecordUpdateSchema = BaseHealthRecordSchema.partial();

// Type exports for TypeScript
export type HealthRecord = z.infer<typeof HealthRecordSchema>;
export type HealthRecordCreateInput = z.infer<typeof HealthRecordCreateSchema>;
export type HealthRecordUpdateInput = z.infer<typeof HealthRecordUpdateSchema>;
export type HealthRecordCreateFormInput = z.infer<typeof HealthRecordCreateFormSchema>;
export type HealthRecordUpdateFormInput = z.infer<typeof HealthRecordUpdateFormSchema>;

// Validation error type for better error handling
export type ValidationError = {
  path: string[];
  message: string;
  code?: string;
};

// Helper function to format validation errors
export const formatValidationErrors = (error: z.ZodError): ValidationError[] => {
  return error.errors.map(err => ({
    path: err.path.map(String),
    message: err.message,
    code: err.code,
  }));
};

// Helper function to get field-specific error message
export const getFieldError = (error: z.ZodError, fieldName: string): string | undefined => {
  const fieldError = error.errors.find(err => err.path[0] === fieldName);
  return fieldError?.message;
};

// Custom validation rules specific to Turkish veterinary practices
export const TurkishHealthValidations = {
  // Validate Turkish Veteriner Chamber Association number
  validateVeterinerChamberNumber: (number: string): boolean => {
    if (!number) return true; // Optional field
    const chamberRegex = /^\d{6}$/;
    return chamberRegex.test(number.replace(/\s/g, ''));
  },

  // Validate Turkish veterinary clinic license
  validateClinicLicense: (license: string): boolean => {
    if (!license) return true; // Optional field
    const licenseRegex = /^[A-Z]{2}\d{4}$/;
    return licenseRegex.test(license.replace(/\s/g, ''));
  },

  // Validate Turkish drug registry number
  validateDrugRegistryNumber: (number: string): boolean => {
    if (!number) return true; // Optional field
    const drugRegex = /^\d{8}\/\d{4}$/;
    return drugRegex.test(number.replace(/\s/g, ''));
  },

  // Validate vaccine batch number (Turkish format)
  validateVaccineBatchNumber: (batchNumber: string): boolean => {
    if (!batchNumber) return true; // Optional field
    const batchRegex = /^[A-Z0-9]{6,12}$/;
    return batchRegex.test(batchNumber.replace(/\s/g, ''));
  },

  // Validate Turkish identification number for pet ownership
  validateTurkishID: (tckn: string): boolean => {
    if (!tckn) return true; // Optional field
    if (tckn.length !== 11) return false;
    if (!/^\d+$/.test(tckn)) return false;

    // TC kimlik numarası algoritması
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(tckn[i]) * (7 - (i % 2));
    }

    const tenthDigit = (sum % 10) + '';
    if (tenthDigit !== tckn[9]) return false;

    let total = 0;
    for (let i = 0; i < 10; i++) {
      total += parseInt(tckn[i]);
    }

    return (total % 10) === parseInt(tckn[10]);
  },

  // Validate Turkish phone number for veterinary clinics
  validateTurkishClinicPhone: (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^(\+90|0)?[2-3]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },
};

// Type union for health record types
type HealthRecordType = 'checkup' | 'visit' | 'surgery' | 'dental' | 'grooming' | 'other';

// Health record type-specific validation schemas
export const HealthRecordTypeSchemas = {
  checkup: HealthRecordCreateSchema,
  visit: HealthRecordCreateSchema,
  surgery: HealthRecordCreateSchema,
  dental: HealthRecordCreateSchema,
  grooming: HealthRecordCreateSchema,
  other: HealthRecordCreateSchema,
} as const;

// Dynamic schema selector based on record type
export const getHealthRecordSchema = (type: HealthRecordType) => {
  return HealthRecordTypeSchemas[type];
};

// Helper function to validate health record data with type-specific rules
export const validateHealthRecord = (data: unknown, type: string) => {
  const schema = getHealthRecordSchema(type as HealthRecordType);
  return schema.safeParse(data);
};

// Export the Zod error map for internationalization (disabled for now)
// export const zodErrorMap = createZodI18nErrorMap();
