# API Contracts: Subscription Paywall System

**Feature**: Subscription Paywall System Best Practices Implementation
**Date**: 2025-12-04
**Contract Type**: External Service Integration (RevenueCat)

## Overview

This feature primarily uses existing APIs and services. The contracts below document the external RevenueCat SDK integration and existing PawPa backend endpoints used for subscription management.

---

## External Services

### RevenueCat React Native Purchases SDK

**Base URL**: N/A (SDK handles communication)
**Purpose**: Subscription management, purchase processing, entitlement verification

#### Get Customer Info

```typescript
// SDK Method
Purchases.getCustomerInfo(): Promise<CustomerInfo>

// Usage in PawPa
const customerInfo = await Purchases.getCustomerInfo();
const isProUser = customerInfo.entitlements.active['pro_features'] !== undefined;
```

**Response Type**: `CustomerInfo`
```typescript
interface CustomerInfo {
  entitlements: {
    all: Record<string, EntitlementInfo>;
    active: Record<string, EntitlementInfo>;
  };
  allPurchaseDates: Record<string, string | null>;
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  nonSubscriptionTransactions: Transaction[];
  firstSeen: string;
  originalAppUserId: string;
  requestDate: string;
  originalApplicationVersion: string | null;
  originalPurchaseDate: string | null;
  managementURL: string | null;
}

interface EntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  latestPurchaseDate: string;
  originalPurchaseDate: string;
  productIdentifier: string;
  isSandbox: boolean;
  ownershipType: string;
}
```

**Purpose**: Verify user's subscription status and entitlements

**Called From**:
- `stores/paywallStore.ts` → `refreshSubscriptionStatus()`
- On app launch
- On tab focus (via `useFocusEffect`)

---

#### Get Offerings

```typescript
// SDK Method
Purchases.getOfferings(): Promise<Offerings>

// Usage in PawPa
const offerings = await Purchases.getOfferings();
const current = offerings.current;
```

**Response Type**: `Offerings`
```typescript
interface Offerings {
  all: Record<string, Offering>;
  current: Offering | null;
}

interface Offering {
  identifier: string;
  serverDescription: string;
  availablePackages: Package[];
  lifetime: Package | null;
  annual: Package | null;
  sixMonth: Package | null;
  threeMonth: Package | null;
  twoMonth: Package | null;
  monthly: Package | null;
  weekly: Package | null;
}

interface Package {
  identifier: string;
  packageType: string;
  product: Product;
  offeringIdentifier: string;
}

interface Product {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
  introPrice: IntroPrice | null;
  discounts: Discount[] | null;
}
```

**Purpose**: Retrieve available subscription packages for display in subscription page

**Called From**:
- `app/subscription.tsx` (subscription page)

---

#### Purchase Package

```typescript
// SDK Method
Purchases.purchasePackage({ aPackage, oldSku, prorationMode }): Promise<{ productIdentifier: string; customerInfo: CustomerInfo }>

// Usage in PawPa
const { customerInfo } = await Purchases.purchasePackage({
  aPackage: selectedPackage
});
```

**Parameters**:
- `aPackage: Package` (required) - The package to purchase
- `oldSku: string` (optional) - For subscription upgrades
- `prorationMode: ProrationMode` (optional) - Android proration behavior

**Response**: Object containing `customerInfo` with updated entitlements

**Purpose**: Process subscription purchase

**Called From**:
- Purchase flow in subscription page

---

### PawPa Backend API (Existing)

#### Sync Subscription Status

```http
POST /api/users/sync-subscription
Content-Type: application/json
Authorization: Bearer < JWT_TOKEN >

{
  "revenueCatId": "string",
  "entitlements": ["string"]
}
```

**Response**:
```json
{
  "success": true,
  "subscriptionStatus": {
    "isProUser": true,
    "isTrialActive": false,
    "trialDaysRemaining": null,
    "subscriptionId": "string"
  }
}
```

**Purpose**: Sync RevenueCat subscription status with PawPa backend for API authorization

**Called From**:
- After successful purchase
- On subscription status change webhook

---

## Integration Points

### ProtectedRoute Component Flow

```
ProtectedRoute mounts
  ↓
Check subscriptionStatus from paywallStore
  ↓
IF isProUser OR showPaywall=false
  ↓                 ↓
Render children   Check triggerReason
  ↓                 ↓
Apply visual     IF not set, trigger modal
blocking         ↓
  ↓              Open GlobalSubscriptionModal
Show inline
upgrade prompt
```

**State Dependencies**:
1. `subscriptionStatus.isProUser` - Determines access level
2. `showPaywall` prop - Controls modal vs blocking behavior
3. `paywallStore.isOpen` - Modal display state
4. `paywallStore.triggerReason` - Feature name for messaging

---

## Error Handling

### RevenueCat Errors

| Error Code | Description | User Action |
|------------|-------------|-------------|
| `PURCHASE_CANCELLED` | User cancelled purchase | Show message: "Purchase cancelled" |
| `STORE_PROBLEM` | Store connection issue | Show retry button |
| `PURCHASE_NOT_ALLOWED` | Device/parental restrictions | Inform user to check restrictions |
| `PURCHASE_INVALID` | Invalid product identifier | Log error, show "Product not available" |
| `NETWORK_ERROR` | Network connection failed | Show offline message with retry |

**Error Display Pattern**:
```typescript
try {
  await Purchases.purchasePackage({ aPackage });
} catch (error) {
  if (error.userCancelled) {
    showToast(t('purchaseCancelled'));
  } else {
    showError(error.message);
  }
}
```

---

## Testing Considerations

### RevenueCat Sandbox Testing

**Test Cards** (provided by RevenueCat):
- Test successful purchases
- Test cancelled purchases
- Test billing issues
- Test subscription renewals
- Test upgrades/downgrades

**Sandbox Scenarios**:
1. Free user → sees homepage modal
2. Start trial → modal disappears, full access
3. Trial expires → content blocking on tabs
4. Purchase Pro → immediate access restoration
5. Cancel Pro → returns to free on expiration

---

## Rate Limits & Performance

**RevenueCat SDK**:
- Automatically caches customer info locally
- Refreshes on app foreground
- Rate limits: SDK handles internally

**PawPa Backend**:
- Subscription sync: Can be called frequently (idempotent operation)
- No strict rate limits (backend handles deduplication)

**Recommended Behavior**:
- Check subscription on app launch
- Check on tab focus (useFocusEffect)
- Don't poll continuously
- Trust RevenueCat webhook for immediate updates

---

## Security Considerations

1. **Never trust client-side status alone**: Always verify with RevenueCat on backend
2. **JWT authentication**: All API calls include authentication token
3. **Entitlement checks**: Backend validates RevenueCat signature before granting access
4. **Receipt validation**: RevenueCat handles receipt validation on device
5. **No hardcoded secrets**: RevenueCat API key in environment configuration

---

## Webhooks (Backend Integration)

### RevenueCat → PawPa Backend

**Event Types**:
- `INITIAL_PURCHASE` - User purchases subscription
- `CANCELLATION` - User cancels subscription
- `EXPIRATION` - Subscription expires
- `RENEWAL` - Subscription renews

**Purpose**: Keep backend subscription status in sync with RevenueCat

**Implementation**: Not directly part of this feature (handled by backend), but affects client-side status accuracy
