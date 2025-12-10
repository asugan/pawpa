import { api, ApiError, ApiResponse } from "../api/client";
import { ENV } from "../config/env";
import type {
  UserBudget,
  UserBudgetStatus,
  SetUserBudgetInput,
  PetBreakdown,
} from "../types";

/**
 * User Budget Service - Manages simplified user budget API operations
 * Implements the new budget simplification roadmap with single budget per user
 */
export class UserBudgetService {
  /**
   * Get current user's budget
   */
  async getBudget(): Promise<ApiResponse<UserBudget>> {
    try {
      const response = await api.get<UserBudget>(ENV.ENDPOINTS.BUDGET);

      console.log("✅ User budget loaded successfully");
      return {
        success: true,
        data: response.data!,
        message: "User budget loaded successfully",
      };
    } catch (error) {
      console.error("❌ Get user budget error:", error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: "No budget found for user",
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: "Failed to fetch user budget",
      };
    }
  }

  /**
   * Set or update user budget (UPSERT operation)
   */
  async setBudget(data: SetUserBudgetInput): Promise<ApiResponse<UserBudget>> {
    try {
      // Clean up the data before sending to API
      const cleanedData = {
        amount: Math.max(0, data.amount), // Ensure non-negative amount
        currency: data.currency,
        alertThreshold: data.alertThreshold ?? 0.8, // Default to 80%
        isActive: data.isActive ?? true, // Default to active
      };

      const response = await api.put<UserBudget>(
        ENV.ENDPOINTS.BUDGET,
        cleanedData
      );

      console.log("✅ User budget set successfully:", response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: "User budget updated successfully",
      };
    } catch (error) {
      console.error("❌ Set user budget error:", error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error:
          "Failed to set user budget. Please check the information and try again.",
      };
    }
  }

  /**
   * Remove user's budget
   */
  async deleteBudget(): Promise<ApiResponse<void>> {
    try {
      await api.delete(ENV.ENDPOINTS.BUDGET);

      console.log("✅ User budget deleted successfully");
      return {
        success: true,
        message: "User budget deleted successfully",
      };
    } catch (error) {
      console.error("❌ Delete user budget error:", error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: "No budget found to delete",
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: "Failed to delete user budget",
      };
    }
  }

  /**
   * Get budget status with current spending and pet breakdown
   */
  async getBudgetStatus(): Promise<ApiResponse<UserBudgetStatus>> {
    try {
      const response = await api.get<UserBudgetStatus>(
        ENV.ENDPOINTS.BUDGET_STATUS
      );

      console.log("✅ Budget status loaded successfully");
      return {
        success: true,
        data: response.data!,
        message: "Budget status loaded successfully",
      };
    } catch (error) {
      console.error("❌ Get budget status error:", error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: "No budget found for status calculation",
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: "Failed to fetch budget status",
      };
    }
  }

  /**
   * Check if budget alerts should be triggered
   */
  async checkBudgetAlerts(): Promise<
    ApiResponse<{
      isAlert: boolean;
      alertType?: "warning" | "critical";
      message?: string;
      percentage?: number;
      remainingAmount?: number;
    }>
  > {
    try {
      const response = await api.get<{
        isAlert: boolean;
        alertType?: "warning" | "critical";
        message?: string;
        percentage?: number;
        remainingAmount?: number;
      }>(ENV.ENDPOINTS.BUDGET_ALERTS);

      console.log("✅ Budget alerts checked successfully");
      return {
        success: true,
        data: response.data!,
        message: "Budget alerts checked successfully",
      };
    } catch (error) {
      console.error("❌ Check budget alerts error:", error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: "No budget found for alert checking",
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: "Failed to check budget alerts",
      };
    }
  }

  /**
   * Get pet spending breakdown for the current budget period
   * This is a helper method that extracts pet breakdown from budget status
   */
  async getPetSpendingBreakdown(): Promise<ApiResponse<PetBreakdown[]>> {
    try {
      const statusResponse = await this.getBudgetStatus();

      if (!statusResponse.success || !statusResponse.data) {
        return {
          success: false,
          error:
            statusResponse.error ||
            "Failed to get budget status for pet breakdown",
        };
      }

      console.log("✅ Pet spending breakdown loaded successfully");
      return {
        success: true,
        data: statusResponse.data.petBreakdown,
        message: "Pet spending breakdown loaded successfully",
      };
    } catch (error) {
      console.error("❌ Get pet spending breakdown error:", error);
      return {
        success: false,
        error: "Failed to get pet spending breakdown",
      };
    }
  }

  /**
   * Check if user has an active budget
   * Helper method to quickly check budget existence and active status
   */
  async hasActiveBudget(): Promise<ApiResponse<boolean>> {
    try {
      const budgetResponse = await this.getBudget();

      if (!budgetResponse.success) {
        return {
          success: true,
          data: false,
          message: "No budget found",
        };
      }

      const hasBudget = !!(budgetResponse.data && budgetResponse.data.isActive);

      console.log("✅ Active budget check completed:", hasBudget);
      return {
        success: true,
        data: hasBudget,
        message: hasBudget
          ? "User has active budget"
          : "User has no active budget",
      };
    } catch (error) {
      console.error("❌ Check active budget error:", error);
      return {
        success: false,
        error: "Failed to check active budget status",
      };
    }
  }

  /**
   * Get budget summary with key metrics
   * Combines budget info and status for a comprehensive overview
   */
  async getBudgetSummary(): Promise<
    ApiResponse<{
      budget: UserBudget | null;
      status: UserBudgetStatus | null;
      hasActiveBudget: boolean;
      alerts: {
        isAlert: boolean;
        alertType?: "warning" | "critical";
        message?: string;
      } | null;
    }>
  > {
    try {
      // Get budget info
      const budgetResponse = await this.getBudget();
      const budget = budgetResponse.success
        ? budgetResponse.data || null
        : null;

      // Get status if budget exists
      let status: UserBudgetStatus | null = null;
      if (budget) {
        const statusResponse = await this.getBudgetStatus();
        status = statusResponse.success ? statusResponse.data || null : null;
      }

      // Get alerts if budget exists
      let alerts: {
        isAlert: boolean;
        alertType?: "warning" | "critical";
        message?: string;
      } | null = null;
      if (budget) {
        const alertsResponse = await this.checkBudgetAlerts();
        alerts = alertsResponse.success ? alertsResponse.data || null : null;
      }

      const hasActiveBudget = !!(budget && budget.isActive);

      console.log("✅ Budget summary loaded successfully");
      return {
        success: true,
        data: {
          budget,
          status,
          hasActiveBudget,
          alerts,
        },
        message: "Budget summary loaded successfully",
      };
    } catch (error) {
      console.error("❌ Get budget summary error:", error);
      return {
        success: false,
        error: "Failed to get budget summary",
      };
    }
  }
}

// Export a singleton instance
export const userBudgetService = new UserBudgetService();
