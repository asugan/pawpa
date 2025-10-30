import React, { useState } from 'react';
import { View, ScrollView, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Card,
  Text,
  Button,
  IconButton,
  Divider,
  Chip,
  List,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthRecord, useDeleteHealthRecord } from '../../lib/hooks/useHealthRecords';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { TURKCE_LABELS, HEALTH_RECORD_COLORS, HEALTH_RECORD_ICONS } from '../../constants';
import type { HealthRecord } from '../../lib/types';

export default function HealthRecordDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useDeleteHealthRecord();
  const { data: healthRecord, isLoading } = useHealthRecord(id as string);

  
  const handleEdit = () => {
    router.push(`/health/edit/${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Sağlık Kaydını Sil',
      'Bu sağlık kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteMutation.mutateAsync(id as string);
      if (!result.success) {
        throw new Error(result.error || 'Kayıt silinemedi');
      }
      router.back();
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Sağlık kaydı silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    if (!healthRecord) return;

    const shareContent = `
${healthRecord.title}
Tür: ${TURKCE_LABELS.HEALTH_RECORD_TYPES[healthRecord.type as keyof typeof TURKCE_LABELS.HEALTH_RECORD_TYPES]}
Tarih: ${new Date(healthRecord.date).toLocaleDateString('tr-TR')}
${healthRecord.veterinarian ? `Veteriner: Dr. ${healthRecord.veterinarian}` : ''}
${healthRecord.clinic ? `Klinik: ${healthRecord.clinic}` : ''}
${healthRecord.cost ? `Maliyet: ₺${healthRecord.cost.toLocaleString('tr-TR')}` : ''}
${healthRecord.description ? `Açıklama: ${healthRecord.description}` : ''}
${healthRecord.notes ? `Notlar: ${healthRecord.notes}` : ''}
    `.trim();

    try {
      await Share.share({
        message: shareContent,
        title: 'Sağlık Kaydı',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!healthRecord) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          title="Kayıt Bulunamadı"
          description="Sağlık kaydı bulunamadı veya silinmiş"
          icon="alert-circle"
          buttonText="Geri Dön"
          onButtonPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const typeColor = HEALTH_RECORD_COLORS[healthRecord.type as keyof typeof HEALTH_RECORD_COLORS] || '#A8A8A8';
  const typeIcon = HEALTH_RECORD_ICONS[healthRecord.type as keyof typeof HEALTH_RECORD_ICONS] || 'medical-bag';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Actions */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
        />
        <View style={styles.headerActions}>
          <IconButton
            icon="share-variant"
            onPress={handleShare}
          />
          <IconButton
            icon="pencil"
            onPress={handleEdit}
          />
          <IconButton
            icon="delete"
            onPress={handleDelete}
            loading={isDeleting}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleRow}>
              <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, flex: 1 }}>
                {healthRecord.title}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Chip
                icon={typeIcon}
                textStyle={{ fontSize: 12 }}
                compact
              >
                {TURKCE_LABELS.HEALTH_RECORD_TYPES[healthRecord.type as keyof typeof TURKCE_LABELS.HEALTH_RECORD_TYPES]}
              </Chip>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {new Date(healthRecord.date).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>

            {healthRecord.description && (
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginTop: 16, lineHeight: 24 }}>
                {healthRecord.description}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Veteriner & Clinic */}
        {(healthRecord.veterinarian || healthRecord.clinic) && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
                Veteriner Bilgileri
              </Text>

              {healthRecord.veterinarian && (
                <List.Item
                  title={healthRecord.veterinarian}
                  description="Veteriner"
                  left={(props) => <List.Icon {...props} icon="doctor" />}
                />
              )}

              {healthRecord.clinic && (
                <List.Item
                  title={healthRecord.clinic}
                  description="Klinik"
                  left={(props) => <List.Icon {...props} icon="hospital-building" />}
                />
              )}
            </Card.Content>
          </Card>
        )}

        {/* Cost */}
        {healthRecord.cost && (
          <Card style={styles.card}>
            <Card.Content>
              <List.Item
                title={`₺${healthRecord.cost.toLocaleString('tr-TR')}`}
                description="Maliyet"
                left={(props) => <List.Icon {...props} icon="currency-try" />}
              />
            </Card.Content>
          </Card>
        )}

        {/* Vaccination Specific Fields */}
        {healthRecord.type === 'vaccination' && (
          <>
            {(healthRecord.vaccineName || healthRecord.vaccineManufacturer || healthRecord.batchNumber) && (
              <Card style={styles.card}>
                <Card.Content>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
                    Aşı Bilgileri
                  </Text>

                  {healthRecord.vaccineName && (
                    <List.Item
                      title={healthRecord.vaccineName}
                      description="Aşı Adı"
                      left={(props) => <List.Icon {...props} icon="needle" />}
                    />
                  )}

                  {healthRecord.vaccineManufacturer && (
                    <List.Item
                      title={healthRecord.vaccineManufacturer}
                      description="Aşı Üreticisi"
                      left={(props) => <List.Icon {...props} icon="factory" />}
                    />
                  )}

                  {healthRecord.batchNumber && (
                    <List.Item
                      title={healthRecord.batchNumber}
                      description="Parti Numarası"
                      left={(props) => <List.Icon {...props} icon="barcode" />}
                    />
                  )}
                </Card.Content>
              </Card>
            )}

            {healthRecord.nextDueDate && (
              <Card style={styles.card}>
                <Card.Content>
                  <List.Item
                    title={new Date(healthRecord.nextDueDate).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                    description="Sonraki Aşı Tarihi"
                    left={(props) => <List.Icon {...props} icon="calendar-clock" />}
                    right={(props) => (
                      <Chip
                        icon="alert"
                        style={{ alignSelf: 'center' }}
                        textStyle={{ fontSize: 10 }}
                      >
                        {getDaysUntilDue(healthRecord.nextDueDate)} gün
                      </Chip>
                    )}
                  />
                </Card.Content>
              </Card>
            )}
          </>
        )}

        {/* Medication Specific Fields */}
        {healthRecord.type === 'medication' && (
          <>
            {(healthRecord.medicationName || healthRecord.dosage || healthRecord.frequency) && (
              <Card style={styles.card}>
                <Card.Content>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
                    İlaç Bilgileri
                  </Text>

                  {healthRecord.medicationName && (
                    <List.Item
                      title={healthRecord.medicationName}
                      description="İlaç Adı"
                      left={(props) => <List.Icon {...props} icon="pill" />}
                    />
                  )}

                  {healthRecord.dosage && (
                    <List.Item
                      title={healthRecord.dosage}
                      description="Doz"
                      left={(props) => <List.Icon {...props} icon="scale-balance" />}
                    />
                  )}

                  {healthRecord.frequency && (
                    <List.Item
                      title={healthRecord.frequency}
                      description="Sıklık"
                      left={(props) => <List.Icon {...props} icon="clock" />}
                    />
                  )}

                  {healthRecord.startDate && (
                    <List.Item
                      title={new Date(healthRecord.startDate).toLocaleDateString('tr-TR')}
                      description="Başlangıç Tarihi"
                      left={(props) => <List.Icon {...props} icon="calendar-start" />}
                    />
                  )}

                  {healthRecord.endDate && (
                    <List.Item
                      title={new Date(healthRecord.endDate).toLocaleDateString('tr-TR')}
                      description="Bitiş Tarihi"
                      left={(props) => <List.Icon {...props} icon="calendar-end" />}
                    />
                  )}
                </Card.Content>
              </Card>
            )}
          </>
        )}

        {/* Notes */}
        {healthRecord.notes && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
                Notlar
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, lineHeight: 20 }}>
                {healthRecord.notes}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Metadata */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Oluşturulma: {new Date(healthRecord.createdAt).toLocaleString('tr-TR')}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

const styles = {
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
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
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};