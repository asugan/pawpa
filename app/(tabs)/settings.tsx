import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Switch, List, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../stores/themeStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const { themeMode, toggleTheme } = useThemeStore();
  const isDarkMode = themeMode === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Theme Settings */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Görünüm
            </Text>
            <List.Item
              title="Karanlık Mod"
              description="Uygulama temasını değiştir"
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
              Uygulama Ayarları
            </Text>
            <List.Item
              title="Bildirimler"
              description="Hatırlatıcı bildirimleri"
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
              title="Dil"
              description="Türkçe"
              left={(props) => <List.Icon {...props} icon="translate" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card.Content>
        </Card>

        {/* Data & Privacy */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Veri ve Gizlilik
            </Text>
            <List.Item
              title="Veri Yedekleme"
              description="Verilerinizi bulutta yedekleyin"
              left={(props) => <List.Icon {...props} icon="cloud-upload" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title="Veri Temizleme"
              description="Tüm verileri sil"
              left={(props) => <List.Icon {...props} icon="delete" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card.Content>
        </Card>

        {/* About */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Hakkında
            </Text>
            <List.Item
              title="Versiyon"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="information" />}
            />
            <List.Item
              title="Yardım ve Destek"
              description="SSS ve iletişim"
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
            Çıkış Yap
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
});