import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Switch, List, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../stores/themeStore';
import { useLanguageStore } from '../../stores/languageStore';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { themeMode, toggleTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const isDarkMode = themeMode === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Theme Settings */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.appearance')}
            </Text>
            <List.Item
              title={t('settings.darkMode')}
              description={t('settings.changeTheme')}
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  color={theme.colors.primary}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* App Settings */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.appSettings')}
            </Text>
            <List.Item
              title={t('settings.notifications')}
              description={t('settings.reminderNotifications')}
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={true}
                  onValueChange={() => console.log('Toggle notifications')}
                  color={theme.colors.primary}
                />
              )}
            />
            <List.Item
              title={t('settings.language')}
              description={language === 'tr' ? 'Türkçe' : 'English'}
              left={(props) => <List.Icon {...props} icon="translate" />}
              onPress={() => {
                const newLanguage = language === 'en' ? 'tr' : 'en';
                setLanguage(newLanguage);
              }}
              right={(props) => (
                <View style={styles.languageIndicator}>
                  <Text style={[styles.languageText, { color: theme.colors.onSurface }]}>
                    {language === 'en' ? 'EN' : 'TR'}
                  </Text>
                </View>
              )}
            />
          </Card.Content>
        </Card>

        {/* Data & Privacy */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.dataPrivacy')}
            </Text>
            <List.Item
              title={t('settings.dataBackup')}
              description={t('settings.dataBackupDescription')}
              left={(props) => <List.Icon {...props} icon="cloud-upload" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title={t('settings.dataCleanup')}
              description={t('settings.dataCleanupDescription')}
              left={(props) => <List.Icon {...props} icon="delete" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card.Content>
        </Card>

        {/* About */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.about')}
            </Text>
            <List.Item
              title={t('settings.version')}
              description={t('settings.versionNumber')}
              left={(props) => <List.Icon {...props} icon="information" />}
            />
            <List.Item
              title={t('settings.helpSupport')}
              description={t('settings.helpSupportDescription')}
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            textColor={theme.colors.error}
            style={[styles.logoutButton, { borderColor: theme.colors.error }]}
            onPress={() => console.log('Logout')}
          >
            {t('settings.logout')}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  logoutContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  logoutButton: {
    borderWidth: 1,
  },
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
  },
});