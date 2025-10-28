import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            PawPa
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('home.title')}
          </Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary, textAlign: 'center' }}>
                0
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, textAlign: 'center' }}>
                {t('home.totalPets')}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineMedium" style={{ color: theme.colors.secondary, textAlign: 'center' }}>
                0
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, textAlign: 'center' }}>
                {t('home.healthReminder')}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            {t('home.quickActions')}
          </Text>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              buttonColor={theme.colors.primary}
              style={styles.actionButton}
              onPress={() => console.log('Add pet')}
            >
              {t('home.addNewPet')}
            </Button>
            <Button
              mode="contained"
              buttonColor={theme.colors.secondary}
              style={styles.actionButton}
              onPress={() => console.log('Add health record')}
            >
              {t('home.healthRecord')}
            </Button>
            <Button
              mode="contained"
              buttonColor={theme.colors.tertiary}
              style={styles.actionButton}
              onPress={() => console.log('Feeding schedule')}
            >
              {t('home.feedingPlan')}
            </Button>
          </View>
        </View>

        {/* Empty State */}
        <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Card.Content style={styles.emptyContent}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              {t('home.noPetsYet')}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
              {t('pets.addFirstPet')}
            </Text>
            <Button
              mode="contained"
              buttonColor={theme.colors.primary}
              style={styles.emptyButton}
              onPress={() => console.log('Add first pet')}
            >
              {t('home.addFirstPet')}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => console.log('Add new pet')}
      />
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 4,
  },
  emptyCard: {
    marginBottom: 80, // Space for FAB
  },
  emptyContent: {
    alignItems: 'center',
    padding: 24,
  },
  emptyButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});