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
- **Database**: Prisma with SQLite
- **State Management**: Zustand with persistence
- **Server State**: TanStack Query
- **Forms**: React Hook Form with Zod validation
- **Icons**: Material Community Icons
- **Notifications**: Expo Notifications
- **Internationalization**: i18next

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

### Database Operations
```bash
npm run db:generate       # Generate Prisma client
npm run db:push          # Push schema changes to database
npm run db:reset         # Reset database with force
npm run db:test          # Test database connection
npm run db:seed          # Seed database with sample data
```

## Architecture

### Directory Structure
- `app/` - Screen components using Expo Router file-based routing
- `components/` - Reusable UI components
- `stores/` - Zustand state management stores
- `lib/` - Utility functions, types, and configurations
- `constants/` - App constants and configurations
- `prisma/` - Database schema and migrations

### Key Architecture Patterns

**Layer Architecture**:
1. **Database Layer** - Prisma ORM with SQLite
2. **API Layer** - React Query for server state management
3. **Component Layer** - Reusable UI components
4. **Screen Layer** - Navigation screens using file-based routing
5. **Store Layer** - Client state management with Zustand

**State Management**:
- **Zustand stores** with persistence for client state
- **TanStack Query** for server state and caching
- **Form state** with React Hook Form + Zod validation

**UI System**:
- **React Native Paper** as base component library
- **Custom theme** with rainbow pastel color palette
- **Dark mode support** with theme persistence
- **Material Design icons** throughout

### Database Schema

The app uses Prisma with SQLite and includes four main models:
- **Pet** - Basic pet information (name, type, breed, birthDate, weight, gender, profilePhoto)
- **HealthRecord** - Health-related records (vaccinations, checkups, medications, surgeries)
- **Event** - Scheduled events (feeding, exercise, grooming, play, other activities)
- **FeedingSchedule** - Recurring feeding schedules with times and days

### Theme System

The app features a rainbow pastel color palette:
- Primary: Soft pink (#FFB3D1)
- Secondary: Mint green (#B3FFD9)
- Tertiary: Lavender (#C8B3FF)
- Accent: Peach (#FFDAB3)
- Surface: Light yellow (#FFF3B3)

Theme switching between light and dark modes is supported and persisted.

## Current Development Status

According to the roadmap files, the project has completed:
- ✅ UI/UX foundation phase with React Native Paper
- ✅ Rainbow pastel theme implementation
- ✅ Bottom tabs navigation
- ✅ Basic components (PetCard, QuickActionButtons, LoadingSpinner, ErrorBoundary, EmptyState)
- ✅ All main screens with placeholder content
- ✅ Store management setup
- ✅ Database schema design

Next phases likely include:
- Pet management forms and CRUD operations
- Health tracking implementation
- Calendar and scheduling features
- Multi-language support setup

## Development Notes

- The project uses TypeScript throughout
- All text content should support multi-language (i18n)
- Component reusability is emphasized - check existing components before creating new ones
- Store persistence is configured for pet data and theme preferences
- Database operations use Prisma client - ensure `db:generate` is run after schema changes