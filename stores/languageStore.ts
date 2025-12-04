import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustandStorage';
import i18n from '../lib/i18n';

type SupportedLanguage = 'tr' | 'en' | 'ar';

interface LanguageState {
  language: SupportedLanguage;
  isRTL: boolean;
  hasUserExplicitlySetLanguage: boolean;
}

interface LanguageActions {
  setLanguage: (language: SupportedLanguage, isExplicit?: boolean) => void;
  toggleLanguage: () => void;
  initializeLanguage: () => void;
  resetLanguage: () => void;
  setExplicitLanguage: (language: SupportedLanguage) => void;
}

const LANGUAGE_STORAGE_KEY = 'pawpa-language';

export const useLanguageStore = create<LanguageState & LanguageActions>()(
  persist(
    (set, get) => ({
      // Initial state
      language: 'en',
      isRTL: false,
      hasUserExplicitlySetLanguage: false,

      // Actions
      setLanguage: (language, isExplicit = false) => {
        set({
          language,
          isRTL: language === 'ar', // For future Arabic support
          hasUserExplicitlySetLanguage: get().hasUserExplicitlySetLanguage || isExplicit,
        });
        i18n.changeLanguage(language);
      },

      toggleLanguage: () => {
        const currentLanguage = get().language;
        const newLanguage = currentLanguage === 'tr' ? 'en' : 'tr';
        set({
          language: newLanguage,
          isRTL: false,
          hasUserExplicitlySetLanguage: true, // Mark as explicit user choice
        });
        i18n.changeLanguage(newLanguage);
      },

      initializeLanguage: () => {
        const currentLanguage = get().language;
        // Only change i18n language if it's different from store
        if (i18n.language !== currentLanguage) {
          i18n.changeLanguage(currentLanguage);
        }
      },

      resetLanguage: () => {
        set({
          language: 'en',
          isRTL: false,
          hasUserExplicitlySetLanguage: false,
        });
        i18n.changeLanguage('en');
      },

      setExplicitLanguage: (language) => {
        set({
          language,
          isRTL: false,
          hasUserExplicitlySetLanguage: true, // Mark as explicit user choice
        });
        i18n.changeLanguage(language);
      },
    }),
    {
      name: LANGUAGE_STORAGE_KEY,
      storage: zustandStorage,
      // Only persist essential data
      partialize: (state) => ({
        language: state.language,
        hasUserExplicitlySetLanguage: state.hasUserExplicitlySetLanguage,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize language after rehydration
        if (state) {
          state.initializeLanguage();
        }
      },
    }
  )
);

// Helper functions for external use
export const getSupportedLanguages = (): SupportedLanguage[] => ['tr', 'en', 'ar'];

export const isLanguageSupported = (language: string): language is SupportedLanguage => {
  return ['tr', 'en', 'ar'].includes(language);
};

export const getLanguageDirection = (language: SupportedLanguage): 'ltr' | 'rtl' => {
  return language === 'ar' ? 'rtl' : 'ltr'; // For future Arabic support
};

export const getLanguageDisplayName = (language: SupportedLanguage): string => {
  const displayNames = {
    tr: 'Türkçe',
    en: 'English',
    ar: 'العربية',
  };
  return displayNames[language] || language;
};

export const getLanguageNativeName = (language: SupportedLanguage): string => {
  const nativeNames = {
    tr: 'Türkçe',
    en: 'English',
    ar: 'العربية',
  };
  return nativeNames[language] || language;
};

// Export types for external components
export type Language = SupportedLanguage;
export type { LanguageState, LanguageActions, SupportedLanguage };