# Global Modal (Root Level Modal) Architecture - Implementation Spec

## Overview

Transform the current architecture where each ProtectedRoute renders its own SubscriptionModal (7 instances) into a single global modal controlled by a centralized store. This prevents the "7 modals opening simultaneously" issue when returning from the subscription page.

## Files to Create/Modify

### 1. Create: `stores/paywallStore.ts`

**New file** - Global Zustand store for paywall state management

```typescript
// stores/paywallStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PaywallState {
  // Modal visibility state
  isOpen: boolean;
  
  // Trigger context (for analytics/tracking)
  triggerReason: string | null;
  triggerRoute: string | null;
  
  // Timestamp of last close (to prevent immediate re-opening)
  lastClosedAt: number | null;
  
  // Actions
  openPaywall: (reason?: string, route?: string) => void;
  closePaywall: () => void;
  canAutoReopen: boolean; // Flag to control auto-reopening behavior
  setCanAutoReopen: (value: boolean) => void;
}

// Debounce time (ms) to prevent rapid re-opening after paywall close
const PAYWALL_DEBOUNCE_MS = 2000;

export const usePaywallStore = create<PaywallState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      triggerReason: null,
      triggerRoute: null,
      lastClosedAt: null,
      canAutoReopen: true,
      
      openPaywall: (reason?: string, route?: string) => {
        const { isOpen, lastClosedAt } = get();
        
        // Prevent opening if already open
        if (isOpen) return;
        
        // Check debounce (prevent re-opening too quickly after closing)
        if (lastClosedAt) {
          const timeSinceClose = Date.now() - lastClosedAt;
          if (timeSinceClose < PAYWALL_DEBOUNCE_MS) {
            console.log(`[Paywall Store] Skipping open - closed ${timeSinceClose}ms ago (debounce: ${PAYWALL_DEBOUNCE_MS}ms)`);
            return;
          }
        }
        
        set({
          isOpen: true,
          triggerReason: reason || null,
          triggerRoute: route || null,
        });
        
        console.log(`[Paywall Store] Opening paywall - Reason: ${reason}, Route: ${route}`);
      },
      
      closePaywall: () => {
        set({
          isOpen: false,
          triggerReason: null,
          triggerRoute: null,
          lastClosedAt: Date.now(),
        });
        
        console.log('[Paywall Store] Closing paywall');
      },
      
      setCanAutoReopen: (value: boolean) => {
        set({ canAutoReopen: value });
        console.log(`[Paywall Store] Setting canAutoReopen: ${value}`);
      },
    }),
    {
      name: 'paywall-storage', // storage key
      partialize: (state) => ({
        // Only persist lastClosedAt, not modal state
        lastClosedAt: state.lastClosedAt,
        canAutoReopen: state.canAutoReopen,
      }),
    }
  )
);

// Selector hooks for convenience
export const usePaywallIsOpen = () => usePaywallStore((state) => state.isOpen);
export const usePaywallActions = () => ({
  open: usePaywallStore((state) => state.openPaywall),
  close: usePaywallStore((state) => state.closePaywall),
  setCanAutoReopen: usePaywallStore((state) => state.setCanAutoReopen),
});
```

### 2. Create: `components/subscription/GlobalSubscriptionModal.tsx`

**New file** - Single global instance of the subscription modal

```tsx
// components/subscription/GlobalSubscriptionModal.tsx
import { useEffect } from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, Button, Card } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { SubscriptionCard } from './SubscriptionCard';
import { usePaywallStore } from '@/stores/paywallStore';

/**
 * GlobalSubscriptionModal - Single global instance rendered at app root
 * Replaces per-tab SubscriptionModal instances
 */
export function GlobalSubscriptionModal() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isLoading } = useSubscription();
  
  // Global paywall state
  const { isOpen, triggerReason, closePaywall } = usePaywallStore();
  
  const handleUpgrade = () => {
    // Close the modal and navigate to subscription page
    closePaywall();
    // Navigation will be handled by router - the modal is at root
  };
  
  const handleClose = () => {
    closePaywall();
  };
  
  // Log for debugging
  useEffect(() => {
    if (isOpen) {
      console.log(`[GlobalSubscriptionModal] Modal opened - Reason: ${triggerReason}`);
    }
  }, [isOpen, triggerReason]);
  
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View style={styles.centeredView}>
          <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <Card style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
              {/* Content identical to original SubscriptionModal */}
              <View style={styles.cardContent}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name="crown"
                      size={32}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
                    {t('subscription.modal.title')}
                  </Text>
                </View>

                {/* Description */}
                <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                  {triggerReason
                    ? t('subscription.modal.featureDescription', { feature: triggerReason })
                    : t('subscription.modal.description')}
                </Text>

                {/* Current Subscription Status */}
                <View style={styles.statusContainer}>
                  <SubscriptionCard compact={false} showManageButton={false} />
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                  <Button
                    mode="contained"
                    onPress={handleUpgrade}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.upgradeButton}
                  >
                    {t('subscription.modal.upgradeNow')}
                  </Button>
                  <Button
                    mode="text"
                    onPress={handleClose}
                    disabled={isLoading}
                    style={styles.laterButton}
                    textColor={theme.colors.onSurfaceVariant}
                  >
                    {t('subscription.modal.maybeLater')}
                  </Button>
                </View>

                {/* Features Preview */}
                <View style={styles.featuresPreview}>
                  <Text variant="labelMedium" style={[styles.featuresTitle, { color: theme.colors.onSurfaceVariant }]}>
                    {t('subscription.modal.includes')}
                  </Text>
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="check" size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('subscription.features.unlimited')}
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="check" size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('subscription.features.advanced')}
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="check" size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('subscription.features.export')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

// Copy styles from SubscriptionModal.tsx
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    width: '100%',
    elevation: 8,
    borderRadius: 16,
  },
  cardContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 179, 209, 0.2)',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  statusContainer: {
    marginBottom: 24,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  upgradeButton: {
    marginBottom: 8,
  },
  laterButton: {
    alignSelf: 'center',
  },
  featuresPreview: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  featuresTitle: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    flex: 1,
  },
});
```

### 3. Update: `app/_layout.tsx`

**Add GlobalSubscriptionModal at root level**

```tsx
// app/_layout.tsx
import { GlobalSubscriptionModal } from '@/components/subscription/GlobalSubscriptionModal';

export default function RootLayout() {
  const { theme } = useTheme();
  const { themeMode } = useThemeStore();
  const isDark = themeMode === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppProviders>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="subscription"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
        </Stack>
        
        {/* Global Single Instance Modal - Renders once at root */}
        <GlobalSubscriptionModal />
      </AppProviders>
    </SafeAreaProvider>
  );
}
```

### 4. Refactor: `components/subscription/ProtectedRoute.tsx`

**Remove local modal rendering, use global store instead**

```tsx
// components/subscription/ProtectedRoute.tsx
import { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { usePaywallStore } from '@/stores/paywallStore';
import LoadingSpinner from '../LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  featureName?: string;
  requirePro?: boolean;
}

/**
 * ProtectedRoute - HOC that protects routes requiring subscription
 * Uses global paywall store to trigger single modal instance
 * 
 * @example
 * <ProtectedRoute featureName="Pet Management">
 *   <ActualScreenContent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children, featureName, requirePro = true }: ProtectedRouteProps) {
  const {
    isProUser,
    isLoading: isSubscriptionLoading,
    refreshSubscriptionStatus,
    isStatusLoading,
  } = useSubscription();
  
  const { openPaywall } = usePaywallStore();
  const router = useRouter();

  // Refresh subscription status and check on tab focus
  useFocusEffect(
    useCallback(() => {
      // Skip if on subscription page
      if (router.pathname === '/subscription') return;
      
      // Refresh status but don't open modal if loading
      if (!isSubscriptionLoading) {
        refreshSubscriptionStatus();
      }
    }, [refreshSubscriptionStatus, isSubscriptionLoading, router.pathname])
  );

  // Control global modal based on subscription status
  useEffect(() => {
    // Skip if on subscription page
    if (router.pathname === '/subscription') return;
    
    // Don't do anything while loading
    if (isSubscriptionLoading || isStatusLoading) return;
    
    // Only trigger if we require Pro and user doesn't have it
    if (requirePro && !isProUser) {
      console.log(`[ProtectedRoute] Triggering paywall - Feature: ${featureName}`);
      openPaywall(featureName, router.pathname || 'unknown');
    }
  }, [
    isProUser,
    isSubscriptionLoading,
    isStatusLoading,
    requirePro,
    openPaywall,
    featureName,
    router.pathname,
  ]);

  // Show loading while checking subscription status
  if (isSubscriptionLoading || isStatusLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  // Render content - modal is handled globally
  // Content will be hidden/overlaid by global modal if needed
  return (
    <View style={styles.container} pointerEvents={requirePro && !isProUser ? 'none' : 'auto'}>
      {children}
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
    opacity: requirePro && !isPro ? 0.5 : 1, // Optionally fade content when blocked
  },
});
```

### 5. Mark as Deprecated: `components/subscription/SubscriptionModal.tsx`

**Keep for backward compatibility but mark as deprecated**

```typescript
// components/subscription/SubscriptionModal.tsx

/**
 * @deprecated Use GlobalSubscriptionModal instead - renders single instance at app root
 * This component is kept for backward compatibility but will be removed in v2.0
 */
```

## Testing Checklist

- [ ] Return from subscription page via Android back button - only 1 modal opens (not 7)
- [ ] All 7 tab routes (pets, health, calendar, feeding, expenses, budgets, home) properly protected
- [ ] Modal doesn't rapidly re-open when switching tabs quickly
- [ ] Subscription status refreshes correctly when returning from paywall
- [ ] Modal trigger reason/route tracking works correctly
- [ ] Navigation to `/subscription` page still works from global modal
- [ ] Settings tab not affected (doesn't use ProtectedRoute)

## Benefits

1. **Singleton Pattern**: Only 1 modal instance ever renders, physically preventing the stacking issue
2. **Performance**: No memory overhead from 7 modal instances in tab screens
3. **Simplified State**: Single source of truth via Zustand store
4. **Maintainability**: Easier to modify paywall behavior in one place
5. **Extensibility**: Easy to trigger paywall from anywhere with `openPaywall()`

## Deployment Notes

- This is a non-breaking refactor - all existing functionality preserved
- Can be deployed immediately after testing
- Consider removing SubscriptionModal.tsx in a future major version