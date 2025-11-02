# PawPa English Implementation Plan

## Overview
Converting PawPa mobile app from Turkish to English as the primary language while maintaining infrastructure for future Turkish support.

### Current State
- i18next is installed but not configured
- All UI text is hardcoded in Turkish
- Constants contain Turkish translations for all labels
- Database schema has Turkish comments

---

## Phase 1: Set Up i18n Infrastructure

### Tasks
1. **Create i18n configuration file** (`/lib/i18n.ts`)
   - Initialize i18next with English as default language
   - Set up language detection and fallback mechanisms
   - Configure React Native specific settings

2. **Set up translation files structure**
   - Create `/locales/en.json` with English translations
   - Create `/locales/tr.json` with Turkish translations (for future use)
   - Organize translations by screens/components

3. **Initialize i18n in the app**
   - Import and configure i18n in main app file
   - Test basic translation functionality

---

## Phase 2: Convert Core UI to English

### Tasks
1. **Main Screens Translation**
   - Home Screen (`/app/(tabs)/index.tsx`):
     - "Evcil Dostlarınızın Sağlık Asistanı" → "Your Pet Health Assistant"
     - "Toplam Pet" → "Total Pets"
     - "Sağlık Hatırlatıcı" → "Health Reminder"
     - "Hızlı İşlemler" → "Quick Actions"
     - "Henüz pet eklemediniz" → "You haven't added any pets yet"
     - All other Turkish text

   - Tab Navigation (`/app/(tabs)/_layout.tsx`):
     - "Ana Sayfa" → "Home"
     - "Evcil Dostlar" → "Pets"
     - "Sağlık" → "Health"
     - "Takvim" → "Calendar"
     - "Ayarlar" → "Settings"

   - Settings Screen (`/app/(tabs)/settings.tsx`):
     - "Görünüm" → "Appearance"
     - "Karanlık Mod" → "Dark Mode"
     - "Uygulama Ayarları" → "App Settings"
     - "Bildirimler" → "Notifications"
     - "Dil" → "Language"
     - All other settings items

   - Pets Screen (`/app/(tabs)/pets.tsx`):
     - "Evcil Dostlarım" → "My Pets"
     - "Henüz pet yok" → "No pets yet"
     - "+ butonuna basarak ilk evcil dostunuzu ekleyin" → "Press the + button to add your first pet"

   - Health Screen (`/app/(tabs)/health.tsx`):
     - "Sağlık Kayıtları" → "Health Records"
     - "Aşı Kaydı" → "Vaccination Record"
     - "Görüntüle" → "View"
     - All other health-related text

   - Calendar Screen (`/app/(tabs)/calendar.tsx`):
     - "Takvim" → "Calendar"
     - "Yakında gelecek" → "Coming Soon"
     - "Yaklaşan Etkinlikler" → "Upcoming Events"
     - All other calendar text

2. **Component Translation**
   - PetCard Component (`/components/PetCard.tsx`):
     - "Yaş bilinmiyor" → "Age unknown"
     - "ay" → "months"
     - "yıl" → "years"
     - "Düzenle" → "Edit"
     - "Sil" → "Delete"

   - QuickActionButtons Component (`/components/QuickActionButtons.tsx`):
     - "Yeni Pet Ekle" → "Add New Pet"
     - "Sağlık Kaydı" → "Health Record"
     - "Besleme Planı" → "Feeding Plan"

---

## Phase 3: Update Constants and Forms

### Tasks
1. **Constants File Translation** (`/constants/index.ts`)
   - PET_TYPE_LABELS:
     - "Köpek" → "Dog"
     - "Kedi" → "Cat"
     - "Kuş" → "Bird"
     - "Tavşan" → "Rabbit"
     - "Hamster" → "Hamster"
     - "Balık" → "Fish"
     - "Sürüngen" → "Reptile"
     - "Diğer" → "Other"

   - GENDER_LABELS:
     - "Erkek" → "Male"
     - "Dişi" → "Female"
     - "Diğer" → "Other"

   - HEALTH_RECORD_TYPE_LABELS:
     - "Aşı" → "Vaccination"
     - "Kontrol" → "Checkup"
     - "İlaç" → "Medication"
     - "Ameliyat" → "Surgery"
     - "Diş" → "Dental"
     - "Bakım" → "Grooming"
     - "Diğer" → "Other"

   - EVENT_TYPE_LABELS:
     - "Besleme" → "Feeding"
     - "Egzersiz" → "Exercise"
     - "Bakım" → "Grooming"
     - "Oyun" → "Play"
     - "Eğitim" → "Training"
     - "Veteriner" → "Vet Visit"
     - "Yürüyüş" → "Walk"
     - "Banyo" → "Bath"
     - "Diğer" → "Other"

   - DAY_LABELS:
     - Turkish day names → English day names

2. **Form Components Translation**
   - PetForm Component (`/components/forms/PetForm.tsx`):
     - "Pet Düzenle"/"Yeni Pet Ekle" → "Edit Pet"/"Add New Pet"
     - "Lütfen evcil dostunuzun bilgilerini giriniz" → "Please enter your pet's information"
     - "Pet Adı" → "Pet Name"
     - "Tür" → "Type"
     - "Cins" → "Breed"
     - "Cinsiyet" → "Gender"
     - "Doğum Tarihi" → "Birth Date"
     - "Kilo" → "Weight"
     - "İptal" → "Cancel"
     - "Güncelle"/"Ekle" → "Update"/"Add"
     - "Lütfen zorunlu alanları doldurunuz" → "Please fill required fields"
     - All placeholder texts and validation messages

---

## Phase 4: Add Language Switcher

### Tasks
1. **Create Language Context**
   - Create language context provider for global language management
   - Implement language switching functionality
   - Add language persistence to Zustand store

2. **Update Settings Screen**
   - Make language selection functional
   - Add English and Turkish options
   - Connect to language context
   - Store user's language preference

3. **Language Preference Storage**
   - Add language preference to app store
   - Implement persistence for language selection
   - Load saved language on app start

---

## Phase 5: Database and Documentation

### Tasks
1. **Database Schema Comments** (Optional, Low Priority)
   - Update Prisma schema comments from Turkish to English
   - Translate model descriptions and field explanations

2. **Testing and Validation**
   - Test all screens with English text
   - Verify language switching functionality
   - Ensure no Turkish text remains in UI
   - Test form validations in English

3. **Code Cleanup**
   - Remove any hardcoded Turkish text
   - Ensure all text uses i18n system
   - Optimize translation files structure

---

## Implementation Order
1. **High Priority**: Phases 1-2 (Core i18n setup and main screens)
2. **Medium Priority**: Phase 3 (Constants and forms)
3. **Medium Priority**: Phase 4 (Language switcher)
4. **Low Priority**: Phase 5 (Database comments and cleanup)

## Notes
- Keep Turkish translations for future implementation
- Test thoroughly after each phase
- Maintain consistent translation keys
- Consider cultural nuances in translations