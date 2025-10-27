import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HealthScreen() {
  const theme = useTheme();

  const renderHealthRecord = () => (
    <Card style={[styles.healthCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.healthContent}>
        <View style={styles.healthInfo}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            Aşı Kaydı
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Pet Adı • Tarih
          </Text>
        </View>
        <Button
          mode="outlined"
          textColor={theme.colors.secondary}
          onPress={() => console.log('View health details')}
        >
          Görüntüle
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
          Sağlık Kayıtları
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
              Sağlık kaydı bulunmuyor
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
              + butonuna basarak sağlık kaydı ekleyin
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