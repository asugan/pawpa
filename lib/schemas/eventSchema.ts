import { z } from 'zod';
import { EVENT_TYPES } from '../../constants';

// Event validation schema with Turkish character support and comprehensive validation
export const eventSchema = z.object({
  title: z
    .string()
    .min(1, 'Etkinlik başlığı zorunludur')
    .max(100, 'Etkinlik başlığı en fazla 100 karakter olabilir')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-_.,!?()]+$/, 'Başlık geçersiz karakterler içeriyor'),

  description: z
    .string()
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .optional()
    .transform(val => val?.trim() || undefined),

  petId: z
    .string()
    .min(1, 'Evcil hayvan seçimi zorunludur'),

  type: z
    .enum(Object.values(EVENT_TYPES) as [string, ...string[]], {
      errorMap: () => ({ message: 'Geçerli bir etkinlik türü seçiniz' })
    }),

  startTime: z
    .string()
    .min(1, 'Başlangıç zamanı zorunludur')
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const now = new Date();
        // Allow events that are at least 1 minute in the future
        const oneMinuteFromNow = new Date(now.getTime() + 60000);
        return selectedDate >= oneMinuteFromNow;
      },
      'Başlangıç zamanı gelecekte bir tarih olmalıdır'
    ),

  endTime: z
    .string()
    .optional()
    .nullable()
    .transform(val => val?.trim() || undefined),

  location: z
    .string()
    .max(200, 'Konum en fazla 200 karakter olabilir')
    .optional()
    .transform(val => val?.trim() || undefined),

  reminder: z
    .boolean()
    .default(false),

  notes: z
    .string()
    .max(1000, 'Notlar en fazla 1000 karakter olabilir')
    .optional()
    .transform(val => val?.trim() || undefined),
}).superRefine((data, ctx) => {
  // Validate end time is after start time
  if (data.endTime && data.startTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

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

  // Additional validation: reminder time should be reasonable if reminder is enabled
  if (data.reminder && data.startTime) {
    const eventTime = new Date(data.startTime);
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

// Type inference from the schema
export type EventFormData = z.infer<typeof eventSchema>;

// Schema for event updates (all fields optional)
export const updateEventSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  petId: z.string().min(1).optional(),
  type: z.enum(Object.values(EVENT_TYPES) as [string, ...string[]]).optional(),
  startTime: z.string().min(1).optional(),
  endTime: z.string().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  reminder: z.boolean().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type UpdateEventFormData = z.infer<typeof updateEventSchema>;

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