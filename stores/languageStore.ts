import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import i18n from '../lib/i18n';

export type Language = 'en' | 'tr';

// Get device language or fallback to English
const getDeviceLanguage = (): Language => {
  // For now, default to English
  // In a production app with Expo managed workflow, we could use
  // Expo Localization module or ask user to select language on first launch
  return 'en';
};

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  initializeLanguage: () => void;
  getSupportedLanguages: () => Language[];
  getCurrentLanguageCode: () => string;
  isLanguageSupported: (lang: string) => lang is Language;
}

export const useLanguageStore = create<LanguageStore>()(
  devtools(
    persist(
      (set, get) => ({
        language: getDeviceLanguage(),

        setLanguage: (language: Language) => {
          set({ language });
          i18n.changeLanguage(language);
          console.log(`🌐 Language set to: ${language}`);
        },

        toggleLanguage: () => {
          const currentLanguage = get().language;
          const newLanguage = currentLanguage === 'en' ? 'tr' : 'en';
          set({ language: newLanguage });
          i18n.changeLanguage(newLanguage);
          console.log(`🌐 Language toggled to: ${newLanguage}`);
        },

        initializeLanguage: () => {
          const currentLanguage = get().language;
          // Only change i18n language if it's different from store
          if (i18n.language !== currentLanguage) {
            i18n.changeLanguage(currentLanguage);
            console.log(`🌐 Language initialized to: ${currentLanguage}`);
          }
        },

        getSupportedLanguages: () => {
          return ['en', 'tr'] as Language[];
        },

        getCurrentLanguageCode: () => {
          return get().language;
        },

        isLanguageSupported: (lang: string): lang is Language => {
          return ['en', 'tr'].includes(lang);
        },
      }),
      {
        name: 'language-storage',
        version: 1,
        onRehydrateStorage: () => (state) => {
          // Initialize language after rehydration
          if (state) {
            state.initializeLanguage();
          }
        },
        partialize: (state) => ({
          language: state.language,
        }),
      }
    ),
    {
      name: 'language-store',
    }
  )
);