import { api, ApiError } from '../api/client';
import { ENV } from '../config/env';
import type {
  BudgetLimit,
  CreateBudgetLimitInput,
  UpdateBudgetLimitInput,
  BudgetAlert,
  BudgetStatus,
  ApiResponse
} from '../types';

/**
 * Budget Service - Manages all budget limit API operations
 */
export class BudgetService {
  /**
   * Create a new budget limit
   */
  async createBudgetLimit(data: CreateBudgetLimitInput): Promise<ApiResponse<BudgetLimit>> {
    try {
      const cleanedData = {
        ...data,
        category: data.category || null,
        alertThreshold: data.alertThreshold ?? 0.8,
        isActive: data.isActive ?? true
      };

      const response = await api.post<BudgetLimit>('/budget-limits', cleanedData);

      console.log('✅ Budget limit created successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Budget limit created successfully'
      };
    } catch (error) {
      console.error('❌ Create budget limit error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to create budget limit. Please check the information and try again.'
      };
    }
  }

  /**
   * Get budget limits for a specific pet
   */
  async getBudgetLimitsByPetId(
    petId: string,
    params?: {
      page?: number;
      limit?: number;
      period?: string;
      isActive?: boolean;
      category?: string;
    }
  ): Promise<ApiResponse<{ budgetLimits: BudgetLimit[]; total: number }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.period) queryParams.append('period', params.period);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.category) queryParams.append('category', params.category);

      const url = `/pets/${petId}/budget-limits${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<BudgetLimit[]>(url);

      // Backend response includes data and meta
      const budgetLimits = response.data || [];
      const meta = (response as any).meta || { total: budgetLimits.length };

      return {
        success: true,
        data: {
          budgetLimits,
          total: meta.total
        }
      };
    } catch (error) {
      console.error('❌ Get budget limits error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to fetch budget limits'
      };
    }
  }

  /**
   * Get a single budget limit by ID
   */
  async getBudgetLimitById(id: string): Promise<ApiResponse<BudgetLimit>> {
    try {
      const response = await api.get<BudgetLimit>(`/budget-limits/${id}`);

      return {
        success: true,
        data: response.data!
      };
    } catch (error) {
      console.error('❌ Get budget limit error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to fetch budget limit'
      };
    }
  }

  /**
   * Update a budget limit
   */
  async updateBudgetLimit(
    id: string,
    data: UpdateBudgetLimitInput
  ): Promise<ApiResponse<BudgetLimit>> {
    try {
      const response = await api.put<BudgetLimit>(`/budget-limits/${id}`, data);

      console.log('✅ Budget limit updated successfully:', id);
      return {
        success: true,
        data: response.data!,
        message: 'Budget limit updated successfully'
      };
    } catch (error) {
      console.error('❌ Update budget limit error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to update budget limit'
      };
    }
  }

  /**
   * Delete a budget limit
   */
  async deleteBudgetLimit(id: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/budget-limits/${id}`);

      console.log('✅ Budget limit deleted successfully:', id);
      return {
        success: true,
        message: 'Budget limit deleted successfully'
      };
    } catch (error) {
      console.error('❌ Delete budget limit error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to delete budget limit'
      };
    }
  }

  /**
   * Get all active budget limits
   */
  async getActiveBudgetLimits(petId?: string): Promise<ApiResponse<BudgetLimit[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (petId) queryParams.append('petId', petId);

      const url = `/budget-limits/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<BudgetLimit[]>(url);

      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('❌ Get active budget limits error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to fetch active budget limits'
      };
    }
  }

  /**
   * Check budget alerts
   */
  async checkBudgetAlerts(petId?: string): Promise<ApiResponse<BudgetAlert[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (petId) queryParams.append('petId', petId);

      const url = `/budget-limits/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<BudgetAlert[]>(url);

      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('❌ Check budget alerts error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to check budget alerts'
      };
    }
  }

  /**
   * Get budget status
   */
  async getBudgetStatus(budgetLimitId: string): Promise<ApiResponse<BudgetStatus>> {
    try {
      const response = await api.get<BudgetStatus>(`/budget-limits/${budgetLimitId}/status`);

      return {
        success: true,
        data: response.data!
      };
    } catch (error) {
      console.error('❌ Get budget status error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to fetch budget status'
      };
    }
  }
}

// Export a singleton instance
export const budgetService = new BudgetService();
