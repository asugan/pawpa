import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, Card, Divider } from "@/components/ui";
import { useTheme } from "@/lib/theme";
import { UserBudgetStatus } from "@/lib/types";

interface BudgetInsightsProps {
  status: UserBudgetStatus;
}

export const BudgetInsights: React.FC<BudgetInsightsProps> = ({ status }) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const momo = status.monthOverMonth;
  const categories = status.categoryBreakdown || [];
  const currency = status.budget?.currency;
  const percentFormatter = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 1,
  });
  const amountFormatter = new Intl.NumberFormat(i18n.language, currency ? {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  } : {
    maximumFractionDigits: 2,
  });

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <Text variant="titleMedium" style={styles.header}>
        {t("budgets.insightsTitle")}
      </Text>

      {momo && (
        <View style={styles.momoRow}>
          <MaterialCommunityIcons
            name={momo.changePct >= 0 ? "arrow-up-bold" : "arrow-down-bold"}
            size={20}
            color={momo.changePct >= 0 ? theme.colors.error : theme.colors.primary}
          />
          <View style={styles.momoText}>
            <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
              {t("budgets.monthOverMonth", {
                change: percentFormatter.format(momo.changePct),
              })}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t("budgets.currentVsPrevious", {
                current: amountFormatter.format(momo.current),
                previous: amountFormatter.format(momo.previous),
              })}
            </Text>
          </View>
        </View>
      )}

      <Divider style={{ marginVertical: 12 }} />

      <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
        {t("budgets.categoryBreakdown")}
      </Text>
      {categories.length === 0 ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {t("budgets.noCategoryData")}
        </Text>
      ) : (
        categories.map((item) => (
          <View key={item.category} style={styles.categoryRow}>
            <View style={styles.categoryLabel}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: theme.colors.primary, opacity: 0.75 },
                ]}
              />
              <Text
                variant="bodyMedium"
                style={styles.categoryText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.category}
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(item.percentage, 100)}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
            <Text variant="bodySmall" style={styles.percentText}>
              {percentFormatter.format(item.percentage)}%
            </Text>
          </View>
        ))
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    fontWeight: "700",
  },
  momoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  momoText: {
    marginLeft: 8,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryLabel: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
    maxWidth: 120,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryText: {
    flexShrink: 1,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e3e3e3",
    marginHorizontal: 8,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  percentText: {
    width: 56,
    textAlign: "right",
  },
});

export default BudgetInsights;
