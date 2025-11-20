import { Button, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { dateUtils } from '@/lib/utils/date';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Event } from '../lib/types';
import EventCard from './EventCard';

interface UpcomingEventsProps {
  events: Event[];
  loading?: boolean;
  onRefresh?: () => void;
  onEventPress?: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
  onEventDelete?: (event: Event) => void;
  maxEvents?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  daysToShow?: number;
  showPetInfo?: boolean;
  showActions?: boolean;
  compact?: boolean;
  title?: string;
  emptyMessage?: string;
  testID?: string;
}

export function UpcomingEvents({
  events,
  loading = false,
  onRefresh,
  onEventPress,
  onEventEdit,
  onEventDelete,
  maxEvents = 5,
  showViewAll = true,
  onViewAll,
  daysToShow = 7,
  showPetInfo = true,
  showActions = true,
  compact = false,
  title,
  emptyMessage,
  testID,
}: UpcomingEventsProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Filter and sort upcoming events
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const endDate = dateUtils.endOfDay(dateUtils.addDays(now, daysToShow));

    return events
      .filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate >= now && eventDate <= endDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.startTime);
        const dateB = new Date(b.startTime);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, maxEvents);
  }, [events, daysToShow, maxEvents]);

  // Group events by time categories
  const eventGroups = useMemo(() => {
    const now = new Date();
    const inOneHour = dateUtils.addHours(now, 1);
    const tomorrow = dateUtils.startOfDay(dateUtils.addDays(now, 1));

    const groups = {
      now: [] as Event[],
      today: [] as Event[],
      tomorrow: [] as Event[],
      thisWeek: [] as Event[],
    };

    upcomingEvents.forEach(event => {
      const eventDate = new Date(event.startTime);

      if (dateUtils.isAfter(eventDate, now) && eventDate <= inOneHour) {
        groups.now.push(event);
      } else if (dateUtils.isToday(eventDate)) {
        groups.today.push(event);
      } else if (dateUtils.isTomorrow(eventDate)) {
        groups.tomorrow.push(event);
      } else {
        groups.thisWeek.push(event);
      }
    });

    return groups;
  }, [upcomingEvents]);

  // Format group title
  const formatGroupTitle = (group: string) => {
    switch (group) {
      case 'now':
        return t('upcomingEvents.now');
      case 'today':
        return t('upcomingEvents.today');
      case 'tomorrow':
        return t('upcomingEvents.tomorrow');
      case 'thisWeek':
        return t('upcomingEvents.thisWeek');
      default:
        return '';
    }
  };

  // Render event item
  const renderEvent = ({ item }: { item: Event }) => (
    <EventCard
      event={item}
      onPress={onEventPress}
      onEdit={onEventEdit}
      onDelete={onEventDelete}
      showPetInfo={showPetInfo}
      showActions={showActions}
      compact={compact}
      testID={`upcoming-event-${item.id}`}
    />
  );

  // Render group section
  const renderSection = ({ title, events }: { title: string; events: Event[] }) => {
    if (events.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text
            variant="labelMedium"
            style={[styles.sectionTitle, { color: theme.colors.primary }]}
          >
            {formatGroupTitle(title)}
          </Text>
          <Text
            variant="labelSmall"
            style={[styles.sectionCount, { color: theme.colors.onSurfaceVariant }]}
          >
            {events.length}
          </Text>
        </View>
        {events.map((event) => (
          <View key={event.id} style={styles.eventItem}>
            {renderEvent({ item: event })}
          </View>
        ))}
      </View>
    );
  };

  // Render list header
  const renderHeader = () => {
    if (!title && !showViewAll) return null;

    return (
      <View style={styles.header}>
        {title && (
          <Text
            variant="titleLarge"
            style={[styles.headerTitle, { color: theme.colors.onSurface }]}
          >
            {title}
          </Text>
        )}
        {showViewAll && onViewAll && (
          <Button
            mode="text"
            onPress={onViewAll}
            compact
            style={styles.viewAllButton}
          >
            {t('upcomingEvents.viewAll')}
          </Button>
        )}
      </View>
    );
  };

  // Empty state
  if (!loading && upcomingEvents.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.surface }]} testID={testID}>
        <Text style={[styles.emptyIcon, { fontSize: 48 }]}>📅</Text>
        <Text
          variant="titleMedium"
          style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
        >
          {title || t('upcomingEvents.noUpcomingTitle')}
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
        >
          {emptyMessage || t('upcomingEvents.noUpcomingMessage')}
        </Text>
        {onRefresh && (
          <Button
            mode="outlined"
            onPress={onRefresh}
            style={styles.refreshButton}
          >
            {t('upcomingEvents.refresh')}
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID={testID}>
      {/* Header */}
      {renderHeader()}

      {/* Events List */}
      <FlatList
        data={upcomingEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          ) : undefined
        }
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
              />
              <Text
                variant="labelSmall"
                style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}
              >
                {t('upcomingEvents.loading')}
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      {/* View All Footer */}
      {showViewAll && onViewAll && upcomingEvents.length > 0 && (
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={onViewAll}
            style={styles.viewAllFooterButton}
          >
            {t('upcomingEvents.viewAllEvents', { count: events.length })}
          </Button>
        </View>
      )}
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: '600',
  },
  viewAllButton: {
    marginLeft: 'auto',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  eventItem: {
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    paddingTop: 0,
  },
  viewAllFooterButton: {
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    margin: 16,
    borderRadius: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    alignSelf: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
  },
});

export default UpcomingEvents;