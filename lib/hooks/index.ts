// Centralized exports for all React Query hooks
export * from './usePets';
export * from './useHealthRecords';
export * from './useEvents';
export * from './useFeedingSchedules';

// Performance optimization hooks
export * from './useOnlineManager';
export * from './usePrefetchData';
export * from './useRequestCancellation';
export * from './useSmartPrefetching';
export * from './useRealtimeUpdates';

// Device integration hooks
export * from './useDeviceLanguage';

// Responsive design hooks
export * from './useResponsiveSize';

// Re-export commonly used query keys for external use
export { petKeys } from './usePets';
export { healthRecordKeys } from './useHealthRecords';
export { eventKeys } from './useEvents';
export { feedingScheduleKeys } from './useFeedingSchedules';

// Re-export types
export type { PetFilters } from './usePets';
export type { HealthRecordFilters } from './useHealthRecords';