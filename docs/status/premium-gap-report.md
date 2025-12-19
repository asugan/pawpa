# Petopia Premium (4.99$) Gap Raporu (Mobile + Backend)

Bu doküman, mevcut altyapıyı çöpe atmadan ve AI eklemeden, 1–2 sprintte “4.99$’ı haklı çıkaracak” özellikler için **mevcut durum** ve **eksikleri** özetler.

## Kapsam

- Mobile repo: `petopia-mobile`
- Backend repo: `petopia-backend`
- Analiz odakları:
  - Smart reminders (AI değil)
  - Health timeline + severity/overdue
  - Budget alerts + analytics
  - Export & Vet mode
  - Emergency mode
  - Family/partner access

## Mevcut altyapı özeti (kısa)

- Bildirim altyapısı (mobile, local notifications) var: `lib/services/notificationService.ts`
- Event/Health/Feeding/Expense/Budget için API servis + hook pattern’leri var: `lib/services/*`, `lib/hooks/*`
- Backend’de event/health/feeding/expense/budget/subscription rotaları mevcut: `../petopia-backend/src/routes/*`
- Export CSV backend’de var; PDF route’u var ama 501 (NOT_IMPLEMENTED): `../petopia-backend/src/controllers/expenseController.ts`
- Family/partner sharing için gerçek bir izin/paylaşım modeli yok (owner `userId` bazlı).

---

## 1) Smart Reminder Logic (AI değil)

### Şu an var

- Event bazlı reminder schedule/cancel altyapısı:
  - `lib/services/notificationService.ts` (`scheduleEventReminder`, `scheduleMultipleReminders`, `cancelEventNotifications`)
- Event form’da sadece `reminder: boolean` toggle’ı:
  - `components/forms/EventForm.tsx`
- Backend event modeli reminder’ı sadece boolean tutuyor:
  - `../petopia-backend/src/models/mongoose/event.ts` (`reminder: boolean`)

### Eksik (ürünleşen değer)

- Event create/update akışına reminder scheduling bağlanmamış:
  - `lib/hooks/useEvents.ts` mutasyonları sadece API + cache invalidation yapıyor; `notificationService` entegrasyonu yok.
- “Zincirli reminder” kural seti (3 gün kala / günü / sonrası) + “quiet hours” + “snooze/tekrar” mantığı yok.
- “Dozu atlandı (missed dose)” üretmek için check-in/log modeli yok:
  - Feeding schedule var ama “tamamlandı / atlandı” gibi event-level completion kaydı yok.
- “Aşı overdue” mantığı backend’de yok:
  - Backend’de mevcut `upcoming vaccinations` sadece `nextDueDate >= now` filtreliyor (overdue listesi ayrı bir sorgu gerektiriyor).

### 1–2 sprintte en düşük eforla kapanan versiyon (öneri)

- Mobile tarafında (AI yok) “kurallı” reminder paketini ürünleştir:
  - Event create/update/delete mutasyonlarına schedule/cancel bağla.
  - Reminder zinciri: `[3 gün, 1 gün, 1 saat, zamanı]` gibi preset’ler.
  - Quiet hours + tekrar: ör. 22:00–08:00 arası bildirim gönderme, sabah tekrar.
- Missed logic için minimum viable:
  - “Tamamlandı” butonu + belirli bir deadline sonrası “tamamlanmadı” ise hatırlatma.
  - Multi-device isteniyorsa backend’de yeni “completion log” koleksiyonu gerekir.

---

## 2) Health Timeline + Severity (green/yellow/red)

### Şu an var

- Health record CRUD + list ekranı: `app/(tabs)/care.tsx`
- Backend’de health record list + upcoming vaccinations endpoint’i var:
  - `../petopia-backend/src/routes/healthRecordRoutes.ts`
  - `../petopia-backend/src/services/healthRecordService.ts`
- Home’da health overview widget var (listelemeye yakın): `components/HealthOverview.tsx`

### Eksik

- Timeline view (tek akışta health records + events) yok.
- Severity / overdue renk kodlaması yok:
  - Yeşil: tamam/ok
  - Sarı: yaklaşan
  - Kırmızı: gecikmiş
- “Last vet visit: X months ago” ve “This pet is overdue for…” listesi yok:
  - Bu; ya client-side hesap (tüm kayıtlar çekilip türetilir) ya da backend summary endpoint’i ile çözülür.

### 1–2 sprintte önerilen yaklaşım

- İlk iterasyon: client-side hesap + UI (backend değiştirmeden).
- İkinci iterasyon: backend’de “health summary” endpoint’i (performans ve basitlik için).

---

## 3) Budget → Alert sistemi (+ analytics)

### Şu an var

- Backend budget status + alert hesabı var (aylık harcama, threshold):
  - `../petopia-backend/src/services/userBudgetService.ts`
- Mobile budget UI ve progress/banner var:
  - `components/UserBudgetCard.tsx`
- Mobile’da budget alert polling hook’u var (yakın “real-time”):
  - `lib/hooks/useUserBudget.ts` (`useBudgetAlerts`, `refetchInterval`)

### Eksik

- Budget alert’lerinin “bildirim”e dönüşmesi yok (şu an sadece UI/polling).
- Kategori bazlı grafik, “geçen aya göre +%” gibi analytics ekranları yok.
- Polling (30s) pil/veri maliyeti yaratabilir; “premium değer” sağlasa bile ürün sağlığı açısından risk.

### 1–2 sprintte premium değer üreten minimum set

- Alert durumunu local notification ile bağla (polling’i azalt/akıllandır).
- “Bu ay vs geçen ay” + “kategori dağılımı” için:
  - Backend’de `monthly`/`yearly` endpoint’leri zaten var (`../petopia-backend/src/routes/expenseRoutes.ts`).
  - Mobile’da görselleştirme katmanı eksik.

---

## 4) Export & Vet Mode (çok güçlü)

### Şu an var

- Backend CSV export var:
  - `../petopia-backend/src/routes/expenseRoutes.ts` (`/export/csv`)
  - `../petopia-backend/src/controllers/expenseController.ts` (`exportExpensesCSV`)
- Backend PDF export + vet summary PDF var:
  - `../petopia-backend/src/controllers/expenseController.ts` (`exportExpensesPDF`, `exportVetSummaryPDF`)
  - `../petopia-backend/src/services/reportService.ts`
- Mobile’da CSV export için service/hook var:
  - `lib/services/expenseService.ts` (`exportExpensesCSV`)
  - `lib/hooks/useExpenses.ts` (`useExportExpensesCSV`)
- Mobile’da PDF export/share akışı var:
  - `lib/services/expenseService.ts` (`exportExpensesPDF`, `exportVetSummaryPDF`)
  - `lib/hooks/useExpenses.ts` (`useExportExpensesPDF`, `useExportVetSummaryPDF`)
  - `app/(tabs)/finance.tsx`

### Eksik

- Shareable link (read-only) yok:
  - Token/permission + yeni route gerekir (family access’e zemin).

### 1–2 sprint önerisi

- PDF export’u backend’de gerçekten implement et.
- Vet summary için ayrı bir PDF endpoint’i ekle ve mobile’dan Share ile gönder.

---

## 5) Emergency Mode

### Şu an var

- Offline/online göstergesi gibi parçalar var (network badge), ama Emergency ekranı yok:
  - `components/NetworkStatusBadge.tsx`

### Eksik

- Pet’e bağlı “Emergency profile” modeli (alerji/kronik, ilaç, vet iletişim, notlar).
- Offline erişim:
  - En azından AsyncStorage’a emergency profile cache.

### 1 sprintte yapılabilir minimum set

- Mobile-only: “Emergency” ekranı + offline cache + tek-tap arama/link.

---

## 6) Family / Partner access

### Şu an var

- Backend modelleri `userId` ownership üzerine kurulu:
  - Pet/Event/Health/Expense/Budget gibi koleksiyonlarda temel erişim “kullanıcı = owner”.
- “Family share” gerçek bir erişim modeli olarak mevcut değil (sadece subscription webhook alanı referansı görünüyor).

### Eksik

- Pet bazlı çoklu kullanıcı erişimi için tam bir model gerekir:
  - ACL/role (owner/editor/viewer)
  - Invite/accept akışı
  - Authorization middleware + tüm resource’larda filtre/izin kontrolü

### 1–2 sprint gerçekçi alternatif

- Full family access yerine “read-only shareable link (Vet mode)” hafif bir MVP olabilir.

---

## 2 sprintte en net “4.99$” paketi (boşluklar)

### Sprint 1 (en yüksek ROI)

- Smart reminders’ın ürünleşmesi:
  - Event create/update/delete → schedule/cancel entegrasyonu
  - Zincirli reminder preset’leri
  - Quiet hours
- Health timeline + overdue/severity (client-side hesap ile başlayarak)

### Sprint 2

- Export/Vet summary PDF (backend PDF implementasyonu + mobile share)
- Budget alerts → notification + basic analytics (month-over-month, kategori dağılımı)
- Emergency mode (mobile-only, offline cache)

---

## Notlar / riskler

- `app/(tabs)/settings.tsx` içindeki bildirim switch’i permission/status ile bağlı; sistem ayarından kapatma için inline uyarı var.
- Event modelinde reminder detayları (zaman, çoklu reminder) backend’de yok; MVP’de bu bilgi cihazda tutulabilir ama multi-device senkron gerektiriyorsa backend değişikliği şart.
- PDF export backend’de implement edildi; büyük veri setlerinde performans/format kontrolü gerekiyor.

---

## Faz 0 (0.5 sprint) – Hizalama ve Backlog Netleştirme

- Kapsam onayı: Smart Reminders, Health Timeline/Severity, Budget Alerts → Notification, Export/Vet PDF, Emergency mode (family sharing MVP’si yok).
- Teknik doğrulama:
  - Mobile: `lib/services/notificationService.ts`, `lib/hooks/useEvents.ts`, `components/forms/EventForm.tsx`, `app/(tabs)/settings.tsx` bildirim izinleri.
  - Backend: `../petopia-backend/src/controllers/expenseController.ts` (PDF 501), `../petopia-backend/src/services/userBudgetService.ts`, `../petopia-backend/src/routes/healthRecordRoutes.ts`, `../petopia-backend/src/models/mongoose/event.ts`.
  - Offline/Emergency: AsyncStorage cache kapsamı ve TTL.
- Planlama çıktısı: Jira/Linear epikleri, mobile/backend/story ayrımları, kabul kriterleri + metrik hedefleri (reminder deliverability, export success rate, budget notification latency).

## Faz 1 (Sprint 1) – Smart Reminders + Health Timeline/Severity

- Smart reminders (mobile-first):
  - `lib/hooks/useEvents.ts` create/update/delete mutasyonlarında `notificationService` ile schedule/cancel; preset zincir `[3gün,1gün,1saat,zamanı]`.
  - Quiet hours (22:00–08:00) ve event formda preset seçimi; backend şemasını değiştirmeden preset bilgisini cihazda tut.
- Missed/completion MVP:
  - Event detayında “Tamamlandı”; deadline geçerse client-side “missed” üret, reminder zincirini iptal et.
- Health timeline + severity:
  - Health records + events tek akışta; renk kodu (yeşil/sarı/kırmızı) ve “Last vet visit/overdue” hesapları client-side.
- Test/QA kapsamı: Notification izinleri, quiet hours uyumu, zincir sırası; timeline renk ve overdue doğruluğu; complete→missed geçişlerinde bildirimin iptali.

## Faz 2 (Sprint 2) – Export/Vet PDF + Budget Alerts → Notification + Emergency Mode

- Export/Vet PDF:
  - Backend: `../petopia-backend/src/controllers/expenseController.ts` içindeki `exportExpensesPDF`’i pdfkit ile gerçek PDF üretimine çevir; yeni “Vet summary PDF” endpoint’i ekle (aşılar, son ilaçlar, son 3 vet ziyareti, emergency contact). Route + controller + service için tek sorumluluklu dosya ekle, CSV davranışı bozulmasın.
  - Mobile: `lib/services/expenseService.ts` + `lib/hooks/useExpenses.ts` içine `exportExpensesPDF` servisini ekle; share akışını `Share` API ile `app/(tabs)/finance.tsx` üzerinden tetikle; loading/error + izin hatalarını kullanıcıya göster.
- Budget alerts → notification + analytics:
  - Backend: `../petopia-backend/src/services/userBudgetService.ts`’te alert’i tetikleyen noktaya “notification payload” hazırlığı ekle (şimdilik webhook yok, mobile local notification’la beslenecek); mevcut `monthly/yearly` endpoint’leri için kategori dağılımı ve MoM yüzdesini dönen alanları ekle.
  - Mobile: `lib/hooks/useUserBudget.ts` içindeki polling sonucunu `lib/services/notificationService.ts` ile local notification’a dönüştür; notification yalnızca eşik ilk aşıldığında tetiklenir; `components/UserBudgetCard.tsx` veya `components/BudgetInsights.tsx` ile “bu ay vs geçen ay” + kategori dağılımı görselleştir.
- Emergency mode:
  - Mobile-only ekran: `app/(tabs)/emergency.tsx` (veya modal) ile pet bazlı emergency profile formu (alerji/kronik durum, ilaç, vet iletişim, notlar); CTA olarak “Ara” ve “Konum aç”.
  - Offline cache: AsyncStorage ile emergency profile’ı yaz/oku; TTL ve invalidate stratejisini `lib/services` altında küçük bir helper ile tut; boş cache durumunda kullanıcıya inline uyarı göster.
- Test/QA kapsamı:
  - PDF üretimi/indirme/share; büyük veri setinde PDF performansı.
  - Budget alert tetiklemesi, notification alma/susturma, polling azaltma; MoM/kategori hesap doğruluğu.
  - Emergency offline okuma, cache invalidation ve CTA’ların çalışması (uçuş modu + online senaryolar).
