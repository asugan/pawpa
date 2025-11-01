import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, useTheme, ProgressBar, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useBudgetAlerts } from '../lib/hooks/useBudgets';

interface BudgetOverviewProps {
  petId?: string;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ petId }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const { data: alerts = [], isLoading } = useBudgetAlerts(petId);

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

  const getProgressColor = (percentage: number, threshold: number): string => {
    if (percentage >= 100) return theme.colors.error;
    if (percentage >= threshold * 100) return theme.colors.tertiary;
    return theme.colors.secondary;
  };

  if (isLoading) {
    return null;
  }

  // Get the most critical alert (highest percentage)
  const criticalAlert = alerts.length > 0
    ? alerts.reduce((prev, current) => (prev.percentage > current.percentage ? prev : current))
    : null;

  return (
    <Pressable onPress={() => router.push('/budgets')}>
      <Card
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderLeftWidth: alerts.length > 0 ? 4 : 0,
            borderLeftColor: alerts.length > 0 ? theme.colors.error : 'transparent',
          },
        ]}
        elevation={2}
      >
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="wallet"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {t('budgets.title', 'Budgets')}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {alerts.length > 0
                  ? t('budgets.alertsActive', '{{count}} alert(s)', { count: alerts.length })
                  : t('budgets.onTrack', 'On track')}
              </Text>
            </View>
            {alerts.length > 0 && (
              <Badge size={24} style={{ backgroundColor: theme.colors.error }}>
                {alerts.length}
              </Badge>
            )}
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginLeft: 8 }}
            />
          </View>

          {criticalAlert ? (
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                  {criticalAlert.budgetLimit.category
                    ? t(`expenses.categories.${criticalAlert.budgetLimit.category}`)
                    : t('budgets.overallBudget', 'Overall Budget')}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{
                    color: getProgressColor(
                      criticalAlert.percentage,
                      criticalAlert.budgetLimit.alertThreshold
                    ),
                    fontWeight: 'bold',
                  }}
                >
                  {criticalAlert.percentage.toFixed(0)}%
                </Text>
              </View>
              <ProgressBar
                progress={Math.min(criticalAlert.percentage / 100, 1)}
                color={getProgressColor(
                  criticalAlert.percentage,
                  criticalAlert.budgetLimit.alertThreshold
                )}
                style={styles.progressBar}
              />
              <View style={styles.budgetDetails}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatCurrency(criticalAlert.currentSpending, criticalAlert.budgetLimit.currency)} /{' '}
                  {formatCurrency(criticalAlert.budgetLimit.amount, criticalAlert.budgetLimit.currency)}
                </Text>
                {criticalAlert.remainingAmount >= 0 ? (
                  <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                    {formatCurrency(criticalAlert.remainingAmount, criticalAlert.budgetLimit.currency)}{' '}
                    {t('budgets.remaining', 'remaining')}
                  </Text>
                ) : (
                  <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                    {formatCurrency(
                      Math.abs(criticalAlert.remainingAmount),
                      criticalAlert.budgetLimit.currency
                    )}{' '}
                    {t('budgets.exceeded', 'exceeded')}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.noBudgets}>
              <MaterialCommunityIcons
                name="check-circle"
                size={32}
                color={theme.colors.secondary}
              />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
              >
                {t('budgets.allGood', 'All budgets are on track')}
              </Text>
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
  alertContent: {
    marginTop: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noBudgets: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});

export default BudgetOverview;
