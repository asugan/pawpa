# Research Findings: Subscription Paywall Best Practices

**Feature**: Subscription Paywall System Best Practices Implementation
**Date**: 2025-12-04
**Research Focus**: RevenueCat integration patterns, modal vs content blocking strategies, Zustand state management best practices

## Research Tasks

### RevenueCat Best Practices

**Decision**: Use existing RevenueCat implementation with `refreshSubscriptionStatus()` on tab focus

**Rationale**:
- Feature spec requires subscription status to be current when navigating between tabs
- Existing codebase already has RevenueCat integration via `react-native-purchases`
- RevenueCat SDK automatically caches subscription status locally
- Best practice is to validate status on navigation events rather than continuous polling
- Using `useFocusEffect` with tab navigation ensures status is checked when user returns to tab

**Implementation Pattern**:
```typescript
// In ProtectedRoute component
useFocusEffect(
  useCallback(() => {
    refreshSubscriptionStatus();
    return () => {
      // Cleanup logic to prevent race conditions
    };
  }, [])
);
```

**Sources**:
- RevenueCat React Native documentation on subscription verification
- Existing PawPa implementation in `stores/paywallStore.ts`

### Modal vs Content Blocking Strategy

**Decision**: Dual-mode paywall system
- Homepage: Modal triggered (`showPaywall=true`)
- Tab screens: Content blocking with inline upgrade prompt (`showPaywall=false`)

**Rationale**:
- Prevents "modal fatigue" when users explore tabs
- Users can see what features exist (incentive to upgrade)
- Modal on homepage is primary conversion point
- Content blocking maintains consistent app structure

**Alternative Considered**:
- Modal on all blocked screens (REJECTED: poor UX, interrupts navigation flow)
- Hide tabs completely (REJECTED: reduces discoverability of Pro features)

**Implementation**:
```typescript
// ProtectedRoute component
interface ProtectedRouteProps {
  featureName: string;
  showPaywall?: boolean; // true = modal, false = content blocking
  children: React.ReactNode;
}
```

### State Management Approach

**Decision**: Zustand paywall store with transient state (non-persistent)

**Rationale**:
- Store already exists at `stores/paywallStore.ts`
- Modal state should not persist across app restarts (FR-008 requirement)
- Zustand's transient state (without persistence middleware) is appropriate
- Cleanup on unmount prevents state conflicts (FR-007 requirement)

**Alternative Considered**:
- React Context (REJECTED: unnecessary for simple global state, already using Zustand)
- AsyncStorage persistence (REJECTED: violates FR-008, modal should not persist)

**Memory Management**:
```typescript
// Cleanup to prevent race conditions
useEffect(() => {
  return () => {
    clearPaywallStore(); // Reset state on unmount
  };
}, []);
```

## Decisions Summary

| Aspect | Decision | Justification |
|--------|----------|---------------|
| Subscription verification | On tab focus via `useFocusEffect` | Ensures current status without excessive polling |
| Homepage paywall | Modal triggered | Primary conversion point, explicit user action to upgrade |
| Tab screen paywall | Content blocking with inline upgrade | Prevents modal fatigue, maintains navigation flow |
| State persistence | Transient Zustand store | Modal state should not persist, cleanup on unmount |
| Tab naming fix | Use correct feature names from spec | Bug fix for inconsistent navigation state |

## Unresolved Questions

None - all technical decisions are resolved based on existing architecture and feature requirements.
