import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, Divider } from "@/components/ui";
import { useTheme } from "@/lib/theme";
import { UserBudgetStatus } from "@/lib/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface BudgetInsightsProps {
  status: UserBudgetStatus;
}

export const BudgetInsights: React.FC<BudgetInsightsProps> = ({ status }) => {
  const { theme } = useTheme();
  const momo = status.monthOverMonth;
  const categories = status.categoryBreakdown || [];

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <Text variant="titleMedium" style={styles.header}>
        Budget Insights
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
              Month-over-month: {momo.changePct.toFixed(1)}%
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Current {momo.current.toFixed(2)} vs Prev {momo.previous.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      <Divider style={{ marginVertical: 12 }} />

      <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
        Category breakdown
      </Text>
      {categories.length === 0 ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          No category data for this period.
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
              <Text variant="bodyMedium">{item.category}</Text>
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
            <Text variant="bodySmall" style={{ width: 60, textAlign: "right" }}>
              {item.percentage.toFixed(1)}%
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
    flex: 1,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  barTrack: {
    flex: 2,
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
});

export default BudgetInsights;
