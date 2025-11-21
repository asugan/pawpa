import { api, ApiError, ApiResponse } from '../api/client';
import { ENV } from '../config/env';
import type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseStats,
  MonthlyExpense,
  YearlyExpense
} from '../types';

/**
 * Date utility functions for safe date handling
 */
function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

function convertDateToISOString(dateValue: Date | string | null | undefined): string | undefined {
  if (!dateValue) {
    return undefined;
  }

  if (isDate(dateValue)) {
    return dateValue.toISOString();
  }

  if (typeof dateValue === 'string') {
    return dateValue;
  }

  return undefined;
}

/**
 * Expense Service - Manages all expense API operations
 */
export class ExpenseService {
  /**
   * Create a new expense
   */
  async createExpense(data: CreateExpenseInput): Promise<ApiResponse<Expense>> {
    try {
      const cleanedData = {
        ...data,
        date: convertDateToISOString(data.date),
        receiptPhoto: data.receiptPhoto || undefined,
        vendor: data.vendor || undefined,
        notes: data.notes || undefined,
        description: data.description || undefined,
        paymentMethod: data.paymentMethod || undefined
      };

      const response = await api.post<Expense>('/api/expenses', cleanedData);

      console.log('✅ Expense created successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Expense created successfully'
      };
    } catch (error) {
      console.error('❌ Create expense error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to create expense. Please check the information and try again.'
      };
    }
  }

  /**
   * Get expenses for a specific pet
   */
  async getExpensesByPetId(
    petId: string,
    params?: {
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
  ): Promise<ApiResponse<{ expenses: Expense[]; total: number }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.minAmount) queryParams.append('minAmount', params.minAmount.toString());
      if (params?.maxAmount) queryParams.append('maxAmount', params.maxAmount.toString());
      if (params?.currency) queryParams.append('currency', params.currency);
      if (params?.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);

      const url = `/api/pets/${petId}/expenses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<Expense[]>(url);

      // Backend response includes data and meta
      const expenses = response.data || [];
      const meta = response.meta || { total: expenses.length };

      return {
        success: true,
        data: {
          expenses,
          total: meta.total ?? expenses.length
        }
      };
    } catch (error) {
      console.error('❌ Get expenses error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to fetch expenses'
      };
    }
  }

  /**
   * Get a single expense by ID
   */
  async getExpenseById(id: string): Promise<ApiResponse<Expense>> {
    try {
      const response = await api.get<Expense>(`/api/expenses/${id}`);

      return {
        success: true,
        data: response.data!
      };
    } catch (error) {
      console.error('❌ Get expense error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to fetch expense'
      };
    }
  }

  /**
   * Update an expense
   */
  async updateExpense(id: string, data: UpdateExpenseInput): Promise<ApiResponse<Expense>> {
    try {
      const cleanedData: Partial<UpdateExpenseInput> & { date?: string } = { ...data };
      if (data.date) {
        cleanedData.date = convertDateToISOString(data.date);
      }

      const response = await api.put<Expense>(`/api/expenses/${id}`, cleanedData);

      console.log('✅ Expense updated successfully:', id);
      return {
        success: true,
        data: response.data!,
        message: 'Expense updated successfully'
      };
    } catch (error) {
      console.error('❌ Update expense error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to update expense'
      };
    }
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/api/expenses/${id}`);

      console.log('✅ Expense deleted successfully:', id);
      return {
        success: true,
        message: 'Expense deleted successfully'
      };
    } catch (error) {
      console.error('❌ Delete expense error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to delete expense'
      };
    }
  }

  /**
   * Get expense statistics
   */
  async getExpenseStats(params?: {
    petId?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<ApiResponse<ExpenseStats>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.category) queryParams.append('category', params.category);

      const url = `/api/expenses/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<ExpenseStats>(url);

      return {
        success: true,
        data: response.data!
      };
    } catch (error) {
      console.error('❌ Get expense stats error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to fetch expense statistics'
      };
    }
  }

  /**
   * Get monthly expenses
   */
  async getMonthlyExpenses(params?: {
    petId?: string;
    year?: number;
    month?: number;
  }): Promise<ApiResponse<MonthlyExpense[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.year) queryParams.append('year', params.year.toString());
      if (params?.month !== undefined) queryParams.append('month', params.month.toString());

      const url = `/api/expenses/monthly${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<MonthlyExpense[]>(url);

      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('❌ Get monthly expenses error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to fetch monthly expenses'
      };
    }
  }

  /**
   * Get yearly expenses
   */
  async getYearlyExpenses(params?: {
    petId?: string;
    year?: number;
  }): Promise<ApiResponse<YearlyExpense[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.year) queryParams.append('year', params.year.toString());

      const url = `/api/expenses/yearly${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<YearlyExpense[]>(url);

      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('❌ Get yearly expenses error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to fetch yearly expenses'
      };
    }
  }

  /**
   * Get expenses by category
   */
  async getExpensesByCategory(
    category: string,
    petId?: string
  ): Promise<ApiResponse<Expense[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (petId) queryParams.append('petId', petId);

      const url = `/api/expenses/by-category/${category}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<Expense[]>(url);

      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('❌ Get expenses by category error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to fetch expenses by category'
      };
    }
  }

  /**
   * Get expenses by date range
   */
  async getExpensesByDateRange(params: {
    petId?: string;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<Expense[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.petId) queryParams.append('petId', params.petId);
      queryParams.append('startDate', params.startDate);
      queryParams.append('endDate', params.endDate);

      const url = `/api/expenses/by-date?${queryParams.toString()}`;
      const response = await api.get<Expense[]>(url);

      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('❌ Get expenses by date range error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to fetch expenses by date range'
      };
    }
  }

  /**
   * Export expenses as CSV
   */
  async exportExpensesCSV(params?: {
    petId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<string>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.petId) queryParams.append('petId', params.petId);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const url = `/api/expenses/export/csv${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<string>(url);

      return {
        success: true,
        data: response.data!
      };
    } catch (error) {
      console.error('❌ Export expenses CSV error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message
        };
      }
      return {
        success: false,
        error: 'Failed to export expenses'
      };
    }
  }
}

// Export a singleton instance
export const expenseService = new ExpenseService();
