import { z } from 'zod';
import { EVENT_TYPES } from '../../constants';
import { combineDateTimeToISO, toUTCWithOffset, isValidUTCISOString } from '../utils/dateConversion';
import { objectIdSchema } from './createZodI18n';

// Form input schema (matches the form structure with separate date/time fields)
export const eventFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Etkinlik başlığı zorunludur')
    .max(100, 'Etkinlik başlığı en fazla 100 karakter olabilir')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-_.,!?()]+$/, 'Başlık geçersiz karakterler içeriyor'),

  description: z
    .string()
    .optional()
    .transform(val => val?.trim() || undefined),

  petId: objectIdSchema.refine(() => true, { message: 'Evcil hayvan seçimi zorunludur' }),

  type: z
    .enum(Object.values(EVENT_TYPES) as [string, ...string[]], {
      errorMap: () => ({ message: 'Geçerli bir etkinlik türü seçiniz' })
    }),

  startDate: z
    .string()
    .min(1, 'Başlangıç tarihi zorunludur'),

  startTime: z
    .string()
    .min(1, 'Başlangıç saati zorunludur'),

  endDate: z
    .string()
    .optional()
    .transform(val => val?.trim() || undefined),

  endTime: z
    .string()
    .optional()
    .transform(val => val?.trim() || undefined),

  location: z
    .string()
    .optional()
    .transform(val => val?.trim() || undefined),

  reminder: z
    .boolean(),

  notes: z
    .string()
    .optional()
    .transform(val => val?.trim() || undefined),
}).superRefine((data, ctx) => {
  // Validate end time is provided completely if either endDate or endTime is provided
  if ((data.endDate && !data.endTime) || (!data.endDate && data.endTime)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Hem bitiş tarihi hem de saati gereklidir',
      path: ['endTime']
    });
  }

  // Validate end time is after start time
  if (data.endDate && data.endTime && data.startDate && data.startTime) {
    const startDateTime = combineDateTimeToISO(data.startDate, data.startTime);
    const endDateTime = combineDateTimeToISO(data.endDate, data.endTime);

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    // End time must be at least 15 minutes after start time
    const minimumEndTime = new Date(start.getTime() + 15 * 60000);
    if (end < minimumEndTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bitiş zamanı başlangıçtan en az 15 dakika sonra olmalıdır',
        path: ['endTime']
      });
    }
  }

  // Validate start time is in the future
  if (data.startDate && data.startTime) {
    const startDateTime = combineDateTimeToISO(data.startDate, data.startTime);
    const selectedDate = new Date(startDateTime);
    const now = new Date();

    // Allow events that are at least 1 minute in the future
    const oneMinuteFromNow = new Date(now.getTime() + 60000);
    if (selectedDate < oneMinuteFromNow) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Başlangıç zamanı gelecekte bir tarih olmalıdır',
        path: ['startTime']
      });
    }
  }

  // Additional validation: reminder time should be reasonable if reminder is enabled
  if (data.reminder && data.startDate && data.startTime) {
    const startDateTime = combineDateTimeToISO(data.startDate, data.startTime);
    const eventTime = new Date(startDateTime);
    const now = new Date();

    // Don't allow reminders for events more than 1 year in the future
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    if (eventTime > oneYearFromNow) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Hatırlatıcı 1 yıldan uzun süreli etkinlikler için ayarlanamaz',
        path: ['reminder']
      });
    }
  }
});

// Type inference from the form schema
export type EventFormData = z.infer<typeof eventFormSchema>;

// API schema (matches backend expectations with ISO datetime strings)
export const eventSchema = z.object({
  title: z
    .string()
    .min(1, 'Etkinlik başlığı zorunludur')
    .max(100, 'Etkinlik başlığı en fazla 100 karakter olabilir'),

  description: z
    .string()
    .optional(),

  petId: objectIdSchema.refine(() => true, { message: 'Evcil hayvan seçimi zorunludur' }),

  type: z
    .string()
    .min(1, 'Etkinlik türü zorunludur'),

  startTime: z
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
      message: 'Başlangıç zamanı geçersiz format. UTC formatında olmalı'
    }),

  endTime: z
    .union([z.string(), z.date()])
    .optional()
    .transform((val): string | undefined => {
      if (!val) return val;
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
    .refine((val) => !val || isValidUTCISOString(val), {
      message: 'Bitiş zamanı geçersiz format. UTC formatında olmalı'
    }),

  location: z
    .string()
    .optional(),

  reminder: z
    .boolean()
    .optional(),

  notes: z
    .string()
    .optional(),
});

// Full Event schema including server-side fields
export const EventSchema = eventSchema.extend({
  _id: objectIdSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Type inference from the API schema
export type EventData = z.infer<typeof eventSchema>;
export type Event = z.infer<typeof EventSchema>;

// Schema for event updates (all fields optional)
export const updateEventSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  petId: objectIdSchema.optional(),
  type: z.enum(Object.values(EVENT_TYPES) as [string, ...string[]]).optional(),
  startTime: z.string().min(1).optional(),
  endTime: z.string().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  reminder: z.boolean().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
export type CreateEventInput = EventData;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// Helper function to validate date strings
export const isValidDateTimeString = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/) !== null;
};

// Helper function to get current datetime string in ISO format
export const getCurrentDateTimeString = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
};

// Helper function to add minimum time to current date
export const getMinimumEventDateTime = (): string => {
  const now = new Date();
  // Add 1 minute to current time as minimum
  const minimumTime = new Date(now.getTime() + 60000);
  return minimumTime.toISOString().slice(0, 16);
};

// Default form values
export const defaultEventFormValues: Partial<EventFormData> = {
  description: '',
  reminder: false,
  notes: '',
  location: '',
};

// Event type specific validation rules
export const getEventTypeSpecificRules = (eventType: string) => {
  switch (eventType) {
    case 'feeding':
      return {
        title: {
          min: 1,
          max: 50,
          pattern: /^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-_.,!?()]+$/,
          message: 'Besleme zamanı başlığı en fazla 50 karakter olabilir'
        },
        duration: {
          maxMinutes: 60, // Feeding activities shouldn't exceed 1 hour
          message: 'Besleme aktivitesi 1 saatten uzun olmamalıdır'
        }
      };

    case 'vet_visit':
      return {
        title: {
          min: 1,
          max: 100,
          pattern: /^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-_.,!?()]+$/,
          message: 'Veteriner ziyareti başlığı gereklidir'
        },
        duration: {
          minMinutes: 30, // Vet visits usually take at least 30 minutes
          maxMinutes: 480, // 8 hours max
          message: 'Veteriner ziyareti 30 dakika ile 8 saat arasında olmalıdır'
        }
      };

    case 'exercise':
    case 'walk':
      return {
        duration: {
          minMinutes: 15,
          maxMinutes: 240, // 4 hours max
          message: 'Egzersiz/yürüyüş 15 dakika ile 4 saat arasında olmalıdır'
        }
      };

    default:
      return {
        duration: {
          minMinutes: 15,
          maxMinutes: 480, // 8 hours max default
          message: 'Etkinlik süresi 15 dakika ile 8 saat arasında olmalıdır'
        }
      };
  }
};

// Helper function to transform form data to API format
export const transformFormDataToAPI = (formData: EventFormData): EventData => {
  // Combine date and time into ISO datetime strings
  const startTime = combineDateTimeToISO(formData.startDate, formData.startTime);
  const endTime = formData.endDate && formData.endTime
    ? combineDateTimeToISO(formData.endDate, formData.endTime)
    : undefined;

  return {
    title: formData.title,
    description: formData.description || undefined,
    petId: formData.petId,
    type: formData.type,
    startTime,
    endTime,
    location: formData.location || undefined,
    reminder: formData.reminder || undefined,
    notes: formData.notes || undefined,
  };
};
