import { useEffect, useCallback } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { useAuth } from '@/lib/auth';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import {
  initializeRevenueCat,
  syncUserIdentity,
  resetUserIdentity,
  getCustomerInfo,
} from '@/lib/revenuecat';

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

/**
 * SubscriptionProvider handles RevenueCat SDK lifecycle and user identity sync
 *
 * Responsibilities:
 * 1. Initialize RevenueCat SDK on mount
 * 2. Sync user identity when auth state changes (login/logout)
 * 3. Listen for CustomerInfo updates
 * 4. Start trial for new users
 */
export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user, isAuthenticated, isPending } = useAuth();
  const {
    setCustomerInfo,
    setInitialized,
    setLoading,
    setError,
    startTrial,
    trialStartDate,
    isInitialized,
  } = useSubscriptionStore();

  /**
   * Handle CustomerInfo updates from RevenueCat
   */
  const handleCustomerInfoUpdate = useCallback((info: CustomerInfo) => {
    console.log('[SubscriptionProvider] CustomerInfo updated');
    setCustomerInfo(info);
  }, [setCustomerInfo]);

  /**
   * Initialize the SDK
   */
  const initializeSDK = useCallback(async () => {
    if (isInitialized) {
      console.log('[SubscriptionProvider] SDK already initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Initialize with user ID if authenticated
      const userId = isAuthenticated ? user?.id ?? null : null;
      await initializeRevenueCat(userId);

      // Get initial customer info
      const customerInfo = await getCustomerInfo();
      setCustomerInfo(customerInfo);

      // Start trial for new users (if not already started)
      if (!trialStartDate) {
        startTrial();
      }

      setInitialized(true);
      console.log('[SubscriptionProvider] SDK initialized successfully');
    } catch (error) {
      console.error('[SubscriptionProvider] SDK initialization error:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [
    isInitialized,
    isAuthenticated,
    user?.id,
    trialStartDate,
    setCustomerInfo,
    setInitialized,
    setLoading,
    setError,
    startTrial,
  ]);

  /**
   * Handle user login - sync identity with RevenueCat
   */
  const handleUserLogin = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('[SubscriptionProvider] Syncing user identity:', user.id);

      const customerInfo = await syncUserIdentity(user.id);
      setCustomerInfo(customerInfo);

      console.log('[SubscriptionProvider] User identity synced');
    } catch (error) {
      console.error('[SubscriptionProvider] Error syncing user identity:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, setCustomerInfo, setLoading, setError]);

  /**
   * Handle user logout - reset to anonymous
   */
  const handleUserLogout = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[SubscriptionProvider] Resetting user identity');

      const customerInfo = await resetUserIdentity();
      setCustomerInfo(customerInfo);

      console.log('[SubscriptionProvider] Reset to anonymous user');
    } catch (error) {
      console.error('[SubscriptionProvider] Error resetting user identity:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [setCustomerInfo, setLoading, setError]);

  // Initialize SDK after auth state is determined
  useEffect(() => {
    if (isPending) {
      // Wait for auth state to be determined
      return;
    }

    initializeSDK();
  }, [isPending, initializeSDK]);

  // Handle auth state changes (login/logout)
  useEffect(() => {
    if (!isInitialized || isPending) {
      return;
    }

    // Note: We handle identity sync, but only after initial SDK setup
    // The initializeSDK already handles the initial user ID
  }, [isAuthenticated, isInitialized, isPending]);

  // Set up CustomerInfo update listener
  useEffect(() => {
    if (!isInitialized) return;

    console.log('[SubscriptionProvider] Setting up CustomerInfo listener');

    // Add listener for real-time updates
    Purchases.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);

    return () => {
      console.log('[SubscriptionProvider] Removing CustomerInfo listener');
      Purchases.removeCustomerInfoUpdateListener(handleCustomerInfoUpdate);
    };
  }, [isInitialized, handleCustomerInfoUpdate]);

  // Handle explicit login (when user signs in after initial load)
  useEffect(() => {
    if (!isInitialized || isPending) return;

    // If SDK is initialized and user just logged in, sync identity
    if (isAuthenticated && user?.id) {
      // Only sync if we haven't already (check if current RevenueCat user matches)
      handleUserLogin();
    }
  }, [isAuthenticated, user?.id, isInitialized, isPending, handleUserLogin]);

  return <>{children}</>;
}
