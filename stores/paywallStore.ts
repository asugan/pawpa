import { create } from 'zustand';
import { StateCreator } from 'zustand';

/**
 * PaywallStore - Global state management for subscription paywall
 *
 * This store manages the global paywall modal state across the entire application.
 * It ensures only one paywall modal instance is active at any time and provides
 * race condition protection for rapid navigation scenarios.
 *
 * ## Key Design Principles
 *
 * ### Non-Persistent State
 * - Store is NOT persisted to AsyncStorage (FR-007 requirement)
 * - State resets on app restart to prevent stale subscription states
 * - Fresh subscription validation on each app session
 *
 * ### Race Condition Protection
 * - Prevents duplicate modal triggers for same feature/route combination
 * - Handles rapid tab switching without state corruption
 * - Validates inputs before state changes
 *
 * ### Cleanup Strategy
 * - Automatic state cleanup on modal close
 * - Component-level cleanup on unmount
 * - Global reset capability for error recovery
 */
interface PaywallState {
  /** Modal visibility state - whether paywall is currently visible */
  isOpen: boolean;

  /** Feature name triggering the paywall (e.g., "petManagement", "homeDashboard") */
  triggerReason: string | null;

  /** Route path where paywall was triggered (e.g., "/pets", "/calendar") */
  triggerRoute: string | null;

  /** Opens paywall modal with context and validation */
  openPaywall: (reason?: string, route?: string) => void;

  /** Closes paywall and cleans up all related state */
  closePaywall: () => void;

  /** Complete store reset - used for error recovery and testing */
  resetStore: () => void;
}

/**
 * Store implementation with race condition protection and state validation
 */
const storeApi: StateCreator<PaywallState> = (set) => ({
  isOpen: false,
  triggerReason: null,
  triggerRoute: null,

  /**
   * Opens paywall modal with context validation and duplicate prevention
   *
   * Race Condition Protection:
   * - Validates reason parameter is provided
   * - Prevents duplicate opens for same feature/route when already open
   * - Maintains atomic state updates
   *
   * @param reason Feature name triggering paywall (required)
   * @param route Navigation route path where triggered (optional)
   */
  openPaywall: (reason?: string, route?: string) => {
    // State validation: prevent invalid states (FR-007)
    if (!reason) {
      console.warn('[Paywall Store] Attempted to open paywall without reason - blocking');
      return;
    }

    set((state) => {
      // Prevent duplicate triggers for same feature/route combination
      // Critical for rapid navigation scenarios (T043 validation)
      if (state.triggerReason === reason && state.triggerRoute === route && state.isOpen) {
        console.log(`[Paywall Store] Skipping duplicate open - Reason: ${reason}, Route: ${route}`);
        return state; // Don't update state to prevent re-renders
      }

      return {
        isOpen: true,
        triggerReason: reason,
        triggerRoute: route,
      };
    });

    console.log(`[Paywall Store] Opening paywall - Reason: ${reason}, Route: ${route}`);
  },

  /**
   * Closes paywall modal with complete state cleanup
   *
   * Cleanup Strategy:
   * - Clears all modal state (isOpen, triggerReason, triggerRoute)
   * - Ensures no modal residue on next navigation
   * - Maintains consistency with ProtectedRoute cleanup
   */
  closePaywall: () => {
    set((state) => {
      // Log current state for debugging rapid navigation scenarios
      console.log(`[Paywall Store] Closing paywall - Current: ${state.triggerReason}, Route: ${state.triggerRoute}`);

      // Always clean up state on close (FR-007 requirement)
      return {
        isOpen: false,
        triggerReason: null,
        triggerRoute: null,
      };
    });

    console.log('[Paywall Store] Paywall closed and state cleaned');
  },

  /**
   * Complete store reset for error recovery and testing scenarios
   *
   * Usage:
   * - Error recovery from invalid states
   * - Test isolation between scenarios
   * - Development debugging
   */
  resetStore: () => {
    set({
      isOpen: false,
      triggerReason: null,
      triggerRoute: null,
    });

    console.log('[Paywall Store] Resetting store state');
  },
});

export const usePaywallStore = create<PaywallState>()(storeApi);

/**
 * Convenience selector hooks for optimized component re-renders
 *
 * These hooks prevent unnecessary component re-renders by selecting
 * only the specific state slice needed by the component.
 */

/** Returns only the modal visibility state */
export const usePaywallIsOpen = () => usePaywallStore((state) => state.isOpen);

/** Returns only the action methods (open/close) */
export const usePaywallActions = () => ({
  open: usePaywallStore((state) => state.openPaywall),
  close: usePaywallStore((state) => state.closePaywall),
});
