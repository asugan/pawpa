import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import Purchases, { CustomerInfo, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useTranslation } from 'react-i18next';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { REVENUECAT_CONFIG } from '@/lib/revenuecat/config';
import { restorePurchases as restorePurchasesApi } from '@/lib/revenuecat/initialize';

/**
 * Subscription status type
 */
export type SubscriptionStatusType = 'pro' | 'trial' | 'free';

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
  provider: 'internal' | 'revenuecat' | null;
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
}

/**
 * Poll for subscription status update after purchase
 * Waits for webhook to process and backend to update
 */
async function pollForSubscriptionUpdate(
  fetchStatus: () => Promise<void>,
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
  console.log('[Subscription] Status update timeout - webhook may be delayed');
  return false;
}

/**
 * Main hook for subscription management
 *
 * Backend-first approach:
 * - All status checks come from backend
 * - RevenueCat SDK used only for purchases and customer center
 * - Polling after purchase to wait for webhook processing
 */
export function useSubscription(): UseSubscriptionReturn {
  const { t } = useTranslation();
  const store = useSubscriptionStore();

  // Computed values from backend status
  const isProUser = store.isProUser();
  const isSubscribed = store.hasActiveSubscription();
  const isTrialActive = store.isTrialActive();
  const isPaidSubscription = store.isPaidSubscription();
  const isExpired = store.isExpired();
  const isCancelled = store.isCancelled();
  const daysRemaining = store.getDaysRemaining();
  const canStartTrial = store.canStartTrial();
  const provider = store.getProvider();
  const tier = store.getTier();
  const activeEntitlement = store.getActiveEntitlement();

  const subscriptionStatus: SubscriptionStatusType = useMemo(() => {
    if (isPaidSubscription) return 'pro';
    if (isTrialActive) return 'trial';
    return 'free';
  }, [isPaidSubscription, isTrialActive]);

  const activeEntitlements = useMemo(() => {
    if (!store.customerInfo) return [];
    return Object.keys(store.customerInfo.entitlements.active);
  }, [store.customerInfo]);

  /**
   * Present the RevenueCat paywall
   * Returns true if a purchase or restore was made
   * Uses polling to wait for backend status update
   */
  const presentPaywall = useCallback(async (offering?: PurchasesOfferings): Promise<boolean> => {
    try {
      store.setLoading(true);
      store.setError(null);

      const result = await RevenueCatUI.presentPaywall({
        offering: offering as any,
      });

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          // Update RevenueCat customer info immediately
          const info = await Purchases.getCustomerInfo();
          store.setCustomerInfo(info);

          // Poll for backend status update (webhook processing)
          await pollForSubscriptionUpdate(
            () => store.fetchSubscriptionStatus(),
            () => store.hasActiveSubscription()
          );
          return true;

        case PAYWALL_RESULT.CANCELLED:
          console.log('[Subscription] Paywall cancelled by user');
          return false;

        case PAYWALL_RESULT.ERROR:
          console.error('[Subscription] Paywall error');
          store.setError(t('subscription.paywallError'));
          return false;

        case PAYWALL_RESULT.NOT_PRESENTED:
          console.log('[Subscription] Paywall not presented');
          return false;

        default:
          return false;
      }
    } catch (error) {
      console.error('[Subscription] Error presenting paywall:', error);
      store.setError((error as Error).message);
      return false;
    } finally {
      store.setLoading(false);
    }
  }, [store, t]);

  /**
   * Present paywall only if user doesn't have the Pro entitlement
   * Uses polling to wait for backend status update
   */
  const presentPaywallIfNeeded = useCallback(async (): Promise<boolean> => {
    try {
      store.setLoading(true);
      store.setError(null);

      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: REVENUECAT_CONFIG.ENTITLEMENT_ID,
      });

      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        const info = await Purchases.getCustomerInfo();
        store.setCustomerInfo(info);

        // Poll for backend status update
        await pollForSubscriptionUpdate(
          () => store.fetchSubscriptionStatus(),
          () => store.hasActiveSubscription()
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Subscription] Error presenting paywall if needed:', error);
      store.setError((error as Error).message);
      return false;
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  /**
   * Present the Customer Center for subscription management
   */
  const presentCustomerCenter = useCallback(async (): Promise<void> => {
    try {
      store.setLoading(true);
      store.setError(null);

      await RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRestoreStarted: () => {
            console.log('[Subscription] Restore started from Customer Center');
          },
          onRestoreCompleted: async ({ customerInfo }) => {
            console.log('[Subscription] Restore completed from Customer Center');
            store.setCustomerInfo(customerInfo);
            // Refresh backend status
            await store.fetchSubscriptionStatus();
          },
          onRestoreFailed: ({ error }) => {
            console.error('[Subscription] Restore failed from Customer Center:', error);
            store.setError(error.message);
          },
          onShowingManageSubscriptions: () => {
            console.log('[Subscription] Showing manage subscriptions');
          },
          onFeedbackSurveyCompleted: ({ feedbackSurveyOptionId }) => {
            console.log('[Subscription] Feedback survey completed:', feedbackSurveyOptionId);
          },
        },
      });
    } catch (error) {
      console.error('[Subscription] Error presenting Customer Center:', error);
      store.setError((error as Error).message);
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  /**
   * Restore purchases for the current user
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      store.setLoading(true);
      store.setError(null);

      const customerInfo = await restorePurchasesApi();
      store.setCustomerInfo(customerInfo);

      const hasEntitlement = typeof customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID] !== 'undefined';

      if (hasEntitlement) {
        // Poll for backend status update
        await pollForSubscriptionUpdate(
          () => store.fetchSubscriptionStatus(),
          () => store.hasActiveSubscription()
        );

        Alert.alert(
          t('common.success'),
          t('subscription.restoreSuccess')
        );
        return true;
      } else {
        Alert.alert(
          t('subscription.noPurchases'),
          t('subscription.noPurchasesMessage')
        );
        return false;
      }
    } catch (error) {
      console.error('[Subscription] Error restoring purchases:', error);
      store.setError((error as Error).message);
      Alert.alert(
        t('common.error'),
        t('subscription.restoreError')
      );
      return false;
    } finally {
      store.setLoading(false);
    }
  }, [store, t]);

  /**
   * Purchase a specific package
   */
  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      store.setLoading(true);
      store.setError(null);

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      store.setCustomerInfo(customerInfo);

      const hasEntitlement = typeof customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID] !== 'undefined';

      if (hasEntitlement) {
        console.log('[Subscription] Purchase successful');
        // Poll for backend status update
        await pollForSubscriptionUpdate(
          () => store.fetchSubscriptionStatus(),
          () => store.hasActiveSubscription()
        );
        return true;
      }

      return false;
    } catch (error: any) {
      if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        console.log('[Subscription] Purchase cancelled by user');
        return false;
      }

      if (error.code === Purchases.PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
        console.log('[Subscription] Product already purchased, restoring...');
        return restorePurchases();
      }

      console.error('[Subscription] Purchase error:', error);
      store.setError(error.message);
      Alert.alert(t('common.error'), error.message);
      return false;
    } finally {
      store.setLoading(false);
    }
  }, [store, t, restorePurchases]);

  /**
   * Get available offerings
   */
  const getOfferings = useCallback(async (): Promise<PurchasesOfferings | null> => {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error('[Subscription] Error getting offerings:', error);
      return null;
    }
  }, []);

  /**
   * Check if user has a specific entitlement (from RevenueCat)
   */
  const checkEntitlement = useCallback((entitlementId: string = REVENUECAT_CONFIG.ENTITLEMENT_ID): boolean => {
    if (!store.customerInfo) return false;
    return typeof store.customerInfo.entitlements.active[entitlementId] !== 'undefined';
  }, [store.customerInfo]);

  /**
   * Start the free trial (via backend)
   * Returns true if trial was started successfully
   */
  const startTrial = useCallback(async (): Promise<boolean> => {
    return await store.startTrial();
  }, [store]);

  /**
   * Refresh subscription status from backend
   */
  const refreshSubscriptionStatus = useCallback(async (): Promise<void> => {
    await store.fetchSubscriptionStatus();
  }, [store]);

  return {
    // Status (from backend)
    isProUser,
    isSubscribed,
    isTrialActive,
    isPaidSubscription,
    isExpired,
    isCancelled,
    daysRemaining,
    subscriptionStatus,
    canStartTrial,
    provider,
    tier,

    // Customer Info (for RevenueCat operations)
    customerInfo: store.customerInfo,
    activeEntitlements,
    expirationDate: store.getExpirationDate(),
    willRenew: store.willRenew(),
    productIdentifier: activeEntitlement?.productIdentifier ?? null,

    // Loading states
    isInitialized: store.isInitialized,
    isLoading: store.isLoading,
    isStatusLoading: store.isStatusLoading,
    error: store.error,
    statusError: store.statusError,

    // Actions
    presentPaywall,
    presentPaywallIfNeeded,
    presentCustomerCenter,
    restorePurchases,
    purchasePackage,
    getOfferings,
    checkEntitlement,
    startTrial,
    refreshSubscriptionStatus,
  };
}
