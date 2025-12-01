## Fix Plan: Subscription Modal Not Re-appearing on Tab Switch

### **Root Cause**
The `ProtectedRoute` component maintains a `showModal` state that, once set to false (when user clicks "Maybe Later" or "Upgrade Now"), never resets to true. When navigating between tabs:
- React components are not unmounted (React Navigation keeps them mounted)
- `useEffect([])` with empty dependency runs only once on mount
- When returning to a tab, the `showModal` state remains false
- Modal never re-appears even though subscription status check is needed

### **Fix Implementation**

**1. Update `ProtectedRoute.tsx`**
- Add `useFocusEffect` from `expo-router` to detect tab focus changes
- Trigger subscription refresh on every tab focus
- Keep existing modal display logic but ensure it re-evaluates on status update

```tsx
import { useFocusEffect } from 'expo-router';

export function ProtectedRoute({ children, featureName, requirePro = true }: ProtectedRouteProps) {
  const { isProUser, isLoading: isSubscriptionLoading, refreshSubscriptionStatus } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  // Refresh subscription status on every tab focus
  useFocusEffect(
    useCallback(() => {
      refreshSubscriptionStatus();
      return () => {};
    }, [refreshSubscriptionStatus])
  );

  // Control modal visibility based on subscription status
  useEffect(() => {
    if (!isSubscriptionLoading && requirePro && !isProUser) {
      setShowModal(true);
    }
  }, [isProUser, isSubscriptionLoading, requirePro]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // ... rest of the component
}
```

**2. Verify All Protected Tabs**
- Ensure all tab screens have proper `featureName` prop
- Confirm subscription modal appears on every protected tab

### **Expected Behavior After Fix**
1. User navigates to a protected tab → Modal appears if no subscription
2. User clicks "Maybe Later" → Modal closes
3. User switches to another tab → Modal appears on that tab if no subscription
4. User returns to first tab → Modal re-appears (new behavior - fixed)

The fix ensures subscription status is re-checked on every tab focus, properly resetting modal state for each tab navigation.