import { z } from "zod";
import { CURRENCIES } from "./expenseSchema";

// Custom validation functions
const validateAlertThreshold = (threshold: number) => {
  return threshold >= 0 && threshold <= 1;
};

// Schema for setting/updating user budget (simplified)
export const SetUserBudgetSchema = z
  .object({
    amount: z
      .number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number",
      })
      .positive("Amount must be positive")
      .min(1, "Amount must be at least 1")
      .max(10000000, "Amount is too large"),

    currency: z.enum(CURRENCIES),

    alertThreshold: z
      .number()
      .min(0, "Alert threshold must be at least 0")
      .max(1, "Alert threshold must be at most 1")
      .default(0.8)
      .refine(validateAlertThreshold, {
        message: "Alert threshold must be between 0 and 1",
      })
      .optional(),

    isActive: z.boolean().default(true).optional(),
  })
  .refine(
    (data) => {
      return data.amount > 0 && data.currency;
    },
    {
      message: "Amount and currency are required",
      path: ["amount"],
    }
  );

// Type exports for TypeScript
export type SetUserBudgetInput = z.infer<typeof SetUserBudgetSchema>;

// Validation error type for better error handling
export type ValidationError = {
  path: string[];
  message: string;
};

// Helper function to format validation errors
export const formatUserBudgetValidationErrors = (
  error: z.ZodError
): ValidationError[] => {
  return error.errors.map((err) => ({
    path: err.path.map(String),
    message: err.message,
  }));
};

// Helper to calculate percentage of budget used
export const calculateBudgetPercentage = (
  spent: number,
  limit: number
): number => {
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
export const formatBudgetAmount = (
  amount: number,
  currency: string,
  locale?: string
): string => {
  const currencySymbols: Record<string, string> = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  const symbol = currencySymbols[currency] || currency;
  const targetLocale = locale === "tr" ? "tr-TR" : "en-US";

  return `${symbol}${amount.toLocaleString(targetLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
