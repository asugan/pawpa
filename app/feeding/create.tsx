import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FeedingScheduleForm } from '@/components/forms/FeedingScheduleForm';
import { useCreateFeedingSchedule } from '@/lib/hooks/useFeedingSchedules';
import { usePets } from '@/lib/hooks/usePets';

export default function CreateFeedingScheduleScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  // Fetch pets for the dropdown
  const { data: pets = [] } = usePets();

  // Create mutation
  const createMutation = useCreateFeedingSchedule();

  const handleSubmit = async (data: any) => {
    try {
      console.log('Creating feeding schedule:', data);
      await createMutation.mutateAsync(data);

      Alert.alert(
        t('common.success') || 'Success',
        t('feedingSchedule.createSuccess') || 'Feeding schedule created successfully',
        [
          {
            text: t('common.ok'),
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating feeding schedule:', error);
      Alert.alert(
        t('common.error'),
        t('feedingSchedule.errors.submitFailed')
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <FeedingScheduleForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={createMutation.isPending}
        pets={pets}
        testID="create-feeding-schedule-form"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
