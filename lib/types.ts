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

// Food type union (from FOOD_TYPES constant)
export type FoodType = 'dry_food' | 'wet_food' | 'raw_food' | 'homemade' | 'treats' | 'supplements' | 'other';

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

// ============================================================================
// Common Type Definitions (to replace 'any' usage)
// ============================================================================

// Icon Types - Material Community Icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// API Error Details
export interface ErrorDetails {
  [key: string]: unknown;
  field?: string;
  value?: unknown;
  constraint?: string;
}

// Query Filter Types
export interface QueryFilters {
  [key: string]: unknown;
}

export interface DateRangeFilter {
  start?: Date | string;
  end?: Date | string;
}

export interface PetFilter extends QueryFilters {
  type?: string;
  gender?: string;
  isActive?: boolean;
}

export interface ExpenseFilter extends QueryFilters {
  petId?: string;
  category?: ExpenseCategory;
  paymentMethod?: PaymentMethod;
  dateRange?: DateRangeFilter;
  minAmount?: number;
  maxAmount?: number;
}

export interface HealthRecordFilter extends QueryFilters {
  petId?: string;
  type?: string;
  dateRange?: DateRangeFilter;
}

export interface EventFilter extends QueryFilters {
  petId?: string;
  type?: string;
  dateRange?: DateRangeFilter;
  isCompleted?: boolean;
}

// FileSystem Types (for photo utilities)
export interface FileInfo {
  exists: boolean;
  uri: string;
  size?: number;
  isDirectory?: boolean;
  modificationTime?: number;
  md5?: string;
}

// Expense Stats Types
export interface MonthlyExpense {
  month: string;
  total: number;
  count: number;
  byCategory: Array<{
    category: ExpenseCategory;
    total: number;
  }>;
}

export interface YearlyExpense {
  year: number;
  total: number;
  count: number;
  byMonth: Array<{
    month: number;
    total: number;
  }>;
}

// Translation Function Type (i18next)
import { TFunction } from 'i18next';
export type TranslationFunction = TFunction;

// Network State Types - using NetInfo's own type
import { NetInfoState } from '@react-native-community/netinfo';
export type NetworkState = NetInfoState;

// Form Handler Types
export interface FormGetValues<T> {
  (name?: keyof T): T[keyof T] | T;
  (): T;
}

export interface FormWatch<T> {
  (name?: keyof T): T[keyof T] | T;
  (): T;
}

// Generic Form Handler Returns
export interface FormHandlerReturn<T> {
  getValues: FormGetValues<T>;
  watch: FormWatch<T>;
  setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  trigger: (name?: keyof T) => Promise<boolean>;
  reset: (values?: T) => void;
  handleSubmit: (onSubmit: (data: T) => void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
}

// Budget Status Types
export interface BudgetStatus {
  budgetLimit: BudgetLimit;
  currentSpending: number;
  percentage: number;
  remainingAmount: number;
}

// Subscription Types
export interface SubscriptionOffering {
  identifier: string;
  packageType: string;
  product: SubscriptionProduct;
}

export interface SubscriptionProduct {
  identifier: string;
  price: string;
  title: string;
  description: string;
  currencyCode: string;
  pricePerMonth?: string;
}

// API Service Function Type
import { ApiResponse } from './api/client';
export type ApiServiceFn<T, Args extends readonly unknown[] = readonly unknown[]> = (...args: Args) => Promise<ApiResponse<T>>;

// Request Cache Type
export interface RequestCache<T = unknown> {
  timestamp: number;
  promise: Promise<T>;
}

// Theme Type
export interface AppTheme {
  dark: boolean;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    background: string;
    surface: string;
    error: string;
    text: string;
    onSurface: string;
    disabled: string;
    placeholder: string;
    backdrop: string;
    notification: string;
    // Add other theme colors as needed
    [key: string]: string;
  };
  fonts: {
    [key: string]: unknown;
  };
  roundness: number;
  animation: {
    scale: number;
  };
}

