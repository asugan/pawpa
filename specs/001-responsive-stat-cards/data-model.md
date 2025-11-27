# Data Model: Responsive Stat Cards

**Feature**: `001-responsive-stat-cards`
**Type**: UI/Component Enhancement
**Date**: 2025-11-23

## Overview

This document defines the TypeScript interfaces, types, and constants for the responsive stat cards feature. Since this is a pure UI enhancement with no backend data changes, the "data model" consists of component props interfaces, layout state types, and viewport configuration.

## Component Interfaces

### StatCard Component (Enhanced)

**File**: `components/StatCard.tsx`

```typescript
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StatCardProps {
  // Existing props (preserved)
  title: string;                                              // Card label (e.g., "Total Pets")
  value: number;                                              // Numeric statistic to display
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; // Material icon name
  color: string;                                              // Theme color for icon/accent
  onPress: () => void;                                        // Tap handler (navigation or no-op)
  loading?: boolean;                                          // Loading state indicator
  error?: string;                                             // Error message if fetch failed

  // NEW: Responsive behavior props
  minWidth?: number;                                          // Minimum card width (default: 160px)
  maxTitleLines?: number;                                     // Title truncation lines (default: 2)
  showTooltip?: boolean;                                      // Enable tooltip for truncated text (default: true)
}

// Internal state (not exposed in props)
interface StatCardState {
  isTitleTruncated: boolean;   // Detected via onTextLayout
  tooltipVisible: boolean;     // Controlled tooltip visibility
}
```

**Props Rationale**:
- `minWidth`: Enforces FR-008 (minimum 160px) while allowing customization
- `maxTitleLines`: Implements FR-004 (2-line truncation) with flexibility
- `showTooltip`: Enables FR-011 (tooltip reveal) with opt-out capability

### Tooltip Component (New)

**File**: `components/Tooltip.tsx`

```typescript
interface TooltipProps {
  content: string;                   // Full text to display in tooltip
  children: React.ReactNode;         // Trigger element (wrapped component)
  visible: boolean;                  // Controlled visibility state
  onDismiss: () => void;             // Callback when tooltip dismissed
  position?: 'top' | 'bottom';       // Tooltip position relative to trigger (default: 'top')
  offset?: number;                   // Distance from trigger in pixels (default: 8)
  maxWidth?: number;                 // Maximum tooltip width (default: 300)
  backgroundColor?: string;          // Custom background color (default: theme.colors.surface)
  textColor?: string;                // Custom text color (default: theme.colors.onSurface)
  accessibilityLabel?: string;       // Screen reader announcement
}

// Internal layout measurements
interface TooltipLayout {
  triggerX: number;         // Trigger element X coordinate
  triggerY: number;         // Trigger element Y coordinate
  triggerWidth: number;     // Trigger element width
  triggerHeight: number;    // Trigger element height
  tooltipWidth: number;     // Measured tooltip width
  tooltipHeight: number;    // Measured tooltip height
}
```

**Design Decisions**:
- **Controlled component**: Parent manages `visible` state for predictable behavior
- **Portal rendering**: Renders tooltip at app root to avoid z-index issues
- **Absolute positioning**: Calculated from trigger layout measurements
- **Accessible**: Includes ARIA-like labels for screen readers

## Layout Types

### Viewport Breakpoints

**File**: `lib/hooks/useResponsiveSize.ts` (enhanced)

```typescript
// Viewport width thresholds
const BREAKPOINTS = {
  MOBILE_MAX: 767,      // Mobile: 320px - 767px (horizontal scroll)
  TABLET_MIN: 768,      // Tablet: 768px - 1024px (grid layout 2-3 columns)
  TABLET_MAX: 1024,     // Desktop: > 1024px (not optimized per spec)
} as const;

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveSizeValues {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  windowWidth: number;
  windowHeight: number;

  // StatCard-specific values
  statCardMinWidth: number;        // 160px on all devices (FR-008)
  statCardGap: number;             // 12px between cards (SC-007)
  statCardPadding: number;         // Internal card padding (12px mobile, 16px tablet)

  // Layout mode
  layoutMode: 'horizontal-scroll' | 'grid';  // Mobile vs tablet layout strategy
}
```

**Breakpoint Rationale**:
- `320px-767px`: Mobile range covers iPhone SE to larger phones
- `768px-1024px`: Tablet range covers iPad portrait/landscape
- `>1024px`: Desktop uses tablet layout per FR (no additional optimization)

### StatCard Container Layout

**File**: `app/(tabs)/index.tsx` (usage site)

```typescript
// Mobile layout (horizontal scroll)
interface MobileScrollLayout {
  horizontal: true;
  showsHorizontalScrollIndicator: false;  // FR-009: hide scrollbar
  contentContainerStyle: {
    gap: 12;                                // SC-007: minimum 12px gaps
    paddingHorizontal: 16;
  };
}

// Tablet layout (grid)
interface TabletGridLayout {
  flexDirection: 'row';
  flexWrap: 'wrap';
  gap: 12;                                  // SC-007: minimum 12px gaps
  justifyContent: 'flex-start';
  // Cards auto-wrap at 2-3 per row based on width
}
```

## Constants

### Styling Constants

```typescript
// Minimum values from requirements
export const STAT_CARD_CONSTRAINTS = {
  MIN_WIDTH: 160,              // FR-008: minimum card width
  MIN_FONT_SIZE: 12,           // SC-004: minimum readable font size
  MIN_TOUCH_TARGET: 44,        // Accessibility: minimum touch target
  MAX_TITLE_LINES: 2,          // FR-004: truncation after 2 lines
  CARD_GAP: 12,                // SC-007: minimum gap between cards
  CARD_BORDER_RADIUS: 12,      // Existing design system
  CARD_BORDER_WIDTH: 1,        // Existing design system
} as const;

// Viewport constraints
export const VIEWPORT_CONSTRAINTS = {
  MIN_SUPPORTED: 320,          // Clarification: minimum supported viewport
  MAX_OPTIMIZED: 1024,         // Clarification: maximum optimized viewport
} as const;

// Performance targets
export const PERFORMANCE_TARGETS = {
  SCROLL_RESPONSE_MS: 300,     // SC-003: maximum scroll response time
  TARGET_FPS: 60,              // Smooth animations
  LAYOUT_TRANSITION_MS: 200,   // Smooth breakpoint transitions
} as const;
```

## Validation Rules

### Runtime Validation (Development Mode)

```typescript
// StatCard prop validation (TypeScript + runtime checks)
const validateStatCardProps = (props: StatCardProps): void => {
  if (__DEV__) {
    if (props.minWidth && props.minWidth < STAT_CARD_CONSTRAINTS.MIN_WIDTH) {
      console.warn(
        `StatCard: minWidth (${props.minWidth}px) is less than minimum (${STAT_CARD_CONSTRAINTS.MIN_WIDTH}px)`
      );
    }

    if (props.maxTitleLines && props.maxTitleLines < 1) {
      console.warn('StatCard: maxTitleLines must be at least 1');
    }

    if (props.title.length === 0) {
      console.warn('StatCard: title should not be empty');
    }
  }
};
```

### Type Guards

```typescript
// Check if text is truncated (based on onTextLayout event)
const isTextTruncated = (layoutEvent: {
  lines: Array<{ text: string }>;
}): boolean => {
  const numberOfLines = layoutEvent.lines.length;
  const maxLines = STAT_CARD_CONSTRAINTS.MAX_TITLE_LINES;
  return numberOfLines > maxLines;
};

// Check if viewport is in supported range
const isViewportSupported = (width: number): boolean => {
  return width >= VIEWPORT_CONSTRAINTS.MIN_SUPPORTED;
};
```

## State Management

### Component-Level State

```typescript
// StatCard internal state (React.useState)
const [isTruncated, setIsTruncated] = React.useState(false);
const [showTooltip, setShowTooltip] = React.useState(false);

// Tooltip internal state
const [triggerLayout, setTriggerLayout] = React.useState<TooltipLayout | null>(null);
```

**No global state required**: All state is component-local. No Zustand store changes needed.

## Accessibility Types

### ARIA-like Attributes (React Native)

```typescript
interface AccessibilityProps {
  accessible: boolean;
  accessibilityRole: 'button' | 'text';
  accessibilityLabel: string;                    // Screen reader label
  accessibilityHint?: string;                    // Additional context
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
  };
}

// Example: StatCard with truncated text
const statCardA11y: AccessibilityProps = {
  accessible: true,
  accessibilityRole: 'button',
  accessibilityLabel: 'Total Pets: 2',
  accessibilityHint: 'Double tap to view pet list',
};

// Example: Tooltip
const tooltipA11y: AccessibilityProps = {
  accessible: true,
  accessibilityRole: 'text',
  accessibilityLabel: 'Full text: This is the complete untruncated title',
  accessibilityHint: 'Tap outside to dismiss',
};
```

## Testing Types

### Test Fixture Types

```typescript
// Mock data for component tests
interface StatCardTestProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  onPress: jest.Mock;
  // Optional overrides for specific test cases
  minWidth?: number;
  maxTitleLines?: number;
  loading?: boolean;
  error?: string;
}

// Viewport test scenarios
type ViewportScenario = {
  name: string;
  width: number;
  expectedLayout: 'horizontal-scroll' | 'grid';
  expectedCardsPerRow?: number;  // For grid layout
};

const VIEWPORT_TEST_CASES: ViewportScenario[] = [
  { name: 'iPhone SE', width: 375, expectedLayout: 'horizontal-scroll' },
  { name: 'iPhone Pro Max', width: 428, expectedLayout: 'horizontal-scroll' },
  { name: 'iPad Portrait', width: 768, expectedLayout: 'grid', expectedCardsPerRow: 2 },
  { name: 'iPad Landscape', width: 1024, expectedLayout: 'grid', expectedCardsPerRow: 3 },
  { name: 'Desktop', width: 1440, expectedLayout: 'grid', expectedCardsPerRow: 3 },
];
```

## Migration Notes

### Breaking Changes

**None** - This is a backward-compatible enhancement. Existing StatCard usage continues to work without changes. New responsive behavior is automatic based on viewport size.

### Deprecations

**None** - No existing APIs are deprecated.

### New Exports

```typescript
// components/StatCard.tsx
export { StatCard as default };
export type { StatCardProps };

// components/Tooltip.tsx (new)
export { Tooltip as default };
export type { TooltipProps };

// lib/hooks/useResponsiveSize.ts (enhanced)
export { useResponsiveSize };
export type { ResponsiveSizeValues, DeviceType };
export { BREAKPOINTS };
```

## Summary

This data model defines:
- ✅ 2 component interfaces (StatCard enhanced, Tooltip new)
- ✅ 3 layout types (viewport breakpoints, scroll layout, grid layout)
- ✅ 3 constant sets (styling, viewport, performance)
- ✅ 2 validation patterns (prop validation, type guards)
- ✅ Accessibility attribute types
- ✅ Test fixture types

**Zero data schema changes**: No database migrations, no API contract modifications, no backend changes required. This is a pure frontend UI enhancement.

**Type safety**: All interfaces use TypeScript strict mode with no `any` types. All component props are fully typed for IntelliSense and compile-time validation.

**Performance**: Layout measurements and state updates are optimized to minimize re-renders and maintain 60fps during scroll and transitions.
