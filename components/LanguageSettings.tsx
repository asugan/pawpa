import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/lib/theme';
import { useDeviceLanguage } from '@/lib/hooks/useDeviceLanguage';
import { useLanguageStore, getLanguageNativeName, SupportedLanguage } from '@/stores/languageStore';
import { useTranslation } from 'react-i18next';

interface LanguageSettingsProps {
  showDeviceInfo?: boolean;
}

export function LanguageSettings({ showDeviceInfo = false }: LanguageSettingsProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const {
    deviceLanguage,
    isDeviceLanguageSupported,
    shouldAutoDetect,
    currentLanguage,
    isLoading,
    hasUserExplicitlySetLanguage,
    applyDeviceLanguage,
    resetToDeviceLanguage,
  } = useDeviceLanguage();

  const { setLanguage, toggleLanguage } = useLanguageStore();
  // Currently only support Turkish and English in UI (Arabic infrastructure ready)
  const supportedLanguages: SupportedLanguage[] = ['tr', 'en'];

  const handleLanguageSelect = (language: SupportedLanguage) => {
    setLanguage(language, true); // Mark as explicit user choice
  };

  const handleUseDeviceLanguage = () => {
    applyDeviceLanguage();
  };

  const handleResetToDeviceLanguage = () => {
    resetToDeviceLanguage();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Current Language Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          {t('settings.currentLanguage')}
        </Text>
        <Text style={[styles.currentLanguage, { color: theme.colors.onSurface }]}>
          {getLanguageNativeName(currentLanguage)}
        </Text>
        {hasUserExplicitlySetLanguage && (
          <Text style={[styles.explicitIndicator, { color: theme.colors.secondary }]}>
            {t('settings.languageExplicitlySet')}
          </Text>
        )}
      </View>

      {/* Device Language Info */}
      {showDeviceInfo && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            {t('settings.deviceLanguage')}
          </Text>
          <Text style={[styles.deviceLanguage, { color: theme.colors.onSurface }]}>
            {getLanguageNativeName(deviceLanguage)}
            {!isDeviceLanguageSupported && ` (${t('settings.notSupported')})`}
          </Text>
          {shouldAutoDetect && isDeviceLanguageSupported && (
            <Text style={[styles.autoDetectIndicator, { color: theme.colors.secondary }]}>
              {t('settings.willAutoDetect')}
            </Text>
          )}
        </View>
      )}

      {/* Language Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          {t('settings.selectLanguage')}
        </Text>
        {supportedLanguages.map((language) => (
          <TouchableOpacity
            key={language}
            style={[
              styles.languageOption,
              {
                backgroundColor: currentLanguage === language ? theme.colors.primaryContainer : 'transparent',
                borderColor: theme.colors.outline,
              },
            ]}
            onPress={() => handleLanguageSelect(language)}
          >
            <Text
              style={[
                styles.languageText,
                {
                  color: currentLanguage === language ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
                },
              ]}
            >
              {getLanguageNativeName(language)}
            </Text>
            {currentLanguage === language && (
              <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      {isDeviceLanguageSupported && deviceLanguage !== currentLanguage && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.secondaryContainer }]}
            onPress={handleUseDeviceLanguage}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.onSecondaryContainer }]}>
              {t('settings.useDeviceLanguage')}
            </Text>
          </TouchableOpacity>

          {hasUserExplicitlySetLanguage && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={handleResetToDeviceLanguage}
            >
              <Text style={[styles.actionButtonText, { color: theme.colors.onSurfaceVariant }]}>
                {t('settings.resetToDeviceLanguage')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Quick Toggle */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: theme.colors.primary }]}
          onPress={toggleLanguage}
        >
          <Text style={[styles.toggleButtonText, { color: theme.colors.onPrimary }]}>
            {t('settings.toggleLanguage')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  currentLanguage: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  deviceLanguage: {
    fontSize: 16,
    marginBottom: 4,
  },
  explicitIndicator: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  autoDetectIndicator: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});