# 🐾 PawPa - Pet Care Mobile App

[![Expo Version](https://img.shields.io/badge/Expo-54.0.20-000.svg?style=for-the-badge&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB.svg?style=for-the-badge&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**PawPa** is a comprehensive pet care mobile application built with React Native and Expo. It features a playful, cute theme with rainbow pastel colors and supports multiple languages (Turkish and English).

![PawPa App Banner](https://via.placeholder.com/800x400/FFB3D1/FFFFFF?text=PawPa+-+Pet+Care+App)

## ✨ Features

### 🐕 Pet Management
- Create and manage pet profiles with photos
- Track pet information (age, breed, weight, etc.)
- Multiple pet support in one app

### 🏥 Health Tracking
- Monitor vaccination schedules and records
- Track medications and appointments
- Health history and medical records
- Upcoming vaccination reminders

### 📅 Calendar & Events
- Schedule pet-related events and appointments
- Calendar view with pet activities
- Event notifications and reminders
- Daily/weekly event summaries

### 🍽️ Feeding Schedules
- Set up automated feeding schedules
- Custom feeding times and portions
- Feeding history and tracking
- Next feeding time notifications

### 🌍 Multi-language Support
- Built-in internationalization (i18n)
- Turkish and English language support
- Easy language switching

### 🎨 Rainbow Pastel Theme
- Beautiful rainbow pastel color palette
- Dark mode support with theme persistence
- Custom React Native Paper theme
- Material Design icons throughout

### 📱 Network-Aware
- Real-time connectivity monitoring
- Offline mode support and user feedback
- Intelligent caching with background sync
- Network-aware retry logic

## 🛠 Tech Stack

### Frontend
- **Framework**: Expo SDK ~54.0.20 with React Native 0.81.5
- **Navigation**: Expo Router (file-based routing) with bottom tabs
- **UI Library**: React Native Paper with custom theme
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form with Zod validation
- **Icons**: Material Community Icons
- **Language**: TypeScript

### Backend Integration
- **API Client**: Axios with interceptors and error handling
- **Backend**: Node.js Express + SQLite + Drizzle ORM (separate project)
- **API Endpoints**: 25 REST endpoints covering all features
- **Network Monitoring**: @react-native-community/netinfo
- **Error Handling**: Global ApiErrorBoundary component

### Development Tools
- **Notifications**: Expo Notifications
- **Internationalization**: i18next
- **Code Quality**: ESLint, TypeScript strict mode
- **Environment**: Environment-based configuration

## 📋 API Endpoints

PawPa connects to a comprehensive backend with **25 REST endpoints**:

### Pet Management API (6 endpoints)
```
GET    /api/pets              - List all pets with pagination
GET    /api/pets/:id          - Get single pet details
POST   /api/pets              - Create new pet
PUT    /api/pets/:id          - Update pet information
DELETE /api/pets/:id          - Delete pet
POST   /api/pets/:id/photo    - Upload pet photo
```

### Health Records API (5 endpoints)
```
GET    /api/pets/:petId/health-records     - Get pet health records
POST   /api/health-records                 - Create new health record
PUT    /api/health-records/:id             - Update health record
DELETE /api/health-records/:id             - Delete health record
GET    /api/health-records/upcoming        - Get upcoming vaccinations
```

### Events API (7 endpoints)
```
GET    /api/pets/:petId/events    - Get pet events
POST   /api/events                - Create new event
PUT    /api/events/:id            - Update event
DELETE /api/events/:id            - Delete event
GET    /api/events/calendar/:date - Get calendar events
GET    /api/events/upcoming       - Get upcoming events
GET    /api/events/today          - Get today's events
```

### Feeding Schedules API (7 endpoints)
```
GET    /api/pets/:petId/feeding-schedules  - Get pet feeding schedules
POST   /api/feeding-schedules              - Create new feeding schedule
PUT    /api/feeding-schedules/:id          - Update feeding schedule
DELETE /api/feeding-schedules/:id          - Delete feeding schedule
GET    /api/feeding-schedules/active       - Get active schedules
GET    /api/feeding-schedules/today        - Get today's schedules
GET    /api/feeding-schedules/next         - Get next feeding time
```

## 🏗 Architecture

### Layer Architecture
```
┌─────────────────────────────────────┐
│           Screen Layer              │ ← Navigation screens
├─────────────────────────────────────┤
│         Component Layer             │ ← Reusable UI components
├─────────────────────────────────────┤
│      State Management Layer         │ ← TanStack Query + Zustand
├─────────────────────────────────────┤
│          Service Layer              │ ← API service classes
├─────────────────────────────────────┤
│            API Layer                │ ← Axios HTTP client
└─────────────────────────────────────┘
```

### Directory Structure
```
pawpa/
├── app/                    # Screen components (Expo Router)
│   ├── (tabs)/            # Bottom tab screens
│   ├── pets/              # Pet-related screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── forms/             # Form components
│   ├── modals/            # Modal components
│   └── ui/                # UI components
├── stores/                # Zustand state management
├── lib/                   # Utilities and configurations
│   ├── api/               # HTTP client and API utilities
│   ├── config/            # Environment configuration
│   ├── hooks/             # React Query hooks
│   ├── services/          # API service layer
│   └── components/        # Specialized components
├── constants/             # App constants
└── types/                 # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Expo CLI
- Android Studio or Xcode (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pawpa.git
   cd pawpa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   ```bash
   # Android
   npm run android

   # iOS
   npm run ios

   # Web
   npm run web
   ```

### Backend Setup

The app requires a backend server running on `localhost:3000` for development:

1. **Navigate to backend directory**
   ```bash
   cd ../pawpa-backend  # or your backend project folder
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm run dev
   ```

4. **Configure API endpoints**
   - Update `lib/config/env.ts` with your backend URL
   - Default: `http://localhost:3000`

### Environment Configuration

Create or update your environment configuration in `lib/config/env.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
}
```

## 🎨 Theme System

PawPa features a beautiful rainbow pastel color palette:

- **Primary**: Soft Pink (#FFB3D1)
- **Secondary**: Mint Green (#B3FFD9)
- **Tertiary**: Lavender (#C8B3FF)
- **Accent**: Peach (#FFDAB3)
- **Surface**: Light Yellow (#FFF3B3)

### Dark Mode
- Full dark mode support with automatic system detection
- Theme preference persistence
- Optimized color schemes for both light and dark modes

## 📱 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Platform-specific builds
npm run android    # Android emulator/device
npm run ios        # iOS simulator/device
npm run web        # Web browser

# Code quality
npm run lint       # Run ESLint

# Project utilities
npm run reset-project  # Reset to blank template
```

## 🔄 Development Status

### ✅ Completed Phases

**Phase 1: Backend Foundation** (28.10.2025) - COMPLETED
- Node.js Express server setup with TypeScript
- SQLite database with Drizzle ORM configuration
- Middleware setup (CORS, helmet, morgan, rate limiting)
- Project structure with controllers, routes, services, middleware

**Phase 2: API Implementation** (28.10.2025) - COMPLETED
- 25 REST API endpoints implemented
- Input validation with Zod schemas
- Error handling and response formatting
- Pagination and filtering support

**Phase 3: Mobile App API Integration** (28.10.2025) - COMPLETED
- HTTP client setup with interceptors and error handling
- Service layer refactored to use API calls
- TanStack Query configuration with network-aware caching
- NetworkStatus and ApiErrorBoundary components

**Earlier Features** - COMPLETED
- UI/UX foundation with React Native Paper
- Rainbow pastel theme implementation
- Bottom tabs navigation with Expo Router
- Zustand store management and i18n setup

### 🔄 Current Phase: Phase 4 - Integration & Testing
- [ ] Backend unit and integration tests
- [ ] End-to-end mobile app + backend testing
- [ ] CRUD operations testing scenarios
- [ ] Network error handling validation
- [ ] Performance optimization and monitoring

### ⏳ Pending: Phase 5 - Deployment & Monitoring
- [ ] Production environment setup
- [ ] Deployment strategy implementation
- [ ] Monitoring and logging setup
- [ ] Documentation finalization

## 🔧 Key Features & Implementation

### Network-Aware Development
- **Real-time Connectivity**: Automatic network status monitoring
- **Offline Support**: Graceful handling of network interruptions
- **Intelligent Caching**: TanStack Query with background refetch
- **Error Recovery**: Network-aware retry logic with exponential backoff

### State Management
- **Zustand Stores**: Theme and language persistence
- **TanStack Query**: Server state management with caching
- **Form State**: React Hook Form + Zod validation
- **Network State**: Automatic synchronization when connectivity returns

### Error Handling
- **Global Error Boundary**: ApiErrorBoundary component
- **User-Friendly Messages**: Localized error messages
- **Request Logging**: Development mode debugging
- **Graceful Degradation**: App remains functional during errors

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Use TypeScript for all new code
- Follow existing code patterns and conventions
- Add proper error handling for API calls
- Test on multiple platforms when possible
- Update documentation for new features

### Code Style
- Use ESLint configuration (`npm run lint`)
- Follow React Native and TypeScript best practices
- Maintain consistent naming conventions
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** - For the amazing React Native framework
- **React Native Paper** - For the excellent UI component library
- **TanStack Query** - For the powerful state management solution
- **Material Community Icons** - For the beautiful icon set

## 📞 Contact

- **Project Maintainer**: [Your Name](mailto:your.email@example.com)
- **Project Link**: [https://github.com/yourusername/pawpa](https://github.com/yourusername/pawpa)
- **Issues**: [GitHub Issues](https://github.com/yourusername/pawpa/issues)

---

**Made with ❤️ for pet lovers everywhere** 🐾