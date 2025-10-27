import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pet } from '../../lib/types';
import { usePetStore } from '../../stores/petStore';
import PetCard from '../../components/PetCard';
import PetModal from '../../components/PetModal';

export default function PetsScreen() {
  const theme = useTheme();
  const { pets, isLoading, loadPets } = usePetStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | undefined>();

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const handleAddPet = () => {
    setSelectedPet(undefined);
    setModalVisible(true);
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setModalVisible(true);
  };

  const handleDeletePet = (pet: Pet) => {
    // TODO: Implement delete functionality
    console.log('Delete pet:', pet.id);
  };

  const handleModalSuccess = () => {
    // Refresh data after successful create/update
    loadPets();
  };

  const renderPetCard = ({ item }: { item: Pet }) => (
    <PetCard
      pet={item}
      onPress={() => console.log('View pet details:', item.id)}
      onEdit={() => handleEditPet(item)}
      onDelete={() => handleDeletePet(item)}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
          Evcil Dostlarım
        </Text>
      </View>

      <FlatList
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item.id}
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
        refreshing={isLoading}
        onRefresh={loadPets}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddPet}
      />

      <PetModal
        visible={modalVisible}
        pet={selectedPet}
        onClose={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
        testID="pet-modal"
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