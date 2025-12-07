# Pawpa Pet Card Next Activity Fix - Quick PRD

Fix the Pawpa app's pet cards to display real next activities instead of fake random data. Currently users see hardcoded times like "10.05" and "18:00" with random event/vaccination counts created via Math.random(). Replace mock data in `/app/(tabs)/pets.tsx` (lines 152-155) and `/components/PetCard.tsx` (lines 56-64) with real activity calculations using existing services (`eventService.getUpcomingEvents()`, `healthRecordService.getUpcomingVaccinations()`, `feedingScheduleService.getNextFeeding()`) and hooks (`useUpcomingEvents()`, `useUpcomingVaccinations()`, `useNextFeedingWithDetails()`). Implement priority-based selection (vaccinations > vet appointments > feeding) and proper time formatting using existing utilities.

Technical requirements: Work with React Native 0.81.5 + Expo SDK ~54.0.20, maintain existing TypeScript patterns, preserve i18n translations and theme system. Create efficient per-pet next activity calculation through a new `usePetNextActivity(petId)` hook that combines data sources, with proper caching and performance optimization using existing TanStack Query infrastructure. All data models and services already exist - this is integration work, not new feature development.

Out of scope: No new activity types (use existing 9 events + 7 health records), no UI redesign (fix existing PetCard only), no new screens or navigation changes, no notification system modifications, no data model changes, no permission system updates. Preserve all existing architecture, translations, and styling patterns. Focus solely on accurate next activity calculation and display with proper prioritization.

---

*Generated with Clavix Planning Mode*
*Generated: 2025-12-07T14:30:22Z*