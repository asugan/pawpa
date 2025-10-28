import { z } from 'zod';
import { HEALTH_RECORD_TYPES } from '../../constants/index';
// import { createZodI18nErrorMap } from './createZodI18n';

// Custom validation regex for Turkish characters
const TURKISH_TEXT_REGEX = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/;
const TURKISH_CLINIC_REGEX = /^[a-zA-Z0-zA-Z0-9çÇğĞıİöÖşŞüÜ\s.,'-]+$/;

// Custom validation functions
const validateHealthDate = (date: Date) => {
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate()); // 30 years ago
  return date <= now && date >= minDate;
};

const validateNextDueDate = (nextDueDate: Date, healthDate: Date) => {
  return nextDueDate > healthDate;
};

const validateVeterinarianName = (name: string | undefined) => {
  if (!name || name.trim() === '') return true; // Optional field
  return TURKISH_TEXT_REGEX.test(name.trim());
};

const validateClinicName = (name: string | undefined) => {
  if (!name || name.trim() === '') return true; // Optional field
  return TURKISH_CLINIC_REGEX.test(name.trim());
};

const validateCost = (cost: number) => {
  return cost >= 0 && cost <= 50000; // Reasonable cost limits
};

// Health record type enum for Zod
const HealthRecordTypeEnum = z.enum([
  'vaccination',
  'checkup',
  'medication',
  'surgery',
  'dental',
  'grooming',
  'other'
]);

// Base health record schema for common validations
const BaseHealthRecordSchema = z.object({
  petId: z
    .string()
    .min(1, 'Pet seçilmesi zorunludur')
    .uuid('Geçersiz pet ID'),

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
    .date()
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

  nextDueDate: z
    .date()
    .optional()
    .nullable()
    .transform(val => val || undefined),
});

// Schema for creating a new health record
export const HealthRecordCreateSchema = BaseHealthRecordSchema.refine(
  (data) => {
    // If nextDueDate is provided, it must be after the health record date
    if (data.nextDueDate && data.date) {
      return validateNextDueDate(data.nextDueDate, data.date);
    }
    return true;
  },
  {
    message: 'Sonraki tarih sağlık kaydından önce olamaz',
    path: ["nextDueDate"]
  }
).refine(
  (data) => {
    // For vaccination records, nextDueDate is highly recommended
    if (data.type === 'vaccination' && !data.nextDueDate) {
      // This is a soft validation - we don't make it required but we could add a warning
      return true;
    }
    return true;
  },
  {
    message: 'Aşılar için sonraki tarih önerilir',
    path: ["nextDueDate"]
  }
);

// Schema for updating an existing health record (all fields optional)
export const HealthRecordUpdateSchema = BaseHealthRecordSchema.partial().extend({
  id: z
    .string()
    .min(1, 'ID zorunludur')
    .uuid('Geçersiz ID formatı'),
}).refine(
  (data) => {
    // If both dates are provided, nextDueDate must be after date
    if (data.nextDueDate && data.date) {
      return validateNextDueDate(data.nextDueDate, data.date);
    }
    return true;
  },
  {
    message: 'Sonraki tarih sağlık kaydından önce olamaz',
    path: ["nextDueDate"]
  }
);

// Schema for vaccination-specific validation
export const VaccinationSchema = BaseHealthRecordSchema.extend({
  type: z.literal('vaccination'),
  nextDueDate: z
    .date({
      required_error: 'Sonraki aşı tarihi zorunludur'
    })
    .refine((date) => date > new Date(), {
      message: 'Sonraki aşı tarihi gelecekte olmalı'
    }),
  vaccineName: z
    .string()
    .min(2, 'Aşı adı en az 2 karakter olmalı')
    .max(100, 'Aşı adı en fazla 100 karakter olabilir')
    .transform(val => val.trim()),
  vaccineManufacturer: z
    .string()
    .max(100, 'Üretici adı en fazla 100 karakter olabilir')
    .optional()
    .transform(val => val?.trim() || undefined),
  batchNumber: z
    .string()
    .max(50, 'Parti numarası en fazla 50 karakter olabilir')
    .optional()
    .transform(val => val?.trim() || undefined),
}).refine(
  (data) => {
    return validateNextDueDate(data.nextDueDate, data.date);
  },
  {
    message: 'Sonraki aşı tarihi sağlık kaydından sonra olmalı',
    path: ["nextDueDate"]
  }
);

// Schema for medication-specific validation
export const MedicationSchema = BaseHealthRecordSchema.extend({
  type: z.literal('medication'),
  medicationName: z
    .string()
    .min(2, 'İlaç adı en az 2 karakter olmalı')
    .max(100, 'İlaç adı en fazla 100 karakter olabilir')
    .transform(val => val.trim()),
  dosage: z
    .string()
    .min(1, 'Doz bilgisi zorunludur')
    .max(50, 'Doz bilgisi en fazla 50 karakter olabilir')
    .transform(val => val.trim()),
  frequency: z
    .string()
    .min(1, 'Kullanım sıklığı zorunludur')
    .max(100, 'Kullanım sıklığı en fazla 100 karakter olabilir')
    .transform(val => val.trim()),
  startDate: z
    .date()
    .optional(),
  endDate: z
    .date()
    .optional(),
}).superRefine((data, ctx) => {
  // Validate that end date is after start date
  if (data.startDate && data.endDate && data.endDate <= data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Bitiş tarihi başlangıç tarihinden sonra olmalı',
      path: ['endDate']
    });
  }
});

// Type exports for TypeScript
export type HealthRecordCreateInput = z.infer<typeof HealthRecordCreateSchema>;
export type HealthRecordUpdateInput = z.infer<typeof HealthRecordUpdateSchema>;
export type VaccinationInput = z.infer<typeof VaccinationSchema>;
export type MedicationInput = z.infer<typeof MedicationSchema>;

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
type HealthRecordType = 'vaccination' | 'checkup' | 'medication' | 'surgery' | 'dental' | 'grooming' | 'other';

// Health record type-specific validation schemas
export const HealthRecordTypeSchemas = {
  vaccination: VaccinationSchema,
  medication: MedicationSchema,
  checkup: HealthRecordCreateSchema,
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
export const validateHealthRecord = (data: any, type: string) => {
  const schema = getHealthRecordSchema(type as HealthRecordType);
  return schema.safeParse(data);
};

// Export the Zod error map for internationalization (disabled for now)
// export const zodErrorMap = createZodI18nErrorMap();