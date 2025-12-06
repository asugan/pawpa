# Optimized Prompt (Clavix Enhanced)

Fix the broken "+"/"add pet" button navigation on the home screen in your React Native app. All three "+" buttons on the home screen currently navigate to `/pet/add` which causes "page not found" - they should navigate to `/(tabs)/pets` instead.

**Specific Changes Required:**
1. **Lines 146-156**: Change `onPress={() => router.push("/pet/add")}` to `onPress={() => router.push("/(tabs)/pets")}`
2. **Lines 159-165**: Change `onAction={() => router.push("/pet/add")}` to `onAction={() => router.push("/(tabs)/pets")}`
3. **Lines 186-191**: Change `onPress={() => router.push("/pet/add")}` to `onPress={() => router.push("/(tabs)/pets")}`

**File Location:** `app/(tabs)/index.tsx`

**Context:**
- App uses React Native with Expo Router and TypeScript
- Navigation uses `useRouter` from `expo-router`
- The Pet tab already has a working FAB that opens `PetModal` for adding pets
- Only change the navigation route - don't modify button styling or behavior

**Success Verification:**
- All three buttons navigate to Pet tab without "page not found" errors
- Users can then use the Pet tab's FAB to add pets successfully
- No impact on existing functionality or UI

---

## Optimization Improvements Applied

1. **[Efficiency]** - Direct specification of exactly which lines to change, reducing implementation time
2. **[Clarity]** - Explicit file location and three specific button locations identified
3. **[Structure]** - Organized into required changes → context → success criteria flow
4. **[Completeness]** - Added specific line numbers and exact code to change
5. **[Actionability]** - Provides copy-paste ready code changes for immediate implementation

---
*Optimized by Clavix on 2025-01-07. This version is ready for implementation.*