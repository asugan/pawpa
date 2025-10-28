import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function HealthScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  const renderHealthRecord = () => (
    <Card style={[styles.healthCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.healthContent}>
        <View style={styles.healthInfo}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {t('health.vaccinationRecord')}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('health.petNameDate')}
          </Text>
        </View>
        <Button
          mode="outlined"
          textColor={theme.colors.secondary}
          onPress={() => console.log('View health details')}
        >
          {t('health.view')}
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
          {t('health.healthRecords')}
        </Text>
      </View>

      <FlatList
        data={[]}
        renderItem={renderHealthRecord}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.healthList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              {t('health.noRecords')}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
              {t('pets.addFirstPet')}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
        onPress={() => console.log('Add health record')}
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
  healthList: {
    padding: 16,
    paddingTop: 0,
  },
  healthCard: {
    margin: 4,
    elevation: 2,
  },
  healthContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthInfo: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});