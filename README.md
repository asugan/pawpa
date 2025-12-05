# Pawpa - Pet Management App 🐾

Pawpa is a modern pet management application built with React Native and Expo, designed to help pet owners track their pets' health records, events, and daily activities with a beautiful and intuitive interface.

[![Expo Version](https://img.shields.io/badge/Expo-~54.0.20-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-green.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 📱 Features

- 🐕 **Pet Profile Management** - Create and manage profiles for all your pets
- 🏥 **Health Records** - Track vaccinations, medications, and vet visits
- 📅 **Event Tracking** - Schedule and remember important pet events
- 🌍 **Multi-language Support** - English and Turkish languages
- 🌙 **Dark Mode** - Beautiful light and dark theme support
- 🔐 **Secure Authentication** - Better Auth integration for secure login
- 💳 **Premium Features** - RevenueCat integration for subscription management

## 🛠 Tech Stack

### Core Technologies
- **React Native 0.81.5** with Expo SDK ~54.0.20
- **TypeScript** with strict mode for type safety
- **Expo Router** for file-based navigation

### State Management
- **Zustand** for client state management
- **TanStack Query** for server state with mobile-optimized caching

### Development & Build
- **ESLint** for code quality
- **EAS Build** for deployment
- **TypeScript Path Aliases** for clean imports

### Third-party Integrations
- **Better Auth** for authentication
- **RevenueCat** for subscription management
- **i18next** for internationalization

## 📁 Project Structure

```
pawpa/
├── app/                    # Expo Router file-based routing
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── index.tsx          # Landing page
│   ├── subscription.tsx   # Subscription modal
│   └── _layout.tsx        # Root layout with providers
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── subscription/     # Subscription components
│   └── [feature]/        # Feature-specific components
├── lib/                   # Core library code
│   ├── api/              # API client and endpoints
│   ├── auth/             # Authentication utilities
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic services
│   ├── schemas/          # Zod validation schemas
│   ├── theme/            # Theme system
│   ├── types.ts          # Central TypeScript definitions
│   └── i18n.ts           # Internationalization setup
├── stores/               # Zustand state management
├── providers/            # React context providers
├── locales/              # Translation files (en.json, tr.json)
├── constants/            # App constants
├── eas.json              # EAS Build configuration
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pawpa.git
   cd pawpa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Development

Start the development server:

```bash
npm start
```

This will open Expo Go in your default browser where you can:

- Scan the QR code with your mobile device using the Expo Go app
- Run on iOS Simulator or Android Emulator
- Open in web browser

### Platform-Specific Development

```bash
# Run on Android device/emulator
npm run android

# Run on iOS simulator/device
npm run ios

# Run in web browser
npm run web

# Run linting
npm run lint

# Reset project to clean state (custom script)
npm run reset-project
```

## 🌐 Features Overview

### Navigation
- File-based routing with Expo Router
- Route groups for authentication (`(auth)`) and main app (`(tabs)`)
- Modal presentation for subscription screen
- Deep linking with `pawpa://` scheme

### Internationalization
- Support for English and Turkish languages
- Namespace-based translations in `locales/`
- Dynamic language switching via Zustand store

### Theme System
- Custom light/dark theme implementation
- System-responsive theme switching
- Zustand store for theme state

### API Integration
- Axios-based client with interceptors
- Mobile-optimized TanStack Query configuration
- Intelligent caching and retry logic for mobile networks

## 📱 Screenshots

*[Add screenshots here when available]*

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
EXPO_PUBLIC_API_URL=https://your-api-url.com
EXPO_PUBLIC_REVENUECAT_API_KEY=your-revenuecat-key
# Add other environment variables as needed
```

### Build Configuration

The app is configured with EAS Build. See `eas.json` for build profiles.

## 📦 Build & Deploy

### EAS Build

```bash
# Build for all platforms
eas build --platform all

# Build for specific platform
eas build --platform ios
eas build --platform android
```

### Submit to App Stores

```bash
# Submit to Apple App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode guidelines
- Use existing components and patterns from `components/ui/`
- Maintain consistent code style with ESLint
- Add proper internationalization for new features
- Follow the established file-based routing structure

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** for the amazing React Native framework
- **React Navigation** for routing solutions
- **RevenueCat** for subscription management
- **Better Auth** for authentication framework

## 📞 Contact

If you have any questions or suggestions, feel free to:

- Open an [Issue](https://github.com/asugan/pawpa/issues)
- Create a [Pull Request](https://github.com/asugan/pawpa/pulls)
- Contact us at [cagatayeren1898@gmail.com]

---

Made with ❤️ for pet lovers everywhere 🐕🐈🐾