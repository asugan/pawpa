import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, Chip } from '@/components/ui';
import { useTheme , gradients, gradientsDark } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useExpenseStats } from '../lib/hooks/useExpenses';
import { ExpenseCategory } from '../lib/types';

interface ExpenseOverviewProps {
  petId?: string;
}

const ExpenseOverview: React.FC<ExpenseOverviewProps> = ({ petId }) => {
  const { theme } = useTheme();
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
    ? stats.byCategory.reduce((prev: { category: ExpenseCategory; total: number; count: number }, current: { category: ExpenseCategory; total: number; count: number }) => (prev.total > current.total ? prev : current))
    : null;

  return (
    <Pressable onPress={() => router.push('/(tabs)/finance')}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={4}>
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <LinearGradient
              colors={theme.dark ? gradientsDark.accent : gradients.accent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <Text style={styles.emojiIcon}>💰</Text>
            </LinearGradient>
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
              <LinearGradient
                colors={theme.dark ? gradientsDark.primary : gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.amountContainer}
              >
                <Text variant="headlineSmall" style={[styles.statValue, { color: '#FFFFFF', fontWeight: '800' }]}>
                  {stats.byCurrency.map((c: { currency: string; total: number }) => formatCurrency(c.total, c.currency)).join(' + ')}
                </Text>
                <Text variant="bodySmall" style={{ color: '#FFFFFF', opacity: 0.9, fontWeight: '600' }}>
                  {t('expenses.totalSpent', 'Total Spent')}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ fontWeight: '800' }}>
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
                mode="flat"
                compact
                style={[styles.chip, { backgroundColor: theme.colors.secondaryContainer }]}
                textStyle={{ fontWeight: '600' }}
              >
                🏷️ {String(t(`expenses.categories.${topCategory.category}`, topCategory.category))} •{' '}
                {formatCurrency(topCategory.total, stats.byCurrency[0]?.currency || 'TRY')}
              </Chip>
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    padding: 16,
  },
  card: {
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emojiIcon: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  amountContainer: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
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
