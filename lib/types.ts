import { Pet, HealthRecord, Event, FeedingSchedule } from '@prisma/client';

// Export Prisma types for easy access
export type { Pet, HealthRecord, Event, FeedingSchedule };

// Extended types with additional fields if needed
export type PetWithRelations = Pet & {
  healthRecords?: HealthRecord[];
  events?: Event[];
  feedingSchedules?: FeedingSchedule[];
};

// Input types for forms (without id and timestamps)
export type CreatePetInput = Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePetInput = Partial<CreatePetInput>;

export type CreateHealthRecordInput = Omit<HealthRecord, 'id' | 'createdAt' | 'pet'>;
export type UpdateHealthRecordInput = Partial<CreateHealthRecordInput>;

export type CreateEventInput = Omit<Event, 'id' | 'createdAt' | 'pet'>;
export type UpdateEventInput = Partial<CreateEventInput>;

export type CreateFeedingScheduleInput = Omit<FeedingSchedule, 'id' | 'createdAt' | 'pet'>;
export type UpdateFeedingScheduleInput = Partial<CreateFeedingScheduleInput>;

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
};