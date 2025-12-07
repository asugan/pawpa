# Implementation Plan

**Project**: pet-card-next-activity-fix
**Generated**: 2025-12-07T14:30:22Z

## Technical Context & Standards
*Detected Stack & Patterns*
- **Framework**: React Native 0.81.5 with Expo SDK ~54.0.20
- **Navigation**: Expo Router (file-based routing)
- **State**: Zustand (theme/language) + TanStack Query (server state)
- **API**: Axios-based client with mobile-optimized caching in `lib/api/`
- **Form**: React Hook Form with Zod resolvers
- **Styling**: Custom theme system with Zustand store
- **Conventions**: TypeScript strict mode, path aliases `@/*`, Zod validation

---

## Phase 1: Core Hook Implementation

- [x] **Create Pet Next Activity Hook** (ref: Real Activity Data Integration)
  Task ID: phase-1-hooks-01
  > **Implementation**: Create `lib/hooks/usePetNextActivity.ts`.
  > **Details**: Export new hook `usePetNextActivity(petId: string)` that combines data from multiple sources:
  > - Use `useEvents(petId)` to get pet's events
  > - Use `useHealthRecords(petId)` with vaccination filter
  > - Use `useActiveFeedingSchedulesByPet(petId)` for feeding schedules
  > - Implement priority logic: vaccinations/medications > vet appointments > feeding
  > - Return object: `{ nextActivity, isLoading, error }` where nextActivity includes `{ label, time, color, priority }`
  > - Use existing time formatting utilities from `date-fns` for proper time display

- [x] **Add Activity Type Utilities** (ref: Priority-Based Activity Selection)
  Task ID: phase-1-utils-02
  > **Implementation**: Create `lib/utils/activityUtils.ts`.
  > **Details**: Export utility functions:
  > - `getNextActivityForPet(events, healthRecords, feedingSchedules): NextActivity | null`
  > - `calculateActivityPriority(activityType): number` (1=highest, 3=lowest)
  > - `formatActivityTime(time, locale): string` using existing date-fns patterns
  > - Import existing types: `Event`, `HealthRecord`, `FeedingSchedule` from `lib/types.ts`

---

## Phase 2: Pet Card Integration

- [x] **Update PetCard Component props** (ref: Real Activity Data Integration)
  Task ID: phase-2-integration-03
  > **Implementation**: Modify `components/PetCard.tsx`.
  > **Details**:
  > - Remove props: `upcomingEvents`, `upcomingVaccinations`
  > - Add: `petId?: string` prop to enable hook usage within component
  > - If `petId` provided, use `usePetNextActivity(petId)` hook internally
  > - If `petId` not provided, expect `nextActivity` prop for backward compatibility
  > - Update interface to maintain backwards compatibility during transition

- [x] **Replace Mock Next Activity Logic** (ref: Priority-Based Activity Selection)
  Task ID: phase-2-component-04
  > **Implementation**: Modify `components/PetCard.tsx` (lines 56-64).
  > **Details**:
  > - Replace `getNextActivity()` function to use real data from `usePetNextActivity()` hook
  > - Remove hardcoded times: '10.05', '18:00'
  > - Use `formatActivityTime()` utility for consistent time formatting
  > - Implement activity-based colors using theme system (accent for health, primary for events, tertiary for feeding)
  > - Handle loading state: show skeleton or empty state while data loads

---

## Phase 3: Data Source Updates

- [x] **Fix Pets Tab Mock Data Calls** (ref: Real Activity Data Integration)
  Task ID: phase-3-data-05
  > **Implementation**: Modify `app/(tabs)/pets.tsx` (lines 152-155).
  > **Details**:
  > - Remove mock data generation: `Math.floor(Math.random() * 3)` and `Math.floor(Math.random() * 2)`
  > - Remove `upcomingEvents` and `upcomingVaccinations` props from PetCard calls
  > - Pass only `pet` object (which includes `pet.id`) to enable internal hook usage
  > - Ensure PetCard receives `{ pet, onPress, onEdit, onDelete }` props only

- [x] **Add Per-Pet Event Filtering** (ref: Per-Pet Next Activity Calculation)
  Task ID: phase-3-filtering-06
  > **Implementation**: Update `lib/hooks/usePetNextActivity.ts`.
  > **Details**:
  > - Filter events by pet ID using existing event data
  > - Filter health records by pet ID and type ('vaccination', 'medication')
  > - Filter feeding schedules by pet ID and `isActive: true`
  > - Use existing `filterUpcomingEvents()` utility for time-based filtering
  > - Calculate next occurrence for recurring feeding schedules using `getNextFeedingTime()`

---

## Phase 4: Performance & Error Handling

- [x] **Optimize Hook Performance** (ref: Performance Optimization)
  Task ID: phase-4-performance-07
  > **Implementation**: Enhance `lib/hooks/usePetNextActivity.ts`.
  > **Details**:
  > - Use `useMemo` for activity sorting and priority calculations
  > - Configure appropriate TanStack Query stale times (SHORT = 30s for time-sensitive data)
  > - Implement dependency array optimization to prevent unnecessary re-calculations
  > - Consider batch query invalidation when pets activities change

- [x] **Add Error States & Loading** (ref: Performance Optimization)
  Task ID: phase-4-handling-08
  > **Implementation**: Update `components/PetCard.tsx`.
  > **Details**:
  > - Add loading indicator while `usePetNextActivity` fetches data
  > - Handle error state gracefully - show appropriate fallback UI
  > - Add empty state when no upcoming activities exist
  > - Use existing theme colors and i18n translations for all UI states
  > - Ensure accessibility with proper loading/error ARIA labels

---

## Phase 5: Testing & Validation

- [x] **Verify Multi-Pet Performance** (ref: Performance Optimization)
  Task ID: phase-5-testing-09
  > **Implementation**: Test with multiple pets.
  > **Details**:
  > - Test with 3+ pets to ensure efficient data loading
  > - Verify no duplicate API calls for same pet data
  > - Confirm proper cache usage across different pet cards
  > - Validate that each pet shows correct individual activities

- [x] **Time Zone & Locale Validation** (ref: Dynamic Time Formatting)
  Task ID: phase-5-validation-10
  > **Implementation**: Test time display accuracy.
  > **Details**:
  > - Test with different device locales (English/Turkish)
  > - Verify proper time zone handling using expo-localization
  > - Test relative time formatting ("in 2 hours" vs absolute time)
  > - Ensure vaccination due dates display correctly across time zones

---

*Generated by Clavix /clavix:plan*