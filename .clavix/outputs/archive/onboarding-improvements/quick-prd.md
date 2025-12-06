# Onboarding Flow Improvements - Quick PRD

Fix critical theme inconsistencies and incomplete features in Pawpa's React Native onboarding flow. Core issues: hardcoded colors bypassing central theme system, incorrect screen count in progress indicator, and improper auth routing affecting user experience. Must implement useTheme() hook integration across all onboarding screens, correct screen count from 4 to 3, and add proper auth state checking for authenticated users.

Technical implementation requires Zustand store cleanup (removing unused actions), fixing skip button onboarding store integration, and maintaining Expo Router file-based routing with Better Auth state control. Priority focus on production-critical fixes before deployment.

Scope is specifically limited to fixing existing inconsistencies - no new screens, animations, accessibility features, or component refactoring included in this phase. Success measured by theme consistency, correct progress indicator, proper user routing, and elimination of dead code.

---

*Generated with Clavix Planning Mode*
*Generated: 2025-12-07T12:00:00Z*