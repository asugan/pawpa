## Subscription Yapısı Entegrasyon Planı

### Mevcut Durum
Backend ve frontend subscription altyapısı tamamen hazır. Backend'de subscription servisleri, frontend'de useSubscription hook, store ve RevenueCat entegrasyonu mevcut.

### Hedef
Kullanıcı trial veya pro üyeliğe sahip değilse, korunan routelara erişmeye çalıştığında modal gösterip paywall'e yönlendirmek.

### Plan

#### 1. **Korunacak Routeların Belirlenmesi**
Pro üyelik gerektiren routelar:
- `/pets` - Evcil hayvan yönetimi
- `/health` - Sağlık kayıtları  
- `/calendar` - Takvim ve etkinlikler
- `/feeding` - Besleme programları
- `/expenses` - Gider takibi
- `/budgets` - Bütçe yönetimi

Ücretsiz kalacak routelar:
- `/` (Home) - Giriş ekranı
- `/(auth)/*` - Auth rotaları
- `/subscription` - Abonelik sayfası

#### 2. **ProtectedRoute Wrapper Component**
Yeni component: `components/subscription/ProtectedRoute.tsx`
- useSubscription hook ile subscription status kontrolü
- isProUser false ise modal göster
- Modal: "Premium Özellik" mesajı + Upgrade butonu
- Upgrade butonu => `/subscription` sayfasına yönlendirme

Kullanım:
```tsx
<ProtectedRoute>
  <ScreenContent />
</ProtectedRoute>
```

#### 3. **Subscription Modal Component**
Yeni component: `components/subscription/SubscriptionModal.tsx`
- Başlık: "Premium Özellik"
- Açıklama: Bu özellik sadece Pro üyeler için
- 2 buton: "Upgrade Now" (primary) ve "Maybe Later" (secondary)
- Upgrade Now => `router.push('/subscription')`
- Maybe Later => Modal'ı kapat

#### 4. **Route Protection Entegrasyonu**
Her korunan tab sayfasına ProtectedRoute wrapper eklenecek:
- `app/(tabs)/pets.tsx`
- `app/(tabs)/health.tsx`
- `app/(tabs)/calendar.tsx`
- `app/(tabs)/feeding.tsx`
- `app/(tabs)/expenses.tsx`
- `app/(tabs)/budgets.tsx`

#### 5. **Settings Sayfası Düzenlemesi**
Mevcut SubscriptionCard zaten settings'te kullanılıyor. Ekstra:
- Free kullanıcılar için upgrade butonu göster
- Trial kullanıcıları için trial süresi progress bar'ı

### Teknik Detaylar

**ProtectedRoute.tsx:**
- useSubscription hook'tan isProUser, isLoading değerlerini al
- isLoading true ise null render et (bekle)
- isProUser false ise modal göster
- isProUser true ise children'ı render et

**SubscriptionModal.tsx:**
- React Native Modal component kullan
- Görsellik: SubscriptionCard ile benzer stil
- Localization desteği (i18n)
- Theme desteği (dark/light mode)

**Entegrasyon Sırası:**
1. SubscriptionModal component'ı oluştur
2. ProtectedRoute wrapper component'ı oluştur
3. Korunan tab sayfalarına ProtectedRoute ekle
4. Test et: Free user ile modal'ın gösterilmesi
5. Test et: Pro user ile içeriğin gösterilmesi
6. Trial user ile trial süresi kontrolü

### Backend Gereksinimleri
Backend zaten tamamen hazır, ekstra bir değişiklik gerekmez.

### Frontend Değişiklikler
- Yeni: components/subscription/ProtectedRoute.tsx
- Yeni: components/subscription/SubscriptionModal.tsx
- Güncelle: app/(tabs)/* (7 dosya) - ProtectedRoute ekleme
- Mevcut dosyalar (useSubscription, subscriptionStore, etc.) zaten hazır