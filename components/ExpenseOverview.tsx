import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, useTheme, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useExpenseStats } from '../lib/hooks/useExpenses';

interface ExpenseOverviewProps {
  petId?: string;
}

const ExpenseOverview: React.FC<ExpenseOverviewProps> = ({ petId }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const { data: stats, isLoading } = useExpenseStats({ petId });

  const formatCurrency = (amount: number, currency: string): string => {
    const currencySymbols: Record<string, string> = {
      TRY: '₺',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    const symbol = currencySymbols[currency] || currency;
    const formatted = amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return `${symbol}${formatted}`;
  };

  if (isLoading || !stats) {
    return null;
  }

  const topCategory = stats.byCategory.length > 0
    ? stats.byCategory.reduce((prev, current) => (prev.total > current.total ? prev : current))
    : null;

  return (
    <Pressable onPress={() => router.push('/expenses')}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="cash-multiple"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {t('expenses.title', 'Expenses')}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('expenses.thisMonth', 'This month')}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.primary }]}>
                {stats.byCurrency.map((c) => formatCurrency(c.total, c.currency)).join(' + ')}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('expenses.totalSpent', 'Total Spent')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                {stats.count}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('expenses.transactions', 'Transactions')}
              </Text>
            </View>
          </View>

          {topCategory && (
            <View style={styles.topCategory}>
              <Chip
                mode="outlined"
                compact
                icon="tag"
                style={styles.chip}
              >
                {t(`expenses.categories.${topCategory.category}`, topCategory.category)} •{' '}
                {formatCurrency(topCategory.total, stats.byCurrency[0]?.currency || 'TRY')}
              </Chip>
            </View>
          )}
        </Card.Content>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  topCategory: {
    marginTop: 8,
    alignItems: 'center',
  },
  chip: {
    alignSelf: 'center',
  },
});

export default ExpenseOverview;
