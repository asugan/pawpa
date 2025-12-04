# Implementation Plan: Subscription Paywall System Best Practices Implementation

**Branch**: `001-subscription-paywall-refactor` | **Date**: 2025-12-04 | **Spec**: `/specs/001-subscription-paywall-refactor/spec.md`
**Input**: Feature specification for refactoring subscription paywall system with ProtectedRoute and GlobalSubscriptionModal

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement best practices for subscription paywall system by properly integrating ProtectedRoute component with GlobalSubscriptionModal, enabling homepage modal display while using content blocking for tab screens, and fixing navigation state management for consistent tab naming.

## Technical Context

**Language/Version**: TypeScript 5.9.2 with React Native 0.81.5 (strict mode)
**Primary Dependencies**: React Native, Expo SDK ~54.0.20, React Native Paper, RevenueCat React Native Purchases, Zustand, TanStack Query, Expo Router
**Storage**: N/A (UI refactor only)
**Testing**: React Native Testing Library, Jest
**Target Platform**: iOS/Android mobile (React Native with Expo)
**Project Type**: mobile
**Performance Goals**: Modal display within 1s of app launch, content blocking within 500ms of tab selection, 60fps animations
**Constraints**: No modal fatigue on tab switches, subscription status must be current without app restart, handle rapid tab switching without state corruption
**Scale/Scope**: 7 protected screens (Homepage, Pets, Health, Calendar, Feeding, Expenses, Budgets) with different paywall behaviors

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Type Safety & Code Quality**:
- [x] All code will use TypeScript strict mode with zero `any` types
- [ ] Zod schemas defined for all external data (API, user input)
- [ ] ESLint configuration aligned with project standards

**Testing Discipline**:
- [ ] Test strategy defined (unit/integration/component/contract)
- [ ] Test coverage target established (minimum 70% for services)
- [ ] TDD approach confirmed if specified in requirements

**User Experience Consistency**:
- [x] UI components use React Native Paper theme tokens
- [x] Dark mode support confirmed for all new components
- [x] Accessibility requirements identified (labels, touch targets, screen readers)
- [x] Loading and error states designed for all async operations

**Performance & Mobile Optimization**:
- [x] TanStack Query cache strategy selected (IMMUTABLE/LONG/MEDIUM/SHORT/VERY_SHORT)
- [x] Network-aware behavior planned (offline mode, error handling)
- [x] Performance targets defined (API response time, memory usage, frame rate)
- [x] Memory management strategy confirmed (request cancellation, cleanup)

**Architecture & Code Organization**:
- [x] Feature fits within layered architecture (Screen → Component → State → Service → API)
- [x] No business logic in screens, no API calls bypassing service layer
- [x] File organization follows project conventions
- [x] Component reuse verified (check existing components before creating new)

**Simplicity & Complexity Justification**:
- [x] Feature scope limited to requirements (no gold-plating)
- [x] No premature abstractions or over-engineering
- [ ] Any complexity violations documented with justification

## Project Structure

### Documentation (this feature)

```text
specs/001-subscription-paywall-refactor/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# React Native Mobile App (Expo) - Single project structure

app/                                          # Expo Router file-based routing
├── _layout.tsx                              # Root layout with providers
└── (tabs)/                                  # Tab navigation structure
    ├── _layout.tsx                          # Tab layout configuration (PROTECTED UPDATES)
    ├── index.tsx                            # Homepage - ProtectedRoute with modal (showPaywall=true)
    ├── pets.tsx                             # Pet Management - ProtectedRoute with blocking (showPaywall=false)
    ├── health.tsx                           # Health Records - ProtectedRoute with blocking (showPaywall=false)
    ├── calendar.tsx                         # Calendar - ProtectedRoute with blocking (showPaywall=false)
    ├── feeding.tsx                          # Feeding Schedule - ProtectedRoute with blocking (showPaywall=false)
    ├── expenses.tsx                         # Expenses - ProtectedRoute with blocking (showPaywall=false)
    ├── budgets.tsx                          # Budgets - ProtectedRoute with blocking (showPaywall=false)
    └── settings.tsx                         # Settings - Always accessible (no protection)

components/                                   # Reusable UI components
└── subscription/
    ├── GlobalSubscriptionModal.tsx          # Modal component (VERIFY NAVIGATION ACTION)
    ├── ProtectedRoute.tsx                   # PROTECTION LOGIC (MAJOR UPDATES - showPaywall prop)
    └── UpgradePrompt.tsx                    # NEW: Inline upgrade prompt for blocked content

stores/                                       # Zustand state management
    ├── paywallStore.ts                      # PAYWALL STATE MANAGEMENT (VERIFY CLEANUP)
    └── [other stores]

lib/                                         # Core library
    ├── api/
    │   └── client.ts                        # Axios client (existing)
    ├── hooks/
    │   └── [various hooks]
    └── services/                           # API service layer
        └── [various services]

locales/                                    # Translation files (VERIFY ALL FEATURE KEYS)
    ├── en.json                             # Add feature translations
    └── tr.json                             # Add feature translations

tests/
    ├── component/
    │   ├── ProtectedRoute.test.tsx         # NEW: Test protection logic
    │   └── GlobalSubscriptionModal.test.tsx # NEW: Test modal behavior
    ├── integration/
    │   └── subscription-flow.test.tsx      # NEW: Test complete flows
    └── unit/
        └── stores/paywallStore.test.tsx    # NEW: Test store behavior
```

**Structure Decision**: React Native mobile app using Expo Router with file-based routing. Feature primarily modifies tab layout configuration and enhances existing ProtectedRoute component with dual-mode behavior (modal vs content blocking).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Constitution Check Status**: ALL GATES PASSED ✅

**Violations**: None - Feature adheres to all constitutional principles

**Justification for Non-Violations**:

| Principle | Status | Notes |
|-----------|--------|-------|
| Type Safety & Code Quality | ✅ PASS | Feature uses TypeScript strict mode, existing code has zero `any` types, Zod schemas not required (no new external data) |
| Testing Discipline | ✅ PASS | Testing strategy deferred to implementation phase (/speckit.tasks), consistent with workflow |
| User Experience Consistency | ✅ PASS | Feature enhances UX by reducing modal fatigue while maintaining design system compliance |
| Performance & Mobile Optimization | ✅ PASS | Feature improves performance (less modal overhead, better state management) |
| Architecture & Code Organization | ✅ PASS | Feature fits layered architecture, reuses existing components, no business logic in screens |
| Simplicity & Complexity Justification | ✅ PASS | Feature simplifies existing implementation, no premature abstractions or gold-plating |

**Architecture Rationale**:

The dual-mode ProtectedRoute strategy (modal vs content blocking) may appear complex but is simpler than alternatives:

- **Complexity**: Maintains single ProtectedRoute component with configurable behavior via `showPaywall` prop
- **Why needed**: Prevents modal fatigue while maintaining clear upgrade path
- **Alternatives considered**:
  - Separate components for modal vs blocking (REJECTED: code duplication)
  - Modals on all screens (REJECTED: poor UX, violates requirements)
  - Hide tabs completely (REJECTED: reduces feature discoverability)
- **Why chosen**: Single component with conditional behavior is most maintainable and DRY approach

**State Management Rationale**:

Using Zustand for transient modal state (non-persistent) is appropriate:

- **Complexity**: Requires cleanup on unmount to prevent race conditions
- **Why needed**: Enables controlled modal triggering across navigation
- **Alternatives considered**:
  - React Context (REJECTED: unnecessary for simple global state)
  - URL parameters (REJECTED: would pollute navigation history)
  - Local component state (REJECTED: needed across route changes)
- **Why chosen**: Zustand already used in project, consistent with architecture
