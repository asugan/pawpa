import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

// Import translation files
import en from '../locales/en.json';
import tr from '../locales/tr.json';

// Define resources
const resources = {
  en: {
    translation: en,
  },
  tr: {
    translation: tr,
  },
};

// Get device language or fallback to English
const getDeviceLanguage = () => {
  // For now, default to English
  // In a production app with Expo managed workflow, we could use
  // Expo Localization module or ask user to select language on first launch
  return 'en';
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(), // Use device language as default
    fallbackLng: 'en', // Fallback to English
    debug: __DEV__, // Enable debug in development

    interpolation: {
      escapeValue: false, // React Native already safe from XSS
    },

    react: {
      useSuspense: false, // Disable suspense mode for React Native
    },

    compatibilityJSON: 'v4', // Use v4 format for latest compatibility
  });

export default i18n;