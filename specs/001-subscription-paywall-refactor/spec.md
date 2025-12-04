# Feature Specification: Subscription Paywall System Best Practices Implementation

**Feature Branch**: `001-subscription-paywall-refactor`
**Created**: 2025-12-04
**Status**: Draft
**Input**: User description: "protected routelarda ve paywall gösteriminde biraz problem yaşıyorum kafam karıştı, bir inceleyip @components/subscription/GlobalSubscriptionModal.tsx ve @components/subscription/ProtectedRoute.tsx 'in best practices implemantasyonunu yaparmısın ? context7 ile dökmanlara ulaşabilirsin. şu an sadece anasayfada modalı gösteriyoruz trial yada pro değilse ve diğer rotaları tablardan kapattım, @components/subscription/ProtectedRoute.tsx i hiç kullanmıyoruz onu diğer tablarda kullanmalıyız fakat modalı tetiklememeli."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Homepage Paywall Modal (Priority: P1)

As a free user without Pro or trial subscription, when I open the app and land on the homepage, I see a paywall modal explaining the Premium features and inviting me to upgrade. The modal shows the correct feature name "Home Dashboard" and provides clear upgrade and close options.

**Why this priority**: This is the primary conversion point for free users and must work correctly to drive subscription revenue. The current implementation already shows modal on homepage but needs proper ProtectedRoute integration for correct state management.

**Independent Test**: Can be fully tested by opening the app as a free user (no trial, no Pro) and verifying the modal appears with correct messaging and "Home Dashboard" as the trigger reason.

**Acceptance Scenarios**:

1. **Given** I am a free user without active trial or Pro subscription, **When** I open the app homepage, **Then** the paywall modal opens automatically with "Home Dashboard" as the feature name in the description.

2. **Given** I am a free user viewing the homepage paywall modal, **When** I tap "Upgrade Now", **Then** the modal closes and I am navigated to the subscription page to complete purchase.

3. **Given** I am a free user viewing the homepage paywall modal, **When** I tap "Maybe Later", **Then** the modal closes and I can view the limited homepage content.

4. **Given** I upgrade to Pro from the homepage modal, **When** I return to the homepage, **Then** the modal does not appear again and I see full Pro content.

---

### User Story 2 - Tab Content Protection Without Modal (Priority: P1)

As a free user, when I navigate to Pro features (Pet Management, Health Records, Calendar, Feeding Schedules, Expenses, Budgets), the tabs are visible but the content area shows a blocked/grayed-out state without triggering the paywall modal. I see a clear message that these features require Pro subscription and can tap an upgrade button within the content area.

**Why this priority**: This prevents modal fatigue while still communicating the value of Pro features. Users can see what features exist without being interrupted by modals on every tab switch.

**Independent Test**: Can be fully tested by tapping on any Pro tab (Pets, Health, Calendar, etc.) as a free user and verifying the content shows a blocked state with upgrade option but NO modal appears.

**Acceptance Scenarios**:

1. **Given** I am a free user on the homepage, **When** I tap the "Pets" tab, **Then** the tab navigates successfully but the content area shows blocked/grayed-out state with "Pet Management requires Pro subscription" message and upgrade button.

2. **Given** I am on the blocked Pets screen, **When** I tap the upgrade button in the content area, **Then** I am navigated to the subscription page.

3. **Given** I switch between multiple Pro tabs (Pets → Health → Calendar), **When** I navigate as a free user, **Then** NO modal appears on any tab, only the content area shows blocked state with consistent messaging.

4. **Given** I upgrade to Pro, **When** I navigate to previously blocked tabs, **Then** I see full content without any blocking or grayed-out state.

---

### User Story 3 - Consistent Navigation State Management (Priority: P2)

As any user, when I switch between tabs, the app maintains correct navigation state. Tab names display correctly in the navigation bar and modal trigger reasons are accurate when modals do appear.

**Why this priority**: This fixes the bug where tabs show incorrect names (e.g., "Home" instead of "Pets", "Health", etc.) in the modal and navigation. While not blocking core functionality, it significantly impacts user experience and perceived app quality.

**Independent Test**: Can be tested by opening modal on homepage and verifying it shows "Home Dashboard", then navigating to other tabs (as trial/Pro user) and verifying tab names are correct in navigation.

**Acceptance Scenarios**:

1. **Given** I am a free user on homepage with modal open, **When** I look at the modal description, **Then** it shows "Home Dashboard" (not "Home" or other tab names).

2. **Given** I am a Pro user navigating between all tabs, **When** I check the navigation state, **Then** each tab shows its correct name (Pets, Health, Calendar, etc.) in the navigation bar.

3. **Given** I switch tabs quickly as a free user, **When** I navigate back and forth, **Then** the content blocking state updates correctly without showing previous tab's state.

---

### Edge Cases

- What happens when subscription status changes from free to Pro while user is viewing a blocked tab? The content should immediately update to show full features without requiring navigation or app restart.

- How does system handle network errors when checking subscription status? The system should show appropriate error message and allow retry, not block users indefinitely with loading state.

- What happens if user background the app and returns after trial expires? The subscription status should be refreshed on app foreground and appropriate blocking/modal shown based on current status.

- How does system handle rapid tab switching by free user? The paywall store should not accumulate multiple trigger reasons or show conflicting states - only the current tab's state should be active.

- What happens when user has active subscription but RevenueCat SDK hasn't initialized yet? The system should wait for initialization or use cached backend status rather than showing incorrect blocked state.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The ProtectedRoute component MUST wrap every Pro feature screen including the homepage and all tab screens (Pets, Health, Calendar, Feeding, Expenses, Budgets).

- **FR-002**: The ProtectedRoute component MUST accept a `showPaywall` parameter (boolean, default: true) that controls whether the paywall modal is triggered when the user lacks Pro subscription.

- **FR-003**: When `showPaywall=true` on homepage, the system MUST open the GlobalSubscriptionModal with "Home Dashboard" as the trigger reason.

- **FR-004**: When `showPaywall=false` on tab screens, the system MUST NOT open the GlobalSubscriptionModal but instead render the children content with visual blocking (opacity reduction) and pointerEvents disabled, showing an inline upgrade prompt within the content area.

- **FR-005**: The GlobalSubscriptionModal MUST include proper navigation action that redirects users to the subscription page when "Upgrade Now" is tapped.

- **FR-006**: The ProtectedRoute component MUST refresh subscription status using `refreshSubscriptionStatus()` on tab focus to ensure state is current.

- **FR-007**: The ProtectedRoute component MUST clean up paywall store state on unmount to prevent race conditions when switching between tabs.

- **FR-008**: The paywall store (usePaywallStore) MUST NOT persist modal state across app restarts - it should be purely transient.

- **FR-009**: The GlobalSubscriptionModal MUST display feature-specific messaging using the triggerReason from the paywall store (e.g., "Pet Management", "Health Records", "Home Dashboard").

- **FR-010**: The ProtectedRoute MUST handle loading states gracefully, showing a loading spinner while subscription status is being determined.

- **FR-011**: Translation keys MUST be added for all feature names to support localization in both English and Turkish.

- **FR-012**: The `Tabs.Protected` guard in tab layout MUST work in conjunction with ProtectedRoute, hiding Pro tabs completely for free users (not just blocking content).

- **FR-013**: The ProtectedRoute component on tab screens with `showPaywall=false` MUST still provide cleanup logic to prevent state conflicts from other screens that do trigger modals.

### Key Entities

- **SubscriptionStatus**: Represents user's current subscription state with properties: isProUser (boolean), isTrialActive (boolean), isTrialExpired (boolean), trialDaysRemaining (number | null)

- **PaywallStoreState**: Global state for paywall modal with properties: isOpen (boolean), triggerReason (string | null), triggerRoute (string | null)

- **ProtectedRouteConfiguration**: Configuration object for ProtectedRoute component with properties: featureName (string), requirePro (boolean), showPaywall (boolean)

- **TabConfiguration**: Defines which tabs should show modals vs content blocking with properties: tabName (string), route (string), showPaywallOnBlock (boolean)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Free users see homepage paywall modal within 1 second of app launch, with correct "Home Dashboard" messaging, achieving 80% upgrade click-through rate from homepage modal.

- **SC-002**: Free users can navigate to all Pro tabs without seeing any paywall modals, with content blocked state appearing within 500ms of tab selection.

- **SC-003**: Zero occurrence of incorrect tab names in navigation or modals - all tabs display correct names (Pets, Health, Calendar, Feeding, Expenses, Budgets, Settings) 100% of the time.

- **SC-004**: Subscription status is always current when navigating between tabs, with subscription changes reflecting immediately in the UI without requiring app restart.

- **SC-005**: Users can upgrade to Pro from any blocked tab using the inline upgrade button, successfully completing purchase and immediately accessing full content on the same tab.

- **SC-006**: Pro and trial users never see paywall modals or blocked content states on any screen - they have uninterrupted access to all features.

- **SC-007**: Rapid tab switching (5+ tabs within 3 seconds) does not cause state corruption or incorrect modal behavior - each tab shows correct blocking/modal state based on its configuration.
