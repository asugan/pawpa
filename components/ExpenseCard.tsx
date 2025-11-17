import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, IconButton, Chip } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { Expense, ExpenseCategory } from '../lib/types';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

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
  const { t, i18n } = useTranslation();

  const getCategoryIcon = (category: ExpenseCategory): string => {
    const icons: Record<ExpenseCategory, string> = {
      food: 'food',
      premium_food: 'food-variant',
      veterinary: 'hospital-box',
      vaccination: 'needle',
      medication: 'pill',
      grooming: 'content-cut',
      toys: 'soccer',
      accessories: 'shopping',
      training: 'school',
      insurance: 'shield-check',
      emergency: 'alert-circle',
      other: 'dots-horizontal',
    };
    return icons[category] || 'cash';
  };

  const getCategoryColor = (category: ExpenseCategory): string => {
    const colors: Record<ExpenseCategory, string> = {
      food: theme.colors.primary,
      premium_food: theme.colors.tertiary,
      veterinary: theme.colors.error,
      vaccination: theme.colors.secondary,
      medication: theme.colors.inversePrimary,
      grooming: theme.colors.tertiaryContainer,
      toys: theme.colors.primaryContainer,
      accessories: theme.colors.secondaryContainer,
      training: theme.colors.surfaceVariant,
      insurance: theme.colors.outline,
      emergency: theme.colors.errorContainer,
      other: theme.colors.surface,
    };
    return colors[category] || theme.colors.surface;
  };

  const formatCurrency = (amount: number, currency: string): string => {
    const currencySymbols: Record<string, string> = {
      TRY: '₺',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    const symbol = currencySymbols[currency] || currency;
    const formatted = amount.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${symbol}${formatted}`;
  };

  const formattedDate = React.useMemo(() => {
    try {
      const date = typeof expense.date === 'string' ? new Date(expense.date) : expense.date;
      return format(date, 'PPP', { locale: i18n.language === 'tr' ? tr : enUS });
    } catch {
      return expense.date.toString();
    }
  }, [expense.date, i18n.language]);

  const cardContent = (
    <Card style={StyleSheet.flatten([styles.card, { backgroundColor: theme.colors.surface }])} elevation={2}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={StyleSheet.flatten([styles.iconContainer, { backgroundColor: getCategoryColor(expense.category) }])}>
              <MaterialCommunityIcons
                name={getCategoryIcon(expense.category) as any}
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
          <Text variant="titleLarge" style={StyleSheet.flatten([styles.amount, { color: theme.colors.primary }])}>
            {formatCurrency(expense.amount, expense.currency)}
          </Text>
        </View>

        {expense.description && (
          <Text
            variant="bodyMedium"
            style={StyleSheet.flatten([styles.description, { color: theme.colors.onSurfaceVariant }])}
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
