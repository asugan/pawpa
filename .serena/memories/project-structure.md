# PawPa - Proje Klasör Yapısı

## Üst Seviye Dizinler

```
pawpa/
├── app/                    # Expo Router - File-based routing
├── components/             # Yeniden kullanılabilir UI bileşenleri
├── lib/                    # Core library ve utilities
├── stores/                 # Zustand state management
├── locales/                # Çeviri dosyaları (tr.json, en.json)
├── constants/              # Uygulama sabitleri
├── assets/                 # Statik kaynaklar (resimler, fontlar)
├── providers/              # React context providers
├── hooks/                  # Genel custom hooks
├── scripts/                # Build ve utility scriptleri
├── docs/                   # Dokümantasyon
└── .serena/                # Serena MCP hafıza klasörü
```

## app/ - Routing Yapısı
```
app/
├── _layout.tsx            # Root layout (providers)
├── index.tsx              # Redirect to tabs
├── (tabs)/                # Tab navigation
│   ├── _layout.tsx        # Tab layout configuration
│   ├── index.tsx          # Ana sayfa (dashboard)
│   ├── pets.tsx           # Evcil hayvan listesi
│   ├── health.tsx         # Sağlık kayıtları
│   ├── calendar.tsx       # Takvim/etkinlikler
│   └── settings.tsx       # Ayarlar
├── pet/[id].tsx           # Evcil hayvan detay sayfası
├── health/[id].tsx        # Sağlık kaydı detayı
└── event/[id].tsx         # Etkinlik detayı
```

## lib/ - Core Library
```
lib/
├── api/                   # API client layer
│   └── client.ts          # Axios instance + interceptors
├── config/                # Yapılandırma dosyaları
│   ├── env.ts             # Environment değişkenleri
│   └── queryConfig.ts     # TanStack Query config
├── hooks/                 # Custom React hooks (12+)
│   ├── usePets.ts         # Pet data operations
│   ├── useHealthRecords.ts
│   ├── useEvents.ts
│   ├── useFeedingSchedules.ts
│   ├── useDeviceLanguage.ts
│   ├── useOnlineManager.ts
│   ├── useRealtimeUpdates.ts
│   └── useSmartPrefetching.ts
├── services/              # API service layer
│   ├── petService.ts
│   ├── healthRecordService.ts
│   ├── eventService.ts
│   └── feedingScheduleService.ts
├── schemas/               # Zod validation schemas
├── components/            # Özel bileşenler
│   ├── NetworkStatus.tsx
│   └── ApiErrorBoundary.tsx
├── utils/                 # Yardımcı fonksiyonlar
├── types/                 # TypeScript type definitions
├── types.ts               # Ana tip tanımları
├── theme.ts               # Tema yapılandırması
└── i18n.ts                # i18next setup
```

## components/ - UI Bileşenleri
```
components/
├── forms/                 # Form bileşenleri
├── calendar/              # Takvim bileşenleri
├── feeding/               # Besleme bileşenleri
├── background/            # Arka plan bileşenleri
├── PetCard.tsx            # Evcil hayvan kartı
├── StatCard.tsx           # İstatistik kartı
├── HealthOverview.tsx     # Sağlık özeti
├── NetworkStatusBadge.tsx # Ağ durumu göstergesi
├── ErrorBoundary.tsx      # Hata sınırı
├── LoadingSpinner.tsx     # Yükleme göstergesi
└── [30+ diğer bileşen]
```

## stores/ - State Management
```
stores/
├── themeStore.ts          # Tema yönetimi
├── petStore.ts            # Pet state (deprecated, TanStack Query kullanılıyor)
├── languageStore.ts       # Dil yönetimi
└── index.ts               # Store exports
```

## Önemli Dosyalar
- `package.json` - Bağımlılıklar ve scriptler
- `tsconfig.json` - TypeScript yapılandırması
- `eslint.config.js` - ESLint kuralları
- `app.json` - Expo yapılandırması
- `CLAUDE.md` - AI asistan için proje rehberi
