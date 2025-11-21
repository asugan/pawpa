import { Card, Chip, IconButton, ListItem, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../../components/EmptyState';
import { HealthRecordForm } from '../../components/forms/HealthRecordForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HEALTH_RECORD_COLORS, HEALTH_RECORD_ICONS, TURKCE_LABELS } from '../../constants';
import { useDeleteHealthRecord, useHealthRecord } from '../../lib/hooks/useHealthRecords';

export default function HealthRecordDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const deleteMutation = useDeleteHealthRecord();
  const { data: healthRecord, isLoading, refetch } = useHealthRecord(id as string);


  const handleEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    refetch();
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
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
      await deleteMutation.mutateAsync(id as string);
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
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Card */}
        <Card style={styles.card}>
          <View style={styles.cardContent}>
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
          </View>
        </Card>

        {/* Veteriner & Clinic */}
        {(healthRecord.veterinarian || healthRecord.clinic) && (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
                Veteriner Bilgileri
              </Text>

              {healthRecord.veterinarian && (
                <ListItem
                  title={healthRecord.veterinarian}
                  description="Veteriner"
                  left={<MaterialCommunityIcons name="doctor" size={24} color={theme.colors.onSurfaceVariant} />}
                />
              )}

              {healthRecord.clinic && (
                <ListItem
                  title={healthRecord.clinic}
                  description="Klinik"
                  left={<MaterialCommunityIcons name="hospital-building" size={24} color={theme.colors.onSurfaceVariant} />}
                />
              )}
            </View>
          </Card>
        )}

        {/* Cost */}
        {healthRecord.cost && (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <ListItem
                title={`₺${healthRecord.cost.toLocaleString('tr-TR')}`}
                description="Maliyet"
                left={<MaterialCommunityIcons name="currency-try" size={24} color={theme.colors.onSurfaceVariant} />}
              />
            </View>
          </Card>
        )}

        {/* Vaccination Specific Fields */}
        {healthRecord.type === 'vaccination' && (
          <>
            {(healthRecord.vaccineName || healthRecord.vaccineManufacturer || healthRecord.batchNumber) && (
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
                    Aşı Bilgileri
                  </Text>

                  {healthRecord.vaccineName && (
                    <ListItem
                      title={healthRecord.vaccineName}
                      description="Aşı Adı"
                      left={<MaterialCommunityIcons name="needle" size={24} color={theme.colors.onSurfaceVariant} />}
                    />
                  )}

                  {healthRecord.vaccineManufacturer && (
                    <ListItem
                      title={healthRecord.vaccineManufacturer}
                      description="Aşı Üreticisi"
                      left={<MaterialCommunityIcons name="factory" size={24} color={theme.colors.onSurfaceVariant} />}
                    />
                  )}

                  {healthRecord.batchNumber && (
                    <ListItem
                      title={healthRecord.batchNumber}
                      description="Parti Numarası"
                      left={<MaterialCommunityIcons name="barcode" size={24} color={theme.colors.onSurfaceVariant} />}
                    />
                  )}
                </View>
              </Card>
            )}

            {healthRecord.nextDueDate && (
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  <ListItem
                    title={new Date(healthRecord.nextDueDate).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                    description="Sonraki Aşı Tarihi"
                    left={<MaterialCommunityIcons name="calendar-clock" size={24} color={theme.colors.onSurfaceVariant} />}
                    right={healthRecord.nextDueDate ? (
                      <Chip
                        icon="alert"
                        style={{ alignSelf: 'center' }}
                        textStyle={{ fontSize: 10 }}
                      >
                        {getDaysUntilDue(healthRecord.nextDueDate)} gün
                      </Chip>
                    ) : null}
                  />
                </View>
              </Card>
            )}
          </>
        )}

        {/* Medication Specific Fields */}
        {healthRecord.type === 'medication' && (
          <>
            {(healthRecord.medicationName || healthRecord.dosage || healthRecord.frequency) && (
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
                    İlaç Bilgileri
                  </Text>

                  {healthRecord.medicationName && (
                    <ListItem
                      title={healthRecord.medicationName}
                      description="İlaç Adı"
                      left={<MaterialCommunityIcons name="pill" size={24} color={theme.colors.onSurfaceVariant} />}
                    />
                  )}

                  {healthRecord.dosage && (
                    <ListItem
                      title={healthRecord.dosage}
                      description="Doz"
                      left={<MaterialCommunityIcons name="scale-balance" size={24} color={theme.colors.onSurfaceVariant} />}
                    />
                  )}

                  {healthRecord.frequency && (
                    <ListItem
                      title={healthRecord.frequency}
                      description="Sıklık"
                      left={<MaterialCommunityIcons name="clock" size={24} color={theme.colors.onSurfaceVariant} />}
                    />
                  )}

                  {healthRecord.startDate && (
                    <ListItem
                      title={new Date(healthRecord.startDate).toLocaleDateString('tr-TR')}
                      description="Başlangıç Tarihi"
                      left={<MaterialCommunityIcons name="calendar-start" size={24} color={theme.colors.onSurfaceVariant} />}
                    />
                  )}

                  {healthRecord.endDate && (
                    <ListItem
                      title={new Date(healthRecord.endDate).toLocaleDateString('tr-TR')}
                      description="Bitiş Tarihi"
                      left={<MaterialCommunityIcons name="calendar-end" size={24} color={theme.colors.onSurfaceVariant} />}
                    />
                  )}
                </View>
              </Card>
            )}
          </>
        )}

        {/* Notes */}
        {healthRecord.notes && (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
                Notlar
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, lineHeight: 20 }}>
                {healthRecord.notes}
              </Text>
            </View>
          </Card>
        )}

        {/* Metadata */}
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Oluşturulma: {new Date(healthRecord.createdAt).toLocaleString('tr-TR')}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Edit Modal */}
      {healthRecord && (
        <HealthRecordForm
          petId={healthRecord.petId}
          visible={isEditModalVisible}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
          initialData={healthRecord}
        />
      )}
    </SafeAreaView>
  );
}

function getDaysUntilDue(dueDate: string | Date): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
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
  cardContent: {
    padding: 16,
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
});