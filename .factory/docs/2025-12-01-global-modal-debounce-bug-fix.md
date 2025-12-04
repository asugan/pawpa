# Global Modal Debounce Bug Fix

## Problem from Logs
Modal doesn't open after tab switch:
```
[Paywall Store] Skipping open - closed 353ms ago (debounce: 2000ms)
```

## Root Cause
- `useFocusEffect` calls `closePaywall()` on every tab switch
- `closePaywall()` sets `lastClosedAt` timestamp
- `openPaywall()` debounce prevents opening for 2000ms
- Result: Modal NEVER opens on tab switch

## Solution
**Remove `closePaywall()` from tab focus effect**

### Changed Logic
```typescript
// ProtectedRoute.tsx - Remove closePaywall() call
useFocusEffect(
  useCallback(() => {
    console.log(`[ProtectedRoute] Tab focused - Pathname: ${pathname}, Feature: ${featureName}`);
    
    if (pathname === '/subscription') return;
    
    // ❌ REMOVE THIS: closePaywall();
    
    if (!isSubscriptionLoading) {
      refreshSubscriptionStatus();
    }
  }, [...])
);
```

### Why This Works
- Tab switch should NOT close paywall (nothing is open yet)
- `openPaywall()` handles debounce for rapid re-opens (e.g., back button)
- Tab switches are intentional navigation, not rapid re-open

## Files to Modify
1. `components/subscription/ProtectedRoute.tsx` - Remove `closePaywall()` from useFocusEffect

## Expected Behavior
1. User navigates to `/health` tab
2. ProtectedRoute triggers: `openPaywall('Health Records', '/health')`
3. Modal opens immediately (no debounce block)
4. User closes modal
5. User clicks back button within 2s: Debounce prevents re-open ✓