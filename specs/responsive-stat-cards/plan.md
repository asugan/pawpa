# Implementation Plan: Responsive Stat Cards for Dashboard

**Branch**: `001-responsive-stat-cards` | **Date**: 2025-11-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-responsive-stat-cards/spec.md`

## Summary

Fix stat card layout responsiveness on mobile and tablet devices by implementing horizontal scroll on mobile (320px-767px) and multi-row grid layout on tablet (768px-1024px). The solution includes text truncation with tooltip reveal and maintains visual consistency across all viewport sizes according to the existing cyan/teal dark theme design system.

## Technical Context

**Language/Version**: TypeScript 5.9.2 with React Native 0.81.5 (strict mode)
**Primary Dependencies**: React Native, Expo SDK ~54.0.20, React Native Paper (theme system)
**UI Components**: React Native core components (ScrollView, View, Pressable), Material Community Icons
**Testing**: React Native Testing Library (component tests required)
**Target Platform**: iOS 15+, Android 8+, Web (responsive layout)
**Project Type**: Mobile (Expo/React Native)
**Performance Goals**: <300ms scroll response time, 60fps animations, smooth layout transitions
**Constraints**: Minimum 12px font size, minimum 160px card width, 44px minimum touch targets, viewport range 320px-1024px
**Scale/Scope**: Single component enhancement affecting 1 screen (home dashboard), existing StatCard component modification

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Type Safety & Code Quality**:
- [x] All code will use TypeScript strict mode with zero `any` types
- [x] Zod schemas defined for all external data (API, user input) - N/A for layout-only feature
- [x] ESLint configuration aligned with project standards

**Testing Discipline**:
- [x] Test strategy defined (component tests for responsive behavior, snapshot tests for breakpoints)
- [x] Test coverage target established (100% for responsive layout logic in StatCard component)
- [x] TDD approach confirmed if specified in requirements - Not specified, tests after implementation

**User Experience Consistency**:
- [x] UI components use React Native Paper theme tokens (existing theme.colors.primary, surface, onSurface)
- [x] Dark mode support confirmed for all new components (using existing theme system)
- [x] Accessibility requirements identified (tooltip dismissal, 44px touch targets maintained, screen reader labels)
- [x] Loading and error states designed for all async operations - N/A (layout enhancement only, existing states preserved)

**Performance & Mobile Optimization**:
- [x] TanStack Query cache strategy selected - N/A (no data fetching changes)
- [x] Network-aware behavior planned (offline mode, error handling) - N/A (layout enhancement only)
- [x] Performance targets defined (<300ms scroll, 60fps transitions, smooth breakpoint changes)
- [x] Memory management strategy confirmed (tooltip lifecycle cleanup, no memory leaks)

**Architecture & Code Organization**:
- [x] Feature fits within layered architecture (Component layer modification only)
- [x] No business logic in screens, no API calls bypassing service layer (pure UI enhancement)
- [x] File organization follows project conventions (components/StatCard.tsx, components/Tooltip.tsx)
- [x] Component reuse verified (modifying existing StatCard component, no new card variants)

**Simplicity & Complexity Justification**:
- [x] Feature scope limited to requirements (responsive layout + tooltip, no additional features)
- [x] No premature abstractions or over-engineering (using native ScrollView, View, simple responsive logic)
- [x] Any complexity violations documented with justification - None anticipated

## Project Structure

### Documentation (this feature)

```text
specs/001-responsive-stat-cards/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command) - Minimal (UI-only feature)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - N/A (no API changes)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
pawpa/
├── app/
│   └── (tabs)/
│       └── index.tsx           # Homepage dashboard - StatCard usage site (minimal changes)
├── components/
│   ├── StatCard.tsx            # MODIFY - Add responsive props and layout logic
│   └── Tooltip.tsx             # CREATE - Reusable tooltip/popover component
├── lib/
│   └── hooks/
│       └── useResponsiveSize.ts  # VERIFY/ENHANCE - Existing hook for responsive utilities
├── constants/
│   └── ui.ts                   # VERIFY - Breakpoint constants if needed
└── __tests__/
    └── components/
        ├── StatCard.test.tsx   # CREATE - Component tests for responsive behavior
        └── Tooltip.test.tsx    # CREATE - Component tests for tooltip interaction
```

**Structure Decision**: Mobile + API project structure. This feature is a pure frontend/component enhancement in the React Native mobile app. No backend API changes required. Modifications are isolated to the component layer with one existing component modification (StatCard) and one new reusable component (Tooltip).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. This feature adheres to all principles:
- Pure UI enhancement within existing architecture
- Uses existing responsive hooks and theme system
- Maintains component layer isolation
- No premature abstractions (simple ScrollView wrapper, basic tooltip component)
- TypeScript strict mode maintained
- Performance optimized (native scroll, minimal re-renders)

---

## Phase 0: Research & Unknowns

**Status**: Ready to begin

### Research Tasks

1. **React Native responsive layout patterns for horizontal scroll vs grid**
   - Research: Best practices for ScrollView horizontal mode with proper touch handling
   - Research: Flexbox grid patterns for wrapping cards at tablet breakpoints
   - Research: Performance implications of layout switching (useWindowDimensions vs Media Queries)

2. **React Native tooltip/popover implementation patterns**
   - Research: Native tooltip libraries (react-native-popover-view, react-native-modal)
   - Research: Custom tooltip positioning above touch target
   - Research: Accessibility considerations (screen reader announcements, dismissal gestures)

3. **Text truncation strategies in React Native**
   - Research: numberOfLines with ellipsizeMode implementation
   - Research: Detecting truncated text programmatically (onTextLayout)
   - Research: Cross-platform text measurement differences (iOS vs Android)

4. **Responsive breakpoint management**
   - Research: useWindowDimensions hook usage and performance
   - Research: Existing breakpoint constants in project (verify constants/ui.ts)
   - Research: SSR/web compatibility for responsive layouts

5. **Performance optimization for list scrolling**
   - Research: ScrollView vs FlatList for small card counts (3-4 cards)
   - Research: useNativeDriver limitations with layout animations
   - Research: Frame rate monitoring during breakpoint transitions

**Deliverable**: `research.md` documenting decisions, rationales, and chosen approaches for each unknown.

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

### Data Model

Since this is a UI-only feature with no data schema changes, the data model document will capture:
- StatCard props interface (existing + new responsive props)
- Tooltip component props interface
- Viewport breakpoint thresholds (constants)
- Layout state types (mobile horizontal vs tablet grid)

**Deliverable**: `data-model.md` with component interfaces and layout types.

### API Contracts

**N/A** - No API changes required. This feature modifies only frontend layout and UI interaction patterns.

### Component Contracts

```typescript
// components/StatCard.tsx - Enhanced interface
interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  onPress: () => void;
  loading?: boolean;
  error?: string;
  // NEW: Responsive behavior (optional, defaults handle mobile/tablet auto-detection)
  minWidth?: number;         // Default: 160px
  numberOfLines?: number;    // Default: 2 for title truncation
}

// components/Tooltip.tsx - New component interface
interface TooltipProps {
  content: string;             // Full text to display
  children: React.ReactNode;   // Trigger element
  visible: boolean;            // Controlled visibility
  onDismiss: () => void;       // Dismiss callback
  position?: 'top' | 'bottom'; // Default: 'top'
}
```

### Quickstart Guide

**Deliverable**: `quickstart.md` providing:
- How to use enhanced StatCard component with responsive layout
- How to implement tooltip interaction for truncated text
- Examples of mobile horizontal scroll and tablet grid configurations
- Testing responsive behavior at different viewport sizes

### Agent Context Update

After generating design artifacts, run:

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will update `.specify/memory/context-claude.md` with:
- New Tooltip component pattern
- Responsive layout patterns for StatCard
- Text truncation implementation approach
- Performance optimization notes for mobile scrolling

**Deliverables**:
- `data-model.md`
- `quickstart.md`
- `.specify/memory/context-claude.md` (updated)

---

## Constitution Re-Check (Post-Design)

After Phase 1 design completion, verify:

- [x] Component interfaces use strict TypeScript types (no `any`)
- [x] Tooltip component reusable across app (follows component reuse principle)
- [x] Responsive behavior uses existing theme system (no hardcoded values)
- [x] Accessibility requirements met (tooltip announcements, touch targets)
- [x] Performance targets achievable (native scroll, minimal state updates)
- [x] No layering violations (component layer only, no service/API layer changes)
- [x] Simplicity maintained (no over-engineered state machines or abstractions)

**Gate**: Must pass before proceeding to Phase 2 (Task Breakdown via `/speckit.tasks`)

---

## Next Steps

1. Execute Phase 0 research to resolve all unknowns
2. Generate Phase 1 design artifacts (data-model, quickstart)
3. Update agent context with new patterns
4. Re-validate constitution compliance
5. Proceed to `/speckit.tasks` for task breakdown and implementation planning
