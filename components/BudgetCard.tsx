import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, IconButton, ProgressBar, Chip, Badge } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { BudgetLimit, BudgetStatus } from '../lib/types';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BudgetCardProps {
  budget: BudgetLimit;
  status?: BudgetStatus | null;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  status,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();

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

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return theme.colors.error;
    if (percentage >= budget.alertThreshold * 100) return theme.colors.tertiary;
    if (percentage >= 70) return theme.colors.primary;
    return theme.colors.secondary;
  };

  const getStatusIcon = (percentage: number): string => {
    if (percentage >= 100) return 'alert-circle';
    if (percentage >= budget.alertThreshold * 100) return 'alert';
    return 'check-circle';
  };

  const percentage = status ? status.percentage : 0;
  const currentSpending = status ? status.currentSpending : 0;
  const remainingAmount = status ? status.remainingAmount : budget.amount;

  const cardContent = (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderLeftWidth: 4,
          borderLeftColor: budget.isActive ? getProgressColor(percentage) : theme.colors.surfaceDisabled,
        },
      ]}
      elevation={2}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons
              name={budget.category ? 'tag' : 'wallet'}
              size={24}
              color={theme.colors.primary}
              style={styles.icon}
            />
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {budget.category
                  ? t(`expenses.categories.${budget.category}`, budget.category)
                  : t('budgets.overallBudget', 'Overall Budget')}
              </Text>
              <Chip
                mode="outlined"
                compact
                style={styles.periodChip}
                textStyle={{ fontSize: 11 }}
              >
                {t(`budgets.periods.${budget.period}`, budget.period)}
              </Chip>
            </View>
          </View>
          {!budget.isActive && (
            <Badge size={20} style={{ backgroundColor: theme.colors.surfaceDisabled }}>
              {t('budgets.inactive', 'Inactive')}
            </Badge>
          )}
        </View>

        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('budgets.spent', 'Spent')}
            </Text>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: getProgressColor(percentage) }}>
              {formatCurrency(currentSpending, budget.currency)}
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('budgets.limit', 'Limit')}
            </Text>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
              {formatCurrency(budget.amount, budget.currency)}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <ProgressBar
            progress={Math.min(percentage / 100, 1)}
            color={getProgressColor(percentage)}
            style={styles.progressBar}
          />
          <View style={styles.progressInfo}>
            <View style={styles.progressLeft}>
              <MaterialCommunityIcons
                name={getStatusIcon(percentage) as any}
                size={16}
                color={getProgressColor(percentage)}
              />
              <Text
                variant="bodySmall"
                style={{ color: getProgressColor(percentage), marginLeft: 4, fontWeight: 'bold' }}
              >
                {percentage.toFixed(1)}%
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {remainingAmount >= 0
                ? `${formatCurrency(remainingAmount, budget.currency)} ${t('budgets.remaining', 'remaining')}`
                : `${formatCurrency(Math.abs(remainingAmount), budget.currency)} ${t('budgets.exceeded', 'exceeded')}`}
            </Text>
          </View>
        </View>

        {percentage >= budget.alertThreshold * 100 && budget.isActive && (
          <View
            style={[
              styles.alertBanner,
              {
                backgroundColor:
                  percentage >= 100 ? theme.colors.errorContainer : theme.colors.tertiaryContainer,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="alert"
              size={16}
              color={percentage >= 100 ? theme.colors.error : theme.colors.tertiary}
            />
            <Text
              variant="bodySmall"
              style={{
                marginLeft: 8,
                color: percentage >= 100 ? theme.colors.error : theme.colors.tertiary,
                fontWeight: '600',
              }}
            >
              {percentage >= 100
                ? t('budgets.budgetExceeded', 'Budget exceeded!')
                : t('budgets.approachingLimit', 'Approaching budget limit')}
            </Text>
          </View>
        )}

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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  periodChip: {
    alignSelf: 'flex-start',
    height: 24,
    marginTop: 4,
  },
  amountSection: {
    marginBottom: 16,
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginRight: -8,
  },
});

export default BudgetCard;
