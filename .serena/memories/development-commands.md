# PawPa - Geliştirme Komutları

## Proje Kurulumu

### İlk Kurulum
```bash
npm install                 # Bağımlılıkları yükle
npm run reset-project      # Projeyi sıfırla (app-example/ klasörüne taşır)
```

## Development Server

### Temel Komutlar
```bash
npm start                  # Expo development server başlat
npm run android           # Android emulator'da çalıştır
npm run ios               # iOS simulator'da çalıştır
npm run web               # Web versiyonunu başlat
```

### Development Server Detayları
- **Port**: Genellikle `19000` (Metro Bundler) ve `19006` (Web)
- **QR Code**: Fiziksel cihazda test için Expo Go uygulaması ile tara
- **Hot Reload**: Otomatik aktif (kod değişikliklerinde)
- **Fast Refresh**: React Fast Refresh destekli

## Code Quality

### Linting
```bash
npm run lint              # ESLint çalıştır (tüm dosyalar)
npm run lint -- --fix     # Auto-fix ile ESLint çalıştır
```

### Type Checking
```bash
npx tsc --noEmit          # TypeScript type checking (build olmadan)
```

## Backend API Configuration

### Development API
```bash
# Backend Ngrok tunnel
# URL: https://7be27a13e414.ngrok-free.app
# Configured in: lib/config/env.ts
```

### API Test
```bash
# Backend durumunu kontrol et
curl https://7be27a13e414.ngrok-free.app/api/health

# Local backend başlatma (backend repo'sunda)
cd ../pawpa-backend
npm run dev
```

## Build & Deployment

### Production Build (placeholder)
```bash
# Android
npx expo build:android

# iOS
npx expo build:ios

# Web
npx expo export:web
```

### EAS Build (Expo Application Services)
```bash
# EAS kurulumu
npm install -g eas-cli
eas login
eas build:configure

# Android build
eas build --platform android

# iOS build
eas build --platform ios
```

## Debugging

### React Native Debugger
```bash
# Chrome DevTools
# Development menu: Shake device or Cmd+D (iOS) / Cmd+M (Android)
# Select "Debug JS Remotely"
```

### Flipper (Advanced)
```bash
# Flipper desktop app ile debugging
# Network inspector, Redux DevTools, Layout Inspector
# https://fbflipper.com/
```

### Logs
```bash
# Metro bundler logs (npm start çalışırken otomatik)
# Android logs
npx react-native log-android

# iOS logs
npx react-native log-ios
```

## Database & API

### API Endpoints (Backend)
- **Pets**: `/api/pets` (6 endpoints)
- **Health Records**: `/api/health-records` (5 endpoints)
- **Events**: `/api/events` (7 endpoints)
- **Feeding Schedules**: `/api/feeding-schedules` (7 endpoints)
- **Total**: 25 REST endpoints

### Data Reset (Backend)
```bash
# Backend repo'sunda
npm run db:reset           # SQLite veritabanını sıfırla
npm run db:seed            # Test verisi ekle
```

## Cache Management

### Clear Cache
```bash
# Expo cache temizleme
npx expo start -c          # Clear cache and start

# Metro bundler cache
npx react-native start --reset-cache

# Node modules reinstall
rm -rf node_modules
npm install
```

### TanStack Query Cache
```bash
# Runtime'da cache invalidation
# lib/hooks içindeki mutation hooks otomatik invalidate eder
# Manual invalidation: queryClient.invalidateQueries()
```

## Testing

### Unit Tests (placeholder - kurulu değil)
```bash
# Jest setup gerekli
npm test
npm run test:watch
npm run test:coverage
```

### E2E Tests (placeholder - kurulu değil)
```bash
# Detox veya Maestro setup gerekli
npm run e2e:ios
npm run e2e:android
```

## Utilities

### System Commands (Linux)
```bash
# Dosya arama
find . -name "*.tsx" -type f

# İçerik arama
grep -r "usePets" lib/

# Dizin listeleme
ls -la app/

# Git operations
git status
git add .
git commit -m "feat: new feature"
git push

# Port kontrolü
lsof -i :19000
```

### Package Management
```bash
# Bağımlılık ekleme
npm install <package-name>
npm install -D <dev-package>

# Bağımlılık kaldırma
npm uninstall <package-name>

# Bağımlılık güncelleme
npm update
npm outdated              # Güncel olmayan paketleri göster

# Audit
npm audit
npm audit fix
```

## Expo Specific

### Expo CLI Commands
```bash
# Expo doctor (sağlık kontrolü)
npx expo-doctor

# Environment info
npx expo-env-info

# Update Expo SDK
npx expo install --fix

# Prebuild (generate native projects)
npx expo prebuild

# Run on specific device
npx expo run:android --device
npx expo run:ios --device
```

### Expo Modules
```bash
# Expo module kurulumu
npx expo install <expo-package>

# Örnek:
npx expo install expo-image-picker
npx expo install expo-notifications
```

## Development Workflow

### Tipik Geliştirme Döngüsü
```bash
# 1. Backend'i başlat (ayrı terminal)
cd ../pawpa-backend
npm run dev

# 2. Frontend'i başlat
cd ../pawpa
npm start

# 3. Kod değişikliği yap

# 4. Lint kontrolü
npm run lint

# 5. Type check
npx tsc --noEmit

# 6. Test (varsa)
npm test

# 7. Commit
git add .
git commit -m "feat: description"
git push
```

### Hot Tips
- **r**: Reload app
- **m**: Toggle menu
- **d**: Open DevTools
- **i**: Run on iOS simulator
- **a**: Run on Android emulator
- **w**: Run on web browser

## Performance Monitoring

### Bundle Size Analysis
```bash
# React Native bundle visualizer
npx react-native-bundle-visualizer

# Expo bundle size
npx expo export --dev
```

### Performance Profiling
```bash
# React DevTools Profiler
# Chrome DevTools Performance tab
# Flipper performance monitoring
```

## Troubleshooting

### Common Issues
```bash
# Metro bundler hatası
npx expo start -c

# iOS build hatası
cd ios && pod install && cd ..

# Android build hatası
cd android && ./gradlew clean && cd ..

# Node version sorunları
nvm use 18  # veya projenin gerektirdiği versiyon

# Port zaten kullanımda
lsof -ti:19000 | xargs kill -9
```

### Clean Slate
```bash
# Tam temizlik ve yeniden başlat
rm -rf node_modules
rm package-lock.json
npm install
npx expo start -c
```
