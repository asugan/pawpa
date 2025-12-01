import { Chip, Text } from "@/components/ui";
import { useTheme } from "@/lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { PAYMENT_METHODS } from "../lib/schemas/expenseSchema";
import { PaymentMethod } from "../lib/types";

interface PaymentMethodPickerProps {
  selectedMethod?: PaymentMethod | null;
  onSelect: (method: PaymentMethod | null) => void;
  label?: string;
  error?: string;
  optional?: boolean;
}

const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({
  selectedMethod,
  onSelect,
  label,
  error,
  optional = true,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const getMethodIcon = (
    method: PaymentMethod
  ): keyof typeof MaterialCommunityIcons.glyphMap => {
    const icons: Record<
      PaymentMethod,
      keyof typeof MaterialCommunityIcons.glyphMap
    > = {
      cash: "cash",
      credit_card: "credit-card",
      debit_card: "credit-card-outline",
      bank_transfer: "bank-transfer",
    };
    return icons[method] || "cash";
  };

  const handleSelect = (method: PaymentMethod) => {
    if (selectedMethod === method && optional) {
      onSelect(null);
    } else {
      onSelect(method);
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text
          variant="labelLarge"
          style={[styles.label, { color: theme.colors.onSurface }]}
        >
          {label}{" "}
          {optional && (
            <Text style={{ opacity: 0.6 }}>({t("common.optional")})</Text>
          )}
        </Text>
      )}
      <View style={styles.chipContainer}>
        {PAYMENT_METHODS.map((method) => (
          <Chip
            key={method}
            selected={selectedMethod === method}
            onPress={() => handleSelect(method)}
            style={styles.chip}
            icon={({ size, color }: { size: number; color: string }) => (
              <MaterialCommunityIcons
                name={getMethodIcon(method)}
                size={size}
                color={selectedMethod === method ? theme.colors.primary : color}
              />
            )}
            mode={selectedMethod === method ? "flat" : "outlined"}
            selectedColor={theme.colors.primary}
          >
            {t(`expenses.paymentMethods.${method}`, method)}
          </Chip>
        ))}
      </View>
      {error && (
        <Text
          variant="bodySmall"
          style={[styles.error, { color: theme.colors.error }]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  error: {
    marginTop: 4,
    marginLeft: 4,
  },
});

export default PaymentMethodPicker;
