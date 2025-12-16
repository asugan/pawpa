<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server with Expo
npm start

# Platform-specific development
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS simulator/device
npm run web        # Run in web browser

# Code quality
npm run lint       # Run ESLint

# Project reset (custom script)
npm run reset-project  # Reset project to clean state
```

## Project Architecture

**Pawpa** is a React Native pet management application built with Expo Router and TypeScript.

### Tech Stack

- **Framework**: React Native 0.81.5 with Expo SDK ~54.0.20
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript with strict mode
- **State Management**: Zustand (client state) + TanStack Query (server state)
- **Authentication**: Better Auth integration
- **Internationalization**: i18next (English/Turkish)
- **Monetization**: RevenueCat for subscriptions

### Directory Structure

```
app/                    # Expo Router file-based routing
├── (auth)/            # Authentication screens group
├── (tabs)/            # Main tab navigation
├── index.tsx          # Landing page
├── _layout.tsx        # Root layout with providers
├── subscription.tsx   # Subscription modal
└── [feature]/         # Feature-specific screens (pet, health, event)

components/            # Reusable UI components
├── ui/               # Base UI components
├── forms/            # Form components
├── subscription/     # Subscription components
└── [feature]/        # Feature-specific components

lib/                   # Core library code
├── api/              # API client and endpoints
├── auth/             # Authentication utilities
├── hooks/            # Custom React hooks
├── services/         # Business logic services
├── schemas/          # Zod validation schemas
├── theme/            # Theme system
├── types.ts          # Central TypeScript definitions
└── i18n.ts           # Internationalization setup

stores/               # Zustand state management
providers/            # React context providers
locales/              # Translation files (en.json, tr.json)
constants/            # App constants
```

### Key Architectural Patterns

#### 1. **File-Based Routing with Expo Router**

- Nested layouts: `_layout.tsx` (root providers) → `(tabs)/_layout.tsx` (main navigation)
- Route groups for authentication (`(auth)`) and main app (`(tabs)`)
- Modal presentation for subscription screen

#### 2. **State Management Strategy**

- **Zustand**: Theme, language, pets, subscription state
- **TanStack Query**: Server state with mobile-optimized caching
- **React Context**: Auth, Language, Subscription providers

#### 3. **API Layer**

- Axios-based client with interceptors in `lib/api/`
- TanStack Query with mobile-aware configuration in `lib/config/queryConfig.ts`
- Intelligent caching and retry logic for mobile networks

#### 4. **Type Safety**

- Strict TypeScript mode with comprehensive type coverage
- Zod schemas for runtime validation
- Centralized types in `lib/types.ts`
- Path aliases: `@/*` points to project root

#### 5. **Form Handling**

- React Hook Form with Zod resolvers
- Reusable form components in `components/forms/`

## Development Guidelines

### Component Organization

- Feature-based component structure
- Reusable UI components in `components/ui/`
- Screen-specific components co-located with features

### Internationalization

- Namespace-based translations in `locales/`
- Dynamic language switching via Zustand store
- Support for English and Turkish

### Theme System

- Custom light/dark theme implementation
- Zustand store for theme state
- System-responsive theme switching

### Error Handling

- Error boundaries at multiple levels
- Centralized TanStack Query error handling
- User-friendly i18n error messages

## Configuration Notes

- **Expo Configuration**: `app.json` with plugins for image picker, secure store, splash screen
- **TypeScript**: Strict mode enabled, path aliases configured
- **Build System**: EAS Build configured (`eas.json`)

- **Router Scheme**: Uses `pawpa://` for deep linking

I've added key details about the deep linking scheme, which complements the existing configuration and provides a complete picture of the app's navigation infrastructure. This rounds out the technical specifications by explaining how the app handles external and internal routing through its custom URI scheme.
