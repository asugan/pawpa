import { z } from 'zod';
import { CURRENCIES, EXPENSE_CATEGORIES } from './expenseSchema';

// Budget period enum
export const BUDGET_PERIODS = ['monthly', 'yearly'] as const;

export type BudgetPeriod = typeof BUDGET_PERIODS[number];

// Custom validation functions
const validateAlertThreshold = (threshold: number) => {
  return threshold >= 0 && threshold <= 1;
};

// Base budget schema for common validations
const BaseBudgetSchema = z.object({
  petId: z.string().min(1, 'Pet ID is required'),

  category: z
    .enum(EXPENSE_CATEGORIES, {
      errorMap: () => ({ message: 'Invalid category' })
    })
    .nullable()
    .optional(), // null means overall budget for all categories

  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number'
    })
    .positive('Amount must be positive')
    .min(1, 'Amount must be at least 1')
    .max(10000000, 'Amount is too large'),

  currency: z.enum(CURRENCIES).default('TRY'),

  period: z.enum(BUDGET_PERIODS, {
    errorMap: () => ({ message: 'Period must be either "monthly" or "yearly"' })
  }),

  alertThreshold: z
    .number()
    .min(0, 'Alert threshold must be at least 0')
    .max(1, 'Alert threshold must be at most 1')
    .default(0.8)
    .refine(validateAlertThreshold, {
      message: 'Alert threshold must be between 0 and 1'
    }),

  isActive: z.boolean()
});

// Full BudgetLimit schema including server-side fields
export const BudgetLimitSchema = BaseBudgetSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

// Schema for creating a new budget limit
export const BudgetCreateSchema = z.object({
  petId: z.string().min(1, 'Pet ID is required'),

  category: z
    .enum(EXPENSE_CATEGORIES, {
      errorMap: () => ({ message: 'Invalid category' })
    })
    .nullable()
    .optional(), // null means overall budget for all categories

  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number'
    })
    .positive('Amount must be positive')
    .min(1, 'Amount must be at least 1')
    .max(10000000, 'Amount is too large'),

  currency: z.enum(CURRENCIES),

  period: z.enum(BUDGET_PERIODS, {
    errorMap: () => ({ message: 'Period must be either "monthly" or "yearly"' })
  }),

  alertThreshold: z
    .number()
    .min(0, 'Alert threshold must be at least 0')
    .max(1, 'Alert threshold must be at most 1')
    .refine(validateAlertThreshold, {
      message: 'Alert threshold must be between 0 and 1'
    }),

  isActive: z.boolean()
}).refine(
  (data) => {
    return data.petId && data.amount > 0 && data.period;
  },
  {
    message: 'Pet ID, amount, and period are required',
    path: ['petId']
  }
);

// Schema for updating an existing budget limit (all fields optional)
export const BudgetUpdateSchema = BaseBudgetSchema.partial().omit({ petId: true });

// Query params schema for filtering budgets
export const BudgetQuerySchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  period: z.enum(BUDGET_PERIODS).optional(),
  isActive: z.boolean().optional(),
  category: z.enum(EXPENSE_CATEGORIES).optional()
});

// Type exports for TypeScript
export type BudgetLimit = z.infer<typeof BudgetLimitSchema>;
export type BudgetCreateInput = z.infer<typeof BudgetCreateSchema>;
export type BudgetUpdateInput = z.infer<typeof BudgetUpdateSchema>;
export type BudgetQueryParams = z.infer<typeof BudgetQuerySchema>;

// Validation error type for better error handling
export type ValidationError = {
  path: string[];
  message: string;
};

// Helper function to format validation errors
export const formatBudgetValidationErrors = (error: z.ZodError): ValidationError[] => {
  return error.errors.map(err => ({
    path: err.path.map(String),
    message: err.message
  }));
};

// Helper to validate budget period
export const isValidBudgetPeriod = (period: string): boolean => {
  return BUDGET_PERIODS.includes(period as any);
};

// Helper to calculate percentage of budget used
export const calculateBudgetPercentage = (spent: number, limit: number): number => {
  if (limit <= 0) return 0;
  return Math.min((spent / limit) * 100, 100);
};

// Helper to check if budget alert should be triggered
export const shouldTriggerBudgetAlert = (
  spent: number,
  limit: number,
  threshold: number
): boolean => {
  if (limit <= 0) return false;
  const percentage = spent / limit;
  return percentage >= threshold;
};

// Helper to format budget amount with currency
export const formatBudgetAmount = (amount: number, currency: string): string => {
  const currencySymbols: Record<string, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
