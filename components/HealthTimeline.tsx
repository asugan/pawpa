import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Chip, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import { format, formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { Event, HealthRecord, Pet } from '@/lib/types';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { getEventTypeLabel } from '@/constants/eventIcons';
import { useEventReminderStore } from '@/stores/eventReminderStore';
import { useReminderScheduler } from '@/hooks/useReminderScheduler';

type TimelineSeverity = 'low' | 'medium' | 'high';

interface TimelineItem {
  id: string;
  type: 'event' | 'health';
  title: string;
  subtitle?: string;
  date: string;
  status?: 'upcoming' | 'completed' | 'cancelled' | 'missed';
  severity: TimelineSeverity;
  nextDueDate?: string | null;
  petId?: string;
}

interface HealthTimelineProps {
  events: Event[];
  healthRecords: HealthRecord[];
  pets: Pet[];
  loading?: boolean;
}

const UPCOMING_THRESHOLD_DAYS = 7;

const HealthTimeline: React.FC<HealthTimelineProps> = ({
  events,
  healthRecords,
  pets,
  loading,
}) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'tr' ? tr : enUS;
  const statuses = useEventReminderStore((state) => state.statuses);
  const { cancelRemindersForEvent } = useReminderScheduler();

  const getPetName = useCallback(
    (petId?: string) => pets.find((pet) => pet._id === petId)?.name || '',
    [pets]
  );

  const getEventStatus = useCallback(
    (event: Event): TimelineItem['status'] => {
      const localStatus = statuses[event._id]?.status;
      if (localStatus === 'completed' || localStatus === 'cancelled' || localStatus === 'missed') {
        return localStatus;
      }
      const start = new Date(event.startTime);
      return start < new Date() ? 'missed' : 'upcoming';
    },
    [statuses]
  );

  const getEventSeverity = useCallback(
    (event: Event): TimelineSeverity => {
      const status = getEventStatus(event);
      if (status === 'completed') return 'low';
      if (status === 'missed') return 'high';

      const start = new Date(event.startTime);
      const hoursUntil = (start.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntil <= 24) return 'medium';
      return 'low';
    },
    [getEventStatus]
  );

  const getHealthSeverity = (record: HealthRecord): TimelineSeverity => {
    if (!record.nextDueDate) return 'low';

    const dueDate = new Date(record.nextDueDate);
    if (dueDate < new Date()) return 'high';

    const daysUntil = (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntil <= UPCOMING_THRESHOLD_DAYS ? 'medium' : 'low';
  };

  const timelineItems: TimelineItem[] = useMemo(() => {
    const eventItems = events.map<TimelineItem>((event) => ({
      id: event._id,
      type: 'event',
      title: event.title,
      subtitle: getEventTypeLabel(event.type, t),
      date: event.startTime,
      status: getEventStatus(event),
      severity: getEventSeverity(event),
      petId: event.petId,
    }));

    const healthItems = healthRecords.map<TimelineItem>((record) => ({
      id: record._id,
      type: 'health',
      title: record.title,
      subtitle: t(`health.types.${record.type}`, record.type),
      date: record.date,
      status: 'completed',
      severity: getHealthSeverity(record),
      nextDueDate: record.nextDueDate,
      petId: record.petId,
    }));

    return [...eventItems, ...healthItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [events, getEventSeverity, getEventStatus, healthRecords, t]);

  const overdueCount = useMemo(
    () => timelineItems.filter((item) => item.severity === 'high').length,
    [timelineItems]
  );

  useEffect(() => {
    timelineItems
      .filter((item) => item.type === 'event' && item.status === 'missed')
      .forEach((item) => cancelRemindersForEvent(item.id));
  }, [cancelRemindersForEvent, timelineItems]);

  const lastVetVisit = useMemo(() => {
    const vetDates: Date[] = [];
    healthRecords.forEach((record) => {
      if (['vaccination', 'checkup', 'surgery'].includes(record.type)) {
        vetDates.push(new Date(record.date));
      }
    });
    events.forEach((event) => {
      if (event.type === 'vet_visit') {
        vetDates.push(new Date(event.startTime));
      }
    });

    if (vetDates.length === 0) return null;
    return vetDates.sort((a, b) => b.getTime() - a.getTime())[0];
  }, [events, healthRecords]);

  const renderSeverityDot = (severity: TimelineSeverity) => {
    const color =
      severity === 'high'
        ? theme.colors.error
        : severity === 'medium'
          ? '#f59e0b'
          : '#22c55e';

    return <View style={[styles.severityDot, { backgroundColor: color }]} />;
  };

  const renderItem = ({ item }: { item: TimelineItem }) => {
    const petName = getPetName(item.petId);
    const formattedDate = format(new Date(item.date), 'dd MMM, HH:mm', { locale });
    const statusLabel =
      item.type === 'event' && item.status
        ? t(`events.status${item.status.charAt(0).toUpperCase()}${item.status.slice(1)}`)
        : t('health.completed', 'Completed');

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.itemHeader}>
          {renderSeverityDot(item.severity)}
          <View style={styles.itemInfo}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {item.subtitle}{petName ? ` • ${petName}` : ''}
            </Text>
          </View>
          <Chip
            mode="flat"
            textStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}
            style={{ backgroundColor: theme.colors.surfaceVariant }}
          >
            {statusLabel}
          </Chip>
        </View>
        <View style={styles.itemFooter}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {formattedDate}
          </Text>
          {item.nextDueDate && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('healthRecords.nextDue', 'Next due')}: {format(new Date(item.nextDueDate), 'dd MMM', { locale })}
            </Text>
          )}
        </View>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (timelineItems.length === 0) {
    return (
      <EmptyState
        title={t('healthTimeline.emptyTitle', 'No timeline yet')}
        description={t('healthTimeline.emptyDescription', 'Add an event or health record to get started')}
        icon="timeline-text"
      />
    );
  }

  return (
    <View style={styles.container}>
      <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('healthTimeline.overdue', 'Overdue')}
            </Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.error }}>
              {overdueCount}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('healthTimeline.lastVetVisit', 'Last vet visit')}
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              {lastVetVisit
                ? formatDistanceToNow(lastVetVisit, { addSuffix: true, locale })
                : t('healthTimeline.noVetVisit', 'No vet visit yet')}
            </Text>
          </View>
        </View>
      </Card>

      <FlatList
        data={timelineItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    padding: 16,
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemFooter: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default HealthTimeline;
