import { create } from 'zustand';
import type { CustomerInfo } from 'react-native-purchases';
import { subscriptionApiService, SubscriptionStatus } from '@/lib/services/subscriptionApiService';

// EntitlementInfo type from CustomerInfo
type EntitlementInfo = CustomerInfo['entitlements']['active'][string];

/**
 * Subscription state interface
 * Backend-first approach: subscription status comes from backend
 */
export interface SubscriptionState {
  // Unified subscription status from backend - single source of truth
  subscriptionStatus: SubscriptionStatus | null;
  isStatusLoading: boolean;
  statusError: string | null;

  // RevenueCat customer info (only for purchase operations, not status)
  customerInfo: CustomerInfo | null;

  // SDK state
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Subscription actions interface
 */
export interface SubscriptionActions {
  // Status management (from backend)
  fetchSubscriptionStatus: () => Promise<void>;

  // Trial management
  startTrial: () => Promise<boolean>;

  // Computed getters (from backend status)
  isProUser: () => boolean;
  hasActiveSubscription: () => boolean;
  isTrialActive: () => boolean;
  isPaidSubscription: () => boolean;
  isExpired: () => boolean;
  isCancelled: () => boolean;
  canStartTrial: () => boolean;
  getDaysRemaining: () => number;
  getExpirationDate: () => string | null;
  getTier: () => string | null;
  getProvider: () => 'internal' | 'revenuecat' | null;

  // Customer info management (for purchases only)
  setCustomerInfo: (info: CustomerInfo | null) => void;
  getActiveEntitlement: () => EntitlementInfo | null;
  willRenew: () => boolean;

  // SDK state
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Reset
  resetSubscription: () => void;
}

const initialState: SubscriptionState = {
  subscriptionStatus: null,
  isStatusLoading: false,
  statusError: null,
  customerInfo: null,
  isInitialized: false,
  isLoading: false,
  error: null,
};

/**
 * Subscription store for managing subscription state
 *
 * Backend-first approach:
 * - All status checks come from backend (subscriptionStatus)
 * - CustomerInfo is only used for RevenueCat purchase operations
 * - Trial and paid subscriptions are unified in backend
 */
export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>()(
  (set, get) => ({
    ...initialState,

    // Fetch unified subscription status from backend
    fetchSubscriptionStatus: async () => {
      set({ isStatusLoading: true, statusError: null });
      try {
        const response = await subscriptionApiService.getSubscriptionStatus();
        if (response.success && response.data) {
          set({ subscriptionStatus: response.data, isStatusLoading: false });
          console.log('[Subscription] Status fetched:', response.data);
        } else {
          set({ statusError: response.error as string, isStatusLoading: false });
          console.error('[Subscription] Failed to fetch status:', response.error);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        set({ statusError: errorMessage, isStatusLoading: false });
        console.error('[Subscription] Error fetching status:', error);
      }
    },

    // Start a new trial for the user via backend
    startTrial: async () => {
      set({ isStatusLoading: true, statusError: null });
      try {
        const response = await subscriptionApiService.startTrial();
        if (response.success && response.data) {
          console.log('[Subscription] Trial started:', response.data.subscription);
          // Refresh status after starting trial
          await get().fetchSubscriptionStatus();
          return true;
        } else {
          set({ statusError: response.error as string, isStatusLoading: false });
          console.error('[Subscription] Failed to start trial:', response.error);
          return false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Trial başlatılamadı';
        set({ statusError: errorMessage, isStatusLoading: false });
        console.error('[Subscription] Error starting trial:', error);
        return false;
      }
    },

    // Check if user has Pro access (active subscription - trial or paid)
    isProUser: () => {
      const { subscriptionStatus } = get();
      return subscriptionStatus?.hasActiveSubscription ?? false;
    },

    // Alias for isProUser
    hasActiveSubscription: () => {
      return get().isProUser();
    },

    // Check if current subscription is a trial
    isTrialActive: () => {
      const { subscriptionStatus } = get();
      if (!subscriptionStatus?.hasActiveSubscription) return false;
      return subscriptionStatus.subscriptionType === 'trial';
    },

    // Check if current subscription is paid
    isPaidSubscription: () => {
      const { subscriptionStatus } = get();
      if (!subscriptionStatus?.hasActiveSubscription) return false;
      return subscriptionStatus.subscriptionType === 'paid';
    },

    // Check if subscription has expired
    isExpired: () => {
      const { subscriptionStatus } = get();
      return subscriptionStatus?.isExpired ?? false;
    },

    // Check if subscription is cancelled
    isCancelled: () => {
      const { subscriptionStatus } = get();
      return subscriptionStatus?.isCancelled ?? false;
    },

    // Check if user can start a trial (device hasn't used one before)
    canStartTrial: () => {
      const { subscriptionStatus } = get();
      return subscriptionStatus?.canStartTrial ?? false;
    },

    // Get remaining days
    getDaysRemaining: () => {
      const { subscriptionStatus } = get();
      return subscriptionStatus?.daysRemaining ?? 0;
    },

    // Get expiration date
    getExpirationDate: () => {
      const { subscriptionStatus } = get();
      return subscriptionStatus?.expiresAt ?? null;
    },

    // Get subscription tier
    getTier: () => {
      const { subscriptionStatus } = get();
      return subscriptionStatus?.tier ?? null;
    },

    // Get subscription provider
    getProvider: () => {
      const { subscriptionStatus } = get();
      return subscriptionStatus?.provider ?? null;
    },

    // Update customer info from RevenueCat (for purchases only)
    setCustomerInfo: (info) => {
      set({ customerInfo: info });
      if (info) {
        console.log('[Subscription] Customer info updated (for purchases):', {
          activeEntitlements: Object.keys(info.entitlements.active),
        });
      }
    },

    // Get the active Pro entitlement info (from RevenueCat)
    getActiveEntitlement: () => {
      const { customerInfo } = get();
      if (!customerInfo) return null;

      // Check for any active entitlement
      const entitlements = customerInfo.entitlements.active;
      const firstKey = Object.keys(entitlements)[0];
      return firstKey ? entitlements[firstKey] : null;
    },

    // Check if subscription will auto-renew (from RevenueCat)
    willRenew: () => {
      const entitlement = get().getActiveEntitlement();
      return entitlement?.willRenew ?? false;
    },

    setInitialized: (initialized) => set({ isInitialized: initialized }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // Reset subscription state (on logout)
    resetSubscription: () => {
      set({
        subscriptionStatus: null,
        isStatusLoading: false,
        statusError: null,
        customerInfo: null,
        isInitialized: false,
        error: null,
      });
      console.log('[Subscription] State reset');
    },
  })
);

/**
 * Helper function to get subscription status summary
 */
export function getSubscriptionStatusSummary(): {
  status: 'pro' | 'trial' | 'free';
  daysRemaining: number | null;
  expirationDate: string | null;
  provider: 'internal' | 'revenuecat' | null;
} {
  const store = useSubscriptionStore.getState();
  const subscriptionStatus = store.subscriptionStatus;

  if (!subscriptionStatus) {
    return {
      status: 'free',
      daysRemaining: null,
      expirationDate: null,
      provider: null,
    };
  }

  if (subscriptionStatus.hasActiveSubscription) {
    if (subscriptionStatus.subscriptionType === 'paid') {
      return {
        status: 'pro',
        daysRemaining: subscriptionStatus.daysRemaining,
        expirationDate: subscriptionStatus.expiresAt,
        provider: subscriptionStatus.provider,
      };
    }
    return {
      status: 'trial',
      daysRemaining: subscriptionStatus.daysRemaining,
      expirationDate: subscriptionStatus.expiresAt,
      provider: subscriptionStatus.provider,
    };
  }

  return {
    status: 'free',
    daysRemaining: null,
    expirationDate: null,
    provider: null,
  };
}
