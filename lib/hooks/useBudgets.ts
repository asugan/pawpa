import { useQueryClient } from '@tanstack/react-query';
import { budgetService } from '../services/budgetService';
import type { BudgetLimit, CreateBudgetLimitInput, UpdateBudgetLimitInput, BudgetAlert, BudgetStatus } from '../types';
import { CACHE_TIMES } from '../config/queryConfig';
import { useCreateResource, useDeleteResource, useUpdateResource } from './useCrud';
import { createQueryKeys } from './core/createQueryKeys';
import { useResource } from './core/useResource';
import { useResources } from './core/useResources';
import { useConditionalQuery } from './core/useConditionalQuery';

// Type-safe filters for budgets
interface BudgetFilters {
  petId?: string;
  page?: number;
  limit?: number;
  period?: string;
  isActive?: boolean;
  category?: string;
}

// Query keys factory
const baseBudgetKeys = createQueryKeys('budgets');

// Extended query keys with custom keys
export const budgetKeys = {
  ...baseBudgetKeys,
  list: (filters: BudgetFilters) => [...baseBudgetKeys.lists(), filters] as const,
  active: (petId?: string) => [...baseBudgetKeys.all, 'active', petId] as const,
  alerts: (petId?: string) => [...baseBudgetKeys.all, 'alerts', petId] as const,
  status: (budgetLimitId: string) => [...baseBudgetKeys.all, 'status', budgetLimitId] as const,
  statuses: (petId?: string) => [...baseBudgetKeys.all, 'statuses', petId] as const,
  byPet: (petId: string) => [...baseBudgetKeys.all, 'by-pet', petId] as const,
};

// Hook for fetching budget limits by pet ID with filters
export function useBudgets(petId?: string, filters: Omit<BudgetFilters, 'petId'> = {}) {
  return useConditionalQuery<{ budgetLimits: BudgetLimit[]; total: number }>({
    queryKey: budgetKeys.list({ petId, ...filters }),
    queryFn: () => budgetService.getBudgetLimitsByPetId(petId!, filters),
    staleTime: CACHE_TIMES.SHORT,
    enabled: !!petId,
    defaultValue: { budgetLimits: [], total: 0 },
    errorMessage: 'Failed to load budget limits',
  });
}

// Hook for fetching a single budget limit
export function useBudget(id?: string) {
  return useResource<BudgetLimit>({
    queryKey: budgetKeys.detail(id!),
    queryFn: () => budgetService.getBudgetLimitById(id!),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: !!id,
    errorMessage: 'Failed to load budget limit',
  });
}

// Hook for fetching active budget limits
export function useActiveBudgets(petId?: string) {
  return useResources<BudgetLimit>({
    queryKey: budgetKeys.active(petId),
    queryFn: () => budgetService.getActiveBudgetLimits(petId),
    staleTime: CACHE_TIMES.SHORT,
  });
}

// Hook for checking budget alerts
export function useBudgetAlerts(petId?: string) {
  return useResources<BudgetAlert>({
    queryKey: budgetKeys.alerts(petId),
    queryFn: () => budgetService.checkBudgetAlerts(petId),
    staleTime: CACHE_TIMES.VERY_SHORT,
  });
}

// Hook for fetching budget status
export function useBudgetStatus(budgetLimitId?: string) {
  return useConditionalQuery<BudgetStatus | null>({
    queryKey: budgetKeys.status(budgetLimitId!),
    queryFn: () => budgetService.getBudgetStatus(budgetLimitId!),
    staleTime: CACHE_TIMES.VERY_SHORT,
    enabled: !!budgetLimitId,
    defaultValue: null,
    errorMessage: 'Failed to load budget status',
  });
}

// Hook for fetching all budget statuses
export function useBudgetStatuses(petId?: string) {
  return useResources<BudgetStatus>({
    queryKey: budgetKeys.statuses(petId),
    queryFn: () => budgetService.getAllBudgetStatuses(petId),
    staleTime: CACHE_TIMES.VERY_SHORT,
  });
}

// Mutation hook for creating a budget limit
export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useCreateResource<BudgetLimit, CreateBudgetLimitInput>(
    (data) => budgetService.createBudgetLimit(data).then(res => res.data!),
    {
      listQueryKey: budgetKeys.all,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: budgetKeys.byPet(data.petId) });
        queryClient.invalidateQueries({ queryKey: budgetKeys.active(data.petId) });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      }
    }
  );
}

// Mutation hook for updating a budget limit
export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useUpdateResource<BudgetLimit, UpdateBudgetLimitInput>(
    ({ id, data }) => budgetService.updateBudgetLimit(id, data).then(res => res.data!),
    {
      listQueryKey: budgetKeys.all,
      detailQueryKey: budgetKeys.detail,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: budgetKeys.byPet(data.petId) });
        queryClient.invalidateQueries({ queryKey: budgetKeys.active(data.petId) });
        queryClient.invalidateQueries({ queryKey: budgetKeys.status(data.id) });
      },
      onSettled: (data) => {
        queryClient.invalidateQueries({ queryKey: budgetKeys.all });
        if (data) {
            queryClient.invalidateQueries({ queryKey: budgetKeys.detail(data.id) });
        }
      }
    }
  );
}

// Mutation hook for deleting a budget limit
export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useDeleteResource<BudgetLimit>(
    (id) => budgetService.deleteBudgetLimit(id).then(res => res.data),
    {
      listQueryKey: budgetKeys.all,
      detailQueryKey: budgetKeys.detail,
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      }
    }
  );
}
