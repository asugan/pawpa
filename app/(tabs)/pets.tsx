import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PetsScreen() {
  const theme = useTheme();

  const renderPetCard = () => (
    <Card style={[styles.petCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.petContent}>
        <View style={styles.petInfo}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            Pet Adı
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Tür • Yaş
          </Text>
        </View>
        <Button
          mode="outlined"
          textColor={theme.colors.primary}
          onPress={() => console.log('View pet details')}
        >
          Detaylar
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
          Evcil Dostlarım
        </Text>
      </View>

      <FlatList
        data={[]}
        renderItem={renderPetCard}
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.petsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Henüz pet yok
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
              + butonuna basarak ilk evcil dostunuzu ekleyin
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  petsList: {
    padding: 16,
    paddingTop: 0,
  },
  petCard: {
    flex: 1,
    margin: 4,
    elevation: 2,
  },
  petContent: {
    padding: 16,
  },
  petInfo: {
    marginBottom: 12,
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