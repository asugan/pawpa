import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Text, FAB, Portal, Snackbar, Button } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pet } from '../../lib/types';
import { usePetUIStore } from '../../stores/petStore';
import { usePets, useCreatePet, useDeletePet, petKeys } from '../../lib/hooks/usePets';
import { useQueryClient } from '@tanstack/react-query';
import PetCard from '../../components/PetCard';
import { PetCardSkeleton } from '../../components/PetCardSkeleton';
import { Grid } from '../../components/Grid';
import PetModal from '../../components/PetModal';
import PetDetailModal from '../../components/PetDetailModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { LAYOUT } from '../../constants';
import { ENV } from '../../lib/config/env';

export default function PetsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState(1);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // ✅ React Query hooks for server state with pagination
  const { data: pets = [], isLoading, error, refetch, isFetching } = usePets({
    page,
    limit: ENV.DEFAULT_LIMIT,
  });
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
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPetIdForDetail, setSelectedPetIdForDetail] = useState<string>('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Accumulate pets when new data is loaded
  useEffect(() => {
    if (pets && pets.length > 0) {
      if (page === 1) {
        // First page - replace all pets
        setAllPets(pets);
      } else {
        // Subsequent pages - append new pets
        setAllPets(prev => {
          // Avoid duplicates
          const newPets = pets.filter(p => !prev.some(existing => existing.id === p.id));
          return [...prev, ...newPets];
        });
      }
      // Check if there are more pets to load
      setHasMore(pets.length === ENV.DEFAULT_LIMIT);
    } else if (page === 1) {
      // No pets on first page
      setAllPets([]);
      setHasMore(false);
    }
  }, [pets, page]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error.message || t('common.error'));
      setSnackbarVisible(true);
    }
  }, [error, t]);

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
      t('pets.deletePet'),
      t('pets.deleteConfirmation', { name: pet.name }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePetMutation.mutateAsync(pet.id);
              showSnackbar(t('pets.deleteSuccess', { name: pet.name }));
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : t('pets.deleteError');
              showSnackbar(errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleModalSuccess = () => {
    // React Query handles cache invalidation automatically
    showSnackbar(t('pets.saveSuccess'));
  };

  const handleSnackbarDismiss = () => {
    setSnackbarVisible(false);
  };

  const handleViewPet = (pet: Pet) => {
    setSelectedPetIdForDetail(pet.id);
    setDetailModalVisible(true);
  };

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleRefresh = async () => {
    setPage(1);
    setHasMore(true);
    // Invalidate all pet list queries to force fresh data from server
    await queryClient.invalidateQueries({
      queryKey: petKeys.lists(),
      refetchType: 'active'
    });
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
  if (isLoading && allPets.length === 0) {
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
            refreshing={isFetching && page === 1}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {allPets.length === 0 ? (
          !isLoading && (
            <EmptyState
              title={t('pets.noPetsYet')}
              description={t('pets.addFirstPet')}
              icon="paw"
              buttonText={t('pets.addFirstPetButton')}
              onButtonPress={handleAddPet}
              buttonColor={theme.colors.primary}
              style={styles.emptyState}
            />
          )
        ) : (
          <>
            <Grid maxColumns={2}>
              {allPets.map(renderPetCard)}
            </Grid>

            {/* Load More Button */}
            {hasMore && (
              <View style={styles.loadMoreContainer}>
                <Button
                  mode="outlined"
                  onPress={handleLoadMore}
                  disabled={isFetching}
                  style={styles.loadMoreButton}
                >
                  {isFetching ? t('common.loading') : t('common.loadMore')}
                </Button>
              </View>
            )}

            {/* Loading indicator at bottom when fetching next page */}
            {isFetching && page > 1 && (
              <View style={styles.loadingFooter}>
                <LoadingSpinner size="small" />
              </View>
            )}
          </>
        )}
      </ScrollView>

      <FAB
        icon="add"
        style={{ ...styles.fab, backgroundColor: theme.colors.primary }}
        onPress={handleAddPet}
      />

      <PetModal
        visible={modalVisible}
        pet={selectedPet}
        onClose={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
        testID="pet-modal"
      />

      {selectedPetIdForDetail && (
        <PetDetailModal
          visible={detailModalVisible}
          petId={selectedPetIdForDetail}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedPetIdForDetail('');
          }}
        />
      )}

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={handleSnackbarDismiss}
          duration={3000}
          message={snackbarMessage}
          style={{
            ...styles.snackbar,
            backgroundColor: snackbarMessage.includes(t('pets.saveSuccess')) || snackbarMessage.includes(t('pets.deleteSuccess'))
              ? theme.colors.primary
              : theme.colors.error
          }}
        />
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
  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    minWidth: 200,
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