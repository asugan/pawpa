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
export type SubscriptionStatus = 'pro' | 'trial' | 'free';

/**
 * useSubscription hook return type
 */
export interface UseSubscriptionReturn {
  // Status
  isProUser: boolean;
  isSubscribed: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  trialDaysRemaining: number;
  subscriptionStatus: SubscriptionStatus;

  // Customer Info
  customerInfo: CustomerInfo | null;
  activeEntitlements: string[];
  expirationDate: string | null;
  willRenew: boolean;
  productIdentifier: string | null;

  // Loading states
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  presentPaywall: (offering?: PurchasesOfferings) => Promise<boolean>;
  presentPaywallIfNeeded: () => Promise<boolean>;
  presentCustomerCenter: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  getOfferings: () => Promise<PurchasesOfferings | null>;
  checkEntitlement: (entitlementId?: string) => boolean;
  startTrial: () => void;
}

/**
 * Main hook for subscription management
 *
 * Combines RevenueCat SDK functionality with custom trial tracking
 * Provides all subscription-related actions and state
 */
export function useSubscription(): UseSubscriptionReturn {
  const { t } = useTranslation();
  const store = useSubscriptionStore();

  // Computed values
  const isProUser = store.isProUser();
  const isSubscribed = store.isSubscribed();
  const isTrialActive = store.isTrialActive();
  const isTrialExpired = store.isTrialExpired();
  const trialDaysRemaining = store.getTrialDaysRemaining();
  const activeEntitlement = store.getActiveEntitlement();

  const subscriptionStatus: SubscriptionStatus = useMemo(() => {
    if (isSubscribed) return 'pro';
    if (isTrialActive) return 'trial';
    return 'free';
  }, [isSubscribed, isTrialActive]);

  const activeEntitlements = useMemo(() => {
    if (!store.customerInfo) return [];
    return Object.keys(store.customerInfo.entitlements.active);
  }, [store.customerInfo]);

  /**
   * Present the RevenueCat paywall
   * Returns true if a purchase or restore was made
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
          // Refresh customer info after purchase/restore
          const info = await Purchases.getCustomerInfo();
          store.setCustomerInfo(info);
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
          onRestoreCompleted: ({ customerInfo }) => {
            console.log('[Subscription] Restore completed from Customer Center');
            store.setCustomerInfo(customerInfo);
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
   * Check if user has a specific entitlement
   */
  const checkEntitlement = useCallback((entitlementId: string = REVENUECAT_CONFIG.ENTITLEMENT_ID): boolean => {
    if (!store.customerInfo) return false;
    return typeof store.customerInfo.entitlements.active[entitlementId] !== 'undefined';
  }, [store.customerInfo]);

  /**
   * Start the free trial
   */
  const startTrial = useCallback(() => {
    store.startTrial();
  }, [store]);

  return {
    // Status
    isProUser,
    isSubscribed,
    isTrialActive,
    isTrialExpired,
    trialDaysRemaining,
    subscriptionStatus,

    // Customer Info
    customerInfo: store.customerInfo,
    activeEntitlements,
    expirationDate: store.getExpirationDate(),
    willRenew: store.willRenew(),
    productIdentifier: activeEntitlement?.productIdentifier ?? null,

    // Loading states
    isInitialized: store.isInitialized,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    presentPaywall,
    presentPaywallIfNeeded,
    presentCustomerCenter,
    restorePurchases,
    purchasePackage,
    getOfferings,
    checkEntitlement,
    startTrial,
  };
}
