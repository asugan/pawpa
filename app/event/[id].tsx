import { Button, Card, Chip, Divider, IconButton, Portal, Snackbar, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { format } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Hooks and Services
import { useCreateEvent, useDeleteEvent, useEvent, useUpdateEvent } from '@/lib/hooks/useEvents';
import { usePet } from '@/lib/hooks/usePets';

// Components
import EventActions from '@/components/EventActions';
import LoadingSpinner from '@/components/LoadingSpinner';

// Utils
import { getEventTypeColor, getEventTypeIcon, getEventTypeLabel } from '@/constants/eventIcons';

export default function EventDetailScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const locale = i18n.language === 'tr' ? tr : enUS;

  // Hooks
  const { data: event, isLoading, error } = useEvent(id || '');
  const { data: pet } = usePet(event?.petId || '');
  const deleteEventMutation = useDeleteEvent();
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();

  // Local state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [eventStatus, setEventStatus] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleEdit = () => {
    if (event) {
      // Navigate to calendar screen with event editing
      router.push({
        pathname: '/(tabs)/calendar',
        params: { editEventId: event.id }
      });
    }
  };

  const handleDelete = () => {
    if (!event) return;

    Alert.alert(
      t('events.deleteEvent'),
      t('events.deleteEventConfirmation', { title: event.title }),
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
              await deleteEventMutation.mutateAsync(event.id);
              showSnackbar(t('events.eventDeleted'));
              setTimeout(() => {
                router.back();
              }, 1500);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : t('events.deleteEventError');
              showSnackbar(errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleDuplicate = async () => {
    if (!event) return;

    try {
      // Create a copy of the event with a new start time (next day)
      const newStartTime = new Date(event.startTime);
      newStartTime.setDate(newStartTime.getDate() + 1);

      const newEndTime = event.endTime ? new Date(event.endTime) : null;
      if (newEndTime) {
        newEndTime.setDate(newEndTime.getDate() + 1);
      }

      const duplicatedEvent = {
        petId: event.petId,
        type: event.type,
        title: `${event.title} (${t('events.copy')})`,
        description: event.description,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime?.toISOString() || undefined,
        location: event.location,
        reminder: event.reminder,
        notes: event.notes,
      };
      await createEventMutation.mutateAsync(duplicatedEvent);
      showSnackbar(t('events.eventDuplicated'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('events.duplicateEventError');
      showSnackbar(errorMessage);
    }
  };

  const handleShare = async () => {
    if (!event) return;

    try {
      const eventDate = format(new Date(event.startTime), 'dd MMMM yyyy', { locale });
      const eventTime = format(new Date(event.startTime), 'HH:mm', { locale });

      const shareMessage = `
📅 ${event.title}

🐾 ${pet?.name || t('events.pet')}
📍 ${event.location || t('events.noLocation')}
🕐 ${eventDate} - ${eventTime}

${event.description || ''}

${t('events.sharedFrom')} PawPa
      `.trim();

      await Share.share({
        message: shareMessage,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  const handleStatusChange = async (status: 'upcoming' | 'completed' | 'cancelled') => {
    setEventStatus(status);
    showSnackbar(t(`events.status${status.charAt(0).toUpperCase()}${status.slice(1)}`));

    // In a real app, you would update this on the backend
    // For now, we'll just update local state
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!event || error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, textAlign: 'center' }}>
            {t('events.eventNotFound')}
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            {t('common.goBack')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const eventTypeColor = getEventTypeColor(event.type);
  const eventTypeIcon = getEventTypeIcon(event.type);
  const eventTypeLabel = getEventTypeLabel(event.type, t);

  const formatEventDate = () => {
    return format(new Date(event.startTime), 'dd MMMM yyyy, EEEE', { locale });
  };

  const formatEventTime = () => {
    const startTime = format(new Date(event.startTime), 'HH:mm', { locale });
    if (event.endTime) {
      const endTime = format(new Date(event.endTime), 'HH:mm', { locale });
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
          style={styles.headerButton}
        />
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          {t('events.eventDetails')}
        </Text>
        <View style={styles.headerActions}>
          <EventActions
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onShare={handleShare}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Type and Title Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: eventTypeColor, borderWidth: 2 }]}>
          <View style={styles.cardContent}>
            <View style={styles.eventTypeContainer}>
              <View style={[styles.eventTypeIconLarge, { backgroundColor: eventTypeColor }]}>
                <Text style={styles.eventTypeIconText}>
                  {eventTypeIcon === 'food' ? '🍽️' :
                   eventTypeIcon === 'run' ? '🏃' :
                   eventTypeIcon === 'content-cut' ? '✂️' :
                   eventTypeIcon === 'tennis' ? '🎾' :
                   eventTypeIcon === 'school' ? '🎓' :
                   eventTypeIcon === 'hospital' ? '🏥' :
                   eventTypeIcon === 'walk' ? '🚶' :
                   eventTypeIcon === 'water' ? '🛁' : '📅'}
                </Text>
              </View>
              <View style={styles.eventTypeInfo}>
                <Text variant="labelLarge" style={[styles.eventTypeLabel, { color: eventTypeColor }]}>
                  {eventTypeLabel}
                </Text>
                <Chip
                  mode="flat"
                  textStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}
                  style={[styles.statusChip, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                  {t(`events.status${eventStatus.charAt(0).toUpperCase()}${eventStatus.slice(1)}`)}
                </Chip>
              </View>
            </View>

            <Text variant="headlineSmall" style={[styles.eventTitle, { color: theme.colors.onSurface }]}>
              {event.title}
            </Text>

            {event.description && (
              <Text variant="bodyMedium" style={[styles.eventDescription, { color: theme.colors.onSurfaceVariant }]}>
                {event.description}
              </Text>
            )}
          </View>
        </Card>

        {/* Date and Time Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              📅 {t('events.dateAndTime')}
            </Text>

            <View style={styles.infoRow}>
              <Text variant="bodyLarge" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('events.date')}:
              </Text>
              <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {formatEventDate()}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyLarge" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('events.time')}:
              </Text>
              <Text variant="bodyLarge" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {formatEventTime()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Pet Information Card */}
        {pet && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.cardContent}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                🐾 {t('events.pet')}
              </Text>

              <View style={styles.petInfoRow}>
                <Text variant="bodyLarge" style={[styles.petName, { color: theme.colors.onSurface }]}>
                  {pet.name}
                </Text>
                <Chip
                  mode="flat"
                  textStyle={{ color: theme.colors.onSurfaceVariant }}
                  style={{ backgroundColor: theme.colors.surfaceVariant }}
                >
                  {t(pet.type)}
                </Chip>
              </View>

              <Button
                mode="outlined"
                icon="paw"
                onPress={() => router.push(`/pet/${pet.id}`)}
                style={styles.viewPetButton}
              >
                {t('events.viewPetProfile')}
              </Button>
            </View>
          </Card>
        )}

        {/* Location Card */}
        {event.location && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.cardContent}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                📍 {t('events.location')}
              </Text>

              <Text variant="bodyLarge" style={[styles.locationText, { color: theme.colors.onSurface }]}>
                {event.location}
              </Text>
            </View>
          </Card>
        )}

        {/* Reminder Card */}
        {event.reminder && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.cardContent}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                🔔 {t('events.reminder')}
              </Text>

              <Text variant="bodyMedium" style={[styles.reminderText, { color: theme.colors.onSurfaceVariant }]}>
                {t('events.reminderEnabled')}
              </Text>
            </View>
          </Card>
        )}

        {/* Notes Card */}
        {event.notes && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.cardContent}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                📝 {t('events.notes')}
              </Text>

              <Text variant="bodyMedium" style={[styles.notesText, { color: theme.colors.onSurface }]}>
                {event.notes}
              </Text>
            </View>
          </Card>
        )}

        {/* Status Management Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              🔄 {t('events.status')}
            </Text>

            <View style={styles.statusButtons}>
              <Button
                mode={eventStatus === 'upcoming' ? 'contained' : 'outlined'}
                onPress={() => handleStatusChange('upcoming')}
                style={styles.statusButton}
              >
                {t('events.statusUpcoming')}
              </Button>
              <Button
                mode={eventStatus === 'completed' ? 'contained' : 'outlined'}
                onPress={() => handleStatusChange('completed')}
                style={styles.statusButton}
              >
                {t('events.statusCompleted')}
              </Button>
              <Button
                mode={eventStatus === 'cancelled' ? 'contained' : 'outlined'}
                onPress={() => handleStatusChange('cancelled')}
                style={styles.statusButton}
              >
                {t('events.statusCancelled')}
              </Button>
            </View>
          </View>
        </Card>

        {/* Timestamps */}
        <View style={styles.timestampsContainer}>
          <Text variant="bodySmall" style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
            {t('common.created')}: {format(new Date(event.createdAt), 'dd MMM yyyy HH:mm', { locale })}
          </Text>
          <Text variant="bodySmall" style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
            {t('common.updated')}: {format(new Date(event.updatedAt), 'dd MMM yyyy HH:mm', { locale })}
          </Text>
        </View>
      </ScrollView>

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{
            ...styles.snackbar,
            backgroundColor: snackbarMessage.includes(t('common.error')) ? theme.colors.error : theme.colors.primary
          }}
          message={snackbarMessage}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerButton: {
    margin: 0,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventTypeIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  eventTypeIconText: {
    fontSize: 32,
  },
  eventTypeInfo: {
    flex: 1,
    gap: 8,
  },
  eventTypeLabel: {
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  statusChip: {
    alignSelf: 'flex-start',
    height: 28,
  },
  eventTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  eventDescription: {
    lineHeight: 22,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    flex: 1,
    fontWeight: '500',
  },
  infoValue: {
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 8,
  },
  petInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  petName: {
    fontWeight: '600',
  },
  viewPetButton: {
    marginTop: 8,
  },
  locationText: {
    lineHeight: 22,
  },
  reminderText: {
    lineHeight: 20,
  },
  notesText: {
    lineHeight: 22,
  },
  statusButtons: {
    gap: 12,
  },
  statusButton: {
    width: '100%',
  },
  timestampsContainer: {
    marginTop: 16,
    marginBottom: 32,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  backButton: {
    marginTop: 16,
  },
  snackbar: {
    marginBottom: 16,
  },
});
