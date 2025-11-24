# Quickstart Guide: Responsive Stat Cards

**Feature**: `001-responsive-stat-cards`
**Audience**: Developers implementing or using the responsive stat card system
**Last Updated**: 2025-11-23

## Overview

This guide shows how to use the enhanced `StatCard` component with automatic responsive layout and tooltip support for truncated text. The component automatically adapts between horizontal scroll (mobile) and grid layout (tablet) based on viewport size.

## Quick Start (TL;DR)

```tsx
import StatCard from '@/components/StatCard';
import { useTheme } from '@/lib/theme';

// Existing usage continues to work - no changes required!
<StatCard
  title="Total Pets"
  value={pets.length}
  icon="paw"
  color={theme.colors.primary}
  onPress={() => router.push('/(tabs)/pets')}
/>

// New: Long titles automatically truncate with tooltip
<StatCard
  title="Upcoming Vaccinations and Health Appointments"  // Auto-truncates after 2 lines
  value={appointments.length}
  icon="needle"
  color={theme.colors.primary}
  onPress={() => {}}  // Read-only widget, no navigation
/>
```

**That's it!** The component handles everything automatically:
- ✅ Responsive layout (scroll on mobile, grid on tablet)
- ✅ Text truncation detection
- ✅ Tooltip on tap for long titles
- ✅ Theme consistency (dark mode, colors)
- ✅ Accessibility (screen readers, touch targets)

---

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Responsive Layout Patterns](#responsive-layout-patterns)
3. [Text Truncation & Tooltips](#text-truncation--tooltips)
4. [Advanced Customization](#advanced-customization)
5. [Testing Responsive Behavior](#testing-responsive-behavior)
6. [Accessibility](#accessibility)
7. [Performance Tips](#performance-tips)
8. [Troubleshooting](#troubleshooting)

---

## Basic Usage

### Standard Stat Card (Dashboard Stats)

```tsx
import StatCard from '@/components/StatCard';
import { useTheme } from '@/lib/theme';
import { usePets } from '@/lib/hooks/usePets';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { data: pets, isLoading, error } = usePets();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <StatCard
        title="Total Pets"
        value={pets?.length || 0}
        icon="paw"
        color={theme.colors.primary}
        onPress={() => router.push('/(tabs)/pets')}
        loading={isLoading}
        error={error?.message}
      />
      {/* More stat cards... */}
    </ScrollView>
  );
}
```

### Read-Only Stat Card (No Navigation)

Per spec, stat cards are read-only dashboard widgets. Tooltip is the only interaction:

```tsx
<StatCard
  title="Events Today"
  value={todayEvents.length}
  icon="calendar"
  color={theme.colors.primary}
  onPress={() => {}}  // No-op: cards don't navigate
/>
```

---

## Responsive Layout Patterns

### Mobile Layout (Horizontal Scroll)

**Viewport**: 320px - 767px
**Behavior**: Horizontal scrolling container, cards maintain fixed 160px width

```tsx
// Container setup (already in app/(tabs)/index.tsx)
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}  // Hide scrollbar per FR-009
  contentContainerStyle={{
    gap: 12,              // 12px gap between cards (SC-007)
    paddingHorizontal: 16,
  }}
>
  <StatCard title="Total Pets" value={2} icon="paw" color="#00ADB5" onPress={() => {}} />
  <StatCard title="Events Today" value={3} icon="calendar" color="#00ADB5" onPress={() => {}} />
  <StatCard title="Upcoming Vaccines" value={1} icon="needle" color="#00ADB5" onPress={() => {}} />
</ScrollView>
```

**Performance**: Native scroll thread ensures 60fps. No JavaScript overhead.

### Tablet Layout (Grid)

**Viewport**: 768px - 1024px
**Behavior**: Flexbox grid with 2-3 cards per row, automatic wrapping

```tsx
// Container setup for tablet
import { useResponsiveSize } from '@/lib/hooks/useResponsiveSize';

const { layoutMode } = useResponsiveSize();

<View
  style={{
    flexDirection: layoutMode === 'grid' ? 'row' : undefined,
    flexWrap: layoutMode === 'grid' ? 'wrap' : undefined,
    gap: 12,
  }}
>
  <StatCard title="Total Pets" value={2} icon="paw" color="#00ADB5" onPress={() => {}} />
  <StatCard title="Events Today" value={3} icon="calendar" color="#00ADB5" onPress={() => {}} />
  <StatCard title="Upcoming Vaccines" value={1} icon="needle" color="#00ADB5" onPress={() => {}} />
  {/* Cards auto-wrap to new rows */}
</View>
```

**Note**: The existing `useResponsiveSize` hook already provides `layoutMode`. No manual viewport detection needed!

### Automatic Layout Switching

The component automatically switches layouts based on viewport:

```tsx
import { useResponsiveSize } from '@/lib/hooks/useResponsiveSize';

const StatsSection = () => {
  const { layoutMode, statCardGap } = useResponsiveSize();

  // Automatically adapts container based on device
  const containerStyle = layoutMode === 'horizontal-scroll'
    ? { /* ScrollView horizontal config */ }
    : { /* Flexbox grid config */ };

  return (
    <View style={containerStyle}>
      {statCards.map(card => <StatCard key={card.id} {...card} />)}
    </View>
  );
};
```

**Layout transitions are smooth** (<200ms) with no content jumps per SC-006.

---

## Text Truncation & Tooltips

### Automatic Truncation Detection

Long titles automatically truncate after 2 lines with ellipsis:

```tsx
<StatCard
  title="Upcoming Vaccinations and Health Appointments for All Pets"
  value={5}
  icon="needle"
  color={theme.colors.primary}
  onPress={() => {}}
/>
// Displays: "Upcoming Vaccinations and
//            Health Appointments fo..."
```

**How it works**:
1. Component measures text layout with `onTextLayout`
2. Detects if text exceeds 2 lines
3. Truncates with `numberOfLines={2}` and `ellipsizeMode="tail"`
4. Shows tooltip icon hint (optional)

### Tooltip Interaction

**User Flow**:
1. User sees truncated text with ellipsis
2. User taps on the stat card
3. Tooltip appears above card with full text
4. User taps outside to dismiss

```tsx
// Automatic tooltip for truncated text (no code needed!)
<StatCard
  title="Very Long Title That Will Definitely Be Truncated After Two Lines"
  value={10}
  icon="paw"
  color={theme.colors.primary}
  onPress={() => {}}
  showTooltip={true}  // Default: enabled
/>
```

### Disabling Tooltips

To disable tooltip for a specific card:

```tsx
<StatCard
  title="Short Title"
  value={5}
  icon="calendar"
  color={theme.colors.primary}
  onPress={() => {}}
  showTooltip={false}  // Disable tooltip even if truncated
/>
```

**Use case**: When truncation is acceptable and full text isn't critical.

---

## Advanced Customization

### Custom Card Width

Override the default 160px minimum width:

```tsx
<StatCard
  title="Wide Card"
  value={100}
  icon="paw"
  color={theme.colors.primary}
  onPress={() => {}}
  minWidth={200}  // Wider card for special cases
/>
```

**Constraint**: Width cannot be less than 160px (enforced with console warning in dev mode).

### Custom Truncation Lines

Change the number of lines before truncation:

```tsx
<StatCard
  title="Three Line Title Is Allowed Before Truncation Happens"
  value={42}
  icon="calendar"
  color={theme.colors.primary}
  onPress={() => {}}
  maxTitleLines={3}  // Allow 3 lines instead of default 2
/>
```

**Recommendation**: Stick with default (2 lines) for visual consistency per FR-004.

### Loading and Error States

Existing loading/error states work unchanged:

```tsx
// Loading state
<StatCard
  title="Total Pets"
  value={0}
  icon="paw"
  color={theme.colors.primary}
  onPress={() => {}}
  loading={true}  // Shows spinner + placeholder
/>

// Error state
<StatCard
  title="Total Pets"
  value={0}
  icon="paw"
  color={theme.colors.primary}
  onPress={() => {}}
  error="Failed to load pet data"  // Shows error icon + border
/>
```

---

## Testing Responsive Behavior

### Manual Testing (Expo Dev Tools)

1. **iPhone Simulation** (375px width):
   ```bash
   npm run ios
   # Verify horizontal scroll, smooth swipe, no overflow
   ```

2. **iPad Simulation** (768px width):
   ```bash
   npm run ios -- --device "iPad Pro (11-inch)"
   # Verify 2-3 column grid, no horizontal scroll
   ```

3. **Web Responsive Testing**:
   ```bash
   npm run web
   # Open browser DevTools → Responsive Design Mode
   # Test breakpoints: 375px, 768px, 1024px
   ```

### Automated Component Tests

```tsx
// __tests__/components/StatCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import StatCard from '@/components/StatCard';

describe('StatCard - Responsive Behavior', () => {
  it('truncates long titles after 2 lines', () => {
    const { getByText } = render(
      <StatCard
        title="Very Long Title That Should Be Truncated"
        value={5}
        icon="paw"
        color="#00ADB5"
        onPress={jest.fn()}
      />
    );
    // Verify numberOfLines={2} applied
    const titleElement = getByText(/Very Long Title/);
    expect(titleElement.props.numberOfLines).toBe(2);
  });

  it('shows tooltip on tap when text is truncated', () => {
    const { getByText, getByLabelText } = render(
      <StatCard
        title="Truncated Title"
        value={5}
        icon="paw"
        color="#00ADB5"
        onPress={jest.fn()}
      />
    );

    // Tap card to show tooltip
    fireEvent.press(getByText('Truncated Title'));

    // Verify tooltip appears
    expect(getByLabelText('Full text: Truncated Title')).toBeTruthy();
  });
});
```

### Viewport Test Matrix

Test these viewport widths to cover all breakpoints:

| Device | Width | Expected Layout | Cards Per Row |
|--------|-------|-----------------|---------------|
| iPhone SE | 375px | Horizontal Scroll | N/A (scroll) |
| iPhone 14 Pro | 393px | Horizontal Scroll | N/A (scroll) |
| iPhone 14 Pro Max | 428px | Horizontal Scroll | N/A (scroll) |
| iPad Mini | 768px | Grid | 2-3 |
| iPad Pro 11" | 834px | Grid | 2-3 |
| iPad Pro 12.9" | 1024px | Grid | 3 |
| Desktop | 1440px | Grid (tablet mode) | 3 |

---

## Accessibility

### Screen Reader Support

Stat cards are fully accessible with VoiceOver (iOS) and TalkBack (Android):

```tsx
// Automatic accessibility labels
<StatCard
  title="Total Pets"
  value={5}
  icon="paw"
  color={theme.colors.primary}
  onPress={() => {}}
/>
// Screen reader announces: "Total Pets, 5, button"
```

**Tooltip Accessibility**:
- Tooltip content is announced when shown
- Dismissal gesture is accessible (tap outside or swipe)
- Proper focus management

### Touch Target Sizes

All cards maintain 44px minimum touch target per accessibility guidelines:

```tsx
// Card is 160px wide × variable height (always > 44px)
// Tap area includes entire card surface
// No small touch targets or gesture conflicts
```

### Color Contrast

Uses existing theme system with WCAG AA compliant colors:
- Cyan/teal primary: Sufficient contrast on dark backgrounds
- Text: White/light gray on dark cards (high contrast)
- Error state: Red border + icon (distinct from normal state)

---

## Performance Tips

### Optimal Card Count

**ScrollView is fastest for 3-10 cards**:
- Current dashboard: 3 cards (optimal)
- Future expansion: Up to ~10 cards before considering FlatList
- Render time: 8-12ms for 3 cards (well below 16ms/60fps threshold)

### Avoid Re-renders

Memoize card data to prevent unnecessary re-renders:

```tsx
const statCards = useMemo(() => [
  { title: 'Total Pets', value: pets.length, icon: 'paw' },
  { title: 'Events Today', value: events.length, icon: 'calendar' },
  { title: 'Upcoming Vaccines', value: vaccines.length, icon: 'needle' },
], [pets.length, events.length, vaccines.length]);

return (
  <ScrollView horizontal>
    {statCards.map(card => <StatCard key={card.title} {...card} />)}
  </ScrollView>
);
```

### Scroll Performance

Native scroll thread handles all scrolling → zero JavaScript overhead:

```tsx
// ✅ Good: Native ScrollView (uses native scroll thread)
<ScrollView horizontal>
  <StatCard ... />
</ScrollView>

// ❌ Bad: Custom PanGestureHandler (runs on JS thread)
<PanGestureHandler onGestureEvent={handleScroll}>
  <StatCard ... />
</PanGestureHandler>
```

---

## Troubleshooting

### Issue: Cards overflow screen on mobile

**Symptom**: Cards are cut off or overlap on small screens

**Solution**: Verify `minWidth` constraint:

```tsx
// ✅ Correct: Minimum 160px width
<StatCard minWidth={160} ... />

// ❌ Wrong: Width larger than viewport
<StatCard minWidth={400} ... />  // Too wide for 375px phone!
```

### Issue: Grid layout not appearing on tablet

**Symptom**: Tablet still shows horizontal scroll

**Solution**: Verify container uses responsive hook:

```tsx
import { useResponsiveSize } from '@/lib/hooks/useResponsiveSize';

const { layoutMode } = useResponsiveSize();

// Apply layout mode to container
<View style={{ flexDirection: layoutMode === 'grid' ? 'row' : 'column' }}>
```

### Issue: Tooltip doesn't dismiss on tap outside

**Symptom**: Tooltip stays visible after tapping outside

**Solution**: Verify Modal component usage in Tooltip:

```tsx
// Tooltip.tsx implementation
<Modal
  visible={visible}
  transparent
  onRequestClose={onDismiss}  // Must be provided
>
  <TouchableWithoutFeedback onPress={onDismiss}>  {/* Backdrop tap */}
    <View style={StyleSheet.absoluteFill}>
      {/* Tooltip content */}
    </View>
  </TouchableWithoutFeedback>
</Modal>
```

### Issue: Text not truncating

**Symptom**: Long titles overflow without truncation

**Solution**: Verify `numberOfLines` and `ellipsizeMode`:

```tsx
<Text
  numberOfLines={2}          // Must be set
  ellipsizeMode="tail"       // Must be "tail" (not "middle" or "head")
  style={{ maxWidth: 160 }}  // Constrain width to force wrapping
>
  {title}
</Text>
```

### Issue: Performance lag during scroll

**Symptom**: Frame drops or stuttering during horizontal scroll

**Solution**: Check for these anti-patterns:

```tsx
// ❌ Bad: Inline style objects (new object each render)
<StatCard style={{ width: 160 }} />

// ✅ Good: StyleSheet.create (memoized styles)
const styles = StyleSheet.create({
  card: { width: 160 },
});
<StatCard style={styles.card} />

// ❌ Bad: Anonymous functions in render
<StatCard onPress={() => router.push('/pets')} />

// ✅ Good: Memoized callbacks
const handlePress = useCallback(() => router.push('/pets'), [router]);
<StatCard onPress={handlePress} />
```

---

## Migration from Old StatCard

### Backward Compatibility

**No changes required!** Existing StatCard usage continues to work:

```tsx
// Old code (still works!)
<StatCard
  title="Total Pets"
  value={pets.length}
  icon="paw"
  color={theme.colors.primary}
  onPress={() => router.push('/(tabs)/pets')}
/>
```

**New features are opt-in**:
- Responsive layout: Automatic (no config needed)
- Text truncation: Automatic (no config needed)
- Tooltip: Automatic for truncated text (can disable with `showTooltip={false}`)

### Gradual Adoption

1. **Phase 1**: Update imports (no code changes)
   ```tsx
   import StatCard from '@/components/StatCard';  // Updated component
   ```

2. **Phase 2**: Test responsive behavior
   - Run app on different viewports
   - Verify no visual regressions

3. **Phase 3**: Customize if needed
   ```tsx
   <StatCard maxTitleLines={3} minWidth={180} />  // Optional customization
   ```

---

## Next Steps

- [ ] Read [data-model.md](data-model.md) for TypeScript interfaces
- [ ] Review [research.md](research.md) for implementation details
- [ ] Run component tests: `npm test -- StatCard.test.tsx`
- [ ] Test on real devices (iOS + Android)
- [ ] Verify accessibility with screen readers

## Support

- **Code**: See implementation in `components/StatCard.tsx` and `components/Tooltip.tsx`
- **Issues**: Report bugs or request features via GitHub issues
- **Questions**: Ask in team Slack #mobile-dev channel

---

**Last Updated**: 2025-11-23 | **Feature Branch**: `001-responsive-stat-cards` | **Spec**: [spec.md](spec.md)
