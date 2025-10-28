# Drizzle ORM & Expo SQLite Migration Guide

Bu doküman, PawPa projesindeki Drizzle ORM ve Expo SQLite entegrasyonunu modern standartlara göre güncellemek için gereken adımları detaylı olarak açıklar.

## 🔍 Mevcut Durum Analizi

### Sorunlar
- Drizzle konfigürasyonu Expo driver'ını kullanmıyor
- Babel plugin eksik
- Metro config eksik
- Migration sistemi kurulmamış
- Tablolar manuel oluşturulmaya çalışılıyor

### Hedef
- Modern Drizzle Expo entegrasyonu
- Otomatik migration yönetimi
- Live queries desteği
- Geliştirici deneyimi iyileştirmesi

---

## 📋 Phase 1: Konfigürasyon Dosyalarını Güncelleme

### 1.1 Drizzle Config Dosyasını Düzelt

**Dosya:** `drizzle.config.ts`

**Mevcut Durum:**
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './dev.db',
  },
});
```

**Güncellenmiş Hali:**
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo', // 🔥 Expo driver'ını ekle
});
```

**Değişiklik Nedeni:**
- Expo-SQLite özel driver desteği
- Migration dosyalarını doğru format üretmesi
- Bundle ile uyumlu SQL generation

### 1.2 Babel Config'ini Güncelle

**Dosya:** `babel.config.js`

**Mevcut Durum:**
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

**Güncellenmiş Hali:**
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [["inline-import", { "extensions": [".sql"] }]] // 🔥 SQL dosyalarını bundle'e ekle
  };
};
```

**Değişiklik Nedeni:**
- SQL migration dosyalarını JavaScript bundle'ine dahil etmek
- Runtime'da migration çalıştırmak için gerekli

### 1.3 Metro Config'ini Oluştur

**Dosya:** `metro.config.js` (yeni dosya)

**İçerik:**
```javascript
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('sql'); // 🔥 SQL dosyalarını tanı

module.exports = config;
```

**Değişiklik Nedeni:**
- Metro bundler'ın .sql dosyalarını tanıması
- Migration dosyalarının doğru şekilde yüklenmesi

---

## 📦 Phase 2: Gerekli Paketleri Yükleme

### 2.1 Babel Plugin Ekle

```bash
npm install babel-plugin-inline-import
# veya
yarn add babel-plugin-inline-import
# veya
pnpm add babel-plugin-inline-import
```

**Neden Gerekli:**
- SQL dosyalarını string olarak import etme
- Runtime migration desteği

### 2.2 Expo-SQLite Versiyonunu Kontrol Et

Mevcut kurulum kontrol et:
```bash
npm list expo-sqlite
```

Eğer kurulu değilse:
```bash
npx expo install expo-sqlite
```

---

## 🔧 Phase 3: Migration Sistemini Kurma

### 3.1 Migration Dosyalarını Oluştur

Drizzle schema'sından migration'ları oluştur:

```bash
npx drizzle-kit generate
```

**Beklenen Çıktı:**
```
📭 drizzle-kit: 3 migrations generated
📭 drizzle-kit: [1/3] 0001_initial.sql
📭 drizzle-kit: [2/3] 0002_health_records.sql
📭 drizzle-kit: [3/3] 0003_events.sql
```

### 3.2 Migration Dosyalarını Kontrol Et

**Oluşacak Dosyalar:**
- `drizzle/0001_initial.sql`
- `drizzle/0002_health_records.sql`
- `drizzle/0003_events.sql`
- `drizzle/migrations.ts` (otomatik oluşturulacak)

### 3.3 App Component'inde Migration Hook Kullan

**Dosya:** `app/_layout.tsx` veya `App.tsx`

**Eklenecek Kod:**
```typescript
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../drizzle/migrations';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  // Normal app content
  return (
    // ... mevcut app içeriği
  );
}
```

---

## 🔄 Phase 4: Servis Katmanını Güncelleme

### 4.1 Database Bağlantısını Kontrol Et

**Dosya:** `db/index.ts`

**Doğru Yapı:**
```typescript
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// ✅ Doğru bağlantı
const expo = openDatabaseSync('dev.db');
export const db = drizzle(expo, { schema });

export * from './schema';
```

### 4.2 Date Handling Düzeltmeleri

Drizzle Expo-SQLite ile tarihleri doğru handle etmek için:

**Event Service Düzeltmeleri:**
```typescript
// ❌ Yanlış: new Date() kullanımı
startTime: new Date(data.startTime)

// ✅ Doğru: Date veya number kabul et
startTime: data.startTime instanceof Date ? data.startTime : new Date(data.startTime)
```

---

## 🎯 Phase 5: Test ve Doğrulama

### 5.1 Migration Testi

Uygulamayı başlat ve migration'ların çalıştığını kontrol et:

```bash
npm start
# veya
expo start
```

**Beklenen Log Mesajları:**
```
✅ Migration completed successfully
📊 Database is ready
```

### 5.2 Tablo Varlığını Kontrol Et

**Test Script:**
```typescript
// lib/db-test.ts dosyasını çalıştır
import { runDatabaseTest } from './lib/db-test';
runDatabaseTest();
```

**Beklenen Çıktı:**
```
✅ Found 0 pets in database
✅ Found 0 health records in database
✅ Found 0 events in database
✅ Found 0 feeding schedules in database
🎉 All database tests passed successfully!
```

### 5.3 Live Query Testi

Opsiyonel: Live queries özelliğini test et:

```typescript
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

const { data } = useLiveQuery(db.select().from(pets));
```

---

## 📚 Phase 6: Geliştirici Deneyimi İyileştirmeleri

### 6.1 Drizzle Studio Entegrasyonu (Opsiyonel)

Geliştirme için Drizzle Studio ekle:

```bash
npm install -D @drizzle-team/studio-expo
```

### 6.2 Development Script'leri

**Package.json'a Ekle:**
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio",
    "db:reset": "npx expo-sqlite reset"
  }
}
```

### 6.3 Error Handling İyileştirmesi

Migration error handling'i güçlendir:

```typescript
const { success, error } = useMigrations(db, migrations);

if (error) {
  console.error('Migration failed:', error);
  // User-friendly error message
  return <ErrorComponent message="Veritabanı kurulamadı" />;
}
```

---

## 🎉 Phase 7: Son Kontroller ve Deployment

### 7.1 Prebuild Kontrolü

```bash
npx expo run:ios
# veya
npx expo run:android
```

### 7.2 Production Build Test

```bash
npx expo build:ios
# veya
npx expo build:android
```

### 7.3 Migration Backup Stratejisi

Production için migration backup planı:

1. Migration dosyalarını versiyon kontrol et
2. Database yedeği stratejisi planla
3. Rollback prosedürleri belirle

---

## 📖 Ek Kaynaklar

- [Drizzle Expo Documentation](https://orm.drizzle.team/docs/connect-expo-sqlite)
- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Drizzle Migration Guide](https://orm.drizzle.team/docs/migrations)

---

## ⚠️ Önemli Notlar

1. **Migration Sırası:** Migration dosyaları her zaman sıralı olarak çalışır
2. **Data Loss:** Production'da migration çalıştırırken mutlaka yedek al
3. **Testing:** Her migration değişikliğinde test et
4. **Version Control:** Migration dosyalarını mutlaka versiyon kontrol et

---

## 🐛 Troubleshooting

### Common Issues

**1. "no such table" Hatası:**
- Migration'ın çalışıp çalışmadığını kontrol et
- useMigrations hook'unun success durumunu bekle

**2. "Cannot read property of undefined" Hatası:**
- Database bağlantısını kontrol et
- Schema import'unu doğrula

**3. Migration Çalışmama:**
- Babel ve metro config'lerini kontrol et
- SQL dosyalarının doğru oluşturulduğunu doğrula

### Debug İpuçları

```typescript
// Debug için temporary logging
console.log('Migration status:', { success, error });
console.log('Database instance:', db);
```

---

Bu doküman, PawPa projesini modern Drizzle Expo-SQLite entegrasyonuna taşımak için eksiksiz bir rehber sunar. Her phase'in sonunda kontrol noktaları belirtilmiştir.