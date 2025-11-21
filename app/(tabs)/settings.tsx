import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Switch, ListItem } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../stores/themeStore';
import { useLanguageStore } from '../../stores/languageStore';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LAYOUT } from '../../constants';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { themeMode, toggleTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const isDarkMode = themeMode === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Theme Settings */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.appearance')}
            </Text>
            <ListItem
              title={t('settings.darkMode')}
              description={t('settings.changeTheme')}
              left={<MaterialCommunityIcons name="theme-light-dark" size={24} color={theme.colors.onSurfaceVariant} />}
              right={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  color={theme.colors.primary}
                />
              }
            />
          </View>
        </Card>

        {/* App Settings */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.appSettings')}
            </Text>
            <ListItem
              title={t('settings.notifications')}
              description={t('settings.reminderNotifications')}
              left={<MaterialCommunityIcons name="bell" size={24} color={theme.colors.onSurfaceVariant} />}
              right={
                <Switch
                  value={true}
                  onValueChange={() => console.log('Toggle notifications')}
                  color={theme.colors.primary}
                />
              }
            />
            <ListItem
              title={t('settings.language')}
              description={language === 'tr' ? 'Türkçe' : 'English'}
              left={<MaterialCommunityIcons name="translate" size={24} color={theme.colors.onSurfaceVariant} />}
              onPress={() => {
                const newLanguage = language === 'en' ? 'tr' : 'en';
                setLanguage(newLanguage);
              }}
              right={
                <View style={styles.languageIndicator}>
                  <Text style={[styles.languageText, { color: theme.colors.onSurface }]}>
                    {language === 'en' ? 'EN' : 'TR'}
                  </Text>
                </View>
              }
            />
          </View>
        </Card>

        {/* Data & Privacy */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.dataPrivacy')}
            </Text>
            <ListItem
              title={t('settings.dataBackup')}
              description={t('settings.dataBackupDescription')}
              left={<MaterialCommunityIcons name="cloud-upload" size={24} color={theme.colors.onSurfaceVariant} />}
              right={<MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />}
            />
            <ListItem
              title={t('settings.dataCleanup')}
              description={t('settings.dataCleanupDescription')}
              left={<MaterialCommunityIcons name="delete" size={24} color={theme.colors.onSurfaceVariant} />}
              right={<MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />}
            />
          </View>
        </Card>

        {/* About */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('settings.about')}
            </Text>
            <ListItem
              title={t('settings.version')}
              description={t('settings.versionNumber')}
              left={<MaterialCommunityIcons name="information" size={24} color={theme.colors.onSurfaceVariant} />}
            />
            <ListItem
              title={t('settings.helpSupport')}
              description={t('settings.helpSupportDescription')}
              left={<MaterialCommunityIcons name="help-circle" size={24} color={theme.colors.onSurfaceVariant} />}
              right={<MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />}
            />
          </View>
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
  cardContent: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  logoutContainer: {
    marginTop: 24,
    marginBottom: LAYOUT.TAB_BAR_HEIGHT,
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
