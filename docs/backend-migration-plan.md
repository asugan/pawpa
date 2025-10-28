# PawPa Backend Migration Plan

## Overview

Bu doküman, PawPa mobil uygulamasındaki yerel veritabanı (SQLite + Drizzle ORM) yapısının Node.js Express backend API'sine taşınması için kapsamlı bir migration planını içerir.

### Mevcut Durum
- **Mobil Uygulama**: Expo + React Native
- **Veritabanı**: SQLite + Drizzle ORM (lokal)
- **Backend**: Mevcut değil
- **Hedef**: Node.js Express + SQLite + Drizzle ORM

### Migration Nedenleri
1. **Merkezi Veri Yönetimi**: Tüm verilerin tek bir yerde yönetimi
2. **Çoklu Platform Desteği**: Mobil, web ve future clients
3. **Güvenlik**: Veri erişiminin merkezileştirilmesi
4. **Scalability**: Gelecekteki genişleme olanakları
5. **Data Persistence**: Uygulama silindiğinde verilerin kaybolmaması

---

## Phase 1: Backend Foundation (1-2 gün) ✅ COMPLETED

### 1.1 Backend Kurulumu ✅
- [x] Node.js Express server kurulumu
- [x] Proje yapısı oluşturma (controllers, routes, services, middleware)
- [x] Temel middleware'ler (CORS, body-parser, helmet, morgan)
- [x] Environment configuration (.env setup)

### 1.2 Veritabanı Konfigürasyonu ✅
- [x] Drizzle ORM Node.js konfigürasyonu
- [x] SQLite database setup
- [x] Mevcut schema'ların taşınması
- [x] Migration dosyalarının düzenlenmesi

### 1.3 Gerekli Paketler ✅
```json
{
  "dependencies": {
    "express": "^5.1.0",
    "drizzle-orm": "^0.44.7",
    "drizzle-kit": "^0.31.6",
    "better-sqlite3": "^12.4.1",
    "cors": "^2.8.5",
    "helmet": "^8.1.0",
    "morgan": "^1.10.1",
    "dotenv": "^17.2.3",
    "zod": "^4.1.12",
    "express-rate-limit": "^8.1.0"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "@types/node": "^24.9.1",
    "@types/express": "^5.0.5",
    "@types/cors": "^2.8.19",
    "@types/morgan": "^1.9.10",
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.2"
  }
}
```

### ✅ Implementation Detayları

**Proje Yapısı:**
```
pawpa-backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Veritabanı konfigürasyonu
│   ├── middleware/
│   │   ├── cors.ts              # CORS middleware
│   │   ├── errorHandler.ts      # Hata yönetimi
│   │   ├── rateLimiter.ts       # Rate limiting
│   │   ├── requestLogger.ts     # Request logging
│   │   └── validation.ts        # Zod validation
│   ├── models/
│   │   └── schema.ts            # Drizzle schema'ları
│   ├── types/
│   │   └── api.ts               # API response & request tipleri
│   ├── utils/
│   │   ├── response.ts          # Response helper fonksiyonları
│   │   └── id.ts                # ID generation utilities
│   ├── services/                # Business logic layer
│   │   ├── petService.ts        # Pet işlemleri
│   │   ├── healthRecordService.ts # Sağlık kayıtları işlemleri
│   │   ├── eventService.ts      # Etkinlik işlemleri
│   │   └── feedingScheduleService.ts # Beslenme programı işlemleri
│   ├── controllers/             # API route handlers
│   │   ├── petController.ts     # Pet endpoint'leri
│   │   ├── healthRecordController.ts # Sağlık kayıtları endpoint'leri
│   │   ├── eventController.ts   # Etkinlik endpoint'leri
│   │   └── feedingScheduleController.ts # Beslenme programı endpoint'leri
│   ├── routes/                  # Route definitions
│   │   ├── index.ts             # Ana router
│   │   ├── petRoutes.ts         # Pet routes
│   │   ├── healthRecordRoutes.ts # Health record routes
│   │   ├── eventRoutes.ts       # Event routes
│   │   └── feedingScheduleRoutes.ts # Feeding schedule routes
│   ├── app.ts                   # Express app konfigürasyonu
│   └── index.ts                 # Server entry point
├── migrations/                  # Database migration'ları
├── data/                       # SQLite database dosyası
└── dist/                       # Build output
```

**Kurulan Script'ler:**
- `npm run dev` - Development server
- `npm run build` - TypeScript build
- `npm run start` - Production server
- `npm run db:generate` - Migration oluşturma
- `npm run db:migrate` - Migration uygulama
- `npm run db:push` - Schema push
- `npm run db:studio` - Drizzle Studio

**Aktif Endpoint'ler:**
- `GET /health` - Health check ✅ Working
- `GET /api` - API bilgisi ✅ Working

**Database Schema:**
- ✅ pets table
- ✅ health_records table
- ✅ events table
- ✅ feeding_schedules table

**Backend Durumu:**
- ✅ Server çalışır durumda (port 3000)
- ✅ TypeScript hataları çözüldü
- ✅ Tüm 25 API endpoint hazır
- ✅ Health check endpoint'leri çalışıyor

---

## Phase 2: API Implementation (3-4 gün) ✅ COMPLETED

### 2.1 Core API Structure ✅
- [x] Base response format oluşturma
- [x] Error handling middleware (geliştirildi)
- [x] Request validation middleware (Zod)
- [x] API documentation structure (endpoint listesi)

### 2.2 Pet Management API ✅
- [x] `GET /api/pets` - Tüm petleri listele (pagination, filtering)
- [x] `GET /api/pets/:id` - Tek pet detayı
- [x] `POST /api/pets` - Yeni pet ekle
- [x] `PUT /api/pets/:id` - Pet güncelle
- [x] `DELETE /api/pets/:id` - Pet sil
- [x] `POST /api/pets/:id/photo` - Pet fotoğrafı yükle

### 2.3 Health Records API ✅
- [x] `GET /api/pets/:petId/health-records` - Pet sağlık kayıtları
- [x] `POST /api/health-records` - Yeni sağlık kaydı
- [x] `PUT /api/health-records/:id` - Sağlık kaydı güncelle
- [x] `DELETE /api/health-records/:id` - Sağlık kaydı sil
- [x] `GET /api/health-records/upcoming` - Yaklaşan aşılar

### 2.4 Events API ✅
- [x] `GET /api/pets/:petId/events` - Pet etkinlikleri
- [x] `POST /api/events` - Yeni etkinlik
- [x] `PUT /api/events/:id` - Etkinlik güncelle
- [x] `DELETE /api/events/:id` - Etkinlik sil
- [x] `GET /api/events/calendar/:date` - Takvim görüntüleme
- [x] `GET /api/events/upcoming` - Yaklaşan etkinlikler
- [x] `GET /api/events/today` - Bugünkü etkinlikler

### 2.5 Feeding Schedules API ✅
- [x] `GET /api/pets/:petId/feeding-schedules` - Beslenme programları
- [x] `POST /api/feeding-schedules` - Yeni beslenme programı
- [x] `PUT /api/feeding-schedules/:id` - Program güncelle
- [x] `DELETE /api/feeding-schedules/:id` - Program sil
- [x] `GET /api/feeding-schedules/active` - Aktif programlar
- [x] `GET /api/feeding-schedules/today` - Bugünkü programlar
- [x] `GET /api/feeding-schedules/next` - Sonraki beslenme zamanı

### 2.6 Validation & Security ✅
- [x] Input validation için Zod schemaları
- [x] Rate limiting (Phase 1'den)
- [x] Request/response logging (Phase 1'den)
- [x] API error response format

### 2.7 ✅ Ek Özellikler
- **Total Endpoints**: 25 API endpoint tamamlandı
- **Pagination**: Tüm list endpoint'lerinde pagination desteği
- **Filtering**: Pet türü, cinsiyet, tarih gibi filtreleme seçenekleri
- **Type Safety**: Full TypeScript desteği
- **Error Handling**: Merkezi error management system

### ✅ Çözülen Sorunlar
- **TypeScript Hataları**: ✅ `exactOptionalPropertyTypes` ve date conversion type hataları çözüldü
- **Backend Status**: ✅ API implementation tamamlandı ve başarıyla çalışıyor

### 🔄 Test Edilmesi Gerekenler
- API endpoint'lerinin fonksiyonel testleri
- Database CRUD operasyonları
- Error handling senaryoları
- Response format doğruluğu

### 📁 Eklenen Dosyalar
- `src/types/api.ts` - API response & request tipleri
- `src/utils/response.ts` - Response helper fonksiyonları
- `src/utils/id.ts` - ID generation utilities
- `src/services/*` - 4 service katmanı (pet, health, event, feeding)
- `src/controllers/*` - 4 controller katmanı
- `src/routes/*` - 5 route dosyası (index + 4 modül)
- `docs/phase-2-api-implementation-summary.md` - Detaylı completion raporu

---

## Phase 3: Mobile App Refactoring (2-3 gün) ✅ COMPLETED

### 3.1 Bağımlılık Yönetimi ✅
- [x] `axios` paketi eklendi
- [x] `@tanstack/react-query` konfigürasyonu güncellendi
- [x] `@react-native-community/netinfo` eklendi (network detection için)

### 3.2 HTTP Client Setup ✅
- [x] Axios instance konfigürasyonu (`lib/api/client.ts`)
- [x] Base URL ve header'lar (`lib/config/env.ts`)
- [x] Request/response interceptor'lar
- [x] Error handling wrapper ve ApiError class

### 3.3 Service Layer Refactoring ✅
- [x] `PetService` - API calls'a dönüştürüldü
- [x] `HealthRecordService` - API calls'a dönüştürüldü
- [x] `EventService` - API calls'a dönüştürüldü
- [x] `FeedingScheduleService` - API calls'a dönüştürüldü

### 3.4 State Management Updates ✅
- [x] TanStack Query konfigürasyonu (network-aware retry logic)
- [x] React Query hooks oluşturuldu (`lib/hooks/usePets.ts`)
- [x] Loading ve error handling component'leri
- [x] Cache invalidation stratejileri
- [x] Network status monitoring
- [x] API Error Boundary

### 3.5 Component Layer Updates ✅
- [x] NetworkStatus component (çevrimdışı mod)
- [x] ApiErrorBoundary component (global error handling)
- [x] Provider yapısı güncellendi
- [x] Database provider kaldırıldı

### ✅ Implementation Detayları

**Yeni Dosyalar:**
- `lib/config/env.ts` - Environment configuration ve API endpoint'leri
- `lib/api/client.ts` - Axios HTTP client ve API wrapper fonksiyonları
- `lib/hooks/usePets.ts` - React Query hooks (diğerleri için de benzerleri oluşturulabilir)
- `lib/components/NetworkStatus.tsx` - Network connectivity monitoring
- `lib/components/ApiErrorBoundary.tsx` - Global error handling

**Güncellenen Dosyalar:**
- `app/_layout.tsx` - Provider yapısı ve error handling
- `lib/services/*.ts` - Tüm servisler API çağrılarına dönüştürüldü
- TanStack Query konfigürasyonu - Network-aware ve mobile-optimized

**Özellikler:**
- ✅ Network connectivity detection
- ✅ Intelligent retry logic (network error'larında az retry, 404'te yok)
- ✅ Error boundary for graceful error handling
- ✅ Offline mode UI feedback
- ✅ Proper cache invalidation
- ✅ Request/response logging (development mode)
- ✅ Centralized error handling

---

## Phase 4: Integration & Testing (2-3 gün)

### 4.1 Backend Testing
- [ ] Unit tests for controllers
- [ ] Integration tests for API endpoints
- [ ] Database operation tests
- [ ] Error scenario tests

### 4.2 End-to-End Testing
- [ ] Mobile app + backend integration
- [ ] CRUD operations test senaryoları
- [ ] Network error handling
- [ ] Concurrent request handling

### 4.3 Performance Optimization
- [ ] Database query optimization
- [ ] Response time measurements
- [ ] Memory usage monitoring
- [ ] API rate limiting effectiveness

### 4.4 Documentation
- [ ] API endpoint documentation
- [ ] Mobile app integration guide
- [ ] Deployment instructions
- [ ] Troubleshooting guide

---

## Phase 5: Deployment & Monitoring (1 gün)

### 5.1 Backend Deployment
- [ ] Production environment setup
- [ ] Database backup strategy
- [ ] Environment variable management
- [ ] SSL certificate setup

### 5.2 Monitoring & Logging
- [ ] Application monitoring setup
- [ ] Error tracking (Sentry benzeri)
- [ ] Performance metrics
- [ ] Database monitoring

---

## Technical Details

### Backend Proje Yapısı
```
pawpa-backend/
├── src/
│   ├── controllers/     # API route handlers
│   ├── routes/         # Route definitions
│   ├── services/       # Business logic
│   ├── models/         # Drizzle schema'ları
│   ├── middleware/     # Custom middleware'ler
│   ├── utils/          # Helper fonksiyonlar
│   └── config/         # Konfigürasyon dosyaları
├── migrations/         # Drizzle migrasyonları
├── tests/             # Test dosyaları
└── docs/              # API dokümantasyonu
```

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
```

### Environment Variables
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=./data/pawpa.db
CORS_ORIGIN=http://localhost:8081
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Risk Analysis & Mitigation

### Potansiyel Riskler
1. **Veri Kaybı**: Migration sırasında veri kaybı riski
2. **Performance**: API çağrılarının yerel DB'den daha yavaş olması
3. **Offline Mode**: İnternet bağlantısı sorunları
4. **Security**: yeni güvenlik açıkları
5. **Complexity**: Artan sistem karmaşıklığı

### Mitigation Stratejileri
1. **Data Backup**: Migration öncesi tam yedekleme
2. **Performance Caching**: React Query ile etkin caching
3. **Offline Queue**: Basit senkronizasyon mekanizması
4. **Security Best Practices**: HTTPS, validation, rate limiting
5. **Incremental Migration**: Adım adım geçiş yapma

---

## Success Criteria

### Functional Requirements
- [ ] Tüm mevcut CRUD işlemlerinin çalışması
- [ ] Veri tutarlılığının sağlanması
- [ ] Mobil uygulama performansının korunması
- [ ] Error handling'in düzgün çalışması

### Non-Functional Requirements
- [ ] API response time < 500ms
- [ ] 99% uptime hedefi
- [ ] Zero data loss migration
- [ ] Comprehensive test coverage > 80%

---

## Timeline Estimate

- **Phase 1**: ✅ 1 gün (28.10.2025'te tamamlandı)
- **Phase 2**: ✅ 1 gün (28.10.2025'te tamamlandı)
- **Phase 3**: ✅ 1 gün (28.10.2025'te tamamlandı)
- **Phase 4**: ⏳ 2-3 gün
- **Phase 5**: ⏳ 1 gün

**Toplam Tahmini Süre**: 7-11 gün
**Kalan Tahmini Süre**: 3-4 gün

---

## Next Steps

1. **✅ Onay**: Bu plan reviewed ve onaylandı
2. **✅ Preparation**: Gerekli araçlar ve environment hazırlandı
3. **✅ Implementation**: Phase 1 tamamlandı (28.10.2025)
4. **🔄 Phase 2**: API Implementation başlatılacak
   - Pet Management API endpoint'leri
   - Health Records API endpoint'leri
   - Events API endpoint'leri
   - Feeding Schedules API endpoint'leri
5. **⏳ Testing**: Her phase sonunda testing ve validation
6. **⏳ Deployment**: Production'a geçiş

### Güncel Durum (28.10.2025)
- **Backend Foundation**: ✅ Tamamlandı
- **Database Setup**: ✅ Tamamlandı
- **Basic Middleware**: ✅ Tamamlandı
- **API Implementation**: ✅ Tamamlandı (25 endpoint)
- **TypeScript Hataları**: ✅ Çözüldü
- **Backend Server**: ✅ Çalışır durumda (localhost:3000)
- **Mobile App Refactoring**: ✅ Tamamlandı (Phase 3)
- **Sıradaki Adım**: Phase 4 - Integration & Testing

### Phase 2 Özeti
- **Tamamlanan Endpoint'ler**: 25 API endpoint
- **Eklenen Özellikler**: Pagination, filtering, validation, error handling
- **Mimari**: Layer architecture (Controller → Service → Database)
- **Durum**: ✅ Tamamlandı ve çalışır durumda
- **Backend Server**: localhost:3000 adresinde çalışıyor
- **Detaylı Rapor**: [Phase 2 Completion Summary](./phase-2-api-implementation-summary.md)

### Phase 3 Özeti
- **Mobile App API Integration**: ✅ Tamamlandı
- **HTTP Client**: ✅ Axios ile modern API client
- **Service Layer**: ✅ Tüm servisler API'ye taşındı
- **State Management**: ✅ TanStack Query optimizasyonu
- **Error Handling**: ✅ Global error handling ve network monitoring
- **Component'ler**: ✅ NetworkStatus ve ApiErrorBoundary
- **Özellikler**: ✅ Network-aware caching, offline support UI

---

*Bu doküman migration sürecince güncellenecektir.*