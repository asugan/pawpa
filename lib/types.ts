// Base types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Import types from schemas
import { BudgetCreateInput, BudgetLimit, BudgetPeriod, BudgetUpdateInput } from './schemas/budgetSchema';
import { CreateEventInput, Event, UpdateEventInput } from './schemas/eventSchema';
import { Currency, Expense, ExpenseCategory, ExpenseCreateInput, ExpenseUpdateInput, PaymentMethod } from './schemas/expenseSchema';
import { CreateFeedingScheduleInput, FeedingSchedule, UpdateFeedingScheduleInput } from './schemas/feedingScheduleSchema';
import { HealthRecord, HealthRecordCreateInput, HealthRecordUpdateInput } from './schemas/healthRecordSchema';
import { Pet, PetCreateInput, PetUpdateInput } from './schemas/petSchema';

// Re-export types
// Re-export types with aliases for backward compatibility
export type {
    BudgetLimit, BudgetPeriod, BudgetCreateInput as CreateBudgetLimitInput, CreateEventInput, ExpenseCreateInput as CreateExpenseInput, CreateFeedingScheduleInput, HealthRecordCreateInput as CreateHealthRecordInput, PetCreateInput as CreatePetInput, Currency, Event, Expense, ExpenseCategory, FeedingSchedule, HealthRecord, PaymentMethod, Pet, BudgetUpdateInput as UpdateBudgetLimitInput, UpdateEventInput, ExpenseUpdateInput as UpdateExpenseInput, UpdateFeedingScheduleInput, HealthRecordUpdateInput as UpdateHealthRecordInput, PetUpdateInput as UpdatePetInput
};

// Also export the new names if needed, or just rely on the aliases
    export type {
        BudgetCreateInput,
        BudgetUpdateInput, ExpenseCreateInput,
        ExpenseUpdateInput, HealthRecordCreateInput,
        HealthRecordUpdateInput, PetCreateInput,
        PetUpdateInput
    };

// Pet type and gender unions (kept for compatibility if used elsewhere, or import from constants/schemas)
export type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other';
export type PetGender = 'male' | 'female' | 'other';

// Extended types with additional fields if needed
export type PetWithRelations = Pet & {
  healthRecords?: HealthRecord[];
  events?: Event[];
  feedingSchedules?: FeedingSchedule[];
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
};

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

// Extended Pet type with expenses and budgets
export type PetWithFinances = Pet & {
  expenses?: Expense[];
  budgetLimits?: BudgetLimit[];
};

