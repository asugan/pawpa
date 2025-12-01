import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { Text, Card, FAB, Chip, IconButton } from '@/components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { usePets } from '../../lib/hooks/usePets';
import { useHealthRecords } from '../../lib/hooks/useHealthRecords';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { HealthRecordForm } from '../../components/forms/HealthRecordForm';
import { HEALTH_RECORD_TYPES, TURKCE_LABELS, HEALTH_RECORD_COLORS, HEALTH_RECORD_ICONS, LAYOUT } from '../../constants';
import type { HealthRecord } from '../../lib/types';
import { ProtectedRoute } from '@/components/subscription';

export default function HealthScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedPetId, setSelectedPetId] = useState<string>();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get pets for selection
  const { data: pets = [], isLoading: petsLoading } = usePets();

  // Get health records for selected pet
  const {
    data: healthRecords = [],
    isLoading,
    error,
    refetch
  } = useHealthRecords(selectedPetId || '');

  // Filter records by type
  const filteredRecords = selectedType === 'all'
    ? healthRecords
    : healthRecords.filter((record: HealthRecord) => record.type === selectedType);

  const handleAddHealthRecord = () => {
    if (selectedPetId) {
      setIsFormVisible(true);
    }
  };

  const handleFormSuccess = () => {
    setIsFormVisible(false);
    setEditingRecord(undefined);
    refetch();
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
    setEditingRecord(undefined);
  };

  const handleHealthRecordPress = (record: HealthRecord) => {
    router.push(`/health/${record.id}`);
  };

  const handleEditRecord = (record: HealthRecord) => {
    setEditingRecord(record);
    setIsFormVisible(true);
  };

  // Simulate loading more (for smooth UX even though all data is loaded)
  const handleEndReached = useCallback(() => {
    if (!isLoading && !isLoadingMore && filteredRecords.length > 10) {
      setIsLoadingMore(true);
      // Simulate a small delay for smooth UX
      setTimeout(() => {
        setIsLoadingMore(false);
      }, 300);
    }
  }, [isLoading, isLoadingMore, filteredRecords.length]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [isLoadingMore, theme.colors.primary]);

  const renderHealthRecord = ({ item }: { item: HealthRecord }) => (
    <Pressable onPress={() => handleHealthRecordPress(item)}>
      <Card style={[styles.healthCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.healthContent}>
        <View style={styles.healthInfo}>
          <View style={styles.titleRow}>
            <View style={[styles.typeIndicator, { backgroundColor: HEALTH_RECORD_COLORS[item.type as keyof typeof HEALTH_RECORD_COLORS] || '#A8A8A8' }]} />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
              {item.title}
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {TURKCE_LABELS.HEALTH_RECORD_TYPES[item.type as keyof typeof TURKCE_LABELS.HEALTH_RECORD_TYPES]}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
            {new Date(item.date).toLocaleDateString('tr-TR')}
          </Text>
          {item.veterinarian && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
              Dr. {item.veterinarian}
            </Text>
          )}
          {item.nextDueDate && (
            <View style={styles.nextDueContainer}>
              <Chip
                icon="calendar-clock"
                textStyle={{ fontSize: 10 }}
                compact
              >
                {new Date(item.nextDueDate).toLocaleDateString('tr-TR')}
              </Chip>
            </View>
          )}
        </View>
        <View style={styles.actionButtons}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => handleEditRecord(item)}
          />
        </View>
      </View>
      </Card>
    </Pressable>
  );

  const renderPetSelector = () => {
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
              key={pet.id}
              selected={selectedPetId === pet.id}
              onPress={() => setSelectedPetId(pet.id)}
              textStyle={{ fontSize: 12 }}
            >
              {pet.name}
            </Chip>
          ))}
        </View>
      </View>
    );
  };

  const renderTypeFilter = () => (
    <View style={styles.typeFilter}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
        {t('health.recordType')}
      </Text>
      <View style={styles.typeChips}>
        <Chip
          selected={selectedType === 'all'}
          onPress={() => setSelectedType('all')}
          textStyle={{ fontSize: 12 }}
        >
          {t('common.all')}
        </Chip>
        {Object.entries(HEALTH_RECORD_TYPES).map(([key, value]) => (
          <Chip
            key={key}
            selected={selectedType === value}
            onPress={() => setSelectedType(value)}
            icon={({ size, color }: { size: number, color: string }) => (
              <MaterialCommunityIcons
                name={HEALTH_RECORD_ICONS[value as keyof typeof HEALTH_RECORD_ICONS]}
                size={size}
                color={color}
              />
            )}
            textStyle={{ fontSize: 12 }}
          >
            {TURKCE_LABELS.HEALTH_RECORD_TYPES[value as keyof typeof TURKCE_LABELS.HEALTH_RECORD_TYPES]}
          </Chip>
        ))}
      </View>
    </View>
  );

  if (petsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <ProtectedRoute featureName={t('subscription.features.healthRecords')}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
            {t('health.healthRecords')}
          </Text>
        </View>

        {renderPetSelector()}

        {selectedPetId && renderTypeFilter()}

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <EmptyState
            title={t('common.error')}
            description={t('health.loadingError')}
            icon="alert-circle"
            buttonText={t('common.retry')}
            onButtonPress={() => refetch()}
          />
        ) : !selectedPetId ? (
          <EmptyState
            title={t('health.selectPetToViewRecords')}
            description={t('health.selectPetToViewRecordsMessage')}
            icon="paw"
          />
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            title={t('health.noRecordsShort')}
            description={t('health.noRecordsMessage')}
            icon="medical-bag"
            buttonText={t('health.addFirstRecord')}
            onButtonPress={handleAddHealthRecord}
          />
        ) : (
          <FlatList
            data={filteredRecords}
            renderItem={renderHealthRecord}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.healthList}
            showsVerticalScrollIndicator={false}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}

        <FAB
          icon="add"
          style={{ ...styles.fab, backgroundColor: theme.colors.secondary }}
          onPress={handleAddHealthRecord}
          disabled={!selectedPetId}
        />

        {/* Health Record Form Modal */}
        {selectedPetId && (
          <HealthRecordForm
            petId={selectedPetId}
            visible={isFormVisible}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            initialData={editingRecord}
          />
        )}
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
  petSelector: {
    padding: 16,
    paddingBottom: 8,
  },
  petChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeFilter: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 8,
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  healthList: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: LAYOUT.TAB_BAR_HEIGHT,
  },
  healthCard: {
    margin: 4,
    elevation: 2,
  },
  healthContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  healthInfo: {
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
  nextDueContainer: {
    marginTop: 8,
  },
  actionButtons: {
    marginLeft: 8,
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