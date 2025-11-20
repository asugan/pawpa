import { Button, TextInput } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ExpenseCreateInput, ExpenseCreateSchema } from '../lib/schemas/expenseSchema';
import { CreateExpenseInput as CreateExpenseInputType, Currency, Expense, ExpenseCategory } from '../lib/types';
import { SmartCategoryPicker } from './forms/SmartCategoryPicker';
import { SmartCurrencyPicker } from './forms/SmartCurrencyPicker';
import { SmartDatePicker } from './forms/SmartDatePicker';
import { SmartInput } from './forms/SmartInput';
import { SmartPaymentMethodPicker } from './forms/SmartPaymentMethodPicker';

interface ExpenseFormProps {
  petId: string;
  initialData?: Expense;
  onSubmit: (data: CreateExpenseInputType) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
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
    category: initialData?.category || ('food' as ExpenseCategory),
    amount: initialData?.amount || 0,
    currency: (initialData?.currency as Currency) || ('TRY' as Currency),
    paymentMethod: initialData?.paymentMethod || undefined,
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    vendor: initialData?.vendor || '',
    notes: initialData?.notes || '',
  };

  const methods = useForm<ExpenseCreateInput>({
    resolver: zodResolver(ExpenseCreateSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = methods;

  const selectedDate = watch('date');

  const handleFormSubmit = (data: ExpenseCreateInput) => {
    onSubmit(data as CreateExpenseInputType);
  };

  return (
    <FormProvider {...methods}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.form}>
        {/* Category Picker */}
        <SmartCategoryPicker name="category" />

        {/* Amount */}
        <SmartInput
          name="amount"
          label={t('expenses.amount', 'Amount')}
          keyboardType="decimal-pad"
          left={<TextInput.Icon icon="cash-outline" />}
        />

        {/* Currency Picker */}
        <SmartCurrencyPicker
          name="currency"
          label={t('expenses.currency', 'Currency')}
        />

        {/* Payment Method Picker */}
        <SmartPaymentMethodPicker
          name="paymentMethod"
          label={t('expenses.paymentMethod', 'Payment Method')}
          optional
        />

        {/* Date Picker */}
        <SmartDatePicker
          name="date"
          label={t('expenses.date', 'Date')}
          mode="date"
          maximumDate={new Date()}
        />

        {/* Description */}
        <SmartInput
          name="description"
          label={t('expenses.description', 'Description')}
          multiline
          numberOfLines={3}
          left={<TextInput.Icon icon="text" />}
        />

        {/* Vendor */}
        <SmartInput
          name="vendor"
          label={t('expenses.vendor', 'Vendor')}
          left={<TextInput.Icon icon="storefront-outline" />}
        />

        {/* Notes */}
        <SmartInput
          name="notes"
          label={t('expenses.notes', 'Notes')}
          multiline
          numberOfLines={3}
          left={<TextInput.Icon icon="document-text-outline" />}
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
  inputContainer: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
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

export default ExpenseForm;
