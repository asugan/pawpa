import { View, StyleSheet } from 'react-native';
import { Text, Card, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function CalendarScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
          {t('calendar.calendar')}
        </Text>
      </View>

      <View style={styles.calendarContainer}>
        <Card style={[styles.calendarCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.calendarContent}>
            <Text variant="headlineMedium" style={{ color: theme.colors.tertiary, textAlign: 'center' }}>
              {t('calendar.calendar')}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, textAlign: 'center', marginTop: 8 }}>
              {t('calendar.comingSoon')}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.upcomingEvents}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            {t('calendar.upcomingEvents')}
          </Text>
          <Card style={[styles.eventCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content style={styles.eventContent}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('calendar.noEvents')}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
        onPress={() => console.log('Add event')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  calendarContainer: {
    flex: 1,
    padding: 16,
  },
  calendarCard: {
    elevation: 2,
    marginBottom: 24,
  },
  calendarContent: {
    padding: 32,
    alignItems: 'center',
  },
  upcomingEvents: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  eventCard: {
    elevation: 1,
  },
  eventContent: {
    padding: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});