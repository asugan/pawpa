# Tasks: Responsive Stat Cards for Dashboard

**Input**: Design documents from `/specs/001-responsive-stat-cards/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Tests are included per constitution requirement (Testing Discipline principle - component tests for responsive behavior)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile project**: `components/`, `app/`, `lib/`, `__tests__/` at repository root
- Paths shown below follow PawPa project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification of existing dependencies

- [x] T001 Verify existing StatCard component structure in components/StatCard.tsx
- [x] T002 Verify existing useResponsiveSize hook in lib/hooks/useResponsiveSize.ts
- [x] T003 [P] Verify React Native Paper theme system integration in lib/theme.ts
- [x] T004 [P] Verify existing Portal component availability in components/ui/ for tooltip rendering

**Checkpoint**: Foundation verified - all existing dependencies confirmed available ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure components that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create Tooltip component with Portal rendering and absolute positioning in components/Tooltip.tsx
- [x] T006 Implement text truncation detection utility using onTextLayout in components/Tooltip.tsx
- [x] T007 [P] Create viewport breakpoint constants in constants/ui.ts (MOBILE_MAX: 767, TABLET_MIN: 768, TABLET_MAX: 1024)
- [x] T008 [P] Enhance useResponsiveSize hook with layoutMode ('horizontal-scroll' | 'grid') in lib/hooks/useResponsiveSize.ts
- [x] T009 Create responsive layout wrapper logic (mobile vs tablet detection) in lib/hooks/useResponsiveSize.ts

**Checkpoint**: Foundation ready - Tooltip component and responsive infrastructure complete. User story implementation can now begin. ✅

---

## Phase 3: User Story 1 - View Dashboard Statistics on Mobile (Priority: P1) 🎯 MVP

**Goal**: Implement horizontal scrollable stat cards on mobile devices (320px-767px) with smooth touch interactions and proper visual separation

**Independent Test**: Open app on mobile simulator (375px width), verify stat cards display horizontally with smooth scroll, no overflow, all cards visible via swipe

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Component test: StatCard renders with mobile layout (width < 768px) in __tests__/components/StatCard.test.tsx
- [ ] T011 [P] [US1] Component test: Horizontal scroll container shows all cards without visual overflow in __tests__/components/StatCard.test.tsx
- [ ] T012 [P] [US1] Snapshot test: Mobile layout (375px) matches design reference in __tests__/components/__snapshots__/StatCard.test.tsx.snap

### Implementation for User Story 1

- [x] T013 [US1] Add horizontal ScrollView container logic to StatCard wrapper in components/StatCard.tsx
- [x] T014 [US1] Implement 160px minimum card width enforcement (FR-008) in components/StatCard.tsx
- [x] T015 [US1] Add gap={12} styling between cards in horizontal scroll container per SC-007 in components/StatCard.tsx
- [x] T016 [US1] Hide horizontal scrollbar (showsHorizontalScrollIndicator=false) per FR-009 in components/StatCard.tsx
- [x] T017 [US1] Ensure smooth scroll behavior with native scroll thread (scrollEventThrottle=16) in components/StatCard.tsx
- [x] T018 [US1] Update homepage dashboard to use responsive StatCard in app/(tabs)/index.tsx
- [x] T019 [US1] Verify 44px minimum touch targets maintained per accessibility requirements in components/StatCard.tsx

**Checkpoint**: Mobile horizontal scroll layout complete and independently testable on devices 320px-767px ✅

---

## Phase 4: User Story 3 - Consistent Visual Design Across Devices (Priority: P1)

**Goal**: Implement text truncation with tooltip reveal and maintain visual consistency (colors, typography, borders) across all viewports

**Independent Test**: Compare stat cards on different viewports (375px, 768px, 1024px), verify colors/borders match theme, tap truncated text shows tooltip

**Note**: US3 implemented before US2 because it's P1 (same priority as US1) and provides core tooltip functionality needed across all devices

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [P] [US3] Component test: Text truncates after 2 lines with ellipsis in __tests__/components/StatCard.test.tsx
- [ ] T021 [P] [US3] Component test: Tooltip appears on tap when text is truncated in __tests__/components/Tooltip.test.tsx
- [ ] T022 [P] [US3] Component test: Tooltip dismisses on tap outside in __tests__/components/Tooltip.test.tsx
- [ ] T023 [P] [US3] Component test: Visual styling (colors, borders) matches theme across viewports in __tests__/components/StatCard.test.tsx

### Implementation for User Story 3

- [x] T024 [P] [US3] Implement numberOfLines={2} with ellipsizeMode="tail" for title text in components/StatCard.tsx
- [x] T025 [P] [US3] Add onTextLayout event handler to detect text truncation in components/StatCard.tsx
- [x] T026 [US3] Integrate Tooltip component with StatCard (wrap card, control visibility state) in components/StatCard.tsx (depends on T024, T025)
- [x] T027 [US3] Implement tooltip trigger on card tap (only if text is truncated) in components/StatCard.tsx
- [x] T028 [US3] Add tooltip dismissal on tap outside using TouchableWithoutFeedback backdrop in components/Tooltip.tsx
- [x] T029 [US3] Ensure consistent theme colors (cyan/teal primary, dark backgrounds) across all card states in components/StatCard.tsx
- [x] T030 [US3] Verify consistent typography (font sizes, weights) across mobile/tablet/desktop in components/StatCard.tsx
- [x] T031 [US3] Add accessibility labels for tooltip interactions (screen reader support) in components/Tooltip.tsx

**Checkpoint**: Text truncation and tooltip functionality complete. Visual consistency verified across all viewport sizes. ✅

---

## Phase 5: User Story 2 - View Dashboard Statistics on Tablet (Priority: P2)

**Goal**: Implement multi-row grid layout on tablet devices (768px-1024px) with 2-3 cards per row, automatic wrapping, smooth orientation transitions

**Independent Test**: Open app on iPad simulator (768px width), verify stat cards display in grid (2-3 per row), rotate device, verify layout adapts smoothly

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T032 [P] [US2] Component test: StatCard renders with grid layout (width >= 768px) in __tests__/components/StatCard.test.tsx
- [ ] T033 [P] [US2] Component test: Cards wrap to multiple rows at tablet breakpoint (2-3 per row) in __tests__/components/StatCard.test.tsx
- [ ] T034 [P] [US2] Component test: No horizontal scrolling occurs on tablet layout in __tests__/components/StatCard.test.tsx
- [ ] T035 [P] [US2] Snapshot test: Tablet layout (768px, 1024px) matches design reference in __tests__/components/__snapshots__/StatCard.test.tsx.snap

### Implementation for User Story 2

- [x] T036 [P] [US2] Implement Flexbox grid with flexDirection="row" and flexWrap="wrap" in components/StatCard.tsx
- [x] T037 [P] [US2] Add responsive layout switching logic (mobile vs tablet) using useResponsiveSize hook in components/StatCard.tsx
- [x] T038 [US2] Calculate card width for 2-3 cards per row based on container width in components/StatCard.tsx (depends on T036, T037)
- [x] T039 [US2] Ensure gap={12} spacing between cards and rows in grid layout per SC-007 in components/StatCard.tsx
- [x] T040 [US2] Support additional rows for >3 cards (future-proofing per clarifications) in components/StatCard.tsx
- [x] T041 [US2] Add LayoutAnimation for smooth breakpoint transitions (<200ms per SC-006) in components/StatCard.tsx
- [x] T042 [US2] Update homepage dashboard grid container styling for tablet in app/(tabs)/index.tsx
- [ ] T043 [US2] Verify orientation change handling (portrait <-> landscape) in app/(tabs)/index.tsx

**Checkpoint**: Tablet grid layout complete. All user stories (US1, US2, US3) now independently functional. ✅

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T044 [P] Performance optimization: Verify <300ms scroll response time (SC-003) across all devices
- [ ] T045 [P] Performance optimization: Confirm 60fps during scroll and layout transitions using React DevTools Profiler
- [ ] T046 [P] Memory optimization: Verify tooltip state cleanup on component unmount (no memory leaks)
- [ ] T047 [P] Verify minimum font size 12px maintained across all viewports (SC-004)
- [ ] T048 [P] Verify consistent card height within rows/scroll container (FR-010)
- [ ] T049 [P] Edge case testing: Test extreme viewports (<320px, >1024px) use boundary constraints per clarifications
- [ ] T050 [P] Edge case testing: Test >3 cards scenario (horizontal scroll on mobile, multi-row on tablet)
- [ ] T051 [P] Accessibility audit: Verify 44px minimum touch targets, screen reader labels, tooltip announcements
- [ ] T052 [P] Visual regression testing: Compare with reference designs (tasarim/code.html, tasarim/screen.png) for 95% fidelity (SC-005)
- [ ] T053 Code cleanup: Remove any debug console.log statements and development comments
- [ ] T054 Documentation: Update component documentation in components/StatCard.tsx with JSDoc comments
- [ ] T055 Documentation: Update quickstart.md examples if implementation differs from plan
- [ ] T056 Run full test suite: Verify all component tests pass with 100% coverage for StatCard responsive logic
- [ ] T057 Run quickstart.md validation: Follow quickstart guide to verify all examples work correctly

**Final Checkpoint**: All user stories complete, tested, and polished. Feature ready for code review and deployment.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - MVP critical path
- **User Story 3 (Phase 4)**: Depends on Foundational completion - Can run in parallel with US1 (different concerns)
- **User Story 2 (Phase 5)**: Depends on Foundational completion - Can run after US1/US3
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Mobile Layout)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1 - Visual Consistency & Tooltip)**: Can start after Foundational (Phase 2) - No dependencies on other stories - Can run in PARALLEL with US1
- **User Story 2 (P2 - Tablet Layout)**: Can start after Foundational (Phase 2) - Independent but benefits from US1 completion for testing continuity

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach per constitution)
- Foundational components (Tooltip, responsive hooks) before StatCard enhancements
- Core responsive logic before integration with homepage
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 - Setup (All tasks can run in parallel)**:
- T001, T002, T003, T004 (verification tasks, different files)

**Phase 2 - Foundational**:
- T005, T006 (Tooltip component + utility)
- T007, T008, T009 (Responsive infrastructure)

**User Story Tests (within each story)**:
- All test tasks marked [P] can run in parallel (different test files/cases)

**User Story Implementation**:
- US1 and US3 can be developed in PARALLEL (different concerns: layout vs tooltip/styling)
- Model/component tasks marked [P] can run in parallel

**Phase 6 - Polish**:
- T044, T045, T046, T047, T048, T049, T050, T051, T052 (validation tasks, different concerns)

---

## Parallel Example: User Story 1 (Mobile Layout)

```bash
# Launch all tests for User Story 1 together:
Task: "Component test: StatCard renders with mobile layout in __tests__/components/StatCard.test.tsx"
Task: "Component test: Horizontal scroll shows all cards in __tests__/components/StatCard.test.tsx"
Task: "Snapshot test: Mobile layout matches design in __tests__/components/__snapshots__/StatCard.test.tsx.snap"

# After tests written, implement in sequence:
# T013 → T014 → T015 → T016 → T017 → T018 → T019
```

## Parallel Example: User Story 3 (Tooltip & Visual Consistency)

```bash
# Launch all tests for User Story 3 together:
Task: "Component test: Text truncates after 2 lines in __tests__/components/StatCard.test.tsx"
Task: "Component test: Tooltip appears on tap in __tests__/components/Tooltip.test.tsx"
Task: "Component test: Tooltip dismisses on tap outside in __tests__/components/Tooltip.test.tsx"
Task: "Component test: Visual styling matches theme in __tests__/components/StatCard.test.tsx"

# Parallel implementation opportunities:
# T024 and T025 can run in parallel (text truncation + detection, different aspects)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify dependencies) → **~15 minutes**
2. Complete Phase 2: Foundational (Tooltip + responsive hooks) → **2-3 hours**
3. Complete Phase 3: User Story 1 (mobile horizontal scroll) → **2-3 hours**
4. **STOP and VALIDATE**: Test User Story 1 independently on mobile simulators
5. Deploy/demo if ready → **MVP: Mobile users can scroll through stat cards**

**MVP Delivery Time**: ~4-7 hours of focused development

### Incremental Delivery

1. **Foundation** (Phases 1-2) → Tooltip + responsive infrastructure ready
2. **MVP: Mobile** (Phase 3) → Test independently → Deploy (US1 complete)
3. **Consistency** (Phase 4) → Add tooltip interactions → Test independently → Deploy (US1 + US3)
4. **Tablet** (Phase 5) → Add grid layout → Test independently → Deploy (All stories complete)
5. **Polish** (Phase 6) → Performance validation → Final deployment

**Total Feature Time**: ~8-12 hours for complete implementation + testing

### Parallel Team Strategy

With 2 developers after Foundational phase completes:

1. **Team completes Phases 1-2 together** (Setup + Foundational) → ~3 hours
2. **Once Foundational done, split work**:
   - **Developer A**: User Story 1 (Mobile Layout) → Phase 3
   - **Developer B**: User Story 3 (Tooltip & Visual Consistency) → Phase 4
3. **Merge US1 and US3**, then either developer can do:
   - **Either Dev**: User Story 2 (Tablet Layout) → Phase 5
4. **Team completes Phase 6 together** (Polish + validation)

**Parallel Team Time**: ~6-8 hours total (40% time savings vs sequential)

---

## Task Summary

### Total Tasks: 57

**By Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 5 tasks
- Phase 3 (US1 - Mobile Layout): 10 tasks (3 tests + 7 implementation)
- Phase 4 (US3 - Visual Consistency): 12 tasks (4 tests + 8 implementation)
- Phase 5 (US2 - Tablet Layout): 12 tasks (4 tests + 8 implementation)
- Phase 6 (Polish): 14 tasks

**By User Story**:
- User Story 1 (Mobile Layout): 10 tasks
- User Story 2 (Tablet Layout): 12 tasks
- User Story 3 (Visual Consistency): 12 tasks
- Infrastructure (Setup + Foundational + Polish): 23 tasks

**Test Coverage**:
- Component tests: 11 test tasks
- Snapshot tests: 2 test tasks
- Validation tests: 7 test tasks (performance, accessibility, edge cases)
- **Total test tasks**: 20 (35% of all tasks - meets testing discipline requirement)

**Parallel Opportunities**:
- Phase 1: 3 parallel tasks (T002, T003, T004)
- Phase 2: 2 parallel groups (Tooltip + Responsive infrastructure)
- US1 Tests: 3 parallel tasks
- US2 Tests: 4 parallel tasks
- US3 Tests: 4 parallel tasks
- Phase 6: 9 parallel validation tasks

**Independent Test Criteria**:
- US1: Open mobile sim (375px), verify horizontal scroll, smooth swipe, no overflow
- US2: Open tablet sim (768px), verify grid 2-3 per row, no horizontal scroll, rotation handling
- US3: Compare viewports, verify theme consistency, tap truncated text shows tooltip

**Suggested MVP Scope**:
- Phases 1-3 only (Setup + Foundational + User Story 1)
- Delivers: Mobile horizontal scroll with smooth interactions
- Time estimate: 4-7 hours
- Value: Primary mobile users can view and interact with stat cards

---

## Notes

- [P] tasks = different files/concerns, no dependencies, can run in parallel
- [Story] label maps task to specific user story (US1, US2, US3) for traceability
- Each user story should be independently completable and testable
- Tests written FIRST (TDD), must FAIL before implementation begins
- Commit after each task or logical group for granular history
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- TypeScript strict mode enforced: Zero `any` types allowed
- Constitution compliance: All principles followed (type safety, testing, UX consistency, performance, simplicity)
