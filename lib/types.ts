// Base types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pet types
export interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string | null;
  birthDate?: string | null;
  weight?: number | null;
  gender?: string | null;
  profilePhoto?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Health Record types
export interface HealthRecord {
  id: string;
  petId: string;
  type: string;
  title: string;
  description?: string;
  date: string;
  veterinarian?: string;
  cost?: number;
  notes?: string;
  nextDueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Event types
export interface Event {
  id: string;
  petId: string;
  type: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string | null;
  location?: string;
  reminder: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Feeding Schedule types
export interface FeedingSchedule {
  id: string;
  petId: string;
  name: string;
  times: string[];
  days: string[];
  foodType?: string;
  portionSize?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Extended types with additional fields if needed
export type PetWithRelations = Pet & {
  healthRecords?: HealthRecord[];
  events?: Event[];
  feedingSchedules?: FeedingSchedule[];
};

// Input types for forms (without id and timestamps)
export type CreatePetInput = Omit<Pet, "id" | "createdAt" | "updatedAt">;
export type UpdatePetInput = Partial<CreatePetInput>;

export type CreateHealthRecordInput = Omit<
  HealthRecord,
  "id" | "createdAt" | "pet"
>;
export type UpdateHealthRecordInput = Partial<CreateHealthRecordInput>;

export type CreateEventInput = Omit<Event, "id" | "createdAt" | "pet">;
export type UpdateEventInput = Partial<CreateEventInput>;

export type CreateFeedingScheduleInput = Omit<
  FeedingSchedule,
  "id" | "createdAt" | "pet"
>;
export type UpdateFeedingScheduleInput = Partial<CreateFeedingScheduleInput>;

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
};
