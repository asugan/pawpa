# Petopia Premium Gap Raporu Uygulama Phaseleri

Bu plan, `docs/status/premium-gap-report.md` içindeki boşlukları 1–2 sprintte kapatmak için uygulanabilir fazları özetler. Her faz, paralel mobile + backend işleri ve net “done” ölçütleri içerir.

## Faz 0 – Hizalama ve Backlog Netleştirme (0.5 sprint)
- Premium paket kapsamını onayla: Smart Reminders, Health Timeline/Severity, Budget Alerts → Notification, Export/Vet PDF, Emergency mode (family sharing MVP’si dışarıda).
- Teknik keşif ve “mevcut durumu kanıtlama”:
  - Mobile: `lib/services/notificationService.ts`, `lib/hooks/useEvents.ts`, `components/forms/EventForm.tsx` içindeki reminder akışını incele; `app/(tabs)/settings.tsx` bildirim izinleri stub’ını nasıl gerçek permission check’e çevireceğini netleştir.
  - Backend: `../petopia-backend/src/controllers/expenseController.ts` (PDF 501 alanı), `../petopia-backend/src/services/userBudgetService.ts` (alert logic), `../petopia-backend/src/routes/healthRecordRoutes.ts` (health summary ihtiyacı), `../petopia-backend/src/models/mongoose/event.ts` (reminder alanları) üstünden yapılacak değişiklikleri sınırlı liste halinde çıkar.
  - Offline/Emergency: AsyncStorage cache stratejisini (hangi alanlar, TTL) kararlaştır.
- İş listesi: Jira/Linear epikleri aç, mobile/backend/story ayrımlarını çıkar, kabul kriterlerini yaz; “başarı metriği” hedeflerini (reminder deliverability %, export success, budget notification latency) ölçülebilir biçimde ekle.
- Çıktı: Onaylanmış user stories + acceptance kriterleri + ölçülebilir hedefler (örn. reminder deliverability, export success rate). Faz 1 başlamadan önce tüm paydaş onayı alınmış backlog.
- **Durum (tamamlandı):** Reminder/backlog analizi yapıldı; mobile izin/stub doğrulandı, reminder preset/quiet hours scope’u netlendi. Faz 1’e geçildi.

## Faz 1 – Smart Reminders + Health Timeline/Severity (Sprint 1)
- Event mutasyonlarına notification entegrasyonu:
  - Mobile: `lib/hooks/useEvents.ts` create/update/delete mutasyonlarına `notificationService` schedule/cancel bağla; preset zincir (`[3gün,1gün,1saat,zamanı]`) + quiet hours (22:00–08:00) uygulaması; reminder toggle’ı event formda preset seçimiyle hizala.
  - Backend: Şimdilik schema değişmeden ilerle (reminder preset bilgisi cihazda tutulacak); multi-device gereksinimi çıkarsa Faz 2’ye aktar.
- Minimal completion/missed mantığı: Event detayında “Tamamlandı” aksiyonu; deadline geçtiğinde client-side “missed” üret ve reminder zincirini durdur; local state yeterli (backend log yok).
- Health timeline UI: Health records + events tek akış; renk kodu (yeşil/sarı/kırmızı) client-side hesap; “Last vet visit” ve “overdue” metrikleri için mevcut listelerden türetme (backend değişikliği yapmadan).
- Test/QA: Notification izin durumu, quiet hours, zincirli reminder sırası; timeline renkleri ve overdue hesapları; missed/complete geçişlerinde notification iptali.
- Çıktı: Reminder’lar cihazda zincirli çalışır, timeline gecikmeli/gündemde olayları renklendirir; Faz 2 için backend değişikliği gerektirmeyen MVP tamam.
- **Durum (tamamlandı - mobile):**
  - Quiet hours + preset zincir eklendi (`constants/reminders.ts`, `lib/services/notificationService.ts`), local reminder/preset store (`stores/eventReminderStore.ts`) ve hook (`hooks/useReminderScheduler.ts`).
  - Event create/update/delete mutasyonlarında schedule/cancel entegrasyonu + completion/missed/cancel akışı (`lib/hooks/useEvents.ts`, `app/event/[id].tsx`).
  - Event formda preset seçimi ve izin isteği bağlandı (`components/forms/EventForm.tsx`, `hooks/useEventForm.ts`, `components/EventModal.tsx`).
  - Settings’te gerçek permission toggle (+ i18n) tamam (`app/(tabs)/settings.tsx`, `locales/*`).
  - Health timeline sekmesi eklendi, renk/kodlu severity + last vet visit hesapları client-side (`components/HealthTimeline.tsx`, `app/(tabs)/care.tsx`).
  - QA notu: Cihazda quiet hours, izin reddi ve missed→cancel flow test edilmeli; backend değişmedi.

## Faz 2 – Export/Vet PDF + Budget Alerts → Notification + Emergency Mode (Sprint 2)
- Export/Vet: Backend’de `exportExpensesPDF` implementasyonu ve yeni “Vet summary PDF” endpoint’i; mobile’da share flow entegrasyonu (`useExportExpensesPDF` hook + share sheet).
- Budget alerts: Polling’i event-driven/akıllı yap (minimum: polling + local notification publish); aylık/ yıllık endpoint’lerle “bu ay vs geçen ay” ve kategori dağılımı görseli.
- Emergency mode: Pet bazlı “Emergency profile” formu, AsyncStorage cache, offline okuma + tek-tap arama/link.
- Test/QA: PDF üretim hataları, share akışı; budget uyarı eşiği tetik/geri çekilme; offline emergency veri tutarlılığı.
- Çıktı: Kullanıcı PDF ve vet summary paylaşabilir, budget uyarıları gerçek bildirime döner, emergency ekran offline çalışır.

## Faz 3 – Shareable Link (Read-Only) Tabanı ve Sertleştirme
- Hafif paylaşım modeli: Pet için read-only token’lı link (backend route + permission guard), mobile’dan link üret ve paylaş.
- Güvenlik/operasyon: Token süresi, iptal edilebilir link, rate-limit; paylaşım geçmişi log’u.
- Performans/tekerrür: Budget polling optimizasyonu, notification teslimat metrikleri, crash/latency gözden geçirme.
- Çıktı: Hafif family/partner erişimi, stabil ve gözlemlenebilir premium özellik seti.

## Faz 4 – Stabilizasyon ve Yayın Hazırlığı
- Sertleştirme: QA regression, offline/low-perf cihaz testleri, metrik ve logging eklemeleri (success/fail).
- Dokümantasyon: Release notları, “premium value” metinleri, iç destek dokümanı (known issues, workarounds).
- Yayın: Feature flag kaldırma/gradual rollout planı, destek ekibine el kitabı.

## Ölçümler (takip)
- Reminder teslimat oranı ve quiet hours ihlalleri.
- Health timeline overdue doğruluğu (manuel doğrulama listesi).
- Budget alert notification tıklanma/engagement ve veri kullanım etkisi.
- Export/Vet PDF başarı oranı ve paylaşım kullanımı.
- Emergency offline erişim doğruluğu (kontrollü test senaryoları).
