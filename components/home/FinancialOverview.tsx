import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui";
import { useTheme } from "@/lib/theme";

interface FinancialOverviewProps {
  monthlyExpense: number;
  monthlyBudget: number;
  expensePercentage: number;
}

export const FinancialOverview = ({ monthlyExpense, monthlyBudget, expensePercentage }: FinancialOverviewProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.financialCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <Text variant="titleMedium" style={[styles.financialTitle, { color: theme.colors.onSurface }]}>
        {t("home.financialOverview")}
      </Text>

      <View style={styles.financialRow}>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {t("finance.monthlyExpenses")}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
          {monthlyExpense.toFixed(0)}₺ / <Text style={{ color: theme.colors.onSurfaceVariant }}>{monthlyBudget.toFixed(0)}₺</Text>
        </Text>
      </View>

      <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: expensePercentage > 80 ? theme.colors.error : theme.colors.accent,
              width: `${Math.min(expensePercentage, 100)}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  financialCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  financialTitle: { fontWeight: "700", marginBottom: 12 },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBarContainer: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 4 },
});
