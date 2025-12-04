import { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect, usePathname } from 'expo-router';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { usePaywallStore } from '@/stores/paywallStore';
import LoadingSpinner from '../LoadingSpinner';
import { UpgradePrompt } from './UpgradePrompt';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Human-readable feature name for paywall messaging and upgrade prompts
   * Maps to translation keys in locales (e.g., "petManagement", "homeDashboard")
   */
  featureName?: string;
  /**
   * Whether this route requires Pro subscription
   * @default true
   */
  requirePro?: boolean;
  /**
   * Dual-mode behavior for free users:
   * - true: Show paywall modal (homepage mode)
   * - false: Show content blocking with inline upgrade button (tab mode)
   * @default true
   */
  showPaywall?: boolean;
}

/**
 * ProtectedRoute - Dual-mode subscription protection component
 *
 * This HOC protects routes requiring Pro subscription with two distinct behaviors
 * to prevent modal fatigue while maintaining conversion opportunities:
 *
 * ## Dual Mode Behavior
 *
 * ### Modal Mode (`showPaywall=true`)
 * - Usage: Homepage and onboarding flows
 * - Behavior: Shows paywall modal for free users
 * - Feature: Specific messaging per feature name
 * - Prevents: Content access until upgrade
 *
 * ### Blocking Mode (`showPaywall=false`)
 * - Usage: Tab navigation (Pets, Health, Calendar, etc.)
 * - Behavior: Shows content with visual blocking + inline upgrade prompt
 * - Goal: Prevents modal fatigue while allowing content exploration
 * - Accessibility: Reduced opacity content with upgrade CTA
 *
 * ## Key Features
 *
 * - **Race Condition Protection**: Prevents duplicate triggers during rapid navigation
 * - **State Cleanup**: Automatic cleanup on tab switch/uncmount
 * - **Performance Optimized**: Loading states and efficient re-renders
 * - **Feature-Specific Messaging**: Contextual upgrade prompts per feature
 * - **Network-Aware**: Handles loading states during subscription status checks
 *
 * @example Modal Mode (Homepage)
 * <ProtectedRoute featureName="homeDashboard" showPaywall={true}>
 *   <HomeDashboardContent />
 * </ProtectedRoute>
 *
 * @example Blocking Mode (Tab)
 * <ProtectedRoute featureName="petManagement" showPaywall={false}>
 *   <PetListScreen />
 * </ProtectedRoute>
 *
 * ## Translation Key Mapping
 *
 * featureName values map to translation keys:
 * - "homeDashboard" → features.homeDashboard
 * - "petManagement" → features.petManagement
 * - "healthRecords" → features.healthRecords
 * - "calendar" → features.calendar
 * - "feedingSchedule" → features.feedingSchedule
 * - "expenses" → features.expenses
 * - "budgets" → features.budgets
 */
export function ProtectedRoute({ children, featureName, requirePro = true, showPaywall = true }: ProtectedRouteProps) {
  const {
    isProUser,
    isLoading: isSubscriptionLoading,
    refreshSubscriptionStatus,
    isStatusLoading,
  } = useSubscription();
  
  const { openPaywall, closePaywall } = usePaywallStore();
  const currentTriggerReason = usePaywallStore((state) => state.triggerReason);
  const pathname = usePathname();

  // Debug: Log initial props and tab focus
  useEffect(() => {
    console.log(`[ProtectedRoute] Mounted - Feature: ${featureName}, Pathname: ${pathname}, requirePro: ${requirePro}`);
  }, [featureName, pathname, requirePro]);

  // Refresh subscription status and check on tab focus
  useFocusEffect(
    useCallback(() => {
      console.log(`[ProtectedRoute] Tab focused - Pathname: ${pathname}, Feature: ${featureName}`);
      
      // Skip if on subscription page
      if (pathname === '/subscription') return;
      
      // Refresh status but don't open modal if loading
      if (!isSubscriptionLoading) {
        refreshSubscriptionStatus();
      }
    }, [refreshSubscriptionStatus, isSubscriptionLoading, pathname, featureName])
  );

  // Control global modal based on subscription status
  useEffect(() => {
    // Skip if on subscription page
    if (pathname === '/subscription') return;

    // Don't do anything while loading
    if (isSubscriptionLoading || isStatusLoading) return;

    // State validation: prevent race conditions
    if (!featureName) return;

    // Only trigger if we require Pro and user doesn't have it
    if (requirePro && !isProUser) {
      // Additional race condition protection: check if we're already on this route
      // Prevent multiple triggers for the same feature on the same route
      if (currentTriggerReason === featureName && pathname === usePaywallStore.getState().triggerRoute) {
        console.log(`[ProtectedRoute] Skipping duplicate trigger - Feature: ${featureName}, Route: ${pathname}`);
        return;
      }

      console.log(`[ProtectedRoute] Triggering paywall - Feature: ${featureName}, Route: ${pathname}, showPaywall: ${showPaywall}`);
      // Only open modal if showPaywall is true
      if (showPaywall) {
        openPaywall(featureName, pathname || 'unknown');
      }
    } else {
      console.log(`[ProtectedRoute] Skipping paywall - isPro: ${isProUser}, requirePro: ${requirePro}, Pathname: ${pathname}, showPaywall: ${showPaywall}`);

      // Clean up if user is Pro but modal is still open for this feature
      if (isProUser && currentTriggerReason === featureName) {
        console.log(`[ProtectedRoute] Cleaning up modal for Pro user - Feature: ${featureName}`);
        closePaywall();
      }
    }
  }, [
    isProUser,
    isSubscriptionLoading,
    isStatusLoading,
    requirePro,
    showPaywall,
    openPaywall,
    closePaywall,
    featureName,
    pathname,
    currentTriggerReason,
  ]);

  // Cleanup: Clear store if this tab's feature was the trigger reason
  useEffect(() => {
    return () => {
      // When component unmounts (tab switch), cleanup if this was the trigger
      // Add race condition protection: ensure consistent state
      const currentState = usePaywallStore.getState();
      console.log(`[ProtectedRoute] Cleanup check - Feature: ${featureName}, Store Reason: ${currentState.triggerReason}`);

      // Only cleanup if this component was the trigger and we're not racing with another tab
      if (currentState.triggerReason === featureName && currentState.triggerRoute === pathname) {
        console.log(`[ProtectedRoute] Cleaning up store - ${featureName} unmounting from route: ${pathname}`);
        closePaywall();
      }
    };
  }, [featureName, pathname, closePaywall]);

  // Show loading while checking subscription status
  if (isSubscriptionLoading || isStatusLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  // In blocking mode (showPaywall=false) without access: show children with visual blocking + upgrade prompt
  const isBlocked = requirePro && !isProUser && !showPaywall;

  return (
    <View style={[styles.container, isBlocked && styles.blockedContainer]} pointerEvents={isBlocked ? 'none' : 'auto'}>
      {children}
      {/* Show upgrade prompt overlay when in blocking mode and user doesn't have access */}
      {isBlocked && featureName && (
        <View style={styles.upgradeOverlay} pointerEvents="box-none">
          <View style={styles.upgradeContainer} pointerEvents="box-none">
            <UpgradePrompt feature={featureName} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  blockedContainer: {
    opacity: 0.3, // Fade content when blocked for better visual distinction
  },
  upgradeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeContainer: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 16,
  },
});
