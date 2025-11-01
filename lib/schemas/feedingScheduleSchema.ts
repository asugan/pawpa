import { z } from 'zod';
import { FOOD_TYPES, DAYS_OF_WEEK } from '../../constants';

// Valid day names for validation
const VALID_DAYS = Object.values(DAYS_OF_WEEK);

// Helper function to validate time format (HH:MM)
const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Helper function to validate days string (comma-separated day names)
const isValidDaysString = (days: string): boolean => {
  if (!days || days.trim() === '') return false;

  const dayArray = days.split(',').map(d => d.trim().toLowerCase());

  // Check if all days are valid
  return dayArray.every(day => VALID_DAYS.includes(day as any)) && dayArray.length > 0;
};

// Form input schema (for create/edit forms with multi-select days)
export const feedingScheduleFormSchema = z.object({
  petId: z
    .string()
    .min(1, 'Evcil hayvan seçimi zorunludur'),

  time: z
    .string()
    .min(1, 'Besleme saati zorunludur')
    .refine(isValidTimeFormat, {
      message: 'Geçersiz saat formatı. HH:MM formatında olmalıdır (örn: 08:00)',
    }),

  foodType: z
    .enum(Object.values(FOOD_TYPES) as [string, ...string[]], {
      errorMap: () => ({ message: 'Geçerli bir mama türü seçiniz' })
    }),

  amount: z
    .string()
    .min(1, 'Porsiyon miktarı zorunludur')
    .max(50, 'Porsiyon miktarı en fazla 50 karakter olabilir')
    .refine(
      (val) => val.trim().length > 0,
      { message: 'Porsiyon miktarı boş olamaz' }
    ),

  // Days as array for form (easier to work with multi-select)
  daysArray: z
    .array(z.enum(Object.values(DAYS_OF_WEEK) as [string, ...string[]]))
    .min(1, 'En az bir gün seçmelisiniz')
    .max(7, 'En fazla 7 gün seçebilirsiniz'),

  isActive: z
    .boolean()
    .default(true),
}).refine((data) => {
  // Validate that time is reasonable (not empty after trim)
  return data.time.trim().length > 0;
}, {
  message: 'Besleme saati geçerli bir değer olmalıdır',
  path: ['time'],
});

// Type inference from the form schema
export type FeedingScheduleFormData = z.infer<typeof feedingScheduleFormSchema>;

// API schema (matches backend expectations with comma-separated days string)
export const feedingScheduleSchema = z.object({
  petId: z
    .string()
    .min(1, 'Evcil hayvan seçimi zorunludur'),

  time: z
    .string()
    .min(1, 'Besleme saati zorunludur')
    .refine(isValidTimeFormat, {
      message: 'Geçersiz saat formatı. HH:MM formatında olmalıdır',
    }),

  foodType: z
    .string()
    .min(1, 'Mama türü zorunludur'),

  amount: z
    .string()
    .min(1, 'Porsiyon miktarı zorunludur')
    .max(50, 'Porsiyon miktarı en fazla 50 karakter olabilir'),

  days: z
    .string()
    .min(1, 'Günler zorunludur')
    .refine(isValidDaysString, {
      message: 'Geçersiz gün formatı. Virgülle ayrılmış geçerli gün isimleri olmalıdır',
    }),

  isActive: z
    .boolean()
    .optional()
    .default(true),
});

// Type inference from the API schema
export type FeedingScheduleData = z.infer<typeof feedingScheduleSchema>;

// Schema for feeding schedule updates (all fields optional)
export const updateFeedingScheduleSchema = z.object({
  time: z
    .string()
    .refine(isValidTimeFormat, {
      message: 'Geçersiz saat formatı. HH:MM formatında olmalıdır',
    })
    .optional(),

  foodType: z
    .enum(Object.values(FOOD_TYPES) as [string, ...string[]])
    .optional(),

  amount: z
    .string()
    .min(1)
    .max(50)
    .optional(),

  days: z
    .string()
    .refine(isValidDaysString, {
      message: 'Geçersiz gün formatı',
    })
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export type UpdateFeedingScheduleFormData = z.infer<typeof updateFeedingScheduleSchema>;

// Helper function to transform form data to API format
export const transformFormDataToAPI = (formData: FeedingScheduleFormData): FeedingScheduleData => {
  // Convert days array to comma-separated string
  const daysString = formData.daysArray.join(',');

  return {
    petId: formData.petId,
    time: formData.time,
    foodType: formData.foodType,
    amount: formData.amount,
    days: daysString,
    isActive: formData.isActive ?? true,
  };
};

// Helper function to transform API data to form format
export const transformAPIDataToForm = (apiData: FeedingScheduleData): FeedingScheduleFormData => {
  // Convert comma-separated days string to array
  const daysArray = apiData.days.split(',').map(d => d.trim()) as Array<typeof DAYS_OF_WEEK[keyof typeof DAYS_OF_WEEK]>;

  return {
    petId: apiData.petId,
    time: apiData.time,
    foodType: apiData.foodType as typeof FOOD_TYPES[keyof typeof FOOD_TYPES],
    amount: apiData.amount,
    daysArray,
    isActive: apiData.isActive ?? true,
  };
};

// Helper function to validate time string
export const validateTimeString = (time: string): boolean => {
  return isValidTimeFormat(time);
};

// Helper function to parse time to hours and minutes
export const parseTime = (time: string): { hours: number; minutes: number } | null => {
  if (!isValidTimeFormat(time)) return null;

  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
};

// Helper function to format time for display
export const formatTimeForDisplay = (time: string): string => {
  const parsed = parseTime(time);
  if (!parsed) return time;

  const { hours, minutes } = parsed;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${period}`;
};

// Helper function to get next feeding time
export const getNextFeedingTime = (schedules: Array<{ time: string; days: string; isActive: boolean }>): Date | null => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Map JS day index to day name
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[currentDay];

  // Filter active schedules for today that haven't passed yet
  const upcomingToday = schedules
    .filter(s => s.isActive && s.days.toLowerCase().includes(todayName) && s.time > currentTime)
    .sort((a, b) => a.time.localeCompare(b.time));

  if (upcomingToday.length > 0) {
    // Return the earliest upcoming feeding today
    const nextSchedule = upcomingToday[0];
    const [hours, minutes] = nextSchedule.time.split(':').map(Number);
    const nextTime = new Date(now);
    nextTime.setHours(hours, minutes, 0, 0);
    return nextTime;
  }

  // If no more feedings today, find the next feeding on a future day
  for (let i = 1; i <= 7; i++) {
    const futureDay = (currentDay + i) % 7;
    const futureDayName = dayNames[futureDay];

    const futureDaySchedules = schedules
      .filter(s => s.isActive && s.days.toLowerCase().includes(futureDayName))
      .sort((a, b) => a.time.localeCompare(b.time));

    if (futureDaySchedules.length > 0) {
      const nextSchedule = futureDaySchedules[0];
      const [hours, minutes] = nextSchedule.time.split(':').map(Number);
      const nextTime = new Date(now);
      nextTime.setDate(now.getDate() + i);
      nextTime.setHours(hours, minutes, 0, 0);
      return nextTime;
    }
  }

  return null;
};

// Default form values
export const defaultFeedingScheduleFormValues: Partial<FeedingScheduleFormData> = {
  time: '08:00',
  amount: '',
  daysArray: [],
  isActive: true,
};
