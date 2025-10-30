import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../lib/i18n';

export type Language = 'en' | 'tr';

// Get device language or fallback to English
const getDeviceLanguage = (): Language => {
  // For now, default to English
  // In a production app with Expo managed workflow, we could use
  // Expo Localization module or ask user to select language on first launch
  return 'en';
};

export interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  initializeLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: getDeviceLanguage(),
      setLanguage: (language: Language) => {
        set({ language });
        i18n.changeLanguage(language);
      },
      toggleLanguage: () => {
        const currentLanguage = get().language;
        const newLanguage = currentLanguage === 'en' ? 'tr' : 'en';
        set({ language: newLanguage });
        i18n.changeLanguage(newLanguage);
      },
      initializeLanguage: () => {
        const currentLanguage = get().language;
        // Only change i18n language if it's different from store
        if (i18n.language !== currentLanguage) {
          i18n.changeLanguage(currentLanguage);
        }
      },
    }),
    {
      name: 'language-storage',
      onRehydrateStorage: () => (state) => {
        // Initialize language after rehydration
        if (state) {
          state.initializeLanguage();
        }
      },
    }
  )
);