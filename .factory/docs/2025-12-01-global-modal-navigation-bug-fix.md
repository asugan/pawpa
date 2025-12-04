# Global Modal Navigation Bug Fix - Implementation Spec

## Problem
Global modal implementasyonunda iki sorun tespit edildi:
1. **Upgrade Now butonu subscription sayfasına gitmiyor** - Sadece modal'ı kapatıyor
2. **Tab isimleri yanlış gösteriliyor** - "Home is only available for pro members" hatası

## Root Cause Analysis
1. `GlobalSubscriptionModal.tsx`: `handleUpgrade` fonksiyonu `router.push('/subscription')` içermiyor
2. `triggerReason` değerleri muhtemelen yanlış translation key'lerini içeriyor veya translation dosyalarında eksik key var

## Files to Modify

### 1. components/subscription/GlobalSubscriptionModal.tsx
**Bug:** Missing navigation after closing modal

**Fix:**
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

const handleUpgrade = () => {
  closePaywall();
  router.push('/subscription');
};
```

### 2. Debug Verification (ProtectedRoute.tsx)
Check if triggerReason values are correct:
- Add console.log to verify `featureName` values
- Verify translation keys in `locales/en.json` and `locales/tr.json`

### 3. Verify Translation Keys
Check if `subscription.features.*` keys exist in locale files:
- `subscription.features.petManagement`
- `subscription.features.healthRecords`
- `subscription.features.calendar`
- `navigation.home`

## Expected Behavior After Fix
1. **Upgrade Now** button navigates to `/subscription` page
2. Modal shows correct tab/feature names (e.g., "Pet Management", "Health Records")