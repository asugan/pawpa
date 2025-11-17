import { z } from 'zod';

// Expense categories enum
export const EXPENSE_CATEGORIES = [
  'food',
  'premium_food',
  'veterinary',
  'vaccination',
  'medication',
  'grooming',
  'toys',
  'accessories',
  'training',
  'insurance',
  'emergency',
  'other'
] as const;

// Payment methods enum
export const PAYMENT_METHODS = [
  'cash',
  'credit_card',
  'debit_card',
  'bank_transfer'
] as const;

// Currencies enum
export const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;

// Custom validation functions
const validateExpenseDate = (date: Date) => {
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate()); // 10 years ago
  return date <= now && date >= minDate;
};

// Base expense schema for common validations
const BaseExpenseSchema = z.object({
  petId: z.string().min(1, 'Pet ID is required'),

  category: z.enum(EXPENSE_CATEGORIES, {
    errorMap: () => ({ message: 'Invalid category' })
  }),

  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number'
    })
    .positive('Amount must be positive')
    .min(0.01, 'Amount must be at least 0.01')
    .max(1000000, 'Amount is too large'),

  currency: z.enum(CURRENCIES),

  paymentMethod: z.enum(PAYMENT_METHODS).optional(),

  description: z
    .string()
    .max(500, 'Description is too long')
    .optional()
    .transform(val => val?.trim() || undefined),

  date: z
    .string({
      required_error: 'Date is required',
      invalid_type_error: 'Date must be a valid date string'
    })
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && validateExpenseDate(date);
    }, {
      message: 'Date cannot be in the future or more than 10 years ago'
    }),

  receiptPhoto: z
    .string()
    .url('Receipt photo must be a valid URL')
    .optional()
    .or(z.literal('').transform(() => undefined)),

  vendor: z
    .string()
    .max(200, 'Vendor name is too long')
    .optional()
    .transform(val => val?.trim() || undefined),

  notes: z
    .string()
    .max(1000, 'Notes are too long')
    .optional()
    .transform(val => val?.trim() || undefined)
});

// Schema for creating a new expense
export const ExpenseCreateSchema = BaseExpenseSchema.refine(
  (data) => {
    return data.petId && data.category && data.amount > 0 && data.date;
  },
  {
    message: 'Pet ID, category, amount, and date are required',
    path: ['petId']
  }
);

// Schema for updating an existing expense (all fields optional)
export const ExpenseUpdateSchema = BaseExpenseSchema.partial().omit({ petId: true });

// Query params schema for filtering expenses
export const ExpenseQuerySchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  currency: z.enum(CURRENCIES).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional()
});

// Type exports for TypeScript
export type ExpenseCreateInput = z.infer<typeof ExpenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof ExpenseUpdateSchema>;
export type ExpenseQueryParams = z.infer<typeof ExpenseQuerySchema>;

// Validation error type for better error handling
export type ValidationError = {
  path: string[];
  message: string;
};

// Helper function to format validation errors
export const formatExpenseValidationErrors = (error: z.ZodError): ValidationError[] => {
  return error.errors.map(err => ({
    path: err.path.map(String),
    message: err.message
  }));
};

// Helper to validate expense category
export const isValidExpenseCategory = (category: string): boolean => {
  return EXPENSE_CATEGORIES.includes(category as any);
};

// Helper to validate payment method
export const isValidPaymentMethod = (method: string): boolean => {
  return PAYMENT_METHODS.includes(method as any);
};

// Helper to validate currency
export const isValidCurrency = (currency: string): boolean => {
  return CURRENCIES.includes(currency as any);
};
