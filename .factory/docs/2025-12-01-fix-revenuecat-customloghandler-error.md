## Fix for `react-native-purchases` customLogHandler Error

### Root Cause
The error occurs due to a race condition in RevenueCat SDK v9.6.8:
- When `Purchases.configure()` is called, the native module emits log events immediately
- The JavaScript layer receives these events before the internal log handler is ready
- This causes the `customLogHandler is not a function` TypeError

### Solution
Defer the CustomerInfo listener setup until AFTER the SDK initialization fully completes:

**File**: `/home/asugan/Projects/pawpa/providers/SubscriptionProvider.tsx`

1. **Current Problem**: Listener is set up in a separate `useEffect` that triggers during SDK initialization, causing race condition
2. **Fix**: Ensure `Purchases.configure()` completes and `setInitialized(true)` is called BEFORE any listeners are registered
3. **Implementation**: Add initialization guard to prevent listener setup before SDK is configured

**Code Changes**:
- Refactor initialization flow: `initializeSDK()` → complete → `setInitialized(true)` → only then allow listener setup
- Already have `isInitialized` state - need to ensure it's set BEFORE listener effect runs
- Move listener setup logic or add stronger guards to prevent premature event handling

This prevents the native module from emitting events to an unprepared JavaScript layer during configuration phase.