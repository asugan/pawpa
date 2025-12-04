# Global Modal Race Condition Fix

## Problem
From user: "hala diğer tableri home olarak algılıyor modalda"

### Root Cause - Multi-Tab Race Condition
1. **All ProtectedRoute instances use same global store**
2. Last rendered tab (Home) overwrites store with its values
3. Other tabs render with stale "Home Dashboard" reason
4. Store acts like singleton, but multiple components compete

### Current Flow (Broken)
```
1. /pets renders → sets "Pet Management" → opens modal ✓
2. /health renders → sets "Health Records" → opens modal ✓
3. / (home) renders LAST → overwrites with "Home Dashboard" → shows in modal ✗
```

## Solution: Tab-Specific State Tracking

### Option A: Store Cleanup on Tab Blur (Recommended)
Each ProtectedRoute cleans up its own trigger on unmount/tab switch:

```typescript
// ProtectedRoute.tsx
useEffect(() => {
  return () => {
    // Cleanup: Clear if this tab's feature was the trigger
    if (triggerReason === featureName) {
      closePaywall();
    }
  };
}, [triggerReason, featureName]);
```

### Option B: Tab-Specific Store Keys (Alternative)
Store tracks multiple tabs:
```typescript
interface PaywallState {
  activeTriggers: Array<{reason: string, route: string, timestamp: number}>;
  isOpen: boolean;
}
```

### Option C: Immediate Open, No Persist (Simpler)
```typescript
// Don't persist triggerReason/triggerRoute in store
// Always pass fresh values when opening
openPaywall(featureName, pathname); // transient, not persisted
```

## Implementation: Option A (Cleanup on Unmount)

### Changes to ProtectedRoute.tsx
1. Add cleanup effect that clears store if this tab triggered it
2. Prevent race by cleaning up on component unmount/tab switch
3. Keep existing logic, just add cleanup

```typescript
// Add this cleanup effect
useEffect(() => {
  return () => {
    // If this component's feature was the trigger, clear it
    if (triggerReason === featureName) {
      console.log(`[ProtectedRoute] Cleaning up - ${featureName}`);
      closePaywall();
    }
  };
}, [triggerReason, featureName, closePaywall]);
```

### Expected Behavior
```
1. Navigate to /health → "Health Records" triggers → modal opens
2. Navigate to /pets → Health component unmounts → clears "Health Records"
3. Pets component mounts → "Pet Management" triggers → modal opens
4. Navigate back to /health → Pets unmounts → clears "Pet Management"
5. Health mounts → "Health Records" triggers → modal opens ✓
```

## Files to Modify
1. `components/subscription/ProtectedRoute.tsx` - Add cleanup effect
2. `stores/paywallStore.ts` - Consider making triggerReason non-persistent

## Key Insight
The problem isn't debounce - it's **state persistence across tabs**. Each tab thinks it's the one that should control the global modal, and the last one wins. We need per-tab cleanup.