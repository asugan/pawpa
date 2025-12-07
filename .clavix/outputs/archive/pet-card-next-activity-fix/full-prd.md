# Product Requirements Document: Pawpa Pet Card Next Activity Fix

## Problem & Goal

The pet cards in the pets tab currently display completely fake data for "next activity" instead of showing real upcoming pet care activities. Users see random upcoming events and vaccination counts with hardcoded times like "10:05" and "18:00" that have no connection to their actual pet data. The goal is to replace the mock data with real activity calculations so users see accurate next care activities (feeding times, vet appointments, vaccination due dates) with proper times and priorities for each individual pet.

## Requirements

### Must-Have Features

#### 1. Real Activity Data Integration
**Current Issue**: Pet cards receive `upcomingEvents` and `upcomingVaccinations` as `Math.floor(Math.random() * 3)` and `Math.floor(Math.random() * 2)` instead of real data.
**Required Fix**: Replace mock data with actual data calls to existing services:
- `eventService.getUpcomingEvents()` for upcoming pet events
- `healthRecordService.getUpcomingVaccinations()` for vaccination due dates
- `feedingScheduleService.getNextFeeding()` for feeding schedules
- Use existing hooks: `useUpcomingEvents()`, `useUpcomingVaccinations()`, `useNextFeedingWithDetails()`

#### 2. Per-Pet Next Activity Calculation
**Current Issue**: The `getNextActivity()` function in PetCard.tsx shows hardcoded times that don't correspond to actual pet activities.
**Required Fix**: Create per-pet activity calculation that:
- Fetches activities for each specific pet by petId
- Calculates the next activity based on actual event times and feeding schedules
- Returns proper timestamps instead of static strings like '10.05', '18:00'

#### 3. Priority-Based Activity Selection
**Current Issue**: When multiple activities exist, the system needs to decide which one to display as "next activity".
**Required Fix**: Implement priority logic:
- **High Priority**: Upcoming vaccinations and medications (health-related)
- **Medium Priority**: Vet appointments and scheduled events
- **Low Priority**: Regular feeding schedules (but still show if closer in time)
- When multiple activities at same priority level, choose the one occurring sooner

#### 4. Dynamic Time Formatting
**Current Issue**: PetCard shows hardcoded time strings that don't match actual activity times.
**Required Fix**: Use existing time formatting utilities:
- `formatTimeForDisplay()` for consistent time representations
- Proper time zone handling for different locales
- Relative time display ("in 2 hours", "tomorrow at 3 PM") when appropriate

#### 5. Performance Optimization
**Current Issue**: Multiple pets with multiple API calls each could cause performance problems.
**Required Fix**: Implement efficient data loading:
- Batch API calls or use React Query's intelligent caching
- Consider creating a new hook `usePetNextActivity(petId)` that combines data sources
- Cache next activity calculations to avoid re-computation
- Implement loading states while real data fetches

### Technical Requirements

#### Infrastructure Integration
- **Maintain existing architecture**: Work with current services, hooks, and data models
- **Use existing code patterns**: Follow current TypeScript and React patterns in the codebase
- **Preserve i18n support**: Ensure all displayed text uses existing translation keys
- **Maintain theme compatibility**: Use existing theme system for colors and styling

#### File Modifications Required
- **Primary Fix**: `/home/asugan/Projects/pawpa/app/(tabs)/pets.tsx` (lines 152-155) - Remove mock data calls
- **Pet Card Logic**: `/home/asugan/Projects/pawpa/components/PetCard.tsx` (lines 56-64) - Replace getNextActivity() with real data integration
- **Potential New Hook**: Create `usePetNextActivity()` hook combining multiple data sources

#### Data Models (Already Available)
- **Pet Schema**: Complete with id, name, type, breed, birthDate, weight, gender, profilePhoto
- **Event Schema**: startTime, type, petId, title fields with 9 event types (feeding, exercise, grooming, play, training, vet_visit, walk, bath, other)
- **HealthRecord Schema**: nextDueDate, type, petId fields with 7 record types (vaccination, checkup, medication, surgery, dental)
- **FeedingSchedule Schema**: time, days, petId, isActive fields for recurring feeding times

#### Existing Services to Utilize
- `eventService.getUpcomingEvents()` - Returns upcoming events filtered by time
- `healthRecordService.getUpcomingVaccinations()` - Returns vaccination due dates
- `feedingScheduleService.getNextFeeding()` - Calculates next feeding from schedules
- `filterUpcomingEvents()` - Utility for time-based filtering
- `getNextFeedingTime()` - Feeding time calculation utility

## Out of Scope

### Explicitly Excluded
- **No new activity types**: Use existing 9 event types and 7 health record types
- **No major UI redesign**: Fix existing PetCard component, do not redesign the interface
- **No new screens or navigation**: All work contained within existing pets tab and PetCard component
- **No notification system changes**: Do not modify push notifications or in-app alerts
- **No admin dashboard features**: No backend admin interfaces or new management screens
- **No data model changes**: Use existing schemas without modification
- **No user permission changes**: Maintain existing access control patterns

### Preservation Requirements
- **Maintain current translations**: Use existing i18next keys, do not add new translation entries
- **Preserve theme system**: Use existing color tokens and styling approach
- **Keep current file structure**: Do not reorganize component directory structure
- **Maintain existing navigation**: Do not add new routes or change tab behavior

## Additional Context

### Success Metrics
- **Accuracy**: Users see correct next activities instead of fake data
- **Performance**: Pet cards load quickly with real data without visible lag
- **Reliability**: Time calculations are consistent and account for time zones properly
- **Usability**: Clear prioritization of activities when multiple exist

### Known Limitations to Address
- **Multiple Pets Performance**: Consider efficient data fetching for users with many pets
- **Time Zone Edge Cases**: Ensure proper handling of users in different time zones
- **Empty States**: Handle cases where pets have no upcoming activities gracefully
- **Error States**: Provide appropriate fallbacks when API calls fail

### Development Notes
The Pawpa app has excellent infrastructure already in place - all services, hooks, utilities, and data models exist and are functional. This is primarily an integration task rather than building new functionality. The main challenge is combining existing data sources efficiently and implementing proper prioritization logic for displaying the most relevant "next activity" for each pet.

---

*Generated with Clavix Planning Mode*
*Generated: 2025-12-07T14:30:22Z*