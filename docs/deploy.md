# PawPa Pet Care Assistant - App Store Deployment Guide

## 📋 Mevcut Durum Analizi

**Mevcut Güçlü Yönler:**

- ✅ Expo SDK 54 kullanımı (güncel versiyon)
- ✅ EAS proje ID'si mevcut
- ✅ Temel eas.json yapılandırması
- ✅ Bundle identifier'lar tanımlanmış (`com.pawpa.app`)
- ✅ React Native 0.81.5 (yeni mimari enabled)

**Geliştirilmesi Gereken Alanlar:**

- ❌ Production build profilleri eksik
- ❌ Submit profilleri yetersiz
- ❌ App store metadataları eksik
- ❌ Privacy Policy ve Terms of Service belgeleri yok

## 🚀 Deployment Stratejisi

### Phase 1: Hazırlık ve Yapılandırma (1-2 gün)

#### 1. App Store Hesap Yapılandırması

**Apple Developer Program:**

- Apple Developer Program hesabı ($99/yıl)
- App Store Connect'te yeni uygulama kaydı
- Bundle ID: `com.pawpa.app`
- App Store Connect API Key oluştur (EAS Submit için)

**Google Play Console:**

- Google Play Console hesabı ($25/tek sefer)
- Yeni uygulama kaydı
- Package name: `com.pawpa.app`
- Service account key oluştur (EAS Submit için)

#### 2. Production Configuration

**app.json Optimizasyonları:**

```json
{
  "expo": {
    "name": "PawPa - Pet Care Assistant",
    "description": "Your complete pet care companion with health tracking, feeding schedules, and expense management.",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "pawpa",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.pawpa.app",
      "buildNumber": "1.0.0",
      "appStoreUrl": "https://apps.apple.com/app/pawpa-pet-care-assistant",
      "infoPlist": {
        "NSCameraUsageDescription": "Uygulamanın fotoğraflarınıza erişmesine izin verin.",
        "NSPhotoLibraryUsageDescription": "Uygulamanın fotoğraflarınıza erişmesine izin verin.",
        "NSMicrophoneUsageDescription": "Uygulamanın mikrofonuna erişmesine izin verin."
      }
    },
    "android": {
      "package": "com.pawpa.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

**eas.json Production Profilleri:**

```json
{
  "cli": {
    "version": ">= 16.28.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "YOUR_APP_STORE_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "track": "production",
        "status": "completed",
        "releaseNotes": "Initial release of PawPa Pet Care Assistant"
      }
    }
  }
}
```

### Phase 2: Asset ve Metadata Hazırlığı (2-3 gün)

#### 3. Görsel Asset'ler

**iOS App Store Requirements:**

- **Screenshots:**
  - 6.7" iPhone: 1290x2796 pixels (minimum 3, maksimum 10)
  - 5.5" iPhone: 1242x2208 pixels (minimum 3, maksimum 10)
  - iPad: 2048x2732 pixels (minimum 2, maksimum 10)
- **App Icon:** 1024x1024 pixels
- **App Preview (optional):** 15-30 saniye, M4V, MP4 veya MOV format

**Google Play Store Requirements:**

- **Screenshots:**
  - Phone: 1080x1920 pixels minimum (minimum 2, maksimum 8)
  - Tablet: 1920x1200 pixels minimum (minimum 1, maksimum 8)
- **Feature Graphic:** 1024x500 pixels (zorunlu)
- **App Icon:** 512x512 pixels
- **Promo Video (optional):** YouTube URL

#### 4. Store Metadata

**App Store Connect Metadata:**

- **App Name:** PawPa - Pet Care Assistant
- **Subtitle:** Your Pet's Health Companion
- **Description:** Complete pet care management app with health tracking, feeding schedules, vaccination reminders, and expense management.
- **Keywords:** pet, care, health, tracking, vaccination, feeding, expenses, management
- **Category:** Health & Fitness
- **Age Rating:** 4+

**Google Play Store Metadata:**

- **App Name:** PawPa - Pet Care Assistant
- **Short Description:** Complete pet care companion with health tracking and expense management.
- **Full Description:** Detailed app description (4000 karakter)
- **Category:** Health & Fitness
- **Content Rating:** Everyone

### Phase 3: Build ve Test (1-2 gün)

#### 5. Production Build

**iOS Production Build:**

```bash
# iOS production build oluştur
eas build --platform ios --profile production

# Build sonrası otomatik submit
eas build --platform ios --profile production --auto-submit
```

**Android Production Build:**

```bash
# Android production build oluştur
eas build --platform android --profile production

# Build sonrası otomatik submit
eas build --platform android --profile production --auto-submit
```

#### 6. Internal Testing

**TestFlight Setup:**

- App Store Connect → TestFlight → Internal Testing
- Test kullanıcıları ekle
- iOS build'ini TestFlight'e yükle

**Google Play Internal Testing:**

- Google Play Console → Internal Testing
- Test kullanıcıları ekle
- Android APK/AAB'ini yükle

### Phase 4: Submission ve Review (1-7 gün)

#### 7. Store Submission

**App Store Submission:**

- App Store Connect → "Prepare for Submission"
- Metadata ve asset'leri yükle
- Privacy information doldur
- "Submit for Review"

**Google Play Submission:**

- Google Play Console → "Release" → "Production"
- Store listing'i tamamla
- Content rating'i onayla
- "Start rollout"

#### 8. Review Süreçleri

**App Store Review:**

- Genellikle 24-48 saat
- Guideline compliance kontrolü
- Functionality testleri
- Privacy policy kontrolü

**Google Play Review:**

- Genellikle birkaç saat
- Policy compliance kontrolü
- Technical validation
- Content review

## 📱 App Store Requirements Checklist

### iOS App Store

- [ ] Apple Developer Program membership ($99/yıl)
- [ ] App Store Connect app kaydı
- [ ] Bundle ID: `com.pawpa.app`
- [ ] Screenshots: 6.7" (1290x2796), 5.5" (1242x2208), iPad (2048x2732)
- [ ] App icon: 1024x1024
- [ ] Privacy Policy URL
- [ ] App Store Connect metadata
- [ ] Age rating information
- [ ] App privacy details
- [ ] App Review Guidelines compliance

### Google Play Store

- [ ] Google Play Console hesabı ($25/tek sefer)
- [ ] App kaydı
- [ ] Package name: `com.pawpa.app`
- [ ] Screenshots: Phone (1080x1920 minimum), Tablet (minimum 2)
- [ ] Feature graphic: 1024x500
- [ ] App icon: 512x512
- [ ] Privacy Policy URL
- [ ] Content rating questionnaire
- [ ] Target audience and content
- [ ] Google Play Policy compliance

## 🛡️ Security ve Compliance

### Privacy Policy Gereksinimleri

PawPa uygulaması şu verileri toplar:

- **Kullanıcı Bilgileri:** E-posta, profil bilgileri (Better Auth ile)
- **Pet Bilgileri:** Pet photos, health records, feeding schedules
- **Kullanım Verileri:** Crash data (expo-updates), analytics
- **Cihaz Bilgileri:** App version, device type (for updates)

### GDPR Compliance

- Veri toplama amaçları
- Kullanıcı hakları
- Veri saklama süreleri
- Third-party servisler

### App Store Review Hazırlığı

- App Store Guidelines compliance
- Google Play Policy compliance
- Content rating doğruluğu
- Functionality testleri

## 📊 Timeline Önerisi

**Hafta 1:**

- Gün 1-2: App store kayıtları ve yapılandırma
- Gün 3-4: Asset ve metadata hazırlığı
- Gün 5-7: Legal dokümanlar

**Hafta 2:**

- Gün 1-2: Production build ve test
- Gün 3-4: Internal testing deployment
- Gün 5-7: Store submission

**Hafta 3+:**

- Review süreçlerini takip
- Feedback ve revisions
- Public release

## 🚀 Deployment Komutları

### Build Komutları

```bash
# Development build
eas build --platform ios --profile development
eas build --platform android --profile development

# Preview build
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Production build
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Submit Komutları

```bash
# Manual submit
eas submit --platform ios --profile production
eas submit --platform android --profile production

# Auto-submit ile build
eas build --platform ios --profile production --auto-submit
eas build --platform android --profile production --auto-submit
```

### Update Komutları

```bash
# OTA update publish
eas update --branch production --message "Bug fixes and improvements"

# Preview update
eas update --branch preview --message "New features for testing"
```

## 📞 Destek Kaynakları

### Official Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

### Troubleshooting

- Build errors: EAS dashboard ve build logs
- Submission issues: App Store Connect ve Google Play Console
- Review rejections: Guideline compliance kontrolü

Bu rehberi takip ederek PawPa uygulamanızı başarıyla app store'lara deploy edebilirsiniz. Her aşama için detaylı implementasyon adımları ve troubleshooting ipuçları included edilmiştir.
