# ProtectedRoute Bileşeni için Multiple Modal Açma Sorunu Çözümü

## Problem
Kullanıcı "Subscription" sayfasına gidip Android geri tuşu ile döndüğünde, tüm sekmelerdeki `ProtectedRoute` bileşenleri aynı anda tetiklenerek üst üste birden fazla `SubscriptionModal` açıyor.

## Kök Sebep
Tab navigasyonunda sekmeler arka planda "mounted" durumda kalır. Abonelik durumu değiştiğinde veya yüklendiğinde (`useEffect` tetiklendiğinde), sadece aktif sekme değil, arka plandaki tüm sekmelerdeki `ProtectedRoute` bileşenleri de modal açma mantığını çalıştırıyor.

## Çözüm Planı
**ProtectedRoute bileşenini sadece odaklanmış (focused) sekme için modal açacak şekilde güncelleyeceğiz:**

1. **`useIsFocused` hook'unu ekle:** `@react-navigation/native` paketinden `useIsFocused` hook'unu import ederek mevcut sayfanın odaklanıp odaklanmadığını kontrol edeceğiz.

2. **Modal açma mantığını `isFocused` koşulu ile sınırla:** `useEffect` içindeki `setShowModal(true)` çağrısını sadece `isFocused` durumu `true` olduğunda çalışacak şekilde güncelleyeceğiz.

3. **`useFocusEffect` ile uyumluluğu koru:** Zaten mevcut olan `useFocusEffect` hook'u, sekme odaklandığında abonelik durumunu yenilemek için kullanılacak. Bu, kullanıcı Subscription sayfasından geri döndüğünde abonelik durumunu kontrol edecek.

## Beklenen Sonuç
- Sadece aktif sekmedeki `ProtectedRoute` modal açacak
- Arka plandaki sekmelerin `ProtectedRoute` bileşenleri modal açmayacak
- Kullanıcı Subscription sayfasına gidip Android geri tuşu ile döndüğünde tek bir modal görecek

## Test Senaryosu
1. Abonelik olmayan bir kullanıcıyla uygulamayı aç
2. Herhangi bir sekmede modal açıldığını doğrula
3. Subscription sayfasına git
4. Android geri tuşu ile geri dön
5. Sadece aktif sekmede tek bir modal açıldığını doğrula