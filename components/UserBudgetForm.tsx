import React from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { FormSection } from "./forms/FormSection";
import { FormActions } from "./forms/FormActions";
import { SmartCurrencyInput } from "./forms/SmartCurrencyInput";
import { SmartSwitch } from "./forms/SmartSwitch";
import { Text } from "@/components/ui";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "react-i18next";
import {
  SetUserBudgetSchema,
  SetUserBudgetInput,
} from "@/lib/schemas/userBudgetSchema";
import { UserBudget } from "@/lib/types";

interface UserBudgetFormProps {
  initialData?: UserBudget;
  onSubmit: (data: SetUserBudgetInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const UserBudgetForm: React.FC<UserBudgetFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const form = useForm<SetUserBudgetInput>({
    resolver: zodResolver(SetUserBudgetSchema),
    defaultValues: {
      amount: initialData?.amount || 0,
      currency: initialData?.currency || "TRY",
      alertThreshold: initialData?.alertThreshold ?? 0.8,
      isActive: initialData?.isActive ?? true,
    },
    mode: "onChange",
  });

  const { control, handleSubmit, formState: { isValid } } = form;

  const handleFormSubmit = (data: SetUserBudgetInput) => {
    onSubmit(data);
  };

  return (
    <FormProvider {...form}>
      <View style={styles.container}>
        <FormSection title={t("budgets.budgetDetails", "Budget Details")}>
        {/* Amount Input */}
        <SmartCurrencyInput
          name="amount"
          label={t("budgets.monthlyAmount", "Monthly Amount")}
          placeholder={t("budgets.enterAmount", "Enter amount")}
          testID="budget-amount-input"
        />

        {/* Alert Threshold Selector */}
        <Controller
          control={control}
          name="alertThreshold"
          render={({ field: { onChange, value } }) => (
            <View style={styles.thresholdContainer}>
              <Text
                variant="labelLarge"
                style={[styles.label, { color: theme.colors.onSurface }]}
              >
                {t("budgets.alertThreshold", "Alert Threshold")}
              </Text>

              <View style={styles.thresholdButtons}>
                {[0.5, 0.7, 0.8, 0.9].map((threshold) => (
                  <TouchableOpacity
                    key={threshold}
                    style={[
                      styles.thresholdButton,
                      {
                        backgroundColor:
                          value === threshold
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                        borderColor: theme.colors.outline,
                      },
                    ]}
                    onPress={() => onChange(threshold)}
                  >
                    <Text
                      variant="bodyMedium"
                      style={{
                        color:
                          value === threshold
                            ? theme.colors.onPrimary
                            : theme.colors.onSurfaceVariant,
                        fontWeight: value === threshold ? "bold" : "normal",
                      }}
                    >
                      {Math.round(threshold * 100)}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text
                variant="bodySmall"
                style={[
                  styles.thresholdDescription,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {t(
                  "budgets.alertThresholdDescription",
                  "Get notified when spending reaches this percentage of your budget"
                )}
              </Text>
            </View>
          )}
        />

        {/* Active Switch */}
        <SmartSwitch
          name="isActive"
          label={t("budgets.activeBudget", "Active Budget")}
          description={t(
            "budgets.activeBudgetDescription",
            "Enable budget tracking and alerts"
          )}
          testID="budget-active-switch"
        />
      </FormSection>

        <FormActions
          onCancel={onCancel}
          onSubmit={handleSubmit(handleFormSubmit)}
          loading={isSubmitting}
          disabled={!isValid}
          testID="user-budget-form"
        />
      </View>
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  thresholdContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 12,
    fontWeight: "500",
  },
  thresholdButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  thresholdButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  thresholdDescription: {
    lineHeight: 18,
  },
});

export default UserBudgetForm;
