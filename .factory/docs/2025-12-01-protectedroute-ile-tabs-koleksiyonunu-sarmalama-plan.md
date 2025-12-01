## ProtectedRoute ile (tabs) Koleksiyonunu Sarmalama Planı

**Amac:** Tüm ana uygulama sekme sayfalarını subscription tabanlı koruma ile sarmalamak.

### Kapsam

**Zaten Korunan Sekmeler:**
- `pets.tsx` ✓ (Evcil Hayvan Yönetimi)
- `expenses.tsx` ✓ (Harcama Takibi)  
- `health.tsx` ✓ (Sağlık Kayıtları)
- `budgets.tsx` ✓ (Bütçe Yönetimi)
- `feeding.tsx` ✓ (Besleme Programları)
- `calendar.tsx` ✓ (Takvim & Etkinlikler)

**Korunması Gereken Sekmeler:**
- `index.tsx` (Ana Sayfa/Dashboard) - Tüm veri özetlerini gösterdiği için korunmalı
- `settings.tsx` (Ayarlar) - Tema, dil, profil, çıkış gibi temel ayarlar olduğu için **açık bırakılmalı**

### Gerçekleştirilecek Değişiklikler

**1. `/app/(tabs)/index.tsx` - Ana Sayfa Koruma**
- Import ekle: `import { ProtectedRoute } from '@/components/subscription';`
- Mevcut return JSX'i `ProtectedRoute` component'i ile sarmala
- Feature name: `"Home Dashboard"` (veya çeviri dosyasına eklenebilir)

**2. `/app/(tabs)/settings.tsx` - Ayarlar Sekmesi**
- Bu sekme **açık kalacak** çünkü:
  - Kullanıcı profili yönetimi gerekiyor
  - Dil ve tema tercihleri değiştirilebilir olmalı
  - Çıkış işlemi erişilebilir olmalı

### Sonuç
- Kullanıcılar subscription olmadan hiçbir korunan tab'a erişemeyecek
- Subscription modal otomatik açılacak
- Settings sekmesi erişilebilir kalacak (kullanıcı temel işlemler yapabilir)