import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { Text, FAB, SegmentedButtons, Menu, Button } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FeedingScheduleCard } from '@/components/feeding/FeedingScheduleCard';
import { FeedingScheduleModal } from '@/components/FeedingScheduleModal';
import {
  useFeedingSchedules,
  useActiveFeedingSchedules,
  useTodayFeedingSchedules,
  useDeleteFeedingSchedule,
  useToggleFeedingSchedule,
} from '@/lib/hooks/useFeedingSchedules';
import { usePets } from '@/lib/hooks/usePets';
import { FeedingSchedule, Pet } from '@/lib/types';
import { LAYOUT } from '@/constants';

type TabValue = 'today' | 'upcoming' | 'all';

export default function FeedingScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // State management
  const [selectedTab, setSelectedTab] = useState<TabValue>('today');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [petFilterVisible, setPetFilterVisible] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<FeedingSchedule | undefined>(undefined);

  // Fetch data
  const { data: allPets = [], isLoading: isPetsLoading } = usePets();
  const { data: todaySchedules = [], isLoading: isTodayLoading } = useTodayFeedingSchedules();
  const { data: activeSchedules = [], isLoading: isActiveLoading } = useActiveFeedingSchedules();

  // Mutations
  const deleteScheduleMutation = useDeleteFeedingSchedule();
  const toggleScheduleMutation = useToggleFeedingSchedule();

  // Filter schedules by selected pet
  const filterByPet = (schedules: FeedingSchedule[]) => {
    if (!selectedPetId) return schedules;
    return schedules.filter(s => s.petId === selectedPetId);
  };

  // Get schedules based on selected tab
  const getSchedules = (): FeedingSchedule[] => {
    switch (selectedTab) {
      case 'today':
        return filterByPet(todaySchedules);
      case 'upcoming':
        return filterByPet(activeSchedules);
      case 'all':
        // For 'all', we need to get all schedules from all pets
        const allSchedules = allPets.flatMap((pet: Pet) => {
          // This is a workaround - ideally we'd have a hook for all schedules
          // For now, we'll use activeSchedules as a proxy
          return activeSchedules.filter((s: FeedingSchedule) => s.petId === pet.id);
        });
        return filterByPet(allSchedules);
      default:
        return [];
    }
  };

  const schedules = getSchedules();
  const isLoading = selectedTab === 'today' ? isTodayLoading :
                    selectedTab === 'upcoming' ? isActiveLoading :
                    false;

  // Get selected pet name
  const selectedPet = allPets.find(p => p.id === selectedPetId);
  const petFilterLabel = selectedPet ? selectedPet.name : t('feedingSchedule.allSchedules');

  // Handlers
  const handleAddSchedule = () => {
    setSelectedSchedule(undefined);
    setIsModalVisible(true);
  };

  const handleSchedulePress = (schedule: FeedingSchedule) => {
    setSelectedSchedule(schedule);
    setIsModalVisible(true);
  };

  const handleEditSchedule = (schedule: FeedingSchedule) => {
    setSelectedSchedule(schedule);
    setIsModalVisible(true);
  };

  const handleDeleteSchedule = async (schedule: FeedingSchedule) => {
    try {
      await deleteScheduleMutation.mutateAsync(schedule.id);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleToggleActive = async (schedule: FeedingSchedule, isActive: boolean) => {
    try {
      await toggleScheduleMutation.mutateAsync({ id: schedule.id, isActive });
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const handlePetFilter = (petId: string | null) => {
    setSelectedPetId(petId);
    setPetFilterVisible(false);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedSchedule(undefined);
  };

  const handleModalSuccess = () => {
    // Modal will close itself and trigger refetch via TanStack Query
  };

  // Simulate loading more (for smooth UX even though all data is loaded)
  const handleEndReached = useCallback(() => {
    if (!isLoading && !isLoadingMore && schedules.length > 10) {
      setIsLoadingMore(true);
      // Simulate a small delay for smooth UX
      setTimeout(() => {
        setIsLoadingMore(false);
      }, 300);
    }
  }, [isLoading, isLoadingMore, schedules.length]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [isLoadingMore, theme.colors.primary]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text
        variant="headlineSmall"
        style={StyleSheet.flatten([styles.emptyTitle, { color: theme.colors.onSurface }])}
      >
        🍽️
      </Text>
      <Text
        variant="titleMedium"
        style={StyleSheet.flatten([styles.emptyText, { color: theme.colors.onSurfaceVariant }])}
      >
        {selectedTab === 'today'
          ? t('feedingSchedule.noSchedules')
          : selectedTab === 'upcoming'
            ? t('feedingSchedule.noNextFeeding')
            : t('feedingSchedule.noSchedules')
        }
      </Text>
      <Text
        variant="bodyMedium"
        style={StyleSheet.flatten([styles.emptySubtext, { color: theme.colors.onSurfaceVariant }])}
      >
        {t('feedingSchedule.addFirstSchedule')}
      </Text>
    </View>
  );

  // Render loading state
  if (isLoading || isPetsLoading) {
    return (
      <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: theme.colors.background }])}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginTop: 16 }}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: theme.colors.background }])}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={StyleSheet.flatten([styles.title, { color: theme.colors.onSurface }])}>
          {t('feedingSchedule.title')}
        </Text>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as TabValue)}
          buttons={[
            {
              value: 'today',
              label: t('feedingSchedule.todaysSchedules'),
              icon: 'calendar-today',
            },
            {
              value: 'upcoming',
              label: t('feedingSchedule.upcomingSchedules'),
              icon: 'calendar-clock',
            },
            {
              value: 'all',
              label: t('feedingSchedule.allSchedules'),
              icon: 'calendar-multiple',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Pet Filter */}
      {allPets.length > 1 && (
        <View style={styles.filterContainer}>
          <Menu
            visible={petFilterVisible}
            onDismiss={() => setPetFilterVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setPetFilterVisible(true)}
                icon="filter"
                style={styles.filterButton}
              >
                {petFilterLabel}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => handlePetFilter(null)}
              title={t('feedingSchedule.allSchedules')}
              leadingIcon={
                selectedPetId === null ? (
                  <MaterialCommunityIcons name="check" size={20} color={theme.colors.primary} />
                ) : undefined
              }
            />
            {allPets.map((pet) => (
              <Menu.Item
                key={pet.id}
                onPress={() => handlePetFilter(pet.id)}
                title={pet.name}
                leadingIcon={
                  selectedPetId === pet.id ? (
                    <MaterialCommunityIcons name="check" size={20} color={theme.colors.primary} />
                  ) : undefined
                }
              />
            ))}
          </Menu>
        </View>
      )}

      {/* Schedule List */}
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedingScheduleCard
            schedule={item}
            onPress={handleSchedulePress}
            onEdit={handleEditSchedule}
            onDelete={handleDeleteSchedule}
            onToggleActive={handleToggleActive}
            showPetInfo={!selectedPetId}
            showActions
            testID={`schedule-card-${item.id}`}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB for adding new schedule */}
      <FAB
        icon="add"
        style={StyleSheet.flatten([styles.fab, { backgroundColor: theme.colors.primary }])}
        onPress={handleAddSchedule}
        testID="add-schedule-fab"
      />

      {/* Feeding Schedule Modal */}
      <FeedingScheduleModal
        visible={isModalVisible}
        schedule={selectedSchedule}
        initialPetId={selectedPetId || undefined}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        pets={allPets}
        testID="feeding-schedule-modal"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontWeight: '700',
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  segmentedButtons: {
    marginBottom: 0,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterButton: {
    alignSelf: 'flex-start',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: LAYOUT.TAB_BAR_HEIGHT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
    marginBottom: 24,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
