# Product Requirements Document: Onboarding Flow Improvements

## Problem & Goal
Pawpa React Native uygulamasının mevcut onboarding akışında tema uyumsuzlukları, tamamlanmamış özellikler ve teknik borç bulunuyor. Kritik sorunlar: hardcoded renkler merkezi tema değişikliklerinden etkilenmiyor, progress indicator yanlış ekran sayısı gösteriyor, ve authenticated kullanıcılar gereksiz login sayfasına yönlendiriliyor. Amaç: tutarlı, bakımı kolay ve kullanıcı dostu bir onboarding deneyimi yaratmak.

## Requirements
### Must-Have Features
1. **Tema Uyumluluğu Düzeltmeleri** - app/(onboarding)/*.tsx dosyalarında hardcoded COLORS objesini kaldırıp useTheme() hook'una geçiş
2. **Ekran Sayısı Düzeltmesi** - stores/onboardingStore.ts'de totalScreens değerini 4'ten 3'e düşürmek
3. **Auth State Kontrolü** - completed.tsx'de authenticated kullanıcıları tabs'e yönlendirme
4. **Skip Action Düzeltme** - step2.tsx'de skip butonunun skipOnboarding() action'ını kullanmasını sağlamak
5. **Store Temizliği** - kullanılmayan nextScreen(), previousScreen(), goToScreen(), setAnimating() action'larını kaldırmak

### Technical Requirements
- **Framework**: React Native 0.81.5 with Expo SDK ~54.0.20
- **State Management**: Zustand store düzenlemesi
- **Navigation**: Expo Router file-based routing
- **Theme System**: Merkezi theme system entegrasyonu
- **Authentication**: Better Auth state control
- **TypeScript**: Strict mode with proper type definitions

## Out of Scope
- 4. onboarding ekranının eklenmesi (mevcut 3 ekran olarak kalacak)
- Reanimated 3 animasyon entegrasyonu (planlanmış ama bu faz dahil değil)
- Accessibility geliştirmeleri
- Analytics tracking entegrasyonu
- Component refactoring (OnboardingLayout, ProgressIndicator gibi yeni component'ler)

## Additional Context
Mevcut implementasyon temelde sağlam ve kullanıma hazır, ancak teknik borç ve tutarsızlıklar giderilmeli. Öncelik sırası: Faz 1 - Kritik düzeltmeler (production öncesi), Faz 2 - Kod kalitesi geliştirmeleri (1-2 sprint). Testing checklist'i: tema değişikliklerinin yansıması, progress indicator doğruğı, auth routing doğruluğu, swipe navigation çalışması.

---

*Generated with Clavix Planning Mode*
*Generated: 2025-12-07T12:00:00Z*