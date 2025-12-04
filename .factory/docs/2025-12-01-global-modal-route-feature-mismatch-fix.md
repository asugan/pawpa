# Global Modal Bug Fix - Route/Feature Mismatch

## Problem Identified from Logs
Log shows: `[Paywall Store] Opening paywall - Reason: Home, Route: /feeding`
- **Major Bug**: Feeding tab shows "Home" as feature name
- Route and feature name don't match
- Previous tab's reason is persisting in store

## Root Cause
1. `triggerReason` state persists in Zustand store across tab switches
2. Multiple ProtectedRoute instances render simultaneously
3. Last rendered tab (Home) overwrites the reason
4. When user navigates to Feeding tab, old "Home" reason still shows

## Solution

### 1. Clear State on Tab Focus
```typescript
// ProtectedRoute.tsx - Add cleanup effect
useFocusEffect(
  useCallback(() => {
    // Clear any existing paywall when tab gains focus
    if (pathname !== '/subscription') {
      closePaywall();
    }
    
    // Then check subscription and open if needed
    if (!isSubscriptionLoading && requirePro && !isProUser) {
      openPaywall(featureName, pathname);
    }
  }, [pathname, isSubscriptionLoading, isProUser, requirePro, featureName])
);
```

### 2. Add Debug Logs
Add detailed logging to trace:
- Which tab is rendering
- What feature name is passed
- What pathname is detected
- What values are in store

### 3. Verify Tab-Specific Features
Ensure each tab has unique feature names:
- Home: `t('subscription.features.home')` or `t('navigation.home')`
- Pets: `t('subscription.features.petManagement')`
- Health: `t('subscription.features.healthRecords')`
- Calendar: `t('subscription.features.calendar')`
- Feeding: `t('subscription.features.feeding')`
- Expenses: `t('subscription.features.expenses')`
- Budgets: `t('subscription.features.budgets')`

## Files to Modify
1. `components/subscription/ProtectedRoute.tsx` - Add cleanup logic and enhanced logging
2. `stores/paywallStore.ts` - Consider adding `clearTrigger` action
3. All tab files - Verify featureName props are unique and correct

## Expected Behavior
When on `/feeding` tab: `[Paywall Store] Opening paywall - Reason: Feeding Schedules, Route: /feeding`
When on `/pets` tab: `[Paywall Store] Opening paywall - Reason: Pet Management, Route: /pets`