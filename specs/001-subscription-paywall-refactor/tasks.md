# Tasks: Subscription Paywall System Best Practices Implementation

**Input**: Design documents from `/specs/001-subscription-paywall-refactor/`
**Feature**: Subscription paywall system with dual-mode ProtectedRoute (modal vs content blocking)
**Branch**: `001-subscription-paywall-refactor`

**Tests**: Tests are OPTIONAL for this feature and are NOT included in the task list, as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact React Native file paths

## Path Conventions

This is a React Native mobile app using Expo Router with file-based routing:
- `app/` - Expo Router screens and navigation
- `components/subscription/` - Subscription-related components
- `stores/` - Zustand state management
- `locales/` - i18n translation files
- No new API endpoints (uses existing RevenueCat integration and backend sync)

---

## Phase 1: Analysis & Foundation Setup

**Purpose**: Review existing implementation and prepare foundational requirements

- [X] T001 Review existing ProtectedRoute.tsx implementation for baseline understanding
- [X] T002 Review existing GlobalSubscriptionModal.tsx implementation and navigation flow
- [X] T003 [P] Review existing paywallStore.ts to understand current subscription management
- [X] T004 [P] Review tab layout at app/(tabs)/_layout.tsx to understand current tab configuration
- [X] T005 Verify RevenueCat SDK integration status in existing codebase
- [X] T006 Document current translation keys for subscription features in locales/en.json and locales/tr.json

---

## Phase 2: Foundational - Paywall Store & Translations

**Purpose**: Core infrastructure that MUST be complete before user stories can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Update paywallStore.ts to ensure state is non-persistent (no AsyncStorage middleware)
- [X] T008 Add cleanup logic to paywallStore.ts to reset state on component unmount (FR-007)
- [X] T009 [P] Add translation keys for all feature names in locales/en.json:
  - `features.homeDashboard`: "Home Dashboard"
  - `features.petManagement`: "Pet Management"
  - `features.healthRecords`: "Health Records"
  - `features.calendar`: "Calendar"
  - `features.feedingSchedule`: "Feeding Schedule"
  - `features.expenses`: "Expenses"
  - `features.budgets`: "Budgets"
- [X] T010 [P] Add corresponding translation keys in locales/tr.json
- [X] T011 Validate translation keys match spec requirements (FR-009, FR-011)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Homepage Paywall Modal (Priority: P1) 🎯 MVP

**Goal**: Free users see paywall modal on homepage with correct "Home Dashboard" messaging and can upgrade

**Independent Test**: Open app as free user (no trial, no Pro), verify modal appears within 1 second with "Home Dashboard" feature name, "Upgrade Now" navigates to subscription page, "Maybe Later" closes modal.

### Implementation for User Story 1

- [X] T012 [US1] Update ProtectedRoute component to accept `showPaywall` prop (boolean, default: true) in components/subscription/ProtectedRoute.tsx
- [X] T013 [US1] Add conditional logic in ProtectedRoute: when `showPaywall=true` and no subscription, trigger modal via paywallStore (FR-003)
- [X] T014 [US1] Add subscription status checking on tab focus using useFocusEffect with refreshSubscriptionStatus() (FR-006)
- [X] T015 [US1] Update app/(tabs)/index.tsx to wrap homepage content with ProtectedRoute and pass `showPaywall={true}`
- [X] T016 [US1] Configure ProtectedRoute on homepage with `featureName="homeDashboard"` for correct modal messaging
- [X] T017 [US1] Verify GlobalSubscriptionModal displays correct triggerReason "Home Dashboard" in modal description (FR-009)
- [X] T018 [US1] Add cleanup logic in ProtectedRoute useEffect to clear paywall store state on unmount (FR-007)
- [X] T019 [US1] Add loading state handling in ProtectedRoute for subscription status determination (FR-010)
- [X] T020 [US1] Verify navigation action from modal "Upgrade Now" button redirects to subscription page (FR-005)

**Checkpoint**: User Story 1 complete - homepage modal works correctly with proper state management

---

## Phase 4: User Story 2 - Tab Content Protection Without Modal (Priority: P1)

**Goal**: Free users can navigate to Pro tabs but see content blocking (no modals) with inline upgrade options

**Independent Test**: As free user, tap any Pro tab (Pets, Health, Calendar, etc.), verify NO modal appears, content shows blocked/grayed state with upgrade button, tapping upgrade button navigates to subscription page.

### Implementation for User Story 2

- [X] T021 [US2] Enhance ProtectedRoute to support dual-mode: when `showPaywall=false`, render children with visual blocking instead of modal (FR-004)
- [X] T022 [P] [US2] Update app/(tabs)/pets.tsx to wrap content with ProtectedRoute, pass `showPaywall={false}` and `featureName="petManagement"`
- [X] T023 [P] [US2] Update app/(tabs)/health.tsx with ProtectedRoute, `showPaywall={false}`, `featureName="healthRecords"`
- [X] T024 [P] [US2] Update app/(tabs)/calendar.tsx with ProtectedRoute, `showPaywall={false}`, `featureName="calendar"`
- [X] T025 [P] [US2] Update app/(tabs)/feeding.tsx with ProtectedRoute, `showPaywall={false}`, `featureName="feedingSchedule"`
- [X] T026 [P] [US2] Update app/(tabs)/expenses.tsx with ProtectedRoute, `showPaywall={false}`, `featureName="expenses"`
- [X] T027 [P] [US2] Update app/(tabs)/budgets.tsx with ProtectedRoute, `showPaywall={false}`, `featureName="budgets"`
- [X] T028 [US2] Add visual blocking styling to ProtectedRoute when `showPaywall=false`: opacity reduction, pointerEvents disabled
- [X] T029 [US2] Create UpgradePrompt component in components/subscription/UpgradePrompt.tsx for inline upgrade button
- [X] T030 [US2] Integrate UpgradePrompt into ProtectedRoute blocking view with correct feature messaging
- [X] T031 [US2] Add navigation handler in UpgradePrompt to redirect to subscription page
- [X] T032 [US2] Ensure cleanup logic works correctly for both modal and blocking modes (FR-007, FR-013)

**Checkpoint**: User Stories 1 and 2 complete - homepage modal works, tabs show blocking without modals

---

## Phase 5: User Story 3 - Consistent Navigation State Management (Priority: P2)

**Goal**: Tab names display correctly in navigation and modal descriptions show accurate feature names

**Independent Test**: Navigate through all tabs as Pro user, verify correct tab names appear (Pets, Health, Calendar, etc. not "Home"). As free user on homepage, verify modal shows "Home Dashboard" not "Home".

### Implementation for User Story 3

- [X] T033 [US3] Review tab layout configuration in app/(tabs)/_layout.tsx and fix tab name mappings
- [X] T034 [US3] Verify ProtectedRoute passes correct featureName to paywallStore for all tabs
- [X] T035 [US3] Update tab configuration to ensure consistent naming between navigation and modal triggers
- [X] T036 [US3] Test rapid tab switching (5+ switches) to verify state stability and correct feature names
- [X] T037 [US3] Add state validation in ProtectedRoute to prevent race conditions during rapid navigation (FR-007)

**Checkpoint**: All user stories complete - modal works, content blocking works, navigation state is consistent

---

## Phase 6: Testing & Validation

**Purpose**: Ensure all acceptance scenarios from quickstart.md pass

- [X] T038 Run manual test: Homepage paywall modal appears for free users (Scenario 1 from quickstart.md)
- [X] T039 Run manual test: Tab content blocking without modals works for all Pro tabs (Scenario 2 from quickstart.md)
- [X] T040 Run manual test: Tab names display correctly in navigation (Scenario 3 from quickstart.md)
- [X] T041 Test subscription upgrade flow: Purchase Pro from blocked tab, verify immediate content access without restart
- [X] T042 Test trial expiration: Verify content blocking appears when trial expires
- [X] T043 Test rapid tab switching: 20+ switches in 10 seconds, verify no state corruption or crashes
- [X] T044 Verify Pro users never see modals or blocked content on any screen (FR-006, SC-006)
- [X] T045 Verify trial users have full access without modals or blocking (SC-006)
- [X] T046 Test network error handling: Offline mode shows appropriate messages, doesn't incorrectly show Pro content
- [X] T047 Measure performance: Modal displays within 1s, content blocking within 500ms, maintains 60fps during navigation

---

## Phase 7: Polish & Documentation

- [X] T048 [P] Add inline code documentation for ProtectedRoute dual-mode behavior
- [X] T049 [P] Add inline code documentation for paywallStore state management and cleanup
- [X] T050 Update feature documentation in specs/001-subscription-paywall-refactor/ with implementation notes
- [X] T051 Verify all translation keys are complete and consistent across en.json and tr.json
- [X] T052 Code cleanup: Remove any unused imports or deprecated subscription logic
- [X] T053 Verify TypeScript strict mode compliance (zero `any` types)
- [X] T054 Run ESLint and fix any code style issues
- [X] T055 Final validation: Run through quickstart.md scenarios and document results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Analysis)**: No dependencies - can start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Stories (Phases 3-5)**: All depend on Phase 2 (Foundation) completion
  - User stories can proceed in parallel if team capacity allows
  - Or sequentially in priority order (US1 P1 → US2 P1 → US3 P2)
- **Phase 6 (Testing)**: Depends on all user stories being complete
- **Phase 7 (Polish)**: Depends on testing completion, can have minor overlap

### User Story Dependencies

- **User Story 1 (P1) - Homepage Modal**: Can start after Phase 2 (Foundation) - No dependencies on other stories
- **User Story 2 (P1) - Tab Blocking**: Can start after Phase 2 (Foundation) - Builds on ProtectedRoute enhancements from US1, but can be worked in parallel if ProtectedRoute structure is defined
- **User Story 3 (P2) - Navigation State**: Can start after Phase 2 (Foundation) - May integrate with US1/US2 but focused on bug fixes

### Within Each User Story

- Update ProtectedRoute component first (modification before integration)
- Add translation keys before implementing features that use them
- Integration tasks (updating tab screens) can be done in parallel once ProtectedRoute is ready
- Test each story independently before moving to next

### Parallel Opportunities

**Phase 3 (US1) can run tasks in parallel:**
```
- T013: Add conditional logic for showPaywall behavior
- T015: Update homepage integration
- T017: Verify modal displays correct messaging
- T020: Verify upgrade navigation
```

**Phase 4 (US2) can update all tab screens in parallel:**
```
- T022: Update pets.tsx
- T023: Update health.tsx
- T024: Update calendar.tsx
- T025: Update feeding.tsx
- T026: Update expenses.tsx
- T027: Update budgets.tsx
```

**Phase 6 (Testing) should be sequential:**
```
- Complete tests in order from quickstart.md
- Each scenario builds on previous validation
- Fix issues immediately before next test
```

---

## Parallel Example: Full Team Deployment

With 3 developers working simultaneously after Foundation phase:

**Developer A** (User Story 1 - Homepage):
```bash
T012: Update ProtectedRoute with showPaywall prop
T014: Add useFocusEffect subscription checking
T015: Update app/(tabs)/index.tsx
T018: Add cleanup logic
T020: Verify upgrade navigation
```

**Developer B** (User Story 2 - Tab Blocking):
```bash
T021: Enhance ProtectedRoute for dual-mode
T029: Create UpgradePrompt component
T030: Integrate UpgradePrompt
T032: Verify cleanup logic
# Then parallel tab updates:
T022: Update pets.tsx
T023: Update health.tsx
T024: Update calendar.tsx
```

**Developer C** (User Story 2 continued + US3):
```bash
# Continue tab updates:
T025: Update feeding.tsx
T026: Update expenses.tsx
T027: Update budgets.tsx
# Then US3 Navigation:
T033: Fix tab name mappings
T034: Verify featureName passing
T036: Test rapid tab switching
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Analysis & existing code review
2. Complete Phase 2: Foundation - Paywall store and translations
3. Complete Phase 3: User Story 1 - Homepage paywall modal
4. **STOP and VALIDATE**: Test homepage modal independently with quickstart.md Scenario 1
5. Verify: Modal appears, shows correct messaging, upgrade navigation works
6. **Deploy/Demo MVP**: Homepage paywall functionality ready for feedback

**Result**: Minimum viable product delivers primary conversion point (homepage modal)

### Incremental Delivery (Recommended)

1. Complete Setup + Foundation → Foundation ready
2. Add User Story 1 → Test homepage modal → Deploy/Demo (MVP!)
3. Add User Story 2 → Test tab blocking → Deploy/Demo
4. Add User Story 3 → Test navigation state → Deploy/Demo
5. Complete Phase 6: Full testing validation
6. Complete Phase 7: Polish and documentation

**Result**: Each story adds value without breaking previous stories, enables early user feedback

### Parallel Team Strategy

With multiple developers (after Phase 2 Foundation complete):

1. Team completes Phase 1-2 together (setup and foundation)
2. Once ProtectedRoute structure is defined:
   - Developer A: User Story 1 (homepage modal)
   - Developer B: User Story 2 (tab blocking - component work)
   - Developer C: User Story 2 (tab blocking - integration work)
3. Developer A joins US3 when US1 complete
4. All stories integrate at Phase 6 testing

**Result**: Faster delivery if team capacity allows, requires good coordination

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability (US1, US2, US3)
- Each user story should be independently completable and testable
- Verify each story works before moving to next priority
- Commit after each task or logical group
- Fix issues immediately in testing phase before proceeding
- Performance targets: Modal < 1s, blocking < 500ms, 60fps navigation
- Zero tolerance for modal fatigue - free users should NEVER see modals on tab switches
- Subscription status must be current without app restart (test immediately)
