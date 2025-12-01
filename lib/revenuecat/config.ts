/**
 * RevenueCat configuration constants
 */
export const REVENUECAT_CONFIG = {
  /**
   * RevenueCat API Key
   * This is a public SDK key that can be safely included in the app
   */
  API_KEY: 'test_VSghWTpnyhxbgOfFxUIFCwIigFM',

  /**
   * Entitlement identifier for Pro access
   * Must match the entitlement ID configured in RevenueCat dashboard
   */
  ENTITLEMENT_ID: 'Dekadans Technology Pro',

  /**
   * Product identifiers
   * Must match the product IDs configured in App Store Connect / Google Play Console
   */
  PRODUCTS: {
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
  },

  /**
   * Free trial duration in days (custom trial without credit card)
   * Note: This is now managed by the backend, this value is kept for reference
   */
  TRIAL_DURATION_DAYS: 3,
} as const;

/**
 * Type for product identifiers
 */
export type ProductId = (typeof REVENUECAT_CONFIG.PRODUCTS)[keyof typeof REVENUECAT_CONFIG.PRODUCTS];
