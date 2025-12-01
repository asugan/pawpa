## Problem Analysis

Your current layout collapsed to the left because removing `justifyContent: 'space-between'` eliminated the space distribution between elements. The flex containers had no instruction on how to space themselves out.

## Desired Layout

**Logo** ← space → **[WiFi/Center]** ← space → **Tab Name**

En solda logo, ortada network sembolü, en sağda tab adı (Logo on far left, network symbol in center, tab name on far right)

## Solution

The best approach is a **hybrid layout**:
1. Use `justifyContent: 'space-between'` to push logo left and tab name right
2. Use **absolute positioning** for WiFi badge to ensure perfect centering (unaffected by left/right content)
3. Add padding to left/right containers to prevent overlap

### CustomTabHeader.tsx Changes

```tsx
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',  // ← RE-ADD: Pushes elements to edges
    width: '100%',
    paddingHorizontal: 16,
    height: 56,
    position: 'relative',  // ← NEW: Container for absolute positioning
  },
  
  left: {
    // REMOVE flex, use natural width
    alignItems: 'flex-start',
    paddingRight: 60,  // ← NEW: Space for WiFi badge (prevents overlap)
  },
  
  center: {
    // ABSOLUTE positioning for perfect center
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -50 }],  // ← Center the 100px width element
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,  // ← Ensure it's above other elements
  },
  
  right: {
    // REMOVE flex, use natural width
    alignItems: 'flex-end',
    paddingLeft: 60,  // ← NEW: Space for WiFi badge (prevents overlap)
    minWidth: 60,
  },
  
  logo: {
    width: 120,  // ← FIXED: Smaller fixed width
    height: 40,
    resizeMode: 'contain',
  },
  
  pageTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
});
```

## Why This Works

✅ **Logo stays left**: `space-between` pushes it to the left edge
✅ **WiFi perfectly centered**: `position: 'absolute'` + `left: '50%'` + `transform: translateX` centers it regardless of other content
✅ **Tab name stays right**: `space-between` pushes it to the right edge
✅ **No overlaps**: Padding on left/right containers creates buffer zones
✅ **Works on all screens**: Absolute centering is viewport-independent

## Alternative (Without Absolute Positioning)

If you prefer no absolute positioning:
```tsx
container: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  paddingHorizontal: 16,
  height: 56,
},
left: {
  flex: 0,  // Don't grow
  width: 120,  // Fixed width
  alignItems: 'flex-start',
},
center: {
  flex: 1,  // Takes remaining space
  alignItems: 'center',
},
right: {
  flex: 0,  // Don't grow
  width: 120,  // Fixed width
  alignItems: 'flex-end',
}
```