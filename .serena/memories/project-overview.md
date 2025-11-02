# PawPa - Proje Genel Bakış

## Proje Amacı
PawPa, evcil hayvan sahipleri için kapsamlı bir bakım takip uygulamasıdır. Kullanıcılar evcil hayvanlarının sağlık kayıtlarını, aşı takvimlerini, besleme programlarını ve etkinliklerini tek bir yerden yönetebilirler.

## Temel Özellikler
- **Evcil Hayvan Yönetimi**: Profiller, sağlık kayıtları, etkinlikler
- **Sağlık Takibi**: Aşılar, randevular, ilaçlar
- **Takvim & Etkinlikler**: Hatırlatmalar ve zamanlama
- **Besleme Programları**: Otomatik hatırlatmalar
- **Çok Dil Desteği**: Türkçe ve İngilizce (40+ dil altyapısı hazır)
- **Dinamik Anasayfa**: Gerçek zamanlı veri senkronizasyonu
- **Tema Sistemi**: Rainbow pastel renkler + karanlık mod
- **Gelişmiş Performans**: Akıllı önbellekleme ve arka plan senkronizasyonu

## Hedef Platform
- **Mobile-First**: React Native ile iOS ve Android
- **Web Desteği**: Expo web çıktısı
- **Offline Mode**: Ağ kesintilerinde çalışma desteği

## Mimari Yaklaşım
- **API-First**: Node.js/Express backend ile REST API
- **State Management**: Zustand (client state) + TanStack Query (server state)
- **File-based Routing**: Expo Router
- **Component-Driven**: Yeniden kullanılabilir UI bileşenleri
- **TypeScript-First**: Tip güvenliği her yerde
