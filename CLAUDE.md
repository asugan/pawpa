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
- Backend server'ının çalıştığından emin olun (localhost:3000)
- Network connectivity otomatik olarak izlenir
- API error'ları global error boundary ile yönetilir
- React Query cache invalidation otomatik çalışır

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

The app connects to a Node.js Express backend with SQLite database through:
- **Pet Management** - Create, read, update, delete pets
- **Health Records** - Track vaccinations, appointments, medications
- **Events** - Schedule and manage pet activities
- **Feeding Schedules** - Manage recurring feeding times

**Key Features**:
- Automatic network connectivity detection
- Graceful error handling with user-friendly messages
- Intelligent caching with background refetch
- Offline mode awareness and feedback

### Theme System

The app features a rainbow pastel color palette:
- Primary: Soft pink (#FFB3D1)
- Secondary: Mint green (#B3FFD9)
- Tertiary: Lavender (#C8B3FF)
- Accent: Peach (#FFDAB3)
- Surface: Light yellow (#FFF3B3)

Theme switching between light and dark modes is supported and persisted.

## Current Development Status

✅ **Backend Migration Completed** (28.10.2025)
- ✅ Backend API implementation (25 REST endpoints)
- ✅ Mobile app API integration with Axios
- ✅ Service layer refactoring to use API calls
- ✅ TanStack Query optimization with network-aware caching
- ✅ Error handling and network monitoring
- ✅ UI/UX foundation phase with React Native Paper
- ✅ Rainbow pastel theme implementation
- ✅ Bottom tabs navigation
- ✅ Basic components (PetCard, QuickActionButtons, LoadingSpinner, ErrorBoundary, EmptyState)
- ✅ All main screens with placeholder content
- ✅ Store management setup with Zustand
- ✅ Multi-language support (i18n) setup

Next phases include:
- ✅ API integration and testing (Phase 4)
- Performance optimization and deployment (Phase 5)

## Development Notes

- The project uses TypeScript throughout
- Backend server must be running on localhost:3000 for development
- All API calls are handled through service layer with proper error handling
- Network connectivity is automatically monitored with offline mode UI
- Component reusability is emphasized - check existing components before creating new ones
- Store persistence is configured for theme preferences
- React Query handles caching and synchronization automatically