## Problem Analysis

The WiFi badge is not centered and the tab name is not properly aligned right due to **conflicting layout properties**:

**Current Issues:**
1. `justifyContent: 'space-between'` on parent conflicts with `flex` values on children
2. Left: `flex: 1`, Center: `flex: 2`, Right: `flex: 1` creates asymmetrical space distribution
3. No maxWidth constraints allow left/right containers to grow and push center off-center

## Fix Implementation

### CustomTabHeader.tsx Changes

```tsx
// Remove justifyContent and use proper flex ratios
container: {
  flexDirection: 'row',
  alignItems: 'center',
  // REMOVE: justifyContent: 'space-between',
  width: '100%',
  paddingHorizontal: 16,
  height: 56,
},

// Left: Limit max width to prevent pushing center
left: {
  flex: 1,
  alignItems: 'flex-start',
  minWidth: 40,
  maxWidth: 120,  // NEW: Prevents logo from growing too much
},

// Center: Fixed width for perfect centering
center: {
  // CHANGE: Remove flex, use fixed width for true center
  width: 100,  // Badge is ~80px, give some padding
  alignItems: 'center',
  justifyContent: 'center',
},

// Right: Limit max widthright: {
  flex: 1,
  alignItems: 'flex-end',
  minWidth: 60,
  maxWidth: 120,  // NEW: Prevents title from pushing center
},
```

### Alternative: True Flex Approach

```tsx
// Use equal flex with maxWidth constraints
container: {
  flexDirection: 'row',
  alignItems: 'center',
  // Use flex instead of space-between
  flex: 1,
  paddingHorizontal: 16,
  height: 56,
},
left: {
  flex: 1,
  alignItems: 'flex-start',
  maxWidth: 120,  // Constrain left
},
center: {
  flex: 0,  // Don't grow
  width: 100,  // Fixed width for centering
  alignItems: 'center',
},
right: {
  flex: 1,
  alignItems: 'flex-end',
  maxWidth: 120,  // Constrain right
},
```

## Expected Results

✅ **WiFi badge perfectly centered** - Fixed width container ensures true center alignment
✅ **Tab name properly right-aligned** - Constrained right container with flex-end alignment
✅ **Logo stays left-aligned** - Constrained left container with flex-start alignment
✅ **Works on all screen sizes** - maxWidth prevents overflow on small screens, flex allows growth on large screens