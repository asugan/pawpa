import { Card, Chip, IconButton, Text } from '@/components/ui';
import { getExpenseCategoryConfig } from '@/constants/expenseConfig';
import { useTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Expense } from '../lib/types';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const categoryConfig = getExpenseCategoryConfig(expense.category);

  const formattedDate = React.useMemo(() => {
    try {
      return formatDate(expense.date, 'PPP');
    } catch {
      return expense.date.toString();
    }
  }, [expense.date]);

  const cardContent = (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: categoryConfig.color.startsWith('#') ? categoryConfig.color : theme.colors[categoryConfig.color as keyof typeof theme.colors] }]}>
              <MaterialCommunityIcons
                name={categoryConfig.icon as any}
                size={24}
                color={theme.colors.onPrimaryContainer}
              />
            </View>
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {t(`expenses.categories.${expense.category}`, expense.category)}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {formattedDate}
              </Text>
            </View>
          </View>
          <Text variant="titleLarge" style={[styles.amount, { color: theme.colors.primary }]}>
            {formatCurrency(expense.amount, expense.currency)}
          </Text>
        </View>

        {expense.description && (
          <Text
            variant="bodyMedium"
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={2}
          >
            {expense.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.tags}>
            {expense.paymentMethod && (
              <Chip
                mode="outlined"
                compact
                style={styles.chip}
                textStyle={{ fontSize: 11 }}
              >
                {t(`expenses.paymentMethods.${expense.paymentMethod}`, expense.paymentMethod)}
              </Chip>
            )}
            {expense.vendor && (
              <Chip
                mode="outlined"
                compact
                style={styles.chip}
                textStyle={{ fontSize: 11 }}
                icon="store"
              >
                {expense.vendor}
              </Chip>
            )}
          </View>

          {showActions && (
            <View style={styles.actions}>
              {onEdit && (
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={onEdit}
                  iconColor={theme.colors.primary}
                />
              )}
              {onDelete && (
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={onDelete}
                  iconColor={theme.colors.error}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  pressable: {
    marginVertical: 6,
  },
  card: {
    marginVertical: 6,
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  amount: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  tags: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
});

export default ExpenseCard;
