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
  const withOpacity = (color: string, opacity: number) => {
    if (!color.startsWith("#")) return color;
    const alpha = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0");
    return `${color}${alpha}`;
  };
  const changeColor = momo && momo.changePct >= 0
    ? theme.colors.error
    : theme.colors.secondary;

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <View style={styles.titleRow}>
        <View
          style={[
            styles.titleIcon,
            { backgroundColor: withOpacity(theme.colors.primary, 0.12) },
          ]}
        >
          <MaterialCommunityIcons
            name="chart-line"
            size={18}
            color={theme.colors.primary}
          />
        </View>
        <Text variant="titleMedium" style={styles.header}>
          {t("budgets.insightsTitle")}
        </Text>
      </View>

      {momo && (
        <View style={styles.momoSection}>
          <View style={styles.momoLeft}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t("budgets.monthOverMonthLabel", "Month-over-month")}
            </Text>
            <View
              style={[
                styles.momoBadge,
                { backgroundColor: withOpacity(changeColor, 0.12) },
              ]}
            >
              <MaterialCommunityIcons
                name={momo.changePct >= 0 ? "arrow-up-bold" : "arrow-down-bold"}
                size={14}
                color={changeColor}
              />
              <Text variant="labelSmall" style={{ color: changeColor, fontWeight: "700" }}>
                {percentFormatter.format(momo.changePct)}%
              </Text>
            </View>
          </View>
          <View style={styles.momoRight}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
              {t("budgets.currentLabel", "Current")}: {amountFormatter.format(momo.current)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t("budgets.previousLabel", "Prev")}: {amountFormatter.format(momo.previous)}
            </Text>
          </View>
        </View>
      )}

      <Divider style={styles.divider} />

      <View style={styles.sectionHeader}>
        <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
          {t("budgets.categoryBreakdown")}
        </Text>
        <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
          {t("common.viewAll")}
        </Text>
      </View>
      {categories.length === 0 ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {t("budgets.noCategoryData")}
        </Text>
      ) : (
        categories.map((item) => (
          <View key={item.category} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryLabel}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: withOpacity(theme.colors.primary, 0.75) },
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
              <Text
                variant="bodySmall"
                style={[styles.categoryAmount, { color: theme.colors.onSurface }]}
              >
                {amountFormatter.format(item.total)}
              </Text>
            </View>
            <View style={styles.categoryBarRow}>
              <View
                style={[
                  styles.barTrack,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
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
          </View>
        ))
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 18,
    padding: 18,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontWeight: "700",
  },
  momoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  momoLeft: {
    gap: 6,
  },
  momoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  momoRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  divider: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryItem: {
    marginBottom: 14,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  categoryLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
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
  categoryAmount: {
  },
  categoryBarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 6,
    marginRight: 8,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },
  percentText: {
    width: 52,
    textAlign: "right",
  },
});

export default BudgetInsights;
