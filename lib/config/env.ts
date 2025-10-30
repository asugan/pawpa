// Environment configuration for PawPa app
export const ENV = {
  // API Base URL - development için localhost, production için değiştirilecek
  API_BASE_URL: __DEV__ ? 'https://7be27a13e414.ngrok-free.app' : 'https://your-production-api.com',

  // API Endpoints
  ENDPOINTS: {
    // Pet endpoints
    PETS: '/api/pets',
    PET_BY_ID: (id: string) => `/api/pets/${id}`,
    PET_PHOTO: (id: string) => `/api/pets/${id}/photo`,

    // Health record endpoints
    HEALTH_RECORDS: '/api/health-records',
    HEALTH_RECORDS_BY_PET: (petId: string) => `/api/pets/${petId}/health-records`,
    HEALTH_RECORD_BY_ID: (id: string) => `/api/health-records/${id}`,
    UPCOMING_VACCINATIONS: '/api/health-records/upcoming',

    // Event endpoints
    EVENTS: '/api/events',
    EVENTS_BY_PET: (petId: string) => `/api/pets/${petId}/events`,
    EVENT_BY_ID: (id: string) => `/api/events/${id}`,
    EVENTS_BY_DATE: (date: string) => `/api/events/calendar/${date}`,
    UPCOMING_EVENTS: '/api/events/upcoming',
    TODAY_EVENTS: '/api/events/today',

    // Feeding schedule endpoints
    FEEDING_SCHEDULES: '/api/feeding-schedules',
    FEEDING_SCHEDULES_BY_PET: (petId: string) => `/api/pets/${petId}/feeding-schedules`,
    FEEDING_SCHEDULE_BY_ID: (id: string) => `/api/feeding-schedules/${id}`,
    ACTIVE_FEEDING_SCHEDULES: '/api/feeding-schedules/active',
    TODAY_FEEDING_SCHEDULES: '/api/feeding-schedules/today',
    NEXT_FEEDING: '/api/feeding-schedules/next',
  },

  // Request timeout
  TIMEOUT: 10000,

  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // Pagination defaults
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
};