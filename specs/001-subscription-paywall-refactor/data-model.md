# Data Model: Subscription Paywall System

**Feature**: Subscription Paywall System Best Practices Implementation
**Date**: 2025-12-04

## Entity Definitions

### SubscriptionStatus

**Purpose**: Represents the current subscription state of the user

**Properties**:
| Property | Type | Required | Validation | Description |
|----------|------|----------|------------|-------------|
| `isProUser` | boolean | Yes | Must be boolean | Whether user has active Pro subscription |
| `isTrialActive` | boolean | Yes | Must be boolean | Whether trial period is currently active |
| `isTrialExpired` | boolean | Yes | Must be boolean | Whether trial period has expired |
| `trialDaysRemaining` | number \| null | Yes | Must be positive or null | Days remaining in trial, null if not in trial |
| `subscriptionId` | string \| null | No | Valid subscription identifier | RevenueCat subscription identifier |
| `expiresDate` | string \| null | No | ISO 8601 date format | Subscription expiration date |

**Source**: RevenueCat CustomerInfo and PaywallStore

---

### PaywallStoreState

**Purpose**: Global state for paywall modal triggering and configuration

**Properties**:
| Property | Type | Required | Validation | Description |
|----------|------|----------|------------|-------------|
| `isOpen` | boolean | Yes | Must be boolean | Whether modal is currently open |
| `triggerReason` | string \| null | Yes | Must be valid feature name | Feature name from translation keys (FR-009) |
| `triggerRoute` | string \| null | No | Must be valid route path | Current route when modal triggered |
| `lastTriggeredAt` | number \| null | No | Unix timestamp | Timestamp of last trigger (for debugging) |

**Transient State**: This store does NOT persist across app restarts (FR-008)

**Feature Name Values** (must match translation keys):
- `homeDashboard` → "Home Dashboard"
- `petManagement` → "Pet Management"
- `healthRecords` → "Health Records"
- `calendar` → "Calendar"
- `feedingSchedule` → "Feeding Schedule"
- `expenses` → "Expenses"
- `budgets` → "Budgets"

---

### ProtectedRouteConfiguration

**Purpose**: Configuration passed to ProtectedRoute component to control behavior

**Properties**:
| Property | Type | Required | Validation | Description |
|----------|------|----------|------------|-------------|
| `featureName` | string | Yes | Must match translation key | Feature identifier for messaging |
| `requirePro` | boolean | Yes | Must be boolean | Whether Pro subscription is required |
| `showPaywall` | boolean | Yes | Default: true | Whether to trigger modal (vs content block) |
| `children` | ReactNode | Yes | Valid React elements | Content to protect/render |
| `loadingFallback` | ReactNode | No | Valid React element | Custom loading state (optional) |

**Behavior Modes**:
1. `showPaywall = true` → Opens GlobalSubscriptionModal when user lacks access
2. `showPaywall = false` → Renders children with visual blocking (opacity, pointerEvents)

---

### TabConfiguration

**Purpose**: Defines paywall behavior for each tab in the navigation

**Properties**:
| Property | Type | Required | Validation | Description |
|----------|------|----------|------------|-------------|
| `tabName` | string | Yes | Must be valid route name | Technical route identifier |
| `displayName` | string | Yes | User-friendly string | Display name in UI/translations |
| `showPaywallOnBlock` | boolean | Yes | Must be boolean | true = modal, false = content block |
| `icon` | string | Yes | Material Community Icon name | Icon for tab navigation |
| `order` | number | Yes | Integer ≥ 0 | Tab display order |

**Tab Configurations** (from spec):

| Tab | Route | Display Name | showPaywallOnBlock | Icon | Order |
|-----|-------|--------------|-------------------|------|-------|
| Home | `index` | Home | true (modal) | `home` | 0 |
| Pets | `pets` | Pets | false (block) | `paw` | 1 |
| Health | `health` | Health | false (block) | `medical-bag` | 2 |
| Calendar | `calendar` | Calendar | false (block) | `calendar` | 3 |
| Feeding | `feeding` | Feeding | false (block) | `food` | 4 |
| Expenses | `expenses` | Expenses | false (block) | `credit-card` | 5 |
| Budgets | `budgets` | Budgets | false (block) | `chart-pie` | 6 |
| Settings | `settings` | Settings | N/A (always free) | `cog` | 7 |

---

### UpgradePromptState

**Purpose**: Local state for inline upgrade prompt in blocked content areas

**Properties**:
| Property | Type | Required | Validation | Description |
|----------|------|----------|------------|-------------|
| `isVisible` | boolean | Yes | Must be boolean | Whether upgrade prompt shown |
| `featureName` | string | Yes | Must match translation key | Feature name for messaging |
| `onUpgrade` | function | Yes | Must be valid function | Navigation handler for upgrade button |
| `buttonText` | string | No | User-friendly string | Custom button text (optional) |

---

## State Transitions

### SubscriptionStatus Transitions

```
Free User
  ↓ (starts trial)
Trial Active → Expires → Trial Expired → Purchases Pro → Pro User
  ↓ (purchases during trial)
Pro User → Subscription Expires → Free User (with expired trial)
```

**Transitions**:
1. `Free` → `Trial Active`: User starts trial (RevenueCat)
2. `Trial Active` → `Pro User`: User purchases during trial
3. `Trial Active` → `Trial Expired`: Trial period ends without purchase
4. `Pro User` → `Free User`: Subscription expires/cancels

**Refresh Triggers**:
- App launch
- Tab focus (via `useFocusEffect`)
- Pull-to-refresh gesture
- Background → foreground app state change

---

### PaywallStoreState Transitions

```
Closed
  ↓ (triggerPaywall called)
Opening → Open
  ↓ (user closes or navigates)
Closed (cleanup state)
```

**Transitions**:
1. `Closed` → `Opening`: `triggerPaywall(reason, route)` called
2. `Opening` → `Open`: Modal mounted and visible
3. `Open` → `Closed`: User taps "Maybe Later" or closes modal
4. `Closed` → `Cleanup`: Component unmount clears trigger reason

**Important**: State does NOT persist app restarts (FR-008)

---

## Validation Rules

### Feature Name Validation

All feature names must exist in translation files:
- `locales/en.json` → English translations
- `locales/tr.json` → Turkish translations

**Required Keys**:
```json
{
  "features": {
    "homeDashboard": "Home Dashboard",
    "petManagement": "Pet Management",
    "healthRecords": "Health Records",
    "calendar": "Calendar",
    "feedingSchedule": "Feeding Schedule",
    "expenses": "Expenses",
    "budgets": "Budgets"
  }
}
```

### Configuration Validation

1. **ProtectedRoute**: Must receive valid `featureName` from translation keys
2. **Paywall Store**: `triggerReason` must match `featureName` passed to ProtectedRoute
3. **Tab Layout**: Tab configuration must match routes defined in `app/(tabs)/_layout.tsx`

---

## Relationships

```
SubscriptionStatus (from paywallStore)
  ↓ determines access
ProtectedRoute (component)
  ↓ uses configuration
ProtectedRouteConfiguration
  ↓ controls behavior
PaywallStoreState (modal trigger)
  OR
UpgradePromptState (inline prompt)
```
