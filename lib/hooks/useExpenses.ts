import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '../services/expenseService';
import type { CreateExpenseInput, Expense, UpdateExpenseInput } from '../types';
import { CACHE_TIMES } from '../config/queryConfig';
import { useCreateResource, useDeleteResource, useUpdateResource } from './useCrud';
import { createQueryKeys } from './core/createQueryKeys';
import { useResource } from './core/useResource';
import { useResources } from './core/useResources';
import { useConditionalQuery } from './core/useConditionalQuery';

// Type-safe filters for expenses
interface ExpenseFilters {
  petId?: string;
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  paymentMethod?: string;
}

// Query keys factory
const baseExpenseKeys = createQueryKeys('expenses');

// Extended query keys with custom keys
export const expenseKeys = {
  ...baseExpenseKeys,
  list: (filters: ExpenseFilters) => [...baseExpenseKeys.lists(), filters] as const,
  stats: (params?: any) => [...baseExpenseKeys.all, 'stats', params] as const,
  byPet: (petId: string) => [...baseExpenseKeys.all, 'by-pet', petId] as const,
  byCategory: (category: string, petId?: string) => [...baseExpenseKeys.all, 'by-category', category, petId] as const,
  monthly: (params?: any) => [...baseExpenseKeys.all, 'monthly', params] as const,
  yearly: (params?: any) => [...baseExpenseKeys.all, 'yearly', params] as const,
  dateRange: (params: any) => [...baseExpenseKeys.all, 'date-range', params] as const,
};

// Hook for fetching expenses by pet ID with filters
export function useExpenses(petId?: string, filters: Omit<ExpenseFilters, 'petId'> = {}) {
  return useConditionalQuery<{ expenses: Expense[]; total: number }>({
    queryKey: expenseKeys.list({ petId, ...filters }),
    queryFn: () => expenseService.getExpensesByPetId(petId!, filters),
    staleTime: CACHE_TIMES.SHORT,
    enabled: !!petId,
    defaultValue: { expenses: [], total: 0 },
    errorMessage: 'Failed to load expenses',
  });
}

// Hook for fetching a single expense
export function useExpense(id?: string) {
  return useResource<Expense>({
    queryKey: expenseKeys.detail(id!),
    queryFn: () => expenseService.getExpenseById(id!),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!id,
    errorMessage: 'Failed to load expense',
  });
}

// Hook for expense statistics
export function useExpenseStats(params?: {
  petId?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}) {
  return useConditionalQuery<any>({
    queryKey: expenseKeys.stats(params),
    queryFn: () => expenseService.getExpenseStats(params),
    staleTime: CACHE_TIMES.MEDIUM,
    defaultValue: null,
    errorMessage: 'Failed to load expense statistics',
  });
}

// Hook for monthly expenses
export function useMonthlyExpenses(params?: {
  petId?: string;
  year?: number;
  month?: number;
}) {
  return useResources<any>({
    queryKey: expenseKeys.monthly(params),
    queryFn: () => expenseService.getMonthlyExpenses(params),
    staleTime: CACHE_TIMES.MEDIUM,
  });
}

// Hook for yearly expenses
export function useYearlyExpenses(params?: {
  petId?: string;
  year?: number;
}) {
  return useResources<any>({
    queryKey: expenseKeys.yearly(params),
    queryFn: () => expenseService.getYearlyExpenses(params),
    staleTime: CACHE_TIMES.MEDIUM,
  });
}

// Hook for expenses by category
export function useExpensesByCategory(category: string, petId?: string) {
  return useConditionalQuery<Expense[]>({
    queryKey: expenseKeys.byCategory(category, petId),
    queryFn: () => expenseService.getExpensesByCategory(category, petId),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!category,
    defaultValue: [],
    errorMessage: 'Failed to load expenses by category',
  });
}

// Hook for expenses by date range
export function useExpensesByDateRange(params: {
  petId?: string;
  startDate: string;
  endDate: string;
}) {
  return useConditionalQuery<Expense[]>({
    queryKey: expenseKeys.dateRange(params),
    queryFn: () => expenseService.getExpensesByDateRange(params),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!params.startDate && !!params.endDate,
    defaultValue: [],
    errorMessage: 'Failed to load expenses by date range',
  });
}

// Mutation hook for creating an expense
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useCreateResource<Expense, CreateExpenseInput>(
    (data) => expenseService.createExpense(data).then(res => res.data!),
    {
      listQueryKey: expenseKeys.all, // Ideally should be more specific but existing code invalidated 'all'
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: expenseKeys.byPet(data.petId) });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      }
    }
  );
}

// Mutation hook for updating an expense
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useUpdateResource<Expense, UpdateExpenseInput>(
    ({ id, data }) => expenseService.updateExpense(id, data).then(res => res.data!),
    {
      listQueryKey: expenseKeys.all,
      detailQueryKey: expenseKeys.detail,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: expenseKeys.byPet(data.petId) });
      },
      onSettled: (data) => {
        queryClient.invalidateQueries({ queryKey: expenseKeys.all });
        if (data) {
             queryClient.invalidateQueries({ queryKey: expenseKeys.detail(data.id) });
        }
      }
    }
  );
}

// Mutation hook for deleting an expense
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useDeleteResource<Expense>(
    (id) => expenseService.deleteExpense(id).then(res => res.data), // Assuming delete returns the ID or void
    {
      listQueryKey: expenseKeys.all,
      detailQueryKey: expenseKeys.detail,
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      }
    }
  );
}

// Mutation hook for exporting expenses as CSV
export function useExportExpensesCSV() {
  return useMutation({
    mutationFn: async (params?: {
      petId?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const result = await expenseService.exportExpensesCSV(params);
      if (!result.success) {
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || 'Failed to export expenses';
        throw new Error(errorMessage);
      }
      return result.data!;
    },
  });
}
