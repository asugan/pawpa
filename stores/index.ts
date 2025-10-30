// ✅ Tüm store'ları tek yerden export etme
export { usePetUIStore } from './petStore';
export { useThemeStore } from './themeStore';
export { useLanguageStore } from './languageStore';

// Store türleri için type exports
export type { PetUIState, PetUIActions } from './petStore';
export type { ThemeStore } from './themeStore';
export type { LanguageStore, Language } from './languageStore';

// Re-export for backward compatibility (deprecated)
// Use usePetUIStore instead
export { usePetUIStore as usePetStore } from './petStore';