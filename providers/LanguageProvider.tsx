import { useEffect } from 'react';
import { useLanguageStore } from '../stores/languageStore';
import i18n from '../lib/i18n';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language, initializeLanguage } = useLanguageStore();

  useEffect(() => {
    // Initialize language on mount
    initializeLanguage();
  }, [initializeLanguage]);

  useEffect(() => {
    // Update i18n language when store language changes
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return <>{children}</>;
}