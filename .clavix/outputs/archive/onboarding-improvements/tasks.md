# Implementation Plan

**Project**: onboarding-improvements
**Generated**: 2025-12-07T12:00:00Z

## Technical Context & Standards
*Detected Stack & Patterns*
- **Framework**: React Native 0.81.5 with Expo SDK ~54.0.20
- **Navigation**: Expo Router file-based routing
- **Styling**: StyleSheet with hardcoded COLORS (needs fixing)
- **State Management**: Zustand (stores in /stores)
- **Theme System**: Central theme in lib/theme/ with useTheme hook
- **Authentication**: Better Auth with Zustand UI store
- **Internationalization**: react-i18next with namespace-based translations
- **Conventions**: TypeScript strict mode, kebab-case routing, feature-based components

---

## Phase 1: Critical Theme Integration Fixes

- [x] **Replace hardcoded COLORS in index.tsx with useTheme hook** (ref: Theme Uyumluluğu Düzeltmeleri)
  Task ID: phase-1-theme-01
  > **Implementation**: Edit `app/(onboarding)/index.tsx`.
  > **Details**: Import `useTheme` from `@/lib/theme`, remove COLORS constant (lines 13-19), replace all COLORS.* references with theme.colors.* (primary: theme.colors.primary, backgroundDark: theme.colors.background, white: theme.colors.white, textSecondary: theme.colors.textSecondary, indicatorInactive: theme.colors.primary + '33'). Use theme.roundness for borderRadius values where appropriate (12px -> theme.roundness.md).

- [x] **Replace hardcoded COLORS in step2.tsx with useTheme hook** (ref: Theme Uyumluluğu Düzeltmeleri)
  Task ID: phase-1-theme-02
  > **Implementation**: Edit `app/(onboarding)/step2.tsx`.
  > **Details**: Import `useTheme` from `@/lib/theme`, remove COLORS constant (lines 11-18), replace all COLORS.* references with theme colors (primary: theme.colors.primary, backgroundDark: theme.colors.background, white: theme.colors.white, textSecondary: theme.colors.textSecondary, cardBg: theme.colors.surface, iconBg: theme.colors.primary + '33'). Remove @ts-ignore on line 99 and create proper MaterialIconName type if needed.

- [x] **Replace hardcoded COLORS in completed.tsx with useTheme hook** (ref: Theme Uyumluluğu Düzeltmeleri)
  Task ID: phase-1-theme-03
  > **Implementation**: Edit `app/(onboarding)/completed.tsx`.
  > **Details**: Import `useTheme` from `@/lib/theme`, remove COLORS constant (lines 12-19), replace all COLORS.* references with theme colors (primary: theme.colors.primary, backgroundDark: theme.colors.background, white: theme.colors.white, textSecondary: theme.colors.textSecondary, circleOuter: theme.colors.primary + '33', circleInner: theme.colors.primary + '4D'). Use theme.roundness for borderRadius values.

## Phase 2: State Management Corrections

- [x] **Fix totalScreens count in onboardingStore** (ref: Ekran Sayısı Düzeltmesi)
  Task ID: phase-2-store-01
  > **Implementation**: Edit `stores/onboardingStore.ts`.
  > **Details**: Change `totalScreens: 4` to `totalScreens: 3` on line 35 and again on line 92 in the onRehydrateStorage function. This ensures the progress indicator shows the correct number of screens.

- [x] **Remove unused navigation actions from onboardingStore** (ref: Store Temizliği)
  Task ID: phase-2-store-02
  > **Implementation**: Edit `stores/onboardingStore.ts`.
  > **Details**: Remove unused functions: `nextScreen` (lines 40-46), `previousScreen` (lines 48-54), `goToScreen` (lines 56-62), and `setAnimating` (line 80). Also remove these from OnboardingActions interface (lines 14-16, 19) and the OnboardingStore type. Keep only `setHasSeenOnboarding`, `skipOnboarding`, and `resetOnboarding`.

- [x] **Update progress indicator in step2.tsx to show 3 dots instead of 4** (ref: Store Temizliği)
  Task ID: phase-2-store-03
  > **Implementation**: Edit `app/(onboarding)/step2.tsx`.
  > **Details**: Remove the 4th indicator from lines 81-86. Change to show only 3 indicators: keep first (inactive), second (active), third (inactive). Also update the styles to use theme.colors.primary for active and theme.colors.primary + '4D' for inactive.

## Phase 3: Auth Integration Fixes

- [x] **Add Better Auth state check in completed.tsx** (ref: Auth State Kontrolü)
  Task ID: phase-3-auth-01
  > **Implementation**: Edit `app/(onboarding)/completed.tsx`.
  > **Details**: Create or import auth state checking hook (`useAuth` from better-auth). Modify handleComplete function to check if user is authenticated: if `isAuthenticated`, navigate to `/(tabs)` instead of `/(auth)/login`. Import the appropriate auth utilities.

- [x] **Fix skip button to use onboarding store in step2.tsx** (ref: Skip Action Düzeltme)
  Task ID: phase-3-auth-02
  > **Implementation**: Edit `app/(onboarding)/step2.tsx`.
  > **Details**: Import `useOnboardingStore` from `../../stores/onboardingStore`. Replace `handleSkip` function on lines 47-49 to call `skipOnboarding()` instead of direct navigation. After calling skipOnboarding, navigate to `/(onboarding)/completed`.

## Phase 4: Final Cleanup & Testing

- [x] **Verify all progress indicators show consistent 3-screen flow** (ref: Testing Checklist)
  Task ID: phase-4-cleanup-01
  > **Implementation**: Test all three onboarding screens.
  > **Details**: Navigate through the onboarding flow and verify: index.tsx shows 3 indicators with first active, step2.tsx shows 3 indicators with second active, swipe navigation works correctly, and theme changes (dark/light) affect all onboarding screens.

- [x] **Update TypeScript interfaces after store cleanup** (ref: Type Safety)
  Task ID: phase-4-cleanup-02
  > **Implementation**: Review and update type definitions.
  > **Details**: Ensure OnboardingActions interface in stores/onboardingStore.ts only includes the remaining actions. Verify all imports across the project that reference the removed functions are cleaned up. Check for any TypeScript errors related to the icon name types.

---

*Generated by Clavix /clavix:plan*