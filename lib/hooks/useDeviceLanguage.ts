import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Localization from 'expo-localization';
import { useLanguageStore, isLanguageSupported } from '@/stores/languageStore';

type SupportedLanguage = 'tr' | 'en';

export function useDeviceLanguage() {
  const { language, setLanguage, hasUserExplicitlySetLanguage } = useLanguageStore();
  const [deviceLanguage, setDeviceLanguage] = useState<SupportedLanguage>('en');
  const [isDeviceLanguageSupported, setIsDeviceLanguageSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get device language
    const getDeviceLanguage = (): SupportedLanguage => {
      try {
        // Try multiple methods to get the language
        const deviceLocales = Localization.getLocales();
        let deviceLocale = deviceLocales[0]?.languageCode || 'en';

        // Fallback for different platforms
        if (Platform.OS === 'ios') {
          // iOS specific logic if needed
          // On iOS, Localization.locale returns the preferred language set in Settings
          const preferredLanguages = Localization.getLocales();
          if (preferredLanguages.length > 0) {
            deviceLocale = preferredLanguages[0].languageCode || deviceLocale;
          }
        } else if (Platform.OS === 'android') {
          // Android specific logic if needed
          // On Android, Localization.locale returns the system language
        }

        // Extract language code (tr-TR -> tr, en-US -> en)
        const languageCode = deviceLocale.split('-')[0].toLowerCase();

        // Check if it's a supported language
        if (isLanguageSupported(languageCode)) {
          return languageCode as SupportedLanguage;
        }

        // Default to English
        return 'en';
      } catch (error) {
        console.warn('Error getting device language:', error);
        return 'en';
      }
    };

    const detectedLanguage = getDeviceLanguage();
    const isSupported = isLanguageSupported(detectedLanguage);

    setDeviceLanguage(detectedLanguage);
    setIsDeviceLanguageSupported(isSupported);
    setIsLoading(false);

    // Only auto-set language if:
    // 1. User hasn't explicitly set a language before
    // 2. Device language is supported
    // 3. Device language is different from current language
    const shouldAutoSet = !hasUserExplicitlySetLanguage && isSupported && detectedLanguage !== language;

    if (shouldAutoSet) {
      // Set language as auto-detected (not explicit)
      setLanguage(detectedLanguage, false);
    }
  }, [language, setLanguage, hasUserExplicitlySetLanguage]);

  // Function to manually set device language
  const applyDeviceLanguage = () => {
    if (isDeviceLanguageSupported && deviceLanguage !== language) {
      setLanguage(deviceLanguage, true); // Mark as explicit user choice
    }
  };

  // Function to reset to device language
  const resetToDeviceLanguage = () => {
    if (isDeviceLanguageSupported) {
      setLanguage(deviceLanguage, false); // Auto-detected, not explicit
    }
  };

  return {
    deviceLanguage,
    isDeviceLanguageSupported,
    shouldAutoDetect: !hasUserExplicitlySetLanguage,
    currentLanguage: language,
    isLoading,
    hasUserExplicitlySetLanguage,
    applyDeviceLanguage,
    resetToDeviceLanguage,
  };
}