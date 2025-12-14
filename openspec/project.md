# Project Context

## Purpose

**Pawpa** (formerly Petopia Petcare) is a React Native mobile application designed to be a comprehensive pet health and care management platform. The app helps pet owners track their pets' health records, manage feeding schedules, monitor expenses, and stay on top of important pet care events. Built with a focus on mobile-first UX with support for iOS, Android, and web platforms.

The app features multi-language support (English/Turkish), subscription-based monetization via RevenueCat, and a modern tech stack optimized for mobile performance.

## Tech Stack

### Core Framework & Runtime
- **React Native 0.81.5** with Expo SDK ~54.0.20
- **Expo Router** for file-based routing
- **TypeScript** with strict mode enabled
- **React 19.1.0** (latest)

### Navigation & UI
- **Expo Router**: File-based routing with nested layouts
- **React Navigation 7.x**: Bottom tabs and navigation elements
- **React Native Reanimated 4.x**: Smooth animations
- **React Native Safe Area Context & Screens**: Platform-specific safe areas
- **Expo Vector Icons & Symbols**: Icon library

### State Management
- **Zustand 5.x**: Client-side state management (theme, language, pets, subscription)
- **TanStack Query 5.x**: Server state with intelligent caching and retry logic
- **React Context**: Auth, Language, Subscription providers

### Data & Validation
- **Zod 3.x**: Runtime type validation and schema definition
- **React Hook Form 7.x**: Form handling with Zod resolvers
- **Axios 1.x**: HTTP client with interceptors
- **date-fns 4.x**: Date manipulation utilities

### Authentication & Security
- **Better Auth 1.4.3** with `@better-auth/expo` integration
- **Expo Secure Store**: Secure credential storage

### Internationalization
- **i18next 25.x**: Internationalization framework
- **react-i18next 16.x**: React integration
- **Expo Localization**: Platform locale detection

### Monetization
- **RevenueCat** with `@react-native-purchases` for subscription management

### Media & Storage
- **Expo Image 3.x** with **Image Picker** and **Image Manipulator**
- **Async Storage**: Local persistence
- **Expo File System**: File management
- **React Native Chart Kit**: Data visualization
- **React Native SVG**: Vector graphics

### Platform Services
- **Expo Notifications**: Push notifications
- **Expo Haptics**: Tactile feedback
- **Expo Network**: Network status monitoring
- **React Native Gesture Handler**: Touch handling
- **Expo Web Browser**: In-app browser

### Development Tools
- **TypeScript ~5.9.2**
- **ESLint** with Expo config
- **babel-plugin-inline-import**: Asset imports

## Project Conventions

### Code Style

#### File Organization
- **Path Alias**: `@/*` points to project root for clean imports
- **Co-location**: Feature-specific components co-located with features
- **Namespace-based i18n**: Translations organized by feature namespace
- **Schema-driven types**: Zod schemas define runtime validation

#### Naming Conventions
- **Files**: camelCase for utilities, PascalCase for components
- **Components**: PascalCase (e.g., `FinancialOverview`, `PetCard`)
- **Functions/variables**: camelCase (e.g., `useThemeStore`, `createQueryKeys`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `CACHE_TIMES`, `RETRY_CONFIGS`)
- **Types/interfaces**: PascalCase with descriptive names (e.g., `ThemeState`, `PetCreateInput`)

#### Import Organization (as per lib/types.ts pattern)
1. External library imports (React, native modules, etc.)
2. Path alias imports (@/...)
3. Relative imports

**Section comments for large files:**
```typescript
// ============================================================================
// IMPORTLAR - Tüm importları en üste taşı
// ============================================================================
```

#### TypeScript Standards
- **Strict mode enabled** - all strict TypeScript checks enforced
- **Explicit types** for props, returns, and state
- **Interface over type** for object shapes (preferred in stores)
- **Centralized types** in `lib/types.ts`
- **Schema-based validation** using Zod for all data inputs/outputs

#### Code Structure
- **Feature-based organization**: Components organized by feature
- **Reusable UI components** in `components/ui/`
- **Business logic separation** in `lib/services/`
- **Custom hooks** for reusable logic in `lib/hooks/`
- **Separate schema files** for each domain entity (petSchema.ts, healthRecordSchema.ts, etc.)

### Architecture Patterns

#### 1. File-Based Routing with Expo Router
- **Root layout**: `_layout.tsx` (providers and global configuration)
- **Nested layouts**: Route groups with dedicated layouts
  - `(auth)/` - Authentication screens
  - `(tabs)/` - Main app navigation with bottom tabs
- **Modal presentation**: Subscription screen as modal overlay
- **Typed routes**: TypeScript integration for type-safe navigation
- **Deep linking**: Custom scheme `petopia-petcare://`

#### 2. State Management Strategy
**Zustand for Client State:**
- `themeStore.ts` - Theme mode and appearance
- `languageStore.ts` - Current language and translations
- `authStore.ts` - Authentication state
- `subscriptionStore.ts` - Subscription status
- `petStore.ts` - Pet data and operations
- `onboardingStore.ts` - User onboarding progress

**TanStack Query for Server State:**
- Mobile-optimized caching with `staleTime` and `gcTime`
- Intelligent retry logic with exponential backoff
- Network-aware queries (only refetch when online)
- Query key factory pattern for consistency
- Prefetching strategies for better UX

**React Context for Providers:**
- Auth provider wrapping entire app
- Language provider with i18n integration
- Subscription provider for premium features

#### 3. API Layer Architecture
- **Axios client** with interceptors for auth tokens and error handling
- **Request/response transformation** at API boundary
- **Typed responses** using Zod schemas
- **Mobile-aware configuration**:
  - Retry logic: 3x for network, 2x for 5xx, 0x for 4xx
  - Exponential backoff with jitter
  - Structural sharing to prevent unnecessary re-renders
  - Background refetch on reconnect

#### 4. Internationalization Pattern
- **Namespace-based translations**: Each feature has its own namespace
- **Dynamic language switching** via Zustand store
- **Translation files**:
  - `locales/en.json` - English
  - `locales/tr.json` - Turkish
- **Translation structure**:
```json
{
  "auth": {
    "login": "Log In",
    "signUp": "Sign Up"
  },
  "navigation": {
    "home": "Home",
    "pets": "Pets"
  }
}
```

#### 5. Theme System
- **Dual theme support**: Light and dark modes
- **Zustand-managed theme state** with persistence
- **System-responsive**: Follows device theme by default
- **Theme structure**: Consistent color palette, spacing, typography
- **Component-level theming**: All components consume theme from store

#### 6. Form Handling
- **React Hook Form** for performance (minimal re-renders)
- **Zod resolvers** for validation
- **Schema-driven forms**: Validation rules from Zod schemas
- **Reusable form components** in `components/forms/`

### Testing Strategy

**Note**: Testing setup may not be fully implemented yet. When implementing tests:
- Use **Jest** for unit testing
- **React Testing Library** for component testing
- **@testing-library/react-native** for React Native components
- **MSW (Mock Service Worker)** for API mocking
- **Snapshot testing** for UI components
- **E2E testing** with Detox for critical user flows

### Git Workflow

**Branching Strategy:**
- **Main branch**: `dev` (current working branch)
- **Feature branches**: `feature/feature-name` or `feat/feature-name`
- **Bug fix branches**: `fix/issue-description`
- **Refactor branches**: `refactor/what-is-refactored`

**Commit Convention:**
Use conventional commits format:
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `style:` - Formatting, missing semicolons, etc.
- `test:` - Adding tests
- `chore:` - Build process, dependencies

**Current Status:**
The repository has active changes with modifications to:
- Authentication pages (`login.tsx`, `signup.tsx`)
- Configuration files (`env.ts`, `app.json`)
- Theme system (`context.tsx`)
- Internationalization files (`en.json`, `tr.json`)
- State management (`languageStore.ts`, `onboardingStore.ts`)

## Domain Context

**Pet Management Domain:**
- **Pet entities** with profile information (name, breed, age, photos)
- **Health Records** including vaccinations, vet visits, medications
- **Feeding Schedules** with customizable reminders
- **Events/Calendar** for appointments, grooming, and activities
- **Financial Tracking** with expense categories and payment methods
- **Multi-pet support** - users can manage multiple pets

**Key User Workflows:**
1. **Onboarding**: Create account → Add pet → Configure preferences
2. **Daily Care**: Check today's schedule → Log feeding → Update health records
3. **Health Monitoring**: Track vaccinations → Schedule vet visits → Monitor symptoms
4. **Financial Tracking**: Log expenses → View spending → Track subscriptions

**Business Model:**
- **Freemium with subscriptions** via RevenueCat
- **Premium features** gated by subscription status
- **In-app purchases** for advanced functionality

## Important Constraints

### Technical Constraints
- **Mobile-first**: Optimized for mobile performance and battery usage
- **Offline capability**: Important data cached locally
- **Network resilience**: Robust retry logic for poor network conditions
- **Cross-platform**: iOS, Android, and Web support
- **Type safety**: Strict TypeScript mode with comprehensive coverage

### Platform Constraints
- **Expo SDK limitations**: Some native modules may require custom configuration
- **Platform-specific features**: iOS and Android have different capabilities
- **App store compliance**: Must follow Apple/Google guidelines
- **Deep linking**: Custom URL scheme `petopia-petcare://`

### Business Constraints
- **Subscription revenue**: Premium features require active subscription
- **User data privacy**: Secure handling of pet and owner information
- **Scalability**: Efficient caching for growing pet/health record data

## External Dependencies

### Authentication
- **Better Auth**: Authentication provider with email/social login support
- **Expo Secure Store**: Secure token storage

### Backend/API
- **Custom API**: RESTful API (endpoint configuration in `lib/config/env.ts`)
- **Axios**: HTTP client with interceptors for token management

### Third-Party Services
- **RevenueCat**: Subscription and in-app purchase management
- **Push Notification Service**: (Configured via Expo Notifications)

### Development & Build
- **Expo Application Services (EAS)**: Build and deployment
- **Project ID**: `28c754d9-aea7-4168-a3b9-becb001d5b22`
- **Bundle Identifier**: `com.petopia.app` (iOS/Android)

### Code Quality Tools
- **ESLint**: Code linting with Expo configuration
- **TypeScript**: Static type checking
- **Pre-commit hooks**: (If configured via husky)

### Analytics & Monitoring
- **Console logging**: Primary debugging method (console.log throughout codebase)
- **Error boundaries**: React error boundaries for graceful failures
- **Network monitoring**: `@react-native-community/netinfo` for connectivity status

### Key Configuration Files
- **app.json**: Expo configuration, plugins, platform settings
- **package.json**: Dependencies and scripts
- **tsconfig.json**: TypeScript configuration
- **eas.json**: EAS Build configuration
- **babel.config.js**: Babel transformation configuration