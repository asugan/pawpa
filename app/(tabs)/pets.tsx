import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Button, FAB, useTheme, Portal, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pet } from '../../lib/types';
import { usePetStore } from '../../stores/petStore';
import PetCard from '../../components/PetCard';
import PetModal from '../../components/PetModal';
import { useTranslation } from 'react-i18next';

export default function PetsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { pets, isLoading, loadPets, deletePet, error, clearError } = usePetStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | undefined>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
    }
  }, [error]);

  const showSnackbar = React.useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  const handleAddPet = () => {
    setSelectedPet(undefined);
    setModalVisible(true);
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setModalVisible(true);
  };

  const handleDeletePet = (pet: Pet) => {
    Alert.alert(
      'Pet Sil',
      `"${pet.name}" adlı pet\'i silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePet(pet.id);
              showSnackbar(`"${pet.name}" başarıyla silindi`);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Pet silinemedi';
              showSnackbar(errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleModalSuccess = () => {
    // Store zaten optimistic update yapıyor, yeniden yüklemeye gerek yok
    // loadPets();
  };

  const handleSnackbarDismiss = () => {
    setSnackbarVisible(false);
    clearError();
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
          {t('pets.myPets')}
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
              {t('pets.noPetsYet')}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
              {t('pets.addFirstPet')}
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

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={handleSnackbarDismiss}
          duration={3000}
          style={[
            styles.snackbar,
            { backgroundColor: snackbarMessage.includes('başarıyla') ? theme.colors.primary : theme.colors.error }
          ]}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
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
  snackbar: {
    marginBottom: 16,
  },
});