import React from 'react';
import { View, StyleSheet, Modal as RNModal } from 'react-native';
import { useTheme, Portal, Snackbar, Text, Button } from 'react-native-paper';
import { Event, CreateEventInput } from '../lib/types';
import EventForm from './forms/EventForm';
import { useCreateEvent, useUpdateEvent } from '../lib/hooks/useEvents';
import { usePets } from '../lib/hooks/usePets';

interface EventModalProps {
  visible: boolean;
  event?: Event;
  initialPetId?: string;
  onClose: () => void;
  onSuccess: () => void;
  testID?: string;
}

export function EventModal({
  visible,
  event,
  initialPetId,
  onClose,
  onSuccess,
  testID,
}: EventModalProps) {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  // React Query hooks for server state
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const { data: pets = [] } = usePets();

  const showSnackbar = React.useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  const handleSubmit = React.useCallback(async (data: CreateEventInput) => {
    setLoading(true);
    try {
      if (event) {
        // Event güncelleme
        await updateEventMutation.mutateAsync({
          id: event.id,
          data: {
            ...data,
            endTime: data.endTime || undefined,
            location: data.location || undefined,
            notes: data.notes || undefined,
          }
        });
        showSnackbar('Etkinlik başarıyla güncellendi');
      } else {
        // Yeni event oluşturma
        await createEventMutation.mutateAsync({
          ...data,
          endTime: data.endTime || undefined,
          location: data.location || undefined,
          notes: data.notes || undefined,
        });
        showSnackbar('Etkinlik başarıyla eklendi');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Event operation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'İşlem başarısız oldu';
      showSnackbar(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [event, createEventMutation, updateEventMutation, onSuccess, onClose, showSnackbar]);

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
              {event ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}
            </Text>
            <Button
              mode="text"
              onPress={handleClose}
              disabled={loading}
              compact
            >
              Kapat
            </Button>
          </View>

          <EventForm
            event={event}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={loading}
            initialPetId={initialPetId}
            pets={pets}
            testID="event-form-in-modal"
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

export default EventModal;
