# Quickstart Guide: Subscription Paywall System

**Feature**: Subscription Paywall System Best Practices Implementation
**Feature Branch**: `001-subscription-paywall-refactor`
**Test Environment**: iOS/Android Emulator or Physical Device

## Prerequisites

Before testing, ensure you have:
1. ✅ Expo development server running (`npm start`)
2. ✅ Backend API accessible (Ngrok tunnel active)
3. ✅ RevenueCat SDK configured with API keys
4. ✅ Test user accounts (free, trial, Pro)
5. ✅ Sandbox/development store accounts configured

---

## Setup for Testing

### 1. Configure RevenueCat for Testing

```bash
# Ensure RevenueCat API keys are set in app.json
# Android: revenueCatApiKeyAndroid
# iOS: revenueCatApiKeyIOS
```

**Test User Setup**:
- Create 3 test users in your test environment
- User A: Free (no trial, no subscription)
- User B: Active trial
- User C: Active Pro subscription

### 2. Build and Install Development Build

```bash
# For iOS
npm run ios

# For Android
npm run android

# Or create development build for physical device testing
eas build --profile development --platform all
```

---

## Testing Scenarios

### Scenario 1: Homepage Paywall Modal (P1)

**Test as Free User (User A)**

1. **Login as free user** (no trial, no Pro)
   ```
   Expected: App loads to homepage
   ```

2. **Verify modal appears automatically**
   ```
   Expected:
   - Modal opens within 1 second
   - Shows "Home Dashboard" in description (not "Home")
   - Has "Upgrade Now" and "Maybe Later" buttons
   - UI uses React Native Paper theme
   ```

3. **Tap "Upgrade Now"**
   ```
   Expected:
   - Modal closes
   - Navigation to /subscription page
   - Subscription offerings displayed
   ```

4. **Navigate back (don't purchase)**
   ```
   Expected:
   - Return to homepage
   - Modal should NOT appear again (respects "Maybe Later")
   ```

5. **Force close and reopen app**
   ```
   Expected:
   - Modal appears again (state is transient, not persisted)
   ```

**Test as Pro User (User C)**

1. **Login as Pro user**
   ```
   Expected:
   - Homepage loads
   - NO modal appears
   - Full dashboard content visible
   ```

**Test as Trial User (User B)**

1. **Login as trial user**
   ```
   Expected:
   - Homepage loads
   - NO modal appears (trial = Pro access)
   - Full dashboard content visible
   ```

---

### Scenario 2: Tab Content Blocking Without Modal (P1)

**Test as Free User (User A)**

1. **From homepage, tap "Pets" tab**
   ```
   Expected:
   - Tab navigates successfully
   - NO modal appears
   - Content area shows blocked/grayed-out state
   - Message: "Pet Management requires Pro subscription"
   - Upgrade button visible in content area
   ```

2. **Tap upgrade button in content area**
   ```
   Expected:
   - Navigation to /subscription page
   - Can complete purchase
   ```

3. **Navigate back to Pets (without purchasing)**
   ```
   Expected:
   - Return to blocked Pets screen
   - Still shows blocking state
   - Still no modal
   ```

4. **Switch to "Health" tab**
   ```
   Expected:
   - Tab switches
   - NO modal
   - Health content shows blocked state
   - Message shows "Health Records requires Pro subscription"
   ```

5. **Rapidly switch between tabs** (Pets → Health → Calendar → Feeding)
   ```
   Expected:
   - NO modals appear on any tab
   - Each tab shows correct blocked content
   - No state corruption or lag
   - Tab names correct in navigation
   ```

6. **From blocked tab, tap header upgrade icon**
   ```
   Expected:
   - Navigation to /subscription page
   ```

**Test as Pro User (User C)**

1. **Login as Pro user**
2. **Navigate through all tabs (Pets, Health, Calendar, etc.)**
   ```
   Expected:
   - No blocking states
   - Full content visible on all tabs
   - No modals
   - All features accessible
   ```

---

### Scenario 3: Consistent Navigation State (P2)

**Test Tab Naming**

1. **As free user on homepage with modal open**
   ```
   Expected:
   - Modal shows "Home Dashboard" (not just "Home")
   ```

2. **As Pro user, navigate through all tabs**
   ```
   Expected:
   - Tab names show correctly in navigation
   - Homepage → index (shows Home icon)
   - Pets → shows Paw icon + "Pets" label
   - Health → shows Medical bag icon + "Health" label
   - Calendar → shows Calendar icon + "Calendar" label
   - And so on...
   ```

3. **Check Settings tab**
   ```
   Expected:
   - Always accessible (not blocked)
   - Shows Cog icon + "Settings" label
   ```

4. **Switch tabs quickly** (5+ switches in 3 seconds)
   ```
   Expected:
   - Each tab shows correct name immediately
   - No flashing or incorrect labels
   - Navigation state stable
   ```

---

### Scenario 4: Subscription Status Changes

**Test Upgrade Flow**

1. **Start as free user (User A)**
2. **Navigate to blocked Pets tab**
3. **Tap upgrade button**
4. **Complete purchase with RevenueCat sandbox**
5. **After successful purchase**
   ```
   Expected:
   - Automatic refresh of subscription status
   - Pets tab immediately shows full content
   - NO app restart required
   - NO navigation required
   - Content updates in place
   ```

6. **Navigate back to homepage**
   ```
   Expected:
   - Full dashboard visible
   - NO modal appears
   ```

**Test Downgrade (Expiration)**

1. **Start as trial user (User B) with trial expiring soon**
2. **Wait for trial to expire (or use RevenueCat dashboard to expire)**
3. **Background the app and return**
   ```
   Expected:
   - Subscription status refreshes on foreground
   - Previously accessible tabs now show blocked states
   - Appropriate messaging shown
   ```

---

### Scenario 5: Network Error Handling

**Test Offline Mode**

1. **Turn on Airplane Mode**
2. **Open app as free user**
   ```
   Expected:
   - Shows network error indicator
   - May show cached subscription status
   - Or shows retry option
   - Does NOT incorrectly show Pro content
   ```

3. **Turn off Airplane Mode**
4. **Pull to refresh or navigate tabs**
   ```
   Expected:
   - Network error resolves
   - Correct subscription status loads
   - Appropriate paywall behavior shown
   ```

---

### Scenario 6: Rapid State Changes

**Test Race Conditions**

1. **As free user, rapidly tap between tabs** (switch every 200ms)
   ```
   Expected:
   - NO accumulation of trigger reasons
   - Current tab state always correct
   - No crashes or memory leaks
   - Performance stays at 60fps
   ```

2. **While tabs switching, change subscription** (purchase Pro)
   ```
   Expected:
   - State updates correctly despite rapid navigation
   - No state corruption
   - Eventually consistent (within 1-2 seconds)
   ```

---

## Success Criteria Validation

Track these metrics during testing:

| Criteria | Target | How to Test |
|----------|--------|-------------|
| Modal displays on homepage | < 1 second | Use stopwatch from app launch |
| Content blocking on tabs | < 500ms | Time from tab tap to blocked state |
| Correct tab names | 100% accuracy | Manual verification on all tabs |
| Status refresh on upgrade | Immediate | Purchase Pro, verify tab access without restart |
| No modals on tab switch | 0 occurrences | Navigate all tabs as free user |
| Rapid tab switch stability | No crashes | Switch tabs 20 times quickly |

---

## Known Test Accounts

### Sandbox Test Users (Apple App Store)

**Setup**: Settings → App Store → Sandbox Account

**Test Cards Provided by Apple**:
- Card number: Any valid format
- Expiry: Any future date
- CVV: Any 3 digits

**Scenarios to Test**:
- ✅ Successful purchase
- ❌ Billing failure
- ⏹ User cancels
- 🔄 Subscription renewals

### Sandbox Test Users (Google Play)

**Setup**: Google Play Console → License Testing

**Test Cards**:
- Test card, always approves
- Test card, always declines
- Test card, slow approval

---

## Common Issues & Troubleshooting

### Issue: Modal doesn't appear on homepage

**Possible Causes**:
1. Subscription status cached incorrectly
2. Paywall store initialized with wrong state
3. RevenueCat SDK not initialized

**Resolution**:
```bash
# Clear app data and reinstall
# Or trigger status refresh manually
```

### Issue: Tabs show modals instead of content blocking

**Possible Causes**:
1. `showPaywall` prop not passed correctly to ProtectedRoute
2. Tab configuration wrong in layout

**Resolution**:
```typescript
// Check tab layout
<ProtectedRoute featureName="petManagement" showPaywall={false}>
```

### Issue: Wrong tab names in navigation

**Possible Causes**:
1. Tab layout configuration incorrect
2. Translation keys missing

**Resolution**:
```bash
# Check locales/en.json and locales/tr.json
# Verify all feature keys present
```

### Issue: Subscription status not updating after purchase

**Possible Causes**:
1. RevenueCat webhook delay
2. Cache not invalidated
3. refreshSubscriptionStatus() not called

**Resolution**:
```typescript
// Ensure on successful purchase:
await refreshSubscriptionStatus();
await queryClient.invalidateQueries(['subscriptionStatus']);
```

---

## Performance Testing

### Frame Rate Testing

**Tools**: React Native Performance Monitor (built-in)

**Steps**:
1. Shake device → Enable Performance Monitor
2. Navigate tabs rapidly
3. Verify frame rate stays above 55fps

**Expected**:
- Normal navigation: 60fps
- Rapid tab switch: 55-60fps
- Modal animation: 60fps

### Memory Testing

**Tools**: Xcode Instruments (iOS) or Android Profiler

**Steps**:
1. Take memory baseline
2. Navigate all tabs multiple times
3. Force garbage collection
4. Check for memory leaks

**Expected**:
- Memory stable after tab navigation
- No accumulation of 5+ MB per tab switch
- Proper cleanup on unmount

---

## Automated Test Cases

### Unit Tests

```typescript
// ProtectedRoute.test.tsx
describe('ProtectedRoute', () => {
  it('shows modal when showPaywall=true and no subscription', () => {
    // Test implementation
  });

  it('blocks content when showPaywall=false and no subscription', () => {
    // Test implementation
  });

  it('renders children when user is Pro', () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
// subscription-flow.test.tsx
describe('Subscription Flow', () => {
  it('homepage shows modal for free user', async () => {
    // Mock free user
    // Navigate to homepage
    // Verify modal appears
  });

  it('tab shows blocked content for free user', async () => {
    // Mock free user
    // Navigate to tab
    // Verify no modal
    // Verify blocked state
  });

  it('no modal or blocking for Pro user', async () => {
    // Mock Pro user
    // Navigate to homepage and tabs
    // Verify full access
  });
});
```

---

## Regression Testing

Verify these existing features still work:

- [ ] Settings tab always accessible
- [ ] Language switching works
- [ ] Theme switching works
- [ ] Login/logout flow intact
- [ ] Error boundaries catch failures
- [ ] Network status indicator works
- [ ] Offline mode handling works
