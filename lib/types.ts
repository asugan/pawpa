// Base types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pet type and gender unions
export type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other';
export type PetGender = 'male' | 'female' | 'other';

// Pet types
export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed?: string | null;
  birthDate?: string | null;
  weight?: number | null;
  gender?: PetGender | null;
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
  clinic?: string;
  cost?: number;
  notes?: string;
  nextDueDate?: string | null;
  // Vaccination specific fields
  vaccineName?: string;
  vaccineManufacturer?: string;
  batchNumber?: string;
  // Medication specific fields
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  startDate?: string | null;
  endDate?: string | null;
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
  time: string; // HH:MM format (e.g., "08:00")
  foodType: string;
  amount: string; // Portion amount (e.g., "200g", "1 cup")
  days: string; // Comma-separated days (e.g., "monday,tuesday,wednesday")
  isActive: boolean;
  createdAt: string;
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
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateHealthRecordInput = Partial<CreateHealthRecordInput>;

export type CreateEventInput = Omit<Event, "id" | "createdAt" | "updatedAt">;
export type UpdateEventInput = Partial<CreateEventInput>;

export type CreateFeedingScheduleInput = Omit<
  FeedingSchedule,
  "id" | "createdAt"
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

// Expense and Budget types
export type ExpenseCategory =
  | 'food'
  | 'premium_food'
  | 'veterinary'
  | 'vaccination'
  | 'medication'
  | 'grooming'
  | 'toys'
  | 'accessories'
  | 'training'
  | 'insurance'
  | 'emergency'
  | 'other';

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer';

export type Currency = 'TRY' | 'USD' | 'EUR' | 'GBP';

export type BudgetPeriod = 'monthly' | 'yearly';

export interface Expense {
  id: string;
  petId: string;
  category: ExpenseCategory;
  amount: number;
  currency: Currency;
  paymentMethod?: PaymentMethod | null;
  description?: string | null;
  date: string;
  receiptPhoto?: string | null;
  vendor?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface BudgetLimit {
  id: string;
  petId: string;
  category?: ExpenseCategory | null; // null means overall budget
  amount: number;
  currency: Currency;
  period: BudgetPeriod;
  alertThreshold: number; // 0-1 (default 0.8 = 80%)
  isActive: boolean;
  createdAt: string;
}

export interface ExpenseStats {
  total: number;
  count: number;
  average: number;
  byCategory: Array<{
    category: ExpenseCategory;
    total: number;
    count: number;
  }>;
  byCurrency: Array<{
    currency: Currency;
    total: number;
  }>;
}

export interface BudgetAlert {
  budgetLimit: BudgetLimit;
  currentSpending: number;
  percentage: number;
  isExceeded: boolean;
  remainingAmount: number;
}

export interface BudgetStatus {
  budgetLimit: BudgetLimit;
  currentSpending: number;
  percentage: number;
  remainingAmount: number;
}

// Input types for forms
export type CreateExpenseInput = Omit<Expense, 'id' | 'createdAt'>;
export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export type CreateBudgetLimitInput = Omit<BudgetLimit, 'id' | 'createdAt'>;
export type UpdateBudgetLimitInput = Partial<CreateBudgetLimitInput>;

// Extended Pet type with expenses and budgets
export type PetWithFinances = Pet & {
  expenses?: Expense[];
  budgetLimits?: BudgetLimit[];
};
