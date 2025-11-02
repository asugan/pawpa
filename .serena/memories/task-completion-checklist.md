# PawPa - Görev Tamamlama Kontrol Listesi

## Her Görev Tamamlandığında

### 1. Code Quality Checks ✓

#### Linting
```bash
npm run lint
# Tüm lint hataları düzeltilmeli
# Auto-fix kullanılabilir: npm run lint -- --fix
```

#### Type Checking
```bash
npx tsc --noEmit
# TypeScript hataları olmamalı
# Strict mode kurallarına uyulmalı
```

### 2. Code Review Checklist ✓

#### Genel Kontroller
- [ ] **Import organizasyonu**: Doğru sıralama (React → 3rd party → Internal → Types)
- [ ] **Naming conventions**: camelCase/PascalCase kurallarına uygun
- [ ] **Type safety**: 'any' kullanımı yok, her değişken tiplenmiş
- [ ] **Error handling**: Try-catch blokları uygun yerlerde
- [ ] **Comments**: Karmaşık logic için açıklayıcı yorumlar var

#### Component Checklist
- [ ] **Props typing**: Interface/Type tanımlı
- [ ] **Hooks order**: Doğru sıralama (React hooks → custom hooks)
- [ ] **Memoization**: Gerekli yerlerde React.memo/useMemo/useCallback
- [ ] **Styling**: StyleSheet.create kullanımı
- [ ] **i18n**: Tüm metinler çeviri sistemi üzerinden

#### State Management
- [ ] **TanStack Query**: Server state için kullanıldı mı?
- [ ] **Zustand**: Client state için uygun mu?
- [ ] **Cache invalidation**: Mutation'lar doğru query'leri invalidate ediyor mu?

### 3. Functionality Testing ✓

#### Manuel Test
- [ ] **Happy path**: Normal kullanım senaryosu çalışıyor
- [ ] **Error cases**: Hata durumları kontrol edildi
- [ ] **Edge cases**: Sınır durumları test edildi
- [ ] **Loading states**: Yükleme göstergeleri uygun
- [ ] **Empty states**: Boş veri durumu UI'ı doğru

#### Platform Testing
- [ ] **Android**: Emulator'da test edildi
- [ ] **iOS**: Simulator'da test edildi (mümkünse)
- [ ] **Web**: Web tarayıcısında çalışıyor (mümkünse)

#### Network Testing
- [ ] **Offline mode**: Ağ kesintisinde davranış
- [ ] **Slow network**: Yavaş bağlantıda performans
- [ ] **Error recovery**: API hata durumlarında toparlanma

### 4. Performance Checks ✓

#### Rendering
- [ ] **No console warnings**: React warnings/errors yok
- [ ] **Smooth animations**: Animasyonlar akıcı (60fps)
- [ ] **Fast initial load**: İlk yükleme hızlı

#### Memory
- [ ] **No memory leaks**: useEffect cleanup'ları var
- [ ] **Request cancellation**: Component unmount'ta request iptal
- [ ] **Image optimization**: Resimler optimize edilmiş

### 5. Accessibility ✓

- [ ] **Screen reader**: Önemli elementlerde accessibilityLabel
- [ ] **Touch targets**: Minimum 44x44 dokunma alanı
- [ ] **Color contrast**: Yeterli kontrast oranı
- [ ] **Keyboard navigation**: Web'de keyboard erişilebilirliği

### 6. Documentation ✓

#### Code Documentation
- [ ] **Complex logic**: JSDoc comments eklendi
- [ ] **New patterns**: Yeni pattern'ler dokümante edildi
- [ ] **API changes**: API değişiklikleri not edildi

#### User-facing Changes
- [ ] **CLAUDE.md**: Yeni özellikler eklendi (gerekirse)
- [ ] **README.md**: Kullanıcı dokümantasyonu güncellendi (gerekirse)

### 7. Security ✓

- [ ] **No sensitive data**: API keys, tokens hardcoded değil
- [ ] **Input validation**: Kullanıcı input'ları validate ediliyor
- [ ] **XSS prevention**: Dinamik content güvenli render ediliyor
- [ ] **API security**: HTTPS kullanımı, proper headers

### 8. Git Workflow ✓

#### Before Commit
```bash
# 1. Lint
npm run lint

# 2. Type check
npx tsc --noEmit

# 3. Stage changes
git add .

# 4. Review diff
git diff --staged
```

#### Commit Message
```bash
# Format: <type>: <description>
# Types: feat, fix, refactor, style, docs, test, chore

git commit -m "feat: add pet vaccination reminder feature"
git commit -m "fix: resolve network error handling in health records"
git commit -m "refactor: optimize pet list rendering performance"
```

#### After Commit
```bash
# Push to remote
git push origin <branch-name>

# Create PR (if applicable)
# Add description, screenshots, testing notes
```

### 9. Backend Integration ✓

#### API Changes
- [ ] **Endpoint tested**: Backend endpoint çalışıyor
- [ ] **Response handling**: Success/error responses doğru işleniyor
- [ ] **Type alignment**: Frontend/backend tip uyumu
- [ ] **Error messages**: Kullanıcı dostu hata mesajları

#### Data Synchronization
- [ ] **Cache strategy**: Uygun cache süresi seçildi
- [ ] **Optimistic updates**: Gerekli yerlerde optimistic update
- [ ] **Conflict resolution**: Veri çakışmaları yönetiliyor

### 10. Release Readiness (Major Features) ✓

#### Pre-release
- [ ] **Feature flag**: Yeni özellik için flag var mı? (gerekirse)
- [ ] **Analytics**: Tracking events eklendi mi? (gerekirse)
- [ ] **A/B testing**: Test konfigürasyonu hazır mı? (gerekirse)

#### Production Readiness
- [ ] **Error tracking**: Hata izleme kuruldu
- [ ] **Performance monitoring**: Performans metrikleri izleniyor
- [ ] **Rollback plan**: Geri alma planı var

## Özel Durum Kontrolleri

### New Component
- [ ] **Reusability**: Başka yerlerde kullanılabilir mi?
- [ ] **Props API**: Prop interface'i temiz ve genişletilebilir
- [ ] **Storybook**: Storybook entry var mı? (kuruluysa)
- [ ] **Export**: components/index.ts'den export edildi mi?

### New Hook
- [ ] **Dependencies**: useEffect dependencies doğru
- [ ] **Cleanup**: Cleanup function var mı?
- [ ] **Memoization**: Gereksiz re-run'ları önlüyor mu?
- [ ] **Export**: lib/hooks/index.ts'den export edildi mi?

### New API Endpoint
- [ ] **Service layer**: Service dosyasında tanımlı
- [ ] **TanStack Query hook**: Custom hook oluşturuldu
- [ ] **Error handling**: API error handling kuruldu
- [ ] **Type safety**: Request/response tipleri tanımlı
- [ ] **Cache key**: Unique ve descriptive query key

### Database Schema Change (Backend)
- [ ] **Migration**: Database migration çalıştırıldı
- [ ] **Seed data**: Test verisi güncellendi
- [ ] **Type sync**: Frontend type'ları güncellendi
- [ ] **Backward compatibility**: Eski veri ile uyumlu mu?

## Final Checklist ✓✓✓

```bash
# Son kontrol scripti
npm run lint && npx tsc --noEmit
# Başarılı ise:
# ✓ Kod quality standartlara uygun
# ✓ Commit ve push yapılabilir
```

**Not**: Bu checklist'in tamamı her küçük değişiklik için gerekli değildir. Değişikliğin boyutuna ve tipine göre uyarlayın.
