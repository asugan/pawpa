import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text, Card, ProgressBar } from "@/components/ui";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { UserBudgetStatus, Expense } from "@/lib/types";
import CompactExpenseItem from "@/components/CompactExpenseItem";

interface FinancialOverviewProps {
  budgetStatus?: UserBudgetStatus;
  recentExpenses?: Expense[];
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  budgetStatus,
  recentExpenses = [],
}) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const formatCurrency = (amount: number, currency: string = "TRY"): string => {
    const currencySymbols: Record<string, string> = {
      TRY: "₺",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };

    const symbol = currencySymbols[currency] || currency;
    const formatted = amount.toLocaleString(
      i18n.language === "tr" ? "tr-TR" : "en-US",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    );

    return `${symbol}${formatted}`; // e.g. ₺450
  };

  const getProgressColor = (percentage: number, threshold: number): string => {
    if (percentage >= 100) return theme.colors.error;
    if (percentage >= threshold * 100) return theme.colors.tertiary; // Orange/Warning
    return theme.colors.secondary; // Normal
  };

  // Budget Data
  const hasBudget = !!budgetStatus?.budget;
  const percentage = budgetStatus?.percentage || 0;
  const currentSpending = budgetStatus?.currentSpending || 0;
  const totalBudget = budgetStatus?.budget?.amount || 0;
  const currency = budgetStatus?.budget?.currency || "TRY";
  const alertThreshold = budgetStatus?.budget?.alertThreshold || 0.8;

  // Recent Expenses Data - take top 3
  const displayExpenses = recentExpenses.slice(0, 3);
  const hasExpenses = displayExpenses.length > 0;

  if (!hasBudget && !hasExpenses) {
    // If absolutely nothing to show, maybe show a "Setup Finances" card or just null
    // But typically we want to encourage usage.
    // For now, let's return null if really nothing, but the parent likely handles empty states?
    // Or we can show a placeholder.
    return null; 
  }

  return (
    <Pressable onPress={() => router.push("/(tabs)/finance")}>
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        elevation={2}
      >
        <View style={styles.content}>
          <Text variant="titleMedium" style={styles.title}>
            {t("finance.overview", "Finansal Genel Bakış")}
          </Text>

          {/* Budget Section */}
          {hasBudget ? (
            <View style={styles.budgetSection}>
              <View style={styles.budgetHeader}>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {t("finance.thisMonthExpenses", "Bu Ayki Harcamalar")}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text variant="bodyLarge" style={{ fontWeight: "600" }}>
                    {formatCurrency(currentSpending, currency)}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {" / "}
                    {formatCurrency(totalBudget, currency)}
                  </Text>
                </View>
              </View>

              <ProgressBar
                progress={Math.min(percentage / 100, 1)}
                color={getProgressColor(percentage, alertThreshold)}
                style={styles.progressBar}
              />
            </View>
          ) : (
             // Placeholder if no budget but has expenses
             <View style={styles.budgetSection}>
                <Text variant="bodyMedium" style={{color: theme.colors.onSurfaceVariant}}>
                    {t("budgets.noBudgetSet", "No Budget Set")}
                </Text>
                {/* Maybe a link to set it? */}
             </View>
          )}

          {/* Recent Expenses Section */}
          {hasExpenses && (
            <View
              style={[
                styles.expensesSection,
                { borderTopColor: theme.colors.outlineVariant },
              ]}
            >
              <Text variant="titleSmall" style={styles.expensesTitle}>
                {t("finance.recentExpenses", "Son Harcamalar")}
              </Text>

              <View style={styles.expensesList}>
                {displayExpenses.map((expense) => (
                  <CompactExpenseItem
                    key={expense.id}
                    expense={expense}
                    // We can customize the item style if needed, but default is fine
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
    borderRadius: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  budgetSection: {
    gap: 8,
    marginBottom: 4,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  expensesSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  expensesTitle: {
    fontWeight: "600",
  },
  expensesList: {
    gap: 0,
  },
});
