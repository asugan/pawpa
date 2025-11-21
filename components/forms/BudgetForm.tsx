import { Button, HelperText, Text, TextInput } from '@/components/ui';
import { useBudgetForm } from '@/hooks/useBudgetForm';
import { useTheme } from '@/lib/theme';
import React from 'react';
import { Controller, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BUDGET_PERIODS } from '../../lib/schemas/budgetSchema';
import { BudgetLimit, BudgetPeriod, CreateBudgetLimitInput } from '../../lib/types';
import { FormActions } from './FormActions';
import { FormSection } from './FormSection';
import { SmartCategoryPicker } from './SmartCategoryPicker';
import { SmartCurrencyPicker } from './SmartCurrencyPicker';
import { SmartInput } from './SmartInput';
import { SmartSegmentedButtons } from './SmartSegmentedButtons';
import { SmartSwitch } from './SmartSwitch';

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

  // Use the custom hook for form management
  const { form, control, handleSubmit, setValue, watch, errors } = useBudgetForm(
    petId,
    initialData
  );

  const selectedCategory = watch('category');

  const handleFormSubmit = (data: any) => {
    onSubmit(data as CreateBudgetLimitInput);
  };

  // Period buttons for SmartSegmentedButtons
  const periodButtons = BUDGET_PERIODS.map((period) => ({
    value: period,
    label: t(`budgets.periods.${period}`, period),
  }));

  return (
    <FormProvider {...form}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Form Header */}
        <FormSection
          title={initialData ? t('budgets.editTitle', 'Edit Budget') : t('budgets.createTitle', 'Create Budget')}
          subtitle={t(
            'budgets.formHelp',
            'Set a budget limit for your pet expenses. Leave category empty for overall budget.'
          )}
        >
          {/* Category Picker (Optional) */}
          <View style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]}>
                {t('budgets.category', 'Category (Optional)')}
              </Text>
              {selectedCategory && (
                <Button mode="text" onPress={() => setValue('category', null)} compact>
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
        </FormSection>

        {/* Budget Details */}
        <FormSection title={t('budgets.sections.details', 'Budget Details')}>
          {/* Amount */}
          <SmartInput
            name="amount"
            label={t('budgets.amount', 'Amount')}
            keyboardType="decimal-pad"
            left={<TextInput.Icon icon="cash" />}
          />

          {/* Currency Picker */}
          <SmartCurrencyPicker name="currency" label={t('budgets.currency', 'Currency')} />

          {/* Period Selector */}
          <SmartSegmentedButtons name="period" buttons={periodButtons} density="small" />
        </FormSection>

        {/* Alert Settings */}
        <FormSection title={t('budgets.sections.alerts', 'Alert Settings')}>
          {/* Alert Threshold - Custom percentage input */}
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
              {t(
                'budgets.alertThresholdHelp',
                'You will be alerted when spending reaches this percentage'
              )}
            </HelperText>
            {errors.alertThreshold && (
              <HelperText type="error" visible={!!errors.alertThreshold}>
                {errors.alertThreshold.message}
              </HelperText>
            )}
          </View>

          {/* Is Active Switch */}
          <SmartSwitch
            name="isActive"
            label={t('budgets.isActive', 'Active Budget')}
            description={t('budgets.isActiveHelp', 'Inactive budgets will not generate alerts')}
          />
        </FormSection>

        {/* Form Actions */}
        <FormActions
          onCancel={onCancel || (() => {})}
          onSubmit={handleSubmit(handleFormSubmit)}
          submitLabel={initialData ? t('common.update', 'Update') : t('common.create', 'Create')}
          cancelLabel={t('common.cancel', 'Cancel')}
          loading={isSubmitting}
          disabled={isSubmitting}
          showDivider={false}
        />
      </ScrollView>
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  categoryContainer: {
    marginTop: -8, // Adjust spacing after FormSection subtitle
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
});

export default BudgetForm;
