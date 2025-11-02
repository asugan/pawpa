import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Text, FAB, useTheme, Portal, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pet } from '../../lib/types';
import { usePetUIStore } from '../../stores/petStore';
import { usePets, useCreatePet, useDeletePet } from '../../lib/hooks/usePets';
import PetCard from '../../components/PetCard';
import { PetCardSkeleton } from '../../components/PetCardSkeleton';
import { Grid } from '../../components/Grid';
import PetModal from '../../components/PetModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { LAYOUT } from '../../constants';

export default function PetsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  // ✅ React Query hooks for server state
  const { data: pets = [], isLoading, error, refetch } = usePets();
  const createPetMutation = useCreatePet();
  const deletePetMutation = useDeletePet();

  // ✅ Zustand store for UI state only
  const {
    selectedPetId,
    isCreatingPet,
    filterStatus,
    sortBy,
    searchQuery,
    setSelectedPet,
    setCreatingPet,
    setSearchQuery
  } = usePetUIStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPet, setSelectedPetState] = useState<Pet | undefined>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error.message || 'Bir hata oluştu');
      setSnackbarVisible(true);
    }
  }, [error]);

  const showSnackbar = React.useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  const handleAddPet = () => {
    setSelectedPetState(undefined);
    setModalVisible(true);
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPetState(pet);
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
              await deletePetMutation.mutateAsync(pet.id);
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
    // React Query handles cache invalidation automatically
    showSnackbar('Pet başarıyla kaydedildi');
  };

  const handleSnackbarDismiss = () => {
    setSnackbarVisible(false);
  };

  const handleViewPet = (pet: Pet) => {
    router.push(`/pet/${pet.id}`);
  };

  const renderPetCard = (pet: Pet) => (
    <PetCard
      pet={pet}
      onPress={() => handleViewPet(pet)}
      onEdit={() => handleEditPet(pet)}
      onDelete={() => handleDeletePet(pet)}
      // Mock data for upcoming events and vaccinations
      // In a real app, this would come from your API
      upcomingEvents={Math.floor(Math.random() * 3)}
      upcomingVaccinations={Math.floor(Math.random() * 2)}
    />
  );

  // Create skeleton cards for loading state
  const renderLoadingSkeleton = () => {
    return Array.from({ length: 4 }, (_, index) => (
      <PetCardSkeleton key={`skeleton-${index}`} />
    ));
  };

  // Show loading spinner on initial load
  if (isLoading && (!pets || pets.length === 0)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
            {t('pets.myPets')}
          </Text>
        </View>
        <Grid maxColumns={2}>
          {renderLoadingSkeleton()}
        </Grid>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
          {t('pets.myPets')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {(!pets || pets.length === 0) ? (
          !isLoading && (
            <EmptyState
              title={t('pets.noPetsYet')}
              description={t('pets.addFirstPet')}
              icon="paw"
              buttonText={t('pets.addFirstPetButton', 'İlk Peti Ekle')}
              onButtonPress={handleAddPet}
              buttonColor={theme.colors.primary}
              style={styles.emptyState}
            />
          )
        ) : (
          <>
            <Grid maxColumns={2}>
              {pets.map(renderPetCard)}
            </Grid>

            {/* Loading indicator at bottom when refreshing */}
            {isLoading && pets.length > 0 && (
              <View style={styles.loadingFooter}>
                <LoadingSpinner size="small" />
              </View>
            )}
          </>
        )}
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: LAYOUT.TAB_BAR_HEIGHT,
  },
  emptyState: {
    marginTop: 40,
    flex: 1,
    justifyContent: 'center',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
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