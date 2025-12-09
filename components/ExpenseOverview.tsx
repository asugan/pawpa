import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useRecentExpenses } from '../lib/hooks/useRecentExpenses';
import CompactExpenseItem from './CompactExpenseItem';

/**
 * ExpenseOverview - Displays the most recent 3 expenses across all pets
 * Provides quick visibility into spending activity without budget information
 */
const ExpenseOverview: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const { data: recentExpenses = [], isLoading } = useRecentExpenses();

  if (isLoading || recentExpenses.length === 0) {
    return null;
  }

  return (
    <Pressable onPress={() => router.push('/(tabs)/finance')}>
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
          },
        ]}
        elevation={4}
      >
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {t('expenses.recent', 'Recent Expenses')}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('expenses.lastThree', 'Last 3 expenses')}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="history"
              size={20}
              color={theme.colors.onSurfaceVariant}
              style={{ marginLeft: 8 }}
            />
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginLeft: 8 }}
            />
          </View>

          <View style={styles.recentExpensesList}>
            {recentExpenses.slice(0, 3).map((expense, index) => (
              <View key={expense.id}>
                <CompactExpenseItem
                  expense={expense}
                />
                {index < 2 && recentExpenses.length > index + 1 && (
                  <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
                )}
              </View>
            ))}
          </View>
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  recentExpensesList: {
    gap: 0,
  },
  separator: {
    height: 1,
    marginVertical: 2,
    marginHorizontal: 8,
    alignSelf: 'stretch',
  },
});

export default ExpenseOverview;