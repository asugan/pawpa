import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '../services/budgetService';
import type { BudgetLimit, CreateBudgetLimitInput, UpdateBudgetLimitInput, BudgetAlert, BudgetStatus } from '../types';

// Type-safe filters for budgets
interface BudgetFilters {
  petId?: string;
  page?: number;
  limit?: number;
  period?: string;
  isActive?: boolean;
  category?: string;
}

// Query keys
export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (filters: BudgetFilters) => [...budgetKeys.lists(), filters] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
  active: (petId?: string) => [...budgetKeys.all, 'active', petId] as const,
  alerts: (petId?: string) => [...budgetKeys.all, 'alerts', petId] as const,
  status: (budgetLimitId: string) => [...budgetKeys.all, 'status', budgetLimitId] as const,
  byPet: (petId: string) => [...budgetKeys.all, 'by-pet', petId] as const,
};

// Hook for fetching budget limits by pet ID with filters
export function useBudgets(petId?: string, filters: Omit<BudgetFilters, 'petId'> = {}) {
  return useQuery({
    queryKey: budgetKeys.list({ petId, ...filters }),
    queryFn: async () => {
      if (!petId) {
        return { budgetLimits: [], total: 0 };
      }
      const result = await budgetService.getBudgetLimitsByPetId(petId, filters);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load budget limits');
      }
      return result.data || { budgetLimits: [], total: 0 };
    },
    enabled: !!petId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for fetching a single budget limit
export function useBudget(id?: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const result = await budgetService.getBudgetLimitById(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load budget limit');
      }
      return result.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching active budget limits
export function useActiveBudgets(petId?: string) {
  return useQuery({
    queryKey: budgetKeys.active(petId),
    queryFn: async () => {
      const result = await budgetService.getActiveBudgetLimits(petId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load active budget limits');
      }
      return result.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for checking budget alerts
export function useBudgetAlerts(petId?: string) {
  return useQuery({
    queryKey: budgetKeys.alerts(petId),
    queryFn: async () => {
      const result = await budgetService.checkBudgetAlerts(petId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to check budget alerts');
      }
      return result.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent updates for alerts)
  });
}

// Hook for fetching budget status
export function useBudgetStatus(budgetLimitId?: string) {
  return useQuery({
    queryKey: budgetKeys.status(budgetLimitId!),
    queryFn: async () => {
      if (!budgetLimitId) return null;
      const result = await budgetService.getBudgetStatus(budgetLimitId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load budget status');
      }
      return result.data;
    },
    enabled: !!budgetLimitId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Hook for fetching all budget statuses
export function useBudgetStatuses(petId?: string) {
  return useQuery({
    queryKey: [...budgetKeys.all, 'statuses', petId] as const,
    queryFn: async () => {
      const result = await budgetService.getAllBudgetStatuses(petId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to load budget statuses');
      }
      return result.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Mutation hook for creating a budget limit
export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBudgetLimitInput) => {
      const result = await budgetService.createBudgetLimit(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create budget limit');
      }
      return result.data!;
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      queryClient.invalidateQueries({ queryKey: budgetKeys.byPet(data.petId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.active(data.petId) });
    },
  });
}

// Mutation hook for updating a budget limit
export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBudgetLimitInput }) => {
      const result = await budgetService.updateBudgetLimit(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update budget limit');
      }
      return result.data!;
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.byPet(data.petId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.active(data.petId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.status(data.id) });
    },
  });
}

// Mutation hook for deleting a budget limit
export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await budgetService.deleteBudgetLimit(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete budget limit');
      }
      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch all budget queries
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}
