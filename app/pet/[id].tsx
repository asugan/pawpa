import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Avatar,
  Divider,
  useTheme,
  Portal,
  Snackbar,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pet } from '../../lib/types';
import { usePet, useDeletePet } from '../../lib/hooks/usePets';
import { useEvents } from '../../lib/hooks/useEvents';
import PetModal from '../../components/PetModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { EventCard } from '../../components/EventCard';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

export default function PetDetailScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // ✅ React Query hooks for server state
  const { data: pet, isLoading, error } = usePet(id || '');
  const { data: events, isLoading: eventsLoading } = useEvents(id || '');
  const deletePetMutation = useDeletePet();
  const locale = i18n.language === 'tr' ? tr : enUS;

  const [modalVisible, setModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (error) {
      showSnackbar('Pet yüklenirken hata oluştu');
    }
  }, [error]);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleEdit = () => {
    if (pet) {
      setModalVisible(true);
    }
  };

  const handleDelete = () => {
    if (!pet) return;

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
              setTimeout(() => {
                router.back();
              }, 1500);
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
    showSnackbar('Pet başarıyla güncellendi');
  };

  const getPetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cat':
        return 'cat';
      case 'dog':
        return 'dog';
      case 'bird':
        return 'bird';
      case 'fish':
        return 'fish';
      case 'rabbit':
        return 'rabbit';
      case 'hamster':
        return 'hamster';
      case 'reptile':
        return 'lizard';
      default:
        return 'paw';
    }
  };

  const getPetTypeLabel = (type: string) => {
    const typeKey = type.toLowerCase();
    return t(typeKey, type);
  };

  const getAgeText = (birthDate: string | Date | null | undefined) => {
    if (!birthDate) return t('pets.ageUnknown');

    const today = new Date();
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : new Date(birthDate);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());

    if (months < 12) {
      return `${months} ${t('pets.months')}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years} ${t('pets.years')} ${remainingMonths} ${t('pets.months')}` : `${years} ${t('pets.years')}`;
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Belirtilmemiş';

    const date = typeof dateString === 'string' ? new Date(dateString) : new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, textAlign: 'center' }}>
            Pet bulunamadı
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Geri Dön
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          {pet.name}
        </Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="pencil"
            size={24}
            onPress={handleEdit}
            iconColor={theme.colors.primary}
          />
          <IconButton
            icon="delete"
            size={24}
            onPress={handleDelete}
            iconColor={theme.colors.error}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pet Photo and Basic Info */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.profileSection}>
            <View style={styles.profileHeader}>
              {pet.profilePhoto ? (
                <Avatar.Image
                  size={80}
                  source={{ uri: pet.profilePhoto }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Icon
                  size={80}
                  icon={getPetIcon(pet.type)}
                  style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
                />
              )}
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={[styles.petName, { color: theme.colors.onSurface }]}>
                  {pet.name}
                </Text>
                <Text variant="titleMedium" style={[styles.petType, { color: theme.colors.onSurfaceVariant }]}>
                  {getPetTypeLabel(pet.type)}
                </Text>
                <Text variant="bodyMedium" style={[styles.petBreed, { color: theme.colors.onSurfaceVariant }]}>
                  {pet.breed || 'Cinsi belirtilmemiş'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Detailed Information */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Detaylı Bilgiler
            </Text>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Cinsiyet:
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {pet.gender === 'male' ? 'Erkek' : pet.gender === 'female' ? 'Dişi' : 'Belirtilmemiş'}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Doğum Tarihi:
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {formatDate(pet.birthDate)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Yaş:
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {getAgeText(pet.birthDate)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Kilo:
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {pet.weight ? `${pet.weight} kg` : 'Belirtilmemiş'}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Eklenme Tarihi:
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {formatDate(pet.createdAt)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Upcoming Events Section */}
        {!eventsLoading && events && events.length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  📅 Yaklaşan Etkinlikler
                </Text>
                <Button
                  mode="text"
                  onPress={() => router.push('/(tabs)/calendar')}
                  compact
                  textColor={theme.colors.primary}
                >
                  {t('common.viewAll')}
                </Button>
              </View>

              {/* Show first 3 upcoming events */}
              {events
                .filter(event => new Date(event.startTime) >= new Date())
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .slice(0, 3)
                .map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    showPetInfo={false}
                    showActions={false}
                    compact
                  />
                ))}

              {events.filter(event => new Date(event.startTime) >= new Date()).length === 0 && (
                <Text variant="bodyMedium" style={[styles.noEventsText, { color: theme.colors.onSurfaceVariant }]}>
                  {t('events.noUpcomingEvents')}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Hızlı İşlemler
            </Text>

            <View style={styles.quickActions}>
              <Button
                mode="contained"
                icon="calendar-plus"
                onPress={() => router.push({
                  pathname: '/(tabs)/calendar',
                  params: { petId: pet.id, action: 'create' }
                })}
                style={styles.quickActionButton}
                buttonColor={theme.colors.primary}
              >
                {t('events.addEvent')}
              </Button>

              <Button
                mode="outlined"
                icon="calendar"
                onPress={() => router.push('/(tabs)/calendar')}
                style={styles.quickActionButton}
              >
                {t('calendar.calendar')}
              </Button>

              <Button
                mode="outlined"
                icon="heart"
                onPress={() => router.push('/(tabs)/health')}
                style={styles.quickActionButton}
              >
                {t('health.healthRecords')}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <PetModal
        visible={modalVisible}
        pet={pet}
        onClose={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
      />

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
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
  },
  profileSection: {
    alignItems: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  petName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  petType: {
    marginBottom: 2,
  },
  petBreed: {
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 0,
  },
  noEventsText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
    marginVertical: 4,
  },
  quickActions: {
    gap: 12,
  },
  quickActionButton: {
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  snackbar: {
    marginBottom: 16,
  },
});