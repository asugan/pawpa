import { Button, HelperText, SegmentedButtons, Switch, Text, TextInput } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BUDGET_PERIODS, BudgetCreateInput, BudgetCreateSchema } from '../lib/schemas/budgetSchema';
import { BudgetLimit, BudgetPeriod, CreateBudgetLimitInput, Currency } from '../lib/types';
import { SmartCategoryPicker } from './forms/SmartCategoryPicker';
import { SmartCurrencyPicker } from './forms/SmartCurrencyPicker';
import { SmartInput } from './forms/SmartInput';

interface BudgetFormProps {
  petId: string;
  initialData?: BudgetLimit;
  onSubmit: (data: CreateBudgetLimitInput) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  petId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const defaultValues = {
    petId,
    category: initialData?.category || null,
    amount: initialData?.amount || 0,
    currency: (initialData?.currency as Currency) || ('TRY' as Currency),
    period: (initialData?.period || 'monthly') as BudgetPeriod,
    alertThreshold: initialData?.alertThreshold || 0.8,
    isActive: initialData?.isActive ?? true,
  };

  const methods = useForm<BudgetCreateInput>({
    resolver: zodResolver(BudgetCreateSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = methods;

  const selectedCategory = watch('category');

  const handleFormSubmit = (data: BudgetCreateInput) => {
    onSubmit(data as CreateBudgetLimitInput);
  };

  const periodButtons = BUDGET_PERIODS.map((period) => ({
    value: period,
    label: t(`budgets.periods.${period}`, period),
  }));

  return (
    <FormProvider {...methods}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.form}>
        <Text variant="bodyMedium" style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
          {t('budgets.formHelp', 'Set a budget limit for your pet expenses. Leave category empty for overall budget.')}
        </Text>

        {/* Category Picker (Optional) */}
        <View style={styles.inputContainer}>
          <View style={styles.categoryHeader}>
            <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]}>
              {t('budgets.category', 'Category (Optional)')}
            </Text>
            {selectedCategory && (
              <Button
                mode="text"
                onPress={() => setValue('category', null)}
                compact
              >
                {t('common.clear', 'Clear')}
              </Button>
            )}
          </View>
          <SmartCategoryPicker name="category" />
          <HelperText type="info">
            {selectedCategory
              ? t('budgets.categorySpecificHelp', 'Budget applies only to this category')
              : t('budgets.overallBudgetHelp', 'Budget applies to all expenses')}
          </HelperText>
        </View>

        {/* Amount */}
        <SmartInput
          name="amount"
          label={t('budgets.amount', 'Amount')}
          keyboardType="decimal-pad"
          left={<TextInput.Icon icon="cash" />}
        />

        {/* Currency Picker */}
        <SmartCurrencyPicker
          name="currency"
          label={t('budgets.currency', 'Currency')}
        />

        {/* Period Selector */}
        <View style={styles.inputContainer}>
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]}>
            {t('budgets.period', 'Period')}
          </Text>
          <Controller
            control={control}
            name="period"
            render={({ field: { value, onChange } }) => (
              <SegmentedButtons
                value={value}
                onValueChange={(val) => onChange(val as BudgetPeriod)}
                buttons={periodButtons}
              />
            )}
          />
          {errors.period && (
            <HelperText type="error" visible={!!errors.period}>
              {errors.period.message}
            </HelperText>
          )}
        </View>

        {/* Alert Threshold */}
        <View style={styles.inputContainer}>
          <Controller
            control={control}
            name="alertThreshold"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                label={t('budgets.alertThreshold', 'Alert Threshold')}
                value={((value || 0.8) * 100).toString()}
                onChangeText={(text) => {
                  const num = parseFloat(text.replace(',', '.'));
                  onChange(isNaN(num) ? 0.8 : num / 100);
                }}
                onBlur={onBlur}
                keyboardType="decimal-pad"
                mode="outlined"
                error={!!errors.alertThreshold}
                left={<TextInput.Icon icon="alert" />}
                right={<TextInput.Affix text="%" />}
              />
            )}
          />
          <HelperText type="info">
            {t('budgets.alertThresholdHelp', 'You will be alerted when spending reaches this percentage')}
          </HelperText>
          {errors.alertThreshold && (
            <HelperText type="error" visible={!!errors.alertThreshold}>
              {errors.alertThreshold.message}
            </HelperText>
          )}
        </View>

        {/* Is Active Switch */}
        <Controller
          control={control}
          name="isActive"
          render={({ field: { value, onChange } }) => (
            <View style={[styles.inputContainer, styles.switchContainer]}>
              <View style={styles.switchLabel}>
                <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
                  {t('budgets.isActive', 'Active Budget')}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t('budgets.isActiveHelp', 'Inactive budgets will not generate alerts')}
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                color={theme.colors.primary}
              />
            </View>
          )}
        />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {onCancel && (
            <Button
              mode="outlined"
              onPress={onCancel}
              style={styles.button}
              disabled={isSubmitting}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
          )}
          <Button
            mode="contained"
            onPress={handleSubmit(handleFormSubmit)}
            style={styles.button}
            disabled={isSubmitting}
          >
            {initialData ? t('common.update', 'Update') : t('common.create', 'Create')}
          </Button>
        </View>
      </ScrollView>
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  helperText: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  inputContainer: {
    marginVertical: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default BudgetForm;
