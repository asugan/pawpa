import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme, Text, Button, Divider, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FeedingScheduleForm } from '@/components/forms/FeedingScheduleForm';
import {
  useFeedingSchedule,
  useUpdateFeedingSchedule,
  useDeleteFeedingSchedule,
} from '@/lib/hooks/useFeedingSchedules';
import { usePets } from '@/lib/hooks/usePets';
import { formatTimeForDisplay } from '@/lib/schemas/feedingScheduleSchema';

export default function FeedingScheduleDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isEditing, setIsEditing] = useState(false);

  // Fetch schedule details
  const { data: schedule, isLoading, error } = useFeedingSchedule(id!);

  // Fetch pets for the dropdown
  const { data: pets = [] } = usePets();

  // Mutations
  const updateMutation = useUpdateFeedingSchedule();
  const deleteMutation = useDeleteFeedingSchedule();

  const handleUpdate = async (data: any) => {
    try {
      console.log('Updating feeding schedule:', data);
      await updateMutation.mutateAsync({ id: id!, data });

      Alert.alert(
        t('common.success') || 'Success',
        t('feedingSchedule.updateSuccess') || 'Feeding schedule updated successfully',
        [
          {
            text: t('common.ok'),
            onPress: () => setIsEditing(false),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating feeding schedule:', error);
      Alert.alert(
        t('common.error'),
        t('feedingSchedule.errors.submitFailed')
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('feedingSchedule.delete.title'),
      t('feedingSchedule.delete.message'),
      [
        {
          text: t('feedingSchedule.delete.cancel'),
          style: 'cancel',
        },
        {
          text: t('feedingSchedule.delete.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(id!);
              Alert.alert(
                t('common.success') || 'Success',
                t('feedingSchedule.deleteSuccess') || 'Feeding schedule deleted successfully',
                [
                  {
                    text: t('common.ok'),
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error) {
              console.error('Error deleting feeding schedule:', error);
              Alert.alert(
                t('common.error'),
                t('feedingSchedule.errors.deleteFailed')
              );
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      router.back();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginTop: 16 }}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !schedule) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={{ color: theme.colors.error, marginBottom: 16 }}>
            {t('common.error')}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
            {t('feedingSchedule.errors.loadFailed')}
          </Text>
          <Button mode="contained" onPress={() => router.back()}>
            {t('common.goBack')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Get pet details
  const pet = pets.find(p => p.id === schedule.petId);

  // Edit mode
  if (isEditing) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['bottom']}
      >
        <FeedingScheduleForm
          schedule={schedule}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          loading={updateMutation.isPending}
          pets={pets}
          testID="edit-feeding-schedule-form"
        />
      </SafeAreaView>
    );
  }

  // View mode
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              🍽️ {formatTimeForDisplay(schedule.time)}
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.primary }]}>
              {t(`foodTypes.${schedule.foodType}`)}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="pencil"
              size={24}
              iconColor={theme.colors.primary}
              onPress={() => setIsEditing(true)}
              testID="edit-button"
            />
            <IconButton
              icon="delete"
              size={24}
              iconColor={theme.colors.error}
              onPress={handleDelete}
              testID="delete-button"
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Details */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {t('feedingSchedule.details') || 'Details'}
          </Text>

          {/* Pet */}
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('feedingSchedule.fields.pet')}
            </Text>
            <Text variant="bodyLarge" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {pet?.name || 'Unknown'}
            </Text>
          </View>

          {/* Amount */}
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('feedingSchedule.fields.amount')}
            </Text>
            <Text variant="bodyLarge" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {schedule.amount}
            </Text>
          </View>

          {/* Days */}
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('feedingSchedule.fields.days')}
            </Text>
            <View style={styles.daysContainer}>
              {schedule.days.split(',').map((day: string, index: number) => (
                <View
                  key={index}
                  style={[styles.dayBadge, { backgroundColor: theme.colors.primaryContainer }]}
                >
                  <Text
                    variant="bodySmall"
                    style={[styles.dayBadgeText, { color: theme.colors.onPrimaryContainer }]}
                  >
                    {t(`days.${day.trim().toLowerCase()}`)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Status */}
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('feedingSchedule.status') || 'Status'}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: schedule.isActive
                    ? theme.colors.primaryContainer
                    : theme.colors.surfaceDisabled,
                }
              ]}
            >
              <Text
                variant="bodyMedium"
                style={[
                  styles.statusText,
                  {
                    color: schedule.isActive
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onSurfaceDisabled,
                  }
                ]}
              >
                {schedule.isActive ? t('feedingSchedule.active') : t('feedingSchedule.inactive')}
              </Text>
            </View>
          </View>

          {/* Created At */}
          <View style={styles.detailRow}>
            <Text variant="bodyMedium" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('common.created')}
            </Text>
            <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurfaceVariant }]}>
              {new Date(schedule.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
            icon="pencil"
          >
            {t('common.edit')}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    flex: 1,
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  daysContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
  },
  dayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayBadgeText: {
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actions: {
    marginTop: 20,
  },
  editButton: {
    marginBottom: 12,
  },
});
