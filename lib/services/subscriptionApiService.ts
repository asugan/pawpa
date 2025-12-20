import { api, ApiError, ApiResponse } from '../api/client';
import { ENV } from '../config/env';
import { getDeviceId } from '../utils/deviceId';
import { RequestCache } from '../types';
import { authClient } from '../auth/client';

// Request deduplication and rate limiting
const REQUEST_CACHE = new Map<string, RequestCache>();
const CACHE_TTL = 5000; // 5 seconds

/**
 * Unified subscription status from backend - single source of truth
 */

/**
 * Invalidate specific cache entry
 */
function invalidateCache(key: string): void {
  REQUEST_CACHE.delete(key);
  console.log(`[SubscriptionApiService] Cache invalidated for ${key}`);
}

/**
 * Clear expired cache entries
 */
function clearExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of REQUEST_CACHE.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      REQUEST_CACHE.delete(key);
    }
  }
}

/**
 * Get or create a cached request
 */
function getCachedRequest<T>(key: string, factory: () => Promise<T>): Promise<T> {
  clearExpiredCache();
  
  const existing = REQUEST_CACHE.get(key);
  if (existing) {
    console.log(`[SubscriptionApiService] Using cached request for ${key}`);
    return existing.promise as Promise<T>;
  }
  
  const promise = factory();
  REQUEST_CACHE.set(key, { timestamp: Date.now(), promise });
  
  // Clean up after promise resolves
  promise.catch(() => {}).finally(() => {
    // Remove from cache after TTL to allow fresh requests
    setTimeout(() => {
      REQUEST_CACHE.delete(key);
    }, CACHE_TTL);
  });
  
  return promise;
}

function hashString(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}
export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionType: 'trial' | 'paid' | null;
  tier: string | null;
  expiresAt: string | null;
  daysRemaining: number;
  isExpired: boolean;
  isCancelled: boolean;
  canStartTrial: boolean;
  provider: 'internal' | 'revenuecat' | null;
}

/**
 * @deprecated Use SubscriptionStatus instead
 */
export interface TrialStatus {
  hasActiveTrial: boolean;
  trialStartDate: string | null;
  trialEndDate: string | null;
  trialDaysRemaining: number;
  isTrialExpired: boolean;
  canStartTrial: boolean;
}

/**
 * Start trial response
 */
export interface StartTrialResponse {
  success: boolean;
  subscription: {
    id: string;
    provider: string;
    tier: string;
    status: string;
    expiresAt: string;
  };
}

/**
 * Subscription API Service - Handles all subscription related API calls
 */
export class SubscriptionApiService {
  /**
   * Get unified subscription status from backend
   * This is the main method - use this for all status checks
   * Implements request deduplication to prevent duplicate calls
   */
  async getSubscriptionStatus(
    options?: { bypassCache?: boolean }
  ): Promise<ApiResponse<SubscriptionStatus>> {
    const deviceId = await getDeviceId();
    const sessionCookie = authClient.getCookie();
    const sessionKey = sessionCookie ? hashString(sessionCookie) : null;
    const cacheKey = sessionKey ? `subscription-status-${deviceId}-${sessionKey}` : null;

    const requestFactory = async () => {
      try {
        const response = await api.get<SubscriptionStatus>(
          ENV.ENDPOINTS.SUBSCRIPTION_STATUS,
          { deviceId }
        );

        console.log('✅ Subscription status loaded successfully');
        return {
          success: true,
          data: response.data!,
        };
      } catch (error) {
        console.error('❌ Get subscription status error:', error);
        if (error instanceof ApiError) {
          return {
            success: false,
            error: error.message,
          };
        }
        return {
          success: false,
          error: 'Abonelik durumu yüklenemedi. Lütfen tekrar deneyin.',
        };
      }
    };

    if (options?.bypassCache || !cacheKey) {
      return requestFactory();
    }

    return getCachedRequest(cacheKey, requestFactory);
  }

  /**
   * @deprecated Use getSubscriptionStatus instead
   */
  async getTrialStatus(): Promise<ApiResponse<TrialStatus>> {
    try {
      const deviceId = await getDeviceId();
      const response = await api.get<TrialStatus>(
        ENV.ENDPOINTS.SUBSCRIPTION_TRIAL_STATUS,
        { deviceId }
      );

      console.log('✅ Trial status loaded successfully');
      return {
        success: true,
        data: response.data!,
      };
    } catch (error) {
      console.error('❌ Get trial status error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Trial durumu yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Invalidate subscription status cache - called after trial start
   */
  public async invalidateSubscriptionStatusCache(): Promise<void> {
    const deviceId = await getDeviceId();
    const sessionCookie = authClient.getCookie();
    if (!sessionCookie) {
      return;
    }
    const sessionKey = hashString(sessionCookie);
    invalidateCache(`subscription-status-${deviceId}-${sessionKey}`);
  }

  /**
   * Start a new trial for the user with immediate cache invalidation
   */
  async startTrial(): Promise<ApiResponse<StartTrialResponse>> {
    try {
      const deviceId = await getDeviceId();

      // Don't use cache for trial start - always fresh request
      const response = await api.post<StartTrialResponse>(
        ENV.ENDPOINTS.SUBSCRIPTION_START_TRIAL,
        { deviceId }
      );

      // Immediately invalidate subscription status cache
      await this.invalidateSubscriptionStatusCache();

      console.log('✅ Trial started successfully, cache invalidated');
      return {
        success: true,
        data: response.data!,
        message: 'Trial başarıyla başlatıldı',
      };
    } catch (error) {
      console.error('❌ Start trial error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: {
            code: error.code ?? 'UNKNOWN_ERROR',
            message: error.message,
          },
        };
      }
      return {
        success: false,
        error: 'Trial başlatılamadı. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * @deprecated Trial is now automatically converted when RevenueCat subscription is created
   */
  async deactivateTrial(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        ENV.ENDPOINTS.SUBSCRIPTION_DEACTIVATE_TRIAL
      );

      console.log('✅ Trial deactivated successfully');
      return {
        success: true,
        data: response.data!,
      };
    } catch (error) {
      console.error('❌ Deactivate trial error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Trial deaktive edilemedi. Lütfen tekrar deneyin.',
      };
    }
  }
}

// Singleton instance
export const subscriptionApiService = new SubscriptionApiService();
