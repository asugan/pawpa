import { useEffect, useCallback, useRef } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Migration key to track if we've migrated from local trial storage
const TRIAL_MIGRATION_KEY = 'trial_migration_v2_done';

/**
 * SubscriptionProvider handles RevenueCat SDK lifecycle and subscription status
 *
 * Backend-first approach:
 * 1. Initialize RevenueCat SDK on mount
 * 2. Sync user identity when auth state changes (login/logout)
 * 3. Listen for CustomerInfo updates (for purchases)
 * 4. Fetch subscription status from backend
 * 5. Auto-start trial for new users
 */
export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user, isAuthenticated, isPending } = useAuth();
  const {
    setCustomerInfo,
    setInitialized,
    setLoading,
    setError,
    fetchSubscriptionStatus,
    startTrial,
    subscriptionStatus,
    canStartTrial,
    isInitialized,
  } = useSubscriptionStore();

  // Track if we've started trial initialization to prevent double-calls
  const trialInitRef = useRef(false);

  // Track trial activation state to prevent race conditions
  const isActivatingTrialRef = useRef(false);

  /**
   * Handle CustomerInfo updates from RevenueCat
   * After update, also refresh backend status
   * Uses rate-limited refresh to prevent loops
   */
  const handleCustomerInfoUpdate = useCallback(async (info: CustomerInfo) => {
    console.log('[SubscriptionProvider] CustomerInfo updated');
    setCustomerInfo(info);
    // Refresh backend status when RevenueCat info changes
    // Note: refreshSubscriptionStatus has built-in rate limiting
    if (isAuthenticated) {
      await fetchSubscriptionStatus();
    }
  }, [setCustomerInfo, fetchSubscriptionStatus, isAuthenticated]);

  /**
   * Migrate from local trial storage to backend
   * This clears the old local trial data
   */
  const migrateLocalTrialStorage = useCallback(async () => {
    try {
      const migrated = await AsyncStorage.getItem(TRIAL_MIGRATION_KEY);
      if (migrated) {
        console.log('[SubscriptionProvider] Trial migration already done');
        return;
      }

      // Clear old subscription storage (local trial data)
      await AsyncStorage.removeItem('subscription-storage');
      await AsyncStorage.setItem(TRIAL_MIGRATION_KEY, 'true');

      console.log('[SubscriptionProvider] Migrated from local trial storage');
    } catch (error) {
      console.error('[SubscriptionProvider] Migration error:', error);
    }
  }, []);

  /**
   * Initialize subscription status from backend
   * For new users (canStartTrial = true), auto-start trial
   * Only runs when user is authenticated
   */
  const initializeSubscriptionStatus = useCallback(async () => {
    if (trialInitRef.current || !isAuthenticated || isPending) {
      return;
    }
    trialInitRef.current = true;

    try {
      console.log('[SubscriptionProvider] Initializing subscription status for authenticated user');

      // Fetch current subscription status from backend
      await fetchSubscriptionStatus();

      // Get updated state after fetch
      const currentStatus = useSubscriptionStore.getState().subscriptionStatus;

      // If user can start a trial (new user, device not used before), auto-start it
      if (currentStatus?.canStartTrial && !isActivatingTrialRef.current) {
        console.log('[SubscriptionProvider] New user detected, starting trial...');
        isActivatingTrialRef.current = true;

        const success = await startTrial();

        if (success) {
          // Immediate refresh without rate limiting using the store method
          const store = useSubscriptionStore.getState();
          await store.fetchSubscriptionStatus();
        }

        isActivatingTrialRef.current = false;
      }
    } catch (error) {
      console.error('[SubscriptionProvider] Error initializing subscription status:', error);
      isActivatingTrialRef.current = false;
      // Don't rethrow - allow app to continue even if subscription check fails
    }
  }, [isAuthenticated, isPending, fetchSubscriptionStatus, startTrial]);

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

      // Migrate local trial storage first
      await migrateLocalTrialStorage();

      // Initialize with user ID if authenticated
      const userId = isAuthenticated ? user?.id ?? null : null;
      await initializeRevenueCat(userId);

      // Get initial customer info (for purchases)
      const customerInfo = await getCustomerInfo();
      setCustomerInfo(customerInfo);

      setInitialized(true);
      console.log('[SubscriptionProvider] SDK initialized successfully');

      // Initialize subscription status from backend after SDK is ready
      if (isAuthenticated) {
        await initializeSubscriptionStatus();
      }
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
    setCustomerInfo,
    setInitialized,
    setLoading,
    setError,
    migrateLocalTrialStorage,
    initializeSubscriptionStatus,
  ]);

  /**
   * Handle user login - sync identity with RevenueCat and fetch subscription status
   * Includes guard to prevent duplicate calls
   */
  const handleUserLogin = useCallback(async () => {
    if (!user?.id || !isAuthenticated) return;

    // Prevent duplicate calls - only sync once per login session
    if (isInitialized) {
      console.log('[SubscriptionProvider] User already logged in, skipping duplicate sync');
      return;
    }

    try {
      setLoading(true);
      console.log('[SubscriptionProvider] Syncing user identity:', user.id);

      const customerInfo = await syncUserIdentity(user.id);
      setCustomerInfo(customerInfo);

      // Fetch subscription status from backend after login
      await initializeSubscriptionStatus();

      console.log('[SubscriptionProvider] User identity synced');
    } catch (error) {
      console.error('[SubscriptionProvider] Error syncing user identity:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated, isInitialized, setCustomerInfo, setLoading, setError, initializeSubscriptionStatus]);

  /**
   * Handle user logout - reset to anonymous
   */
  const handleUserLogout = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[SubscriptionProvider] Resetting user identity');

      const customerInfo = await resetUserIdentity();
      setCustomerInfo(customerInfo);

      // Reset trial init flag for next login
      trialInitRef.current = false;

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

    // Only initialize SDK if user will potentially access subscription features
    // Skip initialization entirely for unauthenticated users to prevent unnecessary API calls
    if (!isAuthenticated) {
      console.log('[SubscriptionProvider] Skipping SDK initialization - user not authenticated');
      return;
    }

    initializeSDK();
  }, [isPending, isAuthenticated, initializeSDK]);

  // Handle auth state changes (login/logout)
  useEffect(() => {
    if (!isInitialized || isPending) {
      return;
    }

    // Note: We handle identity sync, but only after initial SDK setup
    // The initializeSDK already handles the initial user ID
  }, [isAuthenticated, isInitialized, isPending]);

  // Set up CustomerInfo update listener (runs once after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    console.log('[SubscriptionProvider] Setting up CustomerInfo listener');

    // Defer listener setup to next tick to avoid race condition
    // This prevents the customLogHandler error during SDK initialization
    const setupTimer = setTimeout(() => {
      Purchases.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);
    }, 100); // Increased delay to ensure SDK is fully ready

    return () => {
      console.log('[SubscriptionProvider] Removing CustomerInfo listener');
      clearTimeout(setupTimer);
      Purchases.removeCustomerInfoUpdateListener(handleCustomerInfoUpdate);
    };
    // Note: handleCustomerInfoUpdate is stable due to useCallback with proper deps
  }, [isInitialized]); // Removed handleCustomerInfoUpdate from deps to prevent re-registration

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
