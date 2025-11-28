import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomerInfo } from 'react-native-purchases';
import { REVENUECAT_CONFIG } from '@/lib/revenuecat/config';

// EntitlementInfo type from CustomerInfo
type EntitlementInfo = CustomerInfo['entitlements']['active'][string];

/**
 * Subscription state interface
 */
export interface SubscriptionState {
  // Trial tracking (persisted)
  trialStartDate: string | null;

  // RevenueCat customer info (not persisted - fetched on app start)
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
  // Trial management
  startTrial: () => void;
  getTrialDaysRemaining: () => number;
  isTrialActive: () => boolean;
  isTrialExpired: () => boolean;

  // Customer info management
  setCustomerInfo: (info: CustomerInfo | null) => void;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed getters
  isSubscribed: () => boolean;
  isProUser: () => boolean;
  getActiveEntitlement: () => EntitlementInfo | null;
  getExpirationDate: () => string | null;
  willRenew: () => boolean;

  // Reset
  resetSubscription: () => void;
}

const initialState: SubscriptionState = {
  trialStartDate: null,
  customerInfo: null,
  isInitialized: false,
  isLoading: false,
  error: null,
};

/**
 * Subscription store for managing trial and subscription state
 *
 * Trial is managed locally (7 days without credit card)
 * Subscription state comes from RevenueCat CustomerInfo
 */
export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Start a new trial for the user
      startTrial: () => {
        const { trialStartDate } = get();
        // Only start trial if not already started
        if (!trialStartDate) {
          const now = new Date().toISOString();
          set({ trialStartDate: now });
          console.log('[Subscription] Trial started:', now);
        }
      },

      // Get remaining trial days
      getTrialDaysRemaining: () => {
        const { trialStartDate } = get();
        if (!trialStartDate) return REVENUECAT_CONFIG.TRIAL_DURATION_DAYS;

        const start = new Date(trialStartDate);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const remaining = REVENUECAT_CONFIG.TRIAL_DURATION_DAYS - diffDays;

        return Math.max(0, remaining);
      },

      // Check if trial is currently active
      isTrialActive: () => {
        const { trialStartDate } = get();
        if (!trialStartDate) return false;

        const remaining = get().getTrialDaysRemaining();
        return remaining > 0;
      },

      // Check if trial has expired
      isTrialExpired: () => {
        const { trialStartDate } = get();
        if (!trialStartDate) return false;

        return get().getTrialDaysRemaining() <= 0;
      },

      // Update customer info from RevenueCat
      setCustomerInfo: (info) => {
        set({ customerInfo: info });
        if (info) {
          console.log('[Subscription] Customer info updated:', {
            activeEntitlements: Object.keys(info.entitlements.active),
          });
        }
      },

      setInitialized: (initialized) => set({ isInitialized: initialized }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Check if user has active subscription via RevenueCat
      isSubscribed: () => {
        const { customerInfo } = get();
        if (!customerInfo) return false;

        return typeof customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID] !== 'undefined';
      },

      // Check if user has Pro access (subscribed OR in trial)
      isProUser: () => {
        const isSubscribed = get().isSubscribed();
        const isTrialActive = get().isTrialActive();

        return isSubscribed || isTrialActive;
      },

      // Get the active Pro entitlement info
      getActiveEntitlement: () => {
        const { customerInfo } = get();
        if (!customerInfo) return null;

        return customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID] ?? null;
      },

      // Get subscription expiration date
      getExpirationDate: () => {
        const entitlement = get().getActiveEntitlement();
        return entitlement?.expirationDate ?? null;
      },

      // Check if subscription will auto-renew
      willRenew: () => {
        const entitlement = get().getActiveEntitlement();
        return entitlement?.willRenew ?? false;
      },

      // Reset subscription state (on logout)
      resetSubscription: () => {
        set({
          customerInfo: null,
          isInitialized: false,
          error: null,
        });
        // Note: We don't reset trialStartDate as trial is device-bound
        console.log('[Subscription] State reset (keeping trial)');
      },
    }),
    {
      name: 'subscription-storage',
      // Only persist trial start date - customer info is fetched fresh
      partialize: (state) => ({
        trialStartDate: state.trialStartDate,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('[Subscription] Store rehydrated, trial start:', state.trialStartDate);
        }
      },
    }
  )
);

/**
 * Helper function to get subscription status summary
 */
export function getSubscriptionStatus(): {
  status: 'pro' | 'trial' | 'free';
  daysRemaining: number | null;
  expirationDate: string | null;
} {
  const store = useSubscriptionStore.getState();

  if (store.isSubscribed()) {
    return {
      status: 'pro',
      daysRemaining: null,
      expirationDate: store.getExpirationDate(),
    };
  }

  if (store.isTrialActive()) {
    return {
      status: 'trial',
      daysRemaining: store.getTrialDaysRemaining(),
      expirationDate: null,
    };
  }

  return {
    status: 'free',
    daysRemaining: null,
    expirationDate: null,
  };
}
