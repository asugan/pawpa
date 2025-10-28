# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PawPa is a comprehensive pet care mobile application built with React Native and Expo. The app features a playful, cute theme with rainbow pastel colors and supports multiple languages (Turkish and English).

### Key Features
- Pet management (profiles, health records, events)
- Health tracking (vaccinations, appointments, medications)
- Calendar and event scheduling
- Feeding schedules and reminders
- Multi-language support (i18n)
- Rainbow pastel theme with dark mode

## Technical Stack

- **Framework**: Expo SDK ~54.0.20 with React Native 0.81.5
- **Navigation**: Expo Router (file-based routing) with bottom tabs
- **UI Library**: React Native Paper with custom theme
- **API Client**: Axios with React Query for server state
- **Backend**: Node.js Express + SQLite + Drizzle ORM (separate project)
- **State Management**: Zustand with persistence
- **Server State**: TanStack Query with network-aware caching
- **Forms**: React Hook Form with Zod validation
- **Icons**: Material Community Icons
- **Notifications**: Expo Notifications
- **Internationalization**: i18next
- **Network Monitoring**: @react-native-community/netinfo

## Development Commands

### Project Setup
```bash
npm install                 # Install dependencies
npm run reset-project      # Reset to blank project (moves current to app-example/)
```

### Development
```bash
npm start                  # Start Expo development server
npm run android           # Start on Android emulator
npm run ios               # Start on iOS simulator
npm run web               # Start web version
npm run lint              # Run ESLint
```

### API Configuration
```bash
# API endpoint'leri `lib/config/env.ts` dosyasında yapılandırılır
# Development: http://localhost:3000
# Production: Backend URL'i ile güncellenmeli
```

### Development Notes
- Backend server must be running on localhost:3000 for development
- Network connectivity is automatically monitored with @react-native-community/netinfo
- API errors are handled globally with ApiErrorBoundary component
- TanStack Query cache invalidation works automatically with proper mutations
- All local database infrastructure has been removed and replaced with API calls
- Service layer now uses Axios instead of Drizzle ORM for data operations

## Architecture

### Directory Structure
- `app/` - Screen components using Expo Router file-based routing
- `components/` - Reusable UI components
- `stores/` - Zustand state management stores
- `lib/` - Utility functions, types, and configurations
  - `api/` - HTTP client and API utilities
  - `config/` - Environment configuration
  - `hooks/` - React Query hooks
  - `services/` - API service layer
  - `components/` - Specialized components (NetworkStatus, ApiErrorBoundary)
- `constants/` - App constants and configurations

### Key Architecture Patterns

**Layer Architecture**:
1. **API Layer** - Axios HTTP client with error handling
2. **Service Layer** - API service classes for data operations
3. **State Management Layer** - TanStack Query for server state with caching
4. **Component Layer** - Reusable UI components
5. **Screen Layer** - Navigation screens using file-based routing
6. **Store Layer** - Zustand for client state with persistence

**State Management**:
- **Zustand stores** with persistence for client state
- **TanStack Query** for server state, caching, and synchronization
- **Network-aware caching** with intelligent retry logic
- **Form state** with React Hook Form + Zod validation

**UI System**:
- **React Native Paper** as base component library
- **Custom theme** with rainbow pastel color palette
- **Dark mode support** with theme persistence
- **Material Design icons** throughout
- **Network status monitoring** with offline mode UI

### API Integration

The app connects to a Node.js Express backend with SQLite database through 25 REST endpoints:

**Pet Management API (6 endpoints)**:
- `GET /api/pets` - List all pets with pagination and filtering
- `GET /api/pets/:id` - Get single pet details
- `POST /api/pets` - Create new pet
- `PUT /api/pets/:id` - Update pet information
- `DELETE /api/pets/:id` - Delete pet
- `POST /api/pets/:id/photo` - Upload pet photo

**Health Records API (5 endpoints)**:
- `GET /api/pets/:petId/health-records` - Get pet health records
- `POST /api/health-records` - Create new health record
- `PUT /api/health-records/:id` - Update health record
- `DELETE /api/health-records/:id` - Delete health record
- `GET /api/health-records/upcoming` - Get upcoming vaccinations

**Events API (7 endpoints)**:
- `GET /api/pets/:petId/events` - Get pet events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/calendar/:date` - Get calendar events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/today` - Get today's events

**Feeding Schedules API (7 endpoints)**:
- `GET /api/pets/:petId/feeding-schedules` - Get pet feeding schedules
- `POST /api/feeding-schedules` - Create new feeding schedule
- `PUT /api/feeding-schedules/:id` - Update feeding schedule
- `DELETE /api/feeding-schedules/:id` - Delete feeding schedule
- `GET /api/feeding-schedules/active` - Get active schedules
- `GET /api/feeding-schedules/today` - Get today's schedules
- `GET /api/feeding-schedules/next` - Get next feeding time

**Key Features**:
- Automatic network connectivity detection with NetworkStatus component
- Graceful error handling with ApiErrorBoundary component
- Intelligent caching with TanStack Query and background refetch
- Offline mode awareness and user feedback
- Network-aware retry logic (fewer retries for network errors, none for 404s)
- Request/response logging in development mode
- Centralized error handling with user-friendly messages

### Theme System

The app features a rainbow pastel color palette:
- Primary: Soft pink (#FFB3D1)
- Secondary: Mint green (#B3FFD9)
- Tertiary: Lavender (#C8B3FF)
- Accent: Peach (#FFDAB3)
- Surface: Light yellow (#FFF3B3)

Theme switching between light and dark modes is supported and persisted.

## Current Development Status

✅ **Phase 1: Backend Foundation** (28.10.2025) - COMPLETED
- ✅ Node.js Express server setup with TypeScript
- ✅ SQLite database with Drizzle ORM configuration
- ✅ Middleware setup (CORS, helmet, morgan, rate limiting)
- ✅ Project structure with controllers, routes, services, middleware

✅ **Phase 2: API Implementation** (28.10.2025) - COMPLETED
- ✅ 25 REST API endpoints implemented
- ✅ Pet Management API (6 endpoints)
- ✅ Health Records API (5 endpoints)
- ✅ Events API (7 endpoints)
- ✅ Feeding Schedules API (7 endpoints)
- ✅ Input validation with Zod schemas
- ✅ Error handling and response formatting
- ✅ Pagination and filtering support

✅ **Phase 3: Mobile App API Integration** (28.10.2025) - COMPLETED
- ✅ Added Axios and @react-native-community/netinfo dependencies
- ✅ HTTP client setup with interceptors and error handling (`lib/api/client.ts`)
- ✅ Environment configuration with API endpoints (`lib/config/env.ts`)
- ✅ Service layer completely refactored to use API calls instead of local database
- ✅ TanStack Query configuration with network-aware caching and retry logic
- ✅ React Query hooks created (`lib/hooks/usePets.ts`)
- ✅ NetworkStatus component for connectivity monitoring
- ✅ ApiErrorBoundary component for global error handling
- ✅ Provider structure updated in app/_layout.tsx
- ✅ Local database infrastructure completely removed

✅ **Earlier Features** (Previously Completed)
- ✅ UI/UX foundation with React Native Paper
- ✅ Rainbow pastel theme implementation
- ✅ Bottom tabs navigation with Expo Router
- ✅ Basic components (PetCard, QuickActionButtons, LoadingSpinner, ErrorBoundary, EmptyState)
- ✅ All main screens with proper structure
- ✅ Zustand store management setup
- ✅ Multi-language support (i18n) setup

🔄 **Phase 4: Integration & Testing** (CURRENT PHASE)
- [ ] Backend unit and integration tests
- [ ] End-to-end mobile app + backend testing
- [ ] CRUD operations testing scenarios
- [ ] Network error handling validation
- [ ] Performance optimization and monitoring

⏳ **Phase 5: Deployment & Monitoring** (PENDING)
- [ ] Production environment setup
- [ ] Deployment strategy implementation
- [ ] Monitoring and logging setup
- [ ] Documentation finalization

### Recent Major Changes
- **Architecture Migration**: Complete transition from local SQLite to remote API integration
- **Service Layer Transformation**: All services now use Axios HTTP client instead of Drizzle ORM
- **Enhanced Error Handling**: Global ApiErrorBoundary with user-friendly error messages
- **Network Awareness**: Real-time connectivity monitoring and offline mode support
- **Performance Optimization**: Intelligent caching with background refetch and retry logic

## Development Notes

- The project uses TypeScript throughout
- Backend server must be running on localhost:3000 for development
- All API calls are handled through service layer with proper error handling
- Network connectivity is automatically monitored with offline mode UI
- Component reusability is emphasized - check existing components before creating new ones
- Store persistence is configured for theme preferences
- React Query handles caching and synchronization automatically