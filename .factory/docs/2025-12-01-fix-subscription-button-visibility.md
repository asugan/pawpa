SubscriptionCard'daki Upgrade/Manage butonlarının subscription sayfasında gözükmeme sorununu düzelt:

**Sorun**: SubscriptionCard component'ında `showManageButton` prop'u butonların görünürlüğünü kontrol ediyor ancak subscription.tsx'de sadece `isSubscribed` true ise butonları gösteriyoruz ( `<SubscriptionCard showManageButton={isSubscribed} />` ). Bu, abone olmayan kullanıcıların upgrade butonunu görememesi anlamına geliyor.

**Settings sayfasındaki doğru kullanım**: `<SubscriptionCard />` (default showManageButton={true})

**Düzeltme**: subscription.tsx'de showManageButton prop'unu kaldırarak her zaman true olmasını sağla:
```tsx
<SubscriptionCard />
```

Bu sayede:
- Abone olmayan kullanıcılar: Upgrade butonunu görür ve tıklayınca paywall açılır
- Abone olan kullanıcılar: Manage Subscription butonunu görür ve Customer Center açılır
- SubscriptionCard zaten içindeki mantıkla (isPaidSubscription, isProUser vs.) doğru butonu gösterir