import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SegmentedButtons, FAB, Chip, IconButton, Card } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { usePets } from '../../lib/hooks/usePets';
import { useHealthRecords } from '../../lib/hooks/useHealthRecords';
import {
  useTodayFeedingSchedules,
  useDeleteFeedingSchedule,
  useToggleFeedingSchedule,
} from '../../lib/hooks/useFeedingSchedules';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { HealthRecordForm } from '../../components/forms/HealthRecordForm';
import { FeedingScheduleModal } from '../../components/FeedingScheduleModal';
import { TURKCE_LABELS, HEALTH_RECORD_COLORS, LAYOUT } from '../../constants';
import type { HealthRecord, FeedingSchedule } from '../../lib/types';
import { ProtectedRoute } from '@/components/subscription';
import { FeedingScheduleCard } from '@/components/feeding/FeedingScheduleCard';
import { useAllEvents, useEvents } from '@/lib/hooks/useEvents';
import HealthTimelineComponent from '@/components/HealthTimeline';

type CareTabValue = 'health' | 'feeding' | 'timeline';

export default function CareScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<CareTabValue>('health');
  
  // Health state
  const [selectedPetId, setSelectedPetId] = useState<string | undefined>();
  const [isHealthFormVisible, setIsHealthFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | undefined>();
  const [healthFormKey, setHealthFormKey] = useState(0);
  
  // Feeding state
  const [isFeedingModalVisible, setIsFeedingModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<FeedingSchedule | undefined>();

  // Get pets for selection
  const { data: pets = [], isLoading: petsLoading } = usePets();

  // Health data
  const {
    data: healthRecords = [],
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth
  } = useHealthRecords(selectedPetId);

  // Events for timeline
  const { data: eventsByPet = [], isLoading: eventsByPetLoading } = useEvents(selectedPetId || '');
  const { data: allEvents = [], isLoading: allEventsLoading } = useAllEvents();
  const timelineEvents = selectedPetId ? eventsByPet : allEvents;
  const eventsLoading = selectedPetId ? eventsByPetLoading : allEventsLoading;

  // Feeding data
  const { data: todaySchedules = [], isLoading: feedingLoading } = useTodayFeedingSchedules();
  
  // Mutations
  const deleteScheduleMutation = useDeleteFeedingSchedule();
  const toggleScheduleMutation = useToggleFeedingSchedule();

  // Filter health records by type (all records since we removed type filter)
  const filteredHealthRecords = healthRecords;

  // Filter feeding schedules by selected pet (all schedules since we removed pet filter)
  const feedingSchedules = todaySchedules;

  // Health handlers
  const handleAddHealthRecord = () => {
    setEditingRecord(undefined);
    setHealthFormKey((current) => current + 1);
    setIsHealthFormVisible(true);
  };

  const handleHealthFormSuccess = () => {
    setIsHealthFormVisible(false);
    setEditingRecord(undefined);
    refetchHealth();
  };

  const handleHealthFormCancel = () => {
    setIsHealthFormVisible(false);
    setEditingRecord(undefined);
  };



  const handleEditRecord = (record: HealthRecord) => {
    setEditingRecord({
      ...record,
      petId: record.petId, // Ensure petId is preserved when editing
    });
    setHealthFormKey((current) => current + 1);
    setIsHealthFormVisible(true);
  };

  // Feeding handlers
  const handleAddSchedule = () => {
    setSelectedSchedule(undefined);
    setIsFeedingModalVisible(true);
  };

  const handleSchedulePress = (schedule: FeedingSchedule) => {
    setSelectedSchedule(schedule);
    setIsFeedingModalVisible(true);
  };

  const handleEditSchedule = (schedule: FeedingSchedule) => {
    setSelectedSchedule(schedule);
    setIsFeedingModalVisible(true);
  };

  const handleDeleteSchedule = async (schedule: FeedingSchedule) => {
    try {
      await deleteScheduleMutation.mutateAsync(schedule._id);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleToggleActive = async (schedule: FeedingSchedule, isActive: boolean) => {
    try {
      await toggleScheduleMutation.mutateAsync({ id: schedule._id, isActive });
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const handleFeedingModalClose = () => {
    setIsFeedingModalVisible(false);
    setSelectedSchedule(undefined);
  };

  const renderHealthContent = () => {
    if (petsLoading) {
      return <LoadingSpinner />;
    }

    if (pets.length === 0) {
      return (
        <EmptyState
          title={t('health.noPets')}
          description={t('health.addPetFirstToViewRecords')}
          icon="dog"
        />
      );
    }

    // Don't require pet selection - show all records when no pet is selected

    if (healthLoading) {
      return <LoadingSpinner />;
    }

    if (healthError) {
      return (
        <EmptyState
          title={t('common.error')}
          description={t('health.loadingError')}
          icon="alert-circle"
          buttonText={t('common.retry')}
          onButtonPress={() => refetchHealth()}
        />
      );
    }

    if (filteredHealthRecords.length === 0) {
      return (
        <EmptyState
          title={t('health.noRecordsShort')}
          description={t('health.noRecordsMessage')}
          icon="medical-bag"
          buttonText={t('health.addFirstRecord')}
          onButtonPress={handleAddHealthRecord}
        />
      );
    }

    return (
      <View style={styles.listContainer}>
        {filteredHealthRecords.map((record: HealthRecord) => (
          <Card key={record._id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.cardContent}>
              <View style={styles.cardInfo}>
                <View style={styles.titleRow}>
                  <View style={[styles.typeIndicator, { backgroundColor: HEALTH_RECORD_COLORS[record.type as keyof typeof HEALTH_RECORD_COLORS] || '#A8A8A8' }]} />
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
                    {record.title}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  {TURKCE_LABELS.HEALTH_RECORD_TYPES[record.type as keyof typeof TURKCE_LABELS.HEALTH_RECORD_TYPES]}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                  {new Date(record.date).toLocaleDateString('tr-TR')}
                </Text>
                {record.veterinarian && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                    Dr. {record.veterinarian}
                  </Text>
                )}
              </View>
              <View style={styles.actionButtons}>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => handleEditRecord(record)}
                />
              </View>
            </View>
          </Card>
        ))}
      </View>
    );
  };

  const renderFeedingContent = () => {
    if (petsLoading || feedingLoading) {
      return <LoadingSpinner />;
    }

    if (feedingSchedules.length === 0) {
      return (
        <EmptyState
          title={t('feedingSchedule.noSchedules')}
          description={t('feedingSchedule.addFirstSchedule')}
          icon="food"
        />
      );
    }

    return (
      <View style={styles.listContainer}>
        {feedingSchedules.map((schedule) => (
          <FeedingScheduleCard
            key={schedule._id}
            schedule={schedule}
            onPress={handleSchedulePress}
            onEdit={handleEditSchedule}
            onDelete={handleDeleteSchedule}
            onToggleActive={handleToggleActive}
            showPetInfo={true}
            showActions
          />
        ))}
      </View>
    );
  };

  const renderTimelineContent = () => {
    if (petsLoading) {
      return <LoadingSpinner />;
    }

    if (pets.length === 0) {
      return (
        <EmptyState
          title={t('health.noPets')}
          description={t('health.addPetFirstToViewRecords')}
          icon="dog"
        />
      );
    }

    return (
      <HealthTimelineComponent
        events={timelineEvents || []}
        healthRecords={healthRecords}
        pets={pets}
        loading={healthLoading || eventsLoading}
      />
    );
  };

  return (
    <ProtectedRoute featureName={t('subscription.features.healthRecords')}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
            {t('care.title')}
          </Text>
        </View>

        <View style={styles.segmentedContainer}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as CareTabValue)}
            buttons={[
              { 
                value: 'health', 
                label: t('care.health'),
                icon: 'heart-pulse'
              },
              { 
                value: 'feeding', 
                label: t('care.feeding'),
                icon: 'food'
              },
              {
                value: 'timeline',
                label: t('care.timeline', 'Timeline'),
                icon: 'timeline-text'
              }
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Pet selector for health */}
        {activeTab !== 'feeding' && pets.length > 0 && (
          <View style={styles.petSelector}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
              {t('health.selectPet')}
            </Text>
            <View style={styles.petChips}>
              <Chip
                selected={!selectedPetId}
                onPress={() => setSelectedPetId(undefined)}
                textStyle={{ fontSize: 12 }}
              >
                {t('common.all')}
              </Chip>
              {pets.map((pet) => (
                <Chip
                  key={pet._id}
                  selected={selectedPetId === pet._id}
                  onPress={() => setSelectedPetId(pet._id)}
                  textStyle={{ fontSize: 12 }}
                >
                  {pet.name}
                </Chip>
              ))}
            </View>
          </View>
        )}


        <View style={styles.content}>
          {activeTab === 'health' && renderHealthContent()}
          {activeTab === 'feeding' && renderFeedingContent()}
          {activeTab === 'timeline' && renderTimelineContent()}
        </View>

        {/* FABs */}
        {activeTab === 'health' && (
          <FAB
            icon="add"
            style={{ ...styles.fab, backgroundColor: theme.colors.secondary }}
            onPress={handleAddHealthRecord}
          />
        )}

        {activeTab === 'feeding' && (
          <FAB
            icon="add"
            style={{ ...styles.fab, backgroundColor: theme.colors.primary }}
            onPress={handleAddSchedule}
          />
        )}

        {/* Modals */}
        <HealthRecordForm
          key={healthFormKey}
          visible={isHealthFormVisible}
          onSuccess={handleHealthFormSuccess}
          onCancel={handleHealthFormCancel}
          initialData={editingRecord}
        />

        <FeedingScheduleModal
          visible={isFeedingModalVisible}
          schedule={selectedSchedule}
          initialPetId={selectedPetId || undefined}
          onClose={handleFeedingModalClose}
          onSuccess={() => {}}
          pets={pets}
        />
      </SafeAreaView>
    </ProtectedRoute>
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
  segmentedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedButtons: {
    marginBottom: 0,
  },
  petSelector: {
    padding: 16,
    paddingBottom: 8,
  },
  petChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: LAYOUT.TAB_BAR_HEIGHT,
  },
  card: {
    margin: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  actionButtons: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
