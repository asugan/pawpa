# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PawPa is a comprehensive pet care mobile application built with React Native and Expo. The app features a playful, cute theme with rainbow pastel colors and supports multiple languages (Turkish and English).

### Key Features

- Pet management (profiles, health records, events)
- Health tracking (vaccinations, appointments, medications)
- Calendar and event scheduling
- Feeding schedules and reminders
- Multi-language support (i18n) with smart device language detection
- Dynamic homepage dashboard with real-time data synchronization
- Rainbow pastel theme with dark mode
- Advanced performance optimization with smart caching
- Real-time updates and background data synchronization
- Network-aware error handling and offline mode support

## Technical Stack

- **Framework**: Expo SDK ~54.0.20 with React Native 0.81.5
- **Navigation**: Expo Router (file-based routing) with bottom tabs
- **UI Library**: React Native Paper with custom theme
- **API Client**: Axios with TanStack Query for server state
- **Backend**: Node.js Express + SQLite + Drizzle ORM (separate project)
- **State Management**: Zustand with persistence
- **Server State**: TanStack Query with advanced caching strategies
- **Forms**: React Hook Form with Zod validation
- **Icons**: Material Community Icons
- **Notifications**: Expo Notifications
- **Internationalization**: i18next with device language detection
- **Network Monitoring**: @react-native-community/netinfo
- **Performance**: Smart caching, background refetch, prefetching
- **Real-time**: Data synchronization and automatic updates
- **Error Handling**: Global error boundaries with network-aware recovery

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
# API endpoints are configured in `lib/config/env.ts`
# Development: https://7be27a13e414.ngrok-free.app (Ngrok tunnel)
# Production: https://your-production-api.com (placeholder)
# All API calls go through Axios client with interceptors and error handling
```

### Development Notes

- Backend server accessible through Ngrok tunnel for development
- Network connectivity is automatically monitored with @react-native-community/netinfo
- API errors are handled globally with ApiErrorBoundary component
- TanStack Query cache invalidation works automatically with proper mutations
- All local database infrastructure has been removed and replaced with API calls
- Service layer now uses Axios instead of Drizzle ORM for data operations
- Smart caching strategies optimize data loading by type (IMMUTABLE, LONG, MEDIUM, SHORT, VERY_SHORT)
- Background refetch and real-time synchronization keep data fresh
- Network-aware retry logic handles different error types appropriately

## Architecture

### Directory Structure

```
pawpa/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx              # Root layout with providers
│   ├── (tabs)/                  # Tab navigation structure
│   │   ├── _layout.tsx          # Tab layout configuration
│   │   ├── index.tsx            # Dynamic homepage dashboard
│   │   ├── pets.tsx             # Pet management
│   │   ├── health.tsx           # Health records
│   │   ├── calendar.tsx        # Calendar/events
│   │   └── settings.tsx         # Settings
│   └── pet/[id].tsx            # Pet detail pages
├── components/                  # Reusable UI components
│   ├── forms/                   # Form components
│   ├── PetCard.tsx              # Pet display cards
│   ├── HealthOverview.tsx       # Health dashboard
│   ├── StatCard.tsx             # Interactive statistics cards
│   ├── NetworkStatusBadge.tsx   # Real-time connectivity indicator
│   └── [various other components]
├── stores/                      # Zustand state management
│   ├── themeStore.ts            # Theme management
│   ├── petStore.ts              # Pet state
│   ├── languageStore.ts        # Language management
│   └── index.ts                # Store exports
├── lib/                         # Core library and utilities
│   ├── api/                    # API client layer
│   │   └── client.ts           # Axios client with interceptors
│   ├── config/                  # Configuration files
│   │   ├── env.ts              # Environment configuration
│   │   └── queryConfig.ts      # TanStack Query configuration
│   ├── hooks/                   # Custom React hooks
│   │   ├── usePets.ts          # Pet data hooks
│   │   ├── useHealthRecords.ts # Health record hooks
│   │   ├── useEvents.ts        # Event hooks
│   │   ├── useFeedingSchedules.ts
│   │   ├── useDeviceLanguage.ts # Device language detection
│   │   ├── useOnlineManager.ts # Network state management
│   │   ├── useRealtimeUpdates.ts # Real-time synchronization
│   │   ├── useSmartPrefetching.ts # Intelligent data prefetching
│   │   └── [various other hooks]
│   ├── services/                # API service layer
│   │   ├── petService.ts       # Pet API operations
│   │   ├── healthRecordService.ts
│   │   ├── eventService.ts
│   │   └── feedingScheduleService.ts
│   ├── schemas/                 # Zod validation schemas
│   ├── components/             # Specialized components
│   │   ├── NetworkStatus.tsx   # Connectivity monitoring
│   │   └── ApiErrorBoundary.tsx # Global error handling
│   ├── utils/                  # Utility functions
│   ├── types.ts                # TypeScript type definitions
│   ├── theme.ts                # Theme configuration
│   └── i18n.ts                 # Internationalization setup
├── locales/                     # Translation files
│   ├── en.json                 # English translations
│   └── tr.json                 # Turkish translations
├── constants/                   # App constants
├── assets/                     # Static assets
├── providers/                   # React providers
└── scripts/                    # Build and utility scripts
```

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

The app connects to a Node.js Express backend with SQLite database through 25 REST endpoints. The API integration features advanced mobile-optimized configurations:

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

**Current API Configuration**:

- **Development**: `https://7be27a13e414.ngrok-free.app` (Ngrok tunnel for local testing)
- **Production**: `https://your-production-api.com` (placeholder for deployment)
- **Client**: Sophisticated Axios client with interceptors and error handling
- **Timeout**: 15 seconds for mobile optimization
- **Retry Logic**: Exponential backoff with network-aware strategies

**Enhanced API Features**:

- Automatic network connectivity detection with NetworkStatus component
- Global error handling with ApiErrorBoundary component
- Intelligent caching with TanStack Query and smart background refetch
- Offline mode awareness with user-friendly feedback
- Network-aware retry logic (different strategies for different error types)
- Request/response logging in development mode
- Centralized error handling with user-friendly messages
- Request deduplication and automatic cancellation
- Background sync and conflict resolution
- Mobile-optimized payload handling and compression

### Advanced Hooks & Mobile Optimization

The app includes 12+ sophisticated custom hooks designed specifically for mobile performance optimization:

**Core Data Hooks**:

- `usePets.ts`: Pet data management with smart caching and prefetching
- `useHealthRecords.ts`: Health record operations with background sync
- `useEvents.ts`: Event management with calendar integration
- `useFeedingSchedules.ts`: Feeding schedule tracking with notifications

**Advanced Mobile Hooks**:

- `useDeviceLanguage.ts`: Cross-platform device language detection
- `useOnlineManager.ts`: Network state management with offline detection
- `useRealtimeUpdates.ts`: Real-time data synchronization with conflict resolution
- `useSmartPrefetching.ts`: Intelligent data prefetching based on user behavior
- `useRequestCancellation.ts`: Automatic request cleanup and memory management

**Performance Features**:

- **Smart Prefetching**: Predictive data loading based on user navigation patterns
- **Background Sync**: Automatic data synchronization when app is active
- **Request Cancellation**: Cleanup of pending requests on component unmount
- **Network Awareness**: Adaptive behavior based on connection quality
- **Memory Management**: Efficient cache cleanup and garbage collection

**Mobile-Specific Optimizations**:

- Platform-specific language extraction (iOS/Android/Web)
- Adaptive refresh intervals based on network conditions
- Battery-conscious background operations
- Memory-efficient data structures for mobile devices
- Optimistic updates with rollback capability

### Theme System

The app features a rainbow pastel color palette:

- Primary: Soft pink (#FFB3D1)
- Secondary: Mint green (#B3FFD9)
- Tertiary: Lavender (#C8B3FF)
- Accent: Peach (#FFDAB3)
- Surface: Light yellow (#FFF3B3)

Theme switching between light and dark modes is supported and persisted.

### Dynamic Homepage Dashboard

The app features a sophisticated dynamic homepage dashboard with real-time data synchronization:

**Dashboard Components**:

- `StatCard.tsx`: Interactive statistics cards with animations and tap handlers
- `HealthOverview.tsx`: Health activity dashboard showing upcoming vaccinations and appointments
- `NetworkStatusBadge.tsx`: Real-time connectivity indicator with visual feedback
- Time-based greetings and personalization based on user data
- 2-column pet grid layout with status indicators and quick actions

**Dashboard Features**:

- Real-time data synchronization with background refetch
- Responsive design that adapts to different screen sizes
- Interactive elements with smooth animations
- Network-aware loading states and error handling
- Smart caching for optimal performance
- Personalized content based on pet data and user activity

### Advanced Language Detection System

The app includes a sophisticated device language detection system with multi-language support:

**Language Detection Features**:

- `useDeviceLanguage.ts`: Smart platform detection for iOS, Android, and Web
- `LanguageSettings.tsx`: Complete language selection UI with 40+ language options
- Arabic language infrastructure with RTL (right-to-left) support ready
- User choice tracking vs automatic device language detection
- Intelligent language extraction from device settings

**Supported Languages**:

- Turkish (native support with extensive translations)
- English (primary fallback language)
- Arabic (infrastructure ready, RTL support prepared)
- 40+ additional languages through i18next framework

**Language System Architecture**:

- Automatic device language detection on app startup
- User preference override with persistent storage
- Fallback mechanism for unsupported languages
- Real-time language switching without app restart
- Language-specific formatting for dates, numbers, and currencies

### Performance Optimization & Mobile Features

The app implements advanced performance optimization specifically designed for mobile devices:

**Smart Caching Strategies**:

- `queryConfig.ts`: Mobile-optimized TanStack Query configuration
- Multiple cache durations by data type (IMMUTABLE, LONG, MEDIUM, SHORT, VERY_SHORT)
- Structural sharing to prevent unnecessary re-renders
- Intelligent background refetch intervals
- Memory-efficient cache management

**Advanced Hooks**:

- `useSmartPrefetching.ts`: Intelligent data prefetching based on user patterns
- `useRealtimeUpdates.ts`: Real-time data synchronization with conflict resolution
- `useOnlineManager.ts`: Network state management with offline detection
- `useRequestCancellation.ts`: Automatic request cleanup on component unmount
- Network-aware mutation handling with optimistic updates

**Mobile Optimization Features**:

- Background data synchronization when app is active
- Request deduplication to prevent unnecessary API calls
- Exponential backoff retry logic for network errors
- Automatic cache invalidation on data mutations
- Performance monitoring and optimization metrics

**Real-time Synchronization**:

- Automatic data updates in background
- Conflict resolution for concurrent modifications
- Offline-to-online sync with queue management
- Real-time status indicators for ongoing operations
- Smart refresh based on user interaction patterns

### Recent Major Changes

- **Dynamic Homepage Dashboard**: Complete implementation with real-time data, interactive components, and responsive design
- **Advanced Language Detection**: Cross-platform device language detection with 40+ language options and RTL support preparation
- **Performance Optimization**: Mobile-optimized caching strategies, smart prefetching, and background synchronization
- **Enhanced Error Handling**: Global error boundaries with network-aware recovery and user-friendly messages
- **Real-time Features**: Background data synchronization, conflict resolution, and automatic updates
- **Mobile Optimization**: Advanced hooks architecture, memory management, and battery-conscious operations
- **API Integration**: Sophisticated Axios client with Ngrok configuration and advanced retry logic
- **Smart Caching**: Multiple cache strategies by data type with intelligent background refetch

## Development Notes

- The project uses TypeScript throughout with strict type checking
- Backend server accessible through Ngrok tunnel: `https://7be27a13e414.ngrok-free.app`
- All API calls are handled through sophisticated service layer with proper error handling
- Network connectivity is automatically monitored with offline mode UI and recovery
- Component reusability is emphasized - check existing components before creating new ones
- Store persistence is configured for theme and language preferences
- TanStack Query handles intelligent caching and synchronization automatically
- Advanced performance optimization includes smart prefetching and background sync
- Real-time data synchronization keeps the app data fresh automatically
- Mobile-specific optimizations ensure smooth performance on all devices
- Global error boundaries provide graceful error handling and recovery
- The app features cutting-edge React Native development practices and patterns

### Getting Started for Development

1. **Prerequisites**: Node.js, npm, Expo CLI, and an active Ngrok tunnel
2. **Setup**: Run `npm install` to install dependencies
3. **Backend**: Ensure backend server is running and Ngrok tunnel is active
4. **Development**: Run `npm start` to start Expo development server
5. **API Configuration**: Update `lib/config/env.ts` if using different backend URL

### Key Development Patterns

- **Service Layer**: All API operations go through service classes in `lib/services/`
- **Hooks Architecture**: Use custom hooks from `lib/hooks/` for data operations
- **Error Boundaries**: Wrap components with `ApiErrorBoundary` for error handling
- **Performance**: Utilize smart caching strategies and prefetching for optimal UX
- **Real-time**: Leverage background sync and automatic updates for fresh data
- **Mobile First**: Design with mobile performance and battery life in mind
