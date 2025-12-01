Subscription sayfasını sadeleştirerek RevenueCatUI.Paywall'ın otomatik gösterimini kaldırıp sadece Upgrade butonu ile yönlendirme yapacak şekilde düzenle:

1. **RevenueCatUI import'unu kaldır**: `import RevenueCatUI from 'react-native-purchases-ui';` 
2. **Paywall render'ını kaldır**: `<RevenueCatUI.Paywall>` component'ını ve onDismiss callback'lerini kaldır
3. **SubscriptionCard component'ını tut**: Zaten upgrade butonunu içeriyor ve `presentPaywall()` fonksiyonunu kullanıyor
4. **Features list ve diğer bölümleri koru**: Kullanıcıya Pro özelliklerini göstermeye devam et
5. **Restore Purchases ve Legal Links'i tut**: Mevcut fonksiyonellik devam etsin

Yeni yapıda kullanıcı subscription sayfasına geldiğinde:
- Abone değilse: SubscriptionCard'da Upgrade butonunu görür, tıklayınca paywall açılır
- Abone ise: SubscriptionCard'da Manage Subscription butonunu görür
- Pro özellikler listesi her zaman gösterilir
- Restore purchases ve legal links her zaman erişilebilir olur