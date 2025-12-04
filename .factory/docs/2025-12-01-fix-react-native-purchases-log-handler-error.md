## Fix for React Native Purchases `customLogHandler` Error

### Root Cause
The error "customLogHandler is not a function" occurs because:
1. The `customLogHandler` variable in react-native-purchases is declared but never initialized
2. When the SDK emits log events after configuration, it tries to call the undefined handler
3. The SDK requires `Purchases.setLogHandler()` to be called before log events can be received

### Solution
Add a default log handler in the `initializeRevenueCat` function before `Purchases.configure()`:

**File: `/home/asugan/Projects/pawpa/lib/revenuecat/initialize.ts`**

```typescript
// Add this before Purchases.configure()
// Set a default log handler to prevent "customLogHandler is not a function" error
Purchases.setLogHandler((logLevel: LOG_LEVEL, message: string) => {
  if (__DEV__) {
    console.log(`[RevenueCat][${LOG_LEVEL[logLevel]}] ${message}`);
  }
});
```

This will:
- Initialize the `customLogHandler` with a proper function
- Only log in development mode to avoid performance issues
- Use TypeScript types from the SDK (`LOG_LEVEL` enum)
- Prevent the JavaScript error from occurring

### Implementation Details
The fix will be added at line 15 in `initializeRevenueCat()`, right after setting the log level and before calling `Purchases.configure()`.