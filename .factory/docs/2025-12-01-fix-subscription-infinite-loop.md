## **Fix Plan: Stop Subscription Status Infinite Loop**

### **Root Cause Identified**
The app is spamming `/api/subscription/status?deviceId=...` with hundreds of requests due to:
1. No error handling circuit breaker - network errors trigger immediate retries
2. CustomerInfo listener re-registration in `SubscriptionProvider`
3. `SubscriptionModal` calling `refreshSubscriptionStatus()` on mount creating feedback loop
4. Polling during unauthenticated state (before login)

### **Implementation Steps**

**1. Enhance `useSubscription` hook with circuit breaker & backoff**
- Add retry counter and exponential backoff (1s, 2s, 4s, 8s delays)
- Stop retrying after 3 consecutive failures
- Add last request timestamp to prevent duplicate calls

**2. Fix `SubscriptionProvider.tsx` listener issue**
- Remove `isInitialized` from dependency array
- Use stable `handleCustomerInfoUpdate` reference with `useCallback` properly
- Add initialization guard to prevent duplicate setup

**3. Remove modal's auto-refresh**
- Delete the `useEffect` with `refreshSubscriptionStatus()` in `SubscriptionModal.tsx`
- Let `ProtectedRoute` handle status checks instead

**4. Add API layer rate limiting**
- Create request queue with deduplication by deviceId
- 5-second minimum interval between status checks
- Log errors instead of spamming on network failures

**5. Defer checks until authentication**
- Wrap `SubscriptionProvider` initialization with `isAuthenticated` check
- Skip all subscription operations when user is logged out

This will stop the infinite loop and reduce API spam from 100+ requests to 1-2 requests per app session.