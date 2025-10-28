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
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // For React Native, we'll use a simple approach
    // In a real app, you might want to use react-native-localize
    return 'en'; // Default to English for now
  }
  return 'en';
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language - English as primary
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