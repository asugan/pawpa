import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme, Text, HelperText, Switch, SegmentedButtons } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BudgetCreateSchema, BUDGET_PERIODS, BudgetCreateInput } from '../lib/schemas/budgetSchema';
import { CreateBudgetLimitInput, BudgetLimit, Currency, BudgetPeriod } from '../lib/types';
import { useTranslation } from 'react-i18next';
import CurrencyPicker from './CurrencyPicker';
import CategoryPicker from './CategoryPicker';

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
  const theme = useTheme();
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

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BudgetCreateInput>({
    resolver: zodResolver(BudgetCreateSchema),
    defaultValues,
  });

  const selectedCategory = watch('category');

  const handleFormSubmit = (data: BudgetCreateInput) => {
    onSubmit(data as CreateBudgetLimitInput);
  };

  const periodButtons = BUDGET_PERIODS.map((period) => ({
    value: period,
    label: t(`budgets.periods.${period}`, period),
  }));

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.form}>
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
          <Controller
            control={control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <CategoryPicker
                selectedCategory={value || undefined}
                onSelect={onChange}
                error={errors.category?.message}
              />
            )}
          />
          <HelperText type="info">
            {selectedCategory
              ? t('budgets.categorySpecificHelp', 'Budget applies only to this category')
              : t('budgets.overallBudgetHelp', 'Budget applies to all expenses')}
          </HelperText>
        </View>

        {/* Amount */}
        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                label={t('budgets.amount', 'Budget Amount')}
                value={value?.toString() || ''}
                onChangeText={(text) => {
                  const num = parseFloat(text.replace(',', '.'));
                  onChange(isNaN(num) ? 0 : num);
                }}
                onBlur={onBlur}
                keyboardType="decimal-pad"
                mode="outlined"
                error={!!errors.amount}
                left={<TextInput.Icon icon="cash" />}
              />
              {errors.amount && (
                <HelperText type="error" visible={!!errors.amount}>
                  {errors.amount.message}
                </HelperText>
              )}
            </View>
          )}
        />

        {/* Currency Picker */}
        <Controller
          control={control}
          name="currency"
          render={({ field: { value, onChange } }) => (
            <CurrencyPicker
              selectedCurrency={value}
              onSelect={onChange}
              label={t('budgets.currency', 'Currency')}
              error={errors.currency?.message}
            />
          )}
        />

        {/* Period Selector */}
        <Controller
          control={control}
          name="period"
          render={({ field: { value, onChange } }) => (
            <View style={styles.inputContainer}>
              <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]}>
                {t('budgets.period', 'Period')}
              </Text>
              <SegmentedButtons
                value={value}
                onValueChange={(val) => onChange(val as BudgetPeriod)}
                buttons={periodButtons}
              />
              {errors.period && (
                <HelperText type="error" visible={!!errors.period}>
                  {errors.period.message}
                </HelperText>
              )}
            </View>
          )}
        />

        {/* Alert Threshold */}
        <Controller
          control={control}
          name="alertThreshold"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                label={t('budgets.alertThreshold', 'Alert Threshold (%)')}
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
              <HelperText type="info">
                {t('budgets.alertThresholdHelp', 'You will be alerted when spending reaches this percentage')}
              </HelperText>
              {errors.alertThreshold && (
                <HelperText type="error" visible={!!errors.alertThreshold}>
                  {errors.alertThreshold.message}
                </HelperText>
              )}
            </View>
          )}
        />

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
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {initialData ? t('common.update', 'Update') : t('common.create', 'Create')}
          </Button>
        </View>
      </View>
    </ScrollView>
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
