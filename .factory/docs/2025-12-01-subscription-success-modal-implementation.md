## Implement Subscription Success Modal with Navigation

### 1. **Create SuccessSubscriptionModal Component**
   - New file: `components/subscription/SuccessSubscriptionModal.tsx`
   - Modal component with success icon, congratulatory message
   - "Go to Homepage" button that triggers navigation callback

### 2. **Add Translation Strings**
   - Update `/locales/en.json` with subscription success texts:
     - `subscription.success.title`: "Subscription Successful!"
     - `subscription.success.message`: "You are now a Pro member. Enjoy all premium features."
     - `subscription.success.button`: "Go to Homepage"
   - Update `/locales/tr.json` with Turkish translations:
     - `subscription.success.title`: "Abonelik Başarılı!"
     - `subscription.success.message`: "Artık Pro üyesiniz. Tüm premium özelliklerin keyfini çıkarın."
     - `subscription.success.button`: "Anasayfaya Dön"

### 3. **Update subscription.tsx Page**
   - Add `useState` for modal visibility control
   - Import `SuccessSubscriptionModal` component
   - Show modal when `presentPaywall()` or `presentPaywallIfNeeded()` returns successfully
   - Handle modal callback to navigate to tabs homepage: `router.push('/(tabs)')`
   - Modal should use transparent background with centered card layout

### 4. **Success Flow**
   - User completes purchase in RevenueCat paywall
   - `presentPaywall()` returns `true` (PURCHASED or RESTORED)
   - Polling completes and backend status is updated
   - Show `SuccessSubscriptionModal` with success message
   - User clicks "Go to Homepage" button
   - Navigate to `/(tabs)` route (home page)

### Implementation Details
- Modal will use React Native `Modal` component with `transparent={true}`
- Success icon: `MaterialCommunityIcons` with "check-circle" or "crown" icon
- Button will call `onClose` callback prop which handles navigation
- Theme colors from `useTheme()` hook will be used for consistency
- Animation type: `slide` or `fade` for smooth appearance