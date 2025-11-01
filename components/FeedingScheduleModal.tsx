import React from 'react';
import { View, StyleSheet, Modal as RNModal } from 'react-native';
import { useTheme, Portal, Snackbar, Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { FeedingSchedule, Pet } from '../lib/types';
import { FeedingScheduleForm } from './forms/FeedingScheduleForm';
import {
  useCreateFeedingSchedule,
  useUpdateFeedingSchedule,
} from '../lib/hooks/useFeedingSchedules';

interface FeedingScheduleModalProps {
  visible: boolean;
  schedule?: FeedingSchedule;
  initialPetId?: string;
  onClose: () => void;
  onSuccess: () => void;
  pets?: Pet[];
  testID?: string;
}

export function FeedingScheduleModal({
  visible,
  schedule,
  initialPetId,
  onClose,
  onSuccess,
  pets = [],
  testID,
}: FeedingScheduleModalProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  // React Query hooks for server state
  const createMutation = useCreateFeedingSchedule();
  const updateMutation = useUpdateFeedingSchedule();

  const showSnackbar = React.useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  const handleSubmit = React.useCallback(async (data: any) => {
    setLoading(true);
    try {
      if (schedule) {
        // Update existing schedule
        await updateMutation.mutateAsync({
          id: schedule.id,
          data,
        });
        showSnackbar(t('feedingSchedule.updateSuccess') || 'Besleme programı başarıyla güncellendi');
      } else {
        // Create new schedule
        await createMutation.mutateAsync(data);
        showSnackbar(t('feedingSchedule.createSuccess') || 'Besleme programı başarıyla eklendi');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Feeding schedule operation error:', error);
      const errorMessage = error instanceof Error ? error.message : t('feedingSchedule.errors.submitFailed') || 'İşlem başarısız oldu';
      showSnackbar(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [schedule, createMutation, updateMutation, onSuccess, onClose, showSnackbar, t]);

  const handleClose = React.useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [onClose, loading]);

  const handleSnackbarDismiss = React.useCallback(() => {
    setSnackbarVisible(false);
  }, []);

  return (
    <>
      <RNModal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onDismiss={handleClose}
        onRequestClose={handleClose}
        testID={testID}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              {schedule ? t('feedingSchedule.editTitle') : t('feedingSchedule.createTitle')}
            </Text>
            <Button
              mode="text"
              onPress={handleClose}
              disabled={loading}
              compact
            >
              {t('common.close') || 'Kapat'}
            </Button>
          </View>

          <FeedingScheduleForm
            schedule={schedule}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={loading}
            initialPetId={initialPetId}
            pets={pets}
            testID="feeding-schedule-form-in-modal"
          />
        </View>
      </RNModal>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  snackbar: {
    marginBottom: 16,
  },
});

export default FeedingScheduleModal;
