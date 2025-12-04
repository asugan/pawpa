**Fix AsyncStorage Serialization Error**

The error `[Error: com.facebook.react.bridge.ReadableNativeMap cannot be cast to java.lang.String]` occurs because AsyncStorage receives non-string data from Zustand's persist middleware.

The fix involves:

1. **Update storage adapter** (`lib/storage/zustandStorage.ts`):
   - Convert storage adapter to use proper synchronous methods
   - Stringify data before setting to AsyncStorage
   - Parse data when getting from AsyncStorage
   - Remove `as any` casting from store configurations

2. **Add JSON serialization safety**:
   - Wrap JSON.parse/JSON.stringify in try-catch
   - Handle serialization errors gracefully
   - Add better typing with generics

3. **Test storage operations**:
   - Verify paywall storage works correctly
   - Check all other stores work properly

This ensures proper data serialization across the React Native bridge and eliminates the casting error.