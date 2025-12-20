import { useCallback, useMemo, useRef } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { REVENUECAT_CONFIG } from "@/lib/revenuecat/config";
import { restorePurchases as restorePurchasesApi } from "@/lib/revenuecat/initialize";

// Rate limiting configuration
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds minimum between requests
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay
const TRIAL_START_BYPASS_KEY = 'trial-start-in-progress';

async function setTrialBypassFlag(value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TRIAL_START_BYPASS_KEY, value);
  } catch (error) {
    console.warn("[Subscription] Failed to set trial bypass flag:", error);
  }
}

async function clearTrialBypassFlag(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TRIAL_START_BYPASS_KEY);
  } catch (error) {
    console.warn("[Subscription] Failed to clear trial bypass flag:", error);
  }
}

/**
 * Subscription status type
 */
export type SubscriptionStatusType = "pro" | "trial" | "free";

/**
 * useSubscription hook return type
 */
export interface UseSubscriptionReturn {
  // Status (from backend)
  isProUser: boolean;
  isSubscribed: boolean;
  isTrialActive: boolean;
  isPaidSubscription: boolean;
  isExpired: boolean;
  isCancelled: boolean;
  daysRemaining: number;
  subscriptionStatus: SubscriptionStatusType;
  canStartTrial: boolean;
  provider: "internal" | "revenuecat" | null;
  tier: string | null;

  // Customer Info (for RevenueCat operations)
  customerInfo: CustomerInfo | null;
  activeEntitlements: string[];
  expirationDate: string | null;
  willRenew: boolean;
  productIdentifier: string | null;

  // Loading states
  isInitialized: boolean;
  isLoading: boolean;
  isStatusLoading: boolean;
  error: string | null;
  statusError: string | null;
  statusErrorCode: string | null;

  // Actions
  presentPaywall: (offering?: PurchasesOfferings) => Promise<boolean>;
  presentPaywallIfNeeded: () => Promise<boolean>;
  presentCustomerCenter: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  getOfferings: () => Promise<PurchasesOfferings | null>;
  checkEntitlement: (entitlementId?: string) => boolean;
  startTrial: () => Promise<boolean>;
  refreshSubscriptionStatus: () => Promise<void>;
  refreshSubscriptionStatusImmediate: () => Promise<void>;
  clearStatusError: () => void;
}

/**
 * Poll for subscription status update after purchase
 * Waits for webhook to process and backend to update
 */
async function pollForSubscriptionUpdate(
  fetchStatus: () => Promise<boolean>,
  checkActive: () => boolean,
  maxAttempts: number = 10
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 500));
    await fetchStatus();
    if (checkActive()) {
      console.log(`[Subscription] Status updated after ${i + 1} attempts`);
      return true;
    }
  }
  console.log("[Subscription] Status update timeout - webhook may be delayed");
  return false;
}

/**
 * Main hook for subscription management
 *
 * Backend-first approach:
 * - All status checks come from backend
 * - RevenueCat SDK used only for purchases and customer center
 * - Polling after purchase to wait for webhook processing
 * - Added circuit breaker and rate limiting to prevent infinite loops
 */
export function useSubscription(): UseSubscriptionReturn {
  const { t } = useTranslation();

  // Rate limiting and circuit breaker refs
  const lastRequestTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  // Use useShallow to prevent unnecessary re-renders
  const {
    isProUser,
    hasActiveSubscription,
    isTrialActive,
    isPaidSubscription,
    isExpired,
    isCancelled,
    getDaysRemaining,
    canStartTrial,
    getProvider,
    getTier,
    getActiveEntitlement,
    getExpirationDate,
    willRenew,
    setCustomerInfo,
    fetchSubscriptionStatus,
    setLoading,
    setError,
    startTrial,
    resetSubscription,
    clearStatusError,
  } = useSubscriptionStore(
    useShallow((state) => ({
      isProUser: state.isProUser,
      hasActiveSubscription: state.hasActiveSubscription,
      isTrialActive: state.isTrialActive,
      isPaidSubscription: state.isPaidSubscription,
      isExpired: state.isExpired,
      isCancelled: state.isCancelled,
      getDaysRemaining: state.getDaysRemaining,
      canStartTrial: state.canStartTrial,
      getProvider: state.getProvider,
      getTier: state.getTier,
      getActiveEntitlement: state.getActiveEntitlement,
      getExpirationDate: state.getExpirationDate,
      willRenew: state.willRenew,
      setCustomerInfo: state.setCustomerInfo,
      fetchSubscriptionStatus: state.fetchSubscriptionStatus,
      setLoading: state.setLoading,
      setError: state.setError,
      startTrial: state.startTrial,
      resetSubscription: state.resetSubscription,
      clearStatusError: state.clearStatusError,
    }))
  );

  // State values that need to be tracked individually
  const customerInfo = useSubscriptionStore((state) => state.customerInfo);
  const isInitialized = useSubscriptionStore((state) => state.isInitialized);
  const isLoading = useSubscriptionStore((state) => state.isLoading);
  const isStatusLoading = useSubscriptionStore(
    (state) => state.isStatusLoading
  );
  const error = useSubscriptionStore((state) => state.error);
  const statusError = useSubscriptionStore((state) => state.statusError);
  const statusErrorCode = useSubscriptionStore(
    (state) => state.statusErrorCode
  );

  // Computed values from backend status
  const isProUserValue = isProUser();
  const isSubscribed = hasActiveSubscription();
  const isTrialActiveValue = isTrialActive();
  const isPaidSubscriptionValue = isPaidSubscription();
  const isExpiredValue = isExpired();
  const isCancelledValue = isCancelled();
  const daysRemaining = getDaysRemaining();
  const canStartTrialValue = canStartTrial();
  const provider = getProvider();
  const tier = getTier();
  const activeEntitlement = getActiveEntitlement();

  const subscriptionStatus: SubscriptionStatusType = useMemo(() => {
    if (isPaidSubscriptionValue) return "pro";
    if (isTrialActiveValue) return "trial";
    return "free";
  }, [isPaidSubscriptionValue, isTrialActiveValue]);

  const activeEntitlements = useMemo(() => {
    if (!customerInfo) return [];
    return Object.keys(customerInfo.entitlements.active);
  }, [customerInfo]);

  /**
   * Present the RevenueCat paywall
   * Returns true if a purchase or restore was made
   * Uses polling to wait for backend status update
   */
  const presentPaywall = useCallback(
    async (offering?: PurchasesOfferings): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const result = await RevenueCatUI.presentPaywall({
          offering: offering?.current || undefined,
        });

        switch (result) {
          case PAYWALL_RESULT.PURCHASED:
          case PAYWALL_RESULT.RESTORED:
            // Update RevenueCat customer info immediately
            const info = await Purchases.getCustomerInfo();
            setCustomerInfo(info);

            // Poll for backend status update (webhook processing)
            await pollForSubscriptionUpdate(
              () => fetchSubscriptionStatus(),
              () => hasActiveSubscription()
            );
            return true;

          case PAYWALL_RESULT.CANCELLED:
            console.log("[Subscription] Paywall cancelled by user");
            return false;

          case PAYWALL_RESULT.ERROR:
            console.error("[Subscription] Paywall error");
            setError(t("subscription.paywallError"));
            return false;

          case PAYWALL_RESULT.NOT_PRESENTED:
            console.log("[Subscription] Paywall not presented");
            return false;

          default:
            return false;
        }
      } catch (error) {
        console.error("[Subscription] Error presenting paywall:", error);
        setError((error as Error).message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      setLoading,
      setError,
      setCustomerInfo,
      fetchSubscriptionStatus,
      hasActiveSubscription,
      t,
    ]
  );

  /**
   * Present paywall only if user doesn't have the Pro entitlement
   * Uses polling to wait for backend status update
   */
  const presentPaywallIfNeeded = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: REVENUECAT_CONFIG.ENTITLEMENT_ID,
      });

      if (
        result === PAYWALL_RESULT.PURCHASED ||
        result === PAYWALL_RESULT.RESTORED
      ) {
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);

        // Poll for backend status update
        await pollForSubscriptionUpdate(
          () => fetchSubscriptionStatus(),
          () => hasActiveSubscription()
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error(
        "[Subscription] Error presenting paywall if needed:",
        error
      );
      setError((error as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    setLoading,
    setError,
    setCustomerInfo,
    fetchSubscriptionStatus,
    hasActiveSubscription,
  ]);

  /**
   * Present the Customer Center for subscription management
   */
  const presentCustomerCenter = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRestoreStarted: () => {
            console.log("[Subscription] Restore started from Customer Center");
          },
          onRestoreCompleted: async ({ customerInfo }) => {
            console.log(
              "[Subscription] Restore completed from Customer Center"
            );
            setCustomerInfo(customerInfo);
            // Refresh backend status
            await fetchSubscriptionStatus();
          },
          onRestoreFailed: ({ error }) => {
            console.error(
              "[Subscription] Restore failed from Customer Center:",
              error
            );
            setError(error.message);
          },
          onShowingManageSubscriptions: () => {
            console.log("[Subscription] Showing manage subscriptions");
          },
          onFeedbackSurveyCompleted: ({ feedbackSurveyOptionId }) => {
            console.log(
              "[Subscription] Feedback survey completed:",
              feedbackSurveyOptionId
            );
          },
        },
      });
    } catch (error) {
      console.error("[Subscription] Error presenting Customer Center:", error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setCustomerInfo, fetchSubscriptionStatus]);

  /**
   * Restore purchases for the current user
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const customerInfo = await restorePurchasesApi();
      setCustomerInfo(customerInfo);

      const hasEntitlement =
        typeof customerInfo.entitlements.active[
          REVENUECAT_CONFIG.ENTITLEMENT_ID
        ] !== "undefined";

      if (hasEntitlement) {
        // Poll for backend status update
        await pollForSubscriptionUpdate(
          () => fetchSubscriptionStatus(),
          () => hasActiveSubscription()
        );

        Alert.alert(t("common.success"), t("subscription.restoreSuccess"));
        return true;
      } else {
        Alert.alert(
          t("subscription.noPurchases"),
          t("subscription.noPurchasesMessage")
        );
        return false;
      }
    } catch (error) {
      console.error("[Subscription] Error restoring purchases:", error);
      setError((error as Error).message);
      Alert.alert(t("common.error"), t("subscription.restoreError"));
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    setLoading,
    setError,
    setCustomerInfo,
    fetchSubscriptionStatus,
    hasActiveSubscription,
    t,
  ]);

  /**
   * Purchase a specific package
   */
  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const { customerInfo } = await Purchases.purchasePackage(pkg);
        setCustomerInfo(customerInfo);

        const hasEntitlement =
          typeof customerInfo.entitlements.active[
            REVENUECAT_CONFIG.ENTITLEMENT_ID
          ] !== "undefined";

        if (hasEntitlement) {
          console.log("[Subscription] Purchase successful");
          // Poll for backend status update
          await pollForSubscriptionUpdate(
            () => fetchSubscriptionStatus(),
            () => hasActiveSubscription()
          );
          return true;
        }

        return false;
      } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error) {
          const errorCode = (error as { code: string }).code;
          if (
            errorCode ===
            Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
          ) {
            console.log("[Subscription] Purchase cancelled by user");
            return false;
          }

          if (
            errorCode ===
            Purchases.PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR
          ) {
            console.log(
              "[Subscription] Product already purchased, restoring..."
            );
            return restorePurchases();
          }
        }

        console.error("[Subscription] Purchase error:", error);
        const errorMessage =
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "Purchase failed";
        setError(errorMessage);
        Alert.alert(t("common.error"), errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      setLoading,
      setError,
      setCustomerInfo,
      fetchSubscriptionStatus,
      hasActiveSubscription,
      t,
      restorePurchases,
    ]
  );

  /**
   * Get available offerings
   */
  const getOfferings =
    useCallback(async (): Promise<PurchasesOfferings | null> => {
      try {
        const offerings = await Purchases.getOfferings();
        return offerings;
      } catch (error) {
        console.error("[Subscription] Error getting offerings:", error);
        return null;
      }
    }, []);

  /**
   * Check if user has a specific entitlement (from RevenueCat)
   */
  const checkEntitlement = useCallback(
    (entitlementId: string = REVENUECAT_CONFIG.ENTITLEMENT_ID): boolean => {
      if (!customerInfo) return false;
      return (
        typeof customerInfo.entitlements.active[entitlementId] !== "undefined"
      );
    },
    [customerInfo]
  );

  /**
   * Refresh subscription status from backend
   * Implements circuit breaker and rate limiting to prevent infinite loops
   */
  const refreshSubscriptionStatus = useCallback(async (): Promise<void> => {
    // Prevent duplicate concurrent requests
    if (isFetchingRef.current) {
      console.log(
        "[useSubscription] Skipping fetch - request already in progress"
      );
      return;
    }

    // Rate limiting: check if enough time has passed since last request
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      console.log(
        `[useSubscription] Skipping fetch - too soon (${timeSinceLastRequest}ms < ${MIN_REQUEST_INTERVAL}ms)`
      );
      return;
    }

    // Check if circuit breaker has been tripped (too many failures)
    if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
      console.error(
        `[useSubscription] Circuit breaker tripped - too many failures (${retryCountRef.current})`
      );
      // Only log once to avoid console spam
      if (retryCountRef.current === MAX_RETRY_ATTEMPTS) {
        console.error(
          "[useSubscription] Subscription status checks paused. Will retry after app restart."
        );
      }
      return;
    }

    isFetchingRef.current = true;
    lastRequestTimeRef.current = now;

    try {
      const success = await fetchSubscriptionStatus();
      if (success) {
        // Success - reset retry counter
        retryCountRef.current = 0;
        console.log(
          "[useSubscription] Subscription status refreshed successfully"
        );
      } else {
        // Increment retry counter on failure
        retryCountRef.current += 1;
        const delay = RETRY_DELAY_BASE * Math.pow(2, retryCountRef.current - 1);
        console.error(
          `[useSubscription] Failed to refresh subscription status (attempt ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS}), ` +
            `next retry after ${delay}ms`
        );
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [fetchSubscriptionStatus]);

  /**
   * Immediate refresh that bypasses rate limiting for trial activation
   */
  const refreshSubscriptionStatusImmediate = useCallback(async (): Promise<void> => {
    // Bypass rate limiting and circuit breaker for trial activation
    isFetchingRef.current = false;
    retryCountRef.current = 0;
    lastRequestTimeRef.current = 0;

    await fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  /**
   * Start trial with immediate status refresh (bypasses rate limiting)
   */
  const startTrialAction = useCallback(async (): Promise<boolean> => {
    // Mark trial start in progress
    await setTrialBypassFlag(Date.now().toString());

    const success = await startTrial();

    if (success) {
      // Immediate refresh bypassing rate limiting
      await refreshSubscriptionStatusImmediate();
    } else {
      const { statusErrorCode: currentCode, statusError: currentError } =
        useSubscriptionStore.getState();
      const message = (() => {
        switch (currentCode) {
          case "SUBSCRIPTION_EXISTS":
            return t("subscription.trialAlreadySubscribed");
          case "DEVICE_TRIAL_USED":
            return t("subscription.trialAlreadyUsed");
          case "USER_TRIAL_USED":
            return t("subscription.trialAlreadyUsed");
          default:
            return currentError || t("subscription.trialStartFailed");
        }
      })();
      Alert.alert(t("common.error"), message);
    }

    // Clear bypass flag
    await clearTrialBypassFlag();

    return success;
  }, [refreshSubscriptionStatusImmediate, startTrial, t]);

  return {
    // Status (from backend)
    isProUser: isProUserValue,
    isSubscribed,
    isTrialActive: isTrialActiveValue,
    isPaidSubscription: isPaidSubscriptionValue,
    isExpired: isExpiredValue,
    isCancelled: isCancelledValue,
    daysRemaining,
    subscriptionStatus,
    canStartTrial: canStartTrialValue,
    provider,
    tier,

    // Customer Info (for RevenueCat operations)
    customerInfo,
    activeEntitlements,
    expirationDate: getExpirationDate(),
    willRenew: willRenew(),
    productIdentifier: activeEntitlement?.productIdentifier ?? null,

    // Loading states
    isInitialized,
    isLoading,
    isStatusLoading,
    error,
    statusError,
    statusErrorCode,

    // Actions
    presentPaywall,
    presentPaywallIfNeeded,
    presentCustomerCenter,
    restorePurchases,
    purchasePackage,
    getOfferings,
    checkEntitlement,
    startTrial: startTrialAction,
    refreshSubscriptionStatus,
    refreshSubscriptionStatusImmediate,
    clearStatusError,
  };
}
