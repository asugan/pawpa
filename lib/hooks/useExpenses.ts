import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '../services/expenseService';
import type { CreateExpenseInput, Expense, UpdateExpenseInput } from '../types';
import { useCreateResource, useDeleteResource, useUpdateResource } from './useCrud';

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

// Query keys
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: ExpenseFilters) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  stats: (params?: any) => [...expenseKeys.all, 'stats', params] as const,
  byPet: (petId: string) => [...expenseKeys.all, 'by-pet', petId] as const,
  byCategory: (category: string, petId?: string) => [...expenseKeys.all, 'by-category', category, petId] as const,
  monthly: (params?: any) => [...expenseKeys.all, 'monthly', params] as const,
  yearly: (params?: any) => [...expenseKeys.all, 'yearly', params] as const,
  dateRange: (params: any) => [...expenseKeys.all, 'date-range', params] as const,
};

// Hook for fetching expenses by pet ID with filters
export function useExpenses(petId?: string, filters: Omit<ExpenseFilters, 'petId'> = {}) {
  return useQuery({
    queryKey: expenseKeys.list({ petId, ...filters }),
    queryFn: async () => {
      if (!petId) {
        return { expenses: [], total: 0 };
      }
      const result = await expenseService.getExpensesByPetId(petId, filters);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load expenses');
      }
      return result.data || { expenses: [], total: 0 };
    },
    enabled: !!petId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for fetching a single expense
export function useExpense(id?: string) {
  return useQuery({
    queryKey: expenseKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const result = await expenseService.getExpenseById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load expense');
      }
      return result.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for expense statistics
export function useExpenseStats(params?: {
  petId?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: expenseKeys.stats(params),
    queryFn: async () => {
      const result = await expenseService.getExpenseStats(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load expense statistics');
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for monthly expenses
export function useMonthlyExpenses(params?: {
  petId?: string;
  year?: number;
  month?: number;
}) {
  return useQuery({
    queryKey: expenseKeys.monthly(params),
    queryFn: async () => {
      const result = await expenseService.getMonthlyExpenses(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load monthly expenses');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for yearly expenses
export function useYearlyExpenses(params?: {
  petId?: string;
  year?: number;
}) {
  return useQuery({
    queryKey: expenseKeys.yearly(params),
    queryFn: async () => {
      const result = await expenseService.getYearlyExpenses(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load yearly expenses');
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for expenses by category
export function useExpensesByCategory(category: string, petId?: string) {
  return useQuery({
    queryKey: expenseKeys.byCategory(category, petId),
    queryFn: async () => {
      const result = await expenseService.getExpensesByCategory(category, petId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load expenses by category');
      }
      return result.data || [];
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for expenses by date range
export function useExpensesByDateRange(params: {
  petId?: string;
  startDate: string;
  endDate: string;
}) {
  return useQuery({
    queryKey: expenseKeys.dateRange(params),
    queryFn: async () => {
      const result = await expenseService.getExpensesByDateRange(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load expenses by date range');
      }
      return result.data || [];
    },
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
        throw new Error(result.error || 'Failed to export expenses');
      }
      return result.data!;
    },
  });
}
