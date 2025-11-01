import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExpenseCreateSchema } from '../lib/schemas/expenseSchema';
import { CreateExpenseInput, Expense, ExpenseCategory, PaymentMethod, Currency } from '../lib/types';
import { useTranslation } from 'react-i18next';
import CategoryPicker from './CategoryPicker';
import CurrencyPicker from './CurrencyPicker';
import PaymentMethodPicker from './PaymentMethodPicker';
import DatePicker from './DatePicker';

interface ExpenseFormProps {
  petId: string;
  initialData?: Expense;
  onSubmit: (data: CreateExpenseInput) => void;
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
  const theme = useTheme();
  const { t } = useTranslation();

  const defaultValues: Partial<CreateExpenseInput> = {
    petId,
    category: initialData?.category || 'food',
    amount: initialData?.amount || 0,
    currency: (initialData?.currency as Currency) || 'TRY',
    paymentMethod: initialData?.paymentMethod || undefined,
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    vendor: initialData?.vendor || '',
    notes: initialData?.notes || '',
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(ExpenseCreateSchema),
    defaultValues,
  });

  const selectedDate = watch('date');

  const handleFormSubmit = (data: CreateExpenseInput) => {
    onSubmit(data);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.form}>
        {/* Category Picker */}
        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <CategoryPicker
              selectedCategory={value}
              onSelect={onChange}
              label={t('expenses.category', 'Category')}
              error={errors.category?.message}
            />
          )}
        />

        {/* Amount */}
        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                label={t('expenses.amount', 'Amount')}
                value={value?.toString() || ''}
                onChangeText={(text) => {
                  const num = parseFloat(text.replace(',', '.'));
                  onChange(isNaN(num) ? 0 : num);
                }}
                onBlur={onBlur}
                keyboardType="decimal-pad"
                mode="outlined"
                error={!!errors.amount}
                left={<TextInput.Icon icon="currency-usd" />}
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
              label={t('expenses.currency', 'Currency')}
              error={errors.currency?.message}
            />
          )}
        />

        {/* Payment Method Picker */}
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field: { value, onChange } }) => (
            <PaymentMethodPicker
              selectedMethod={value || null}
              onSelect={onChange}
              label={t('expenses.paymentMethod', 'Payment Method')}
              error={errors.paymentMethod?.message}
              optional
            />
          )}
        />

        {/* Date Picker */}
        <Controller
          control={control}
          name="date"
          render={({ field: { value, onChange } }) => (
            <View style={styles.inputContainer}>
              <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]}>
                {t('expenses.date', 'Date')}
              </Text>
              <DatePicker
                selectedDate={value ? new Date(value) : new Date()}
                onDateChange={onChange}
                maximumDate={new Date()}
                label={t('expenses.selectDate', 'Select Date')}
              />
              {errors.date && (
                <HelperText type="error" visible={!!errors.date}>
                  {errors.date.message}
                </HelperText>
              )}
            </View>
          )}
        />

        {/* Description */}
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                label={t('expenses.description', 'Description (Optional)')}
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                error={!!errors.description}
                multiline
                numberOfLines={3}
                left={<TextInput.Icon icon="text" />}
              />
              {errors.description && (
                <HelperText type="error" visible={!!errors.description}>
                  {errors.description.message}
                </HelperText>
              )}
            </View>
          )}
        />

        {/* Vendor */}
        <Controller
          control={control}
          name="vendor"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                label={t('expenses.vendor', 'Vendor (Optional)')}
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                error={!!errors.vendor}
                left={<TextInput.Icon icon="store" />}
              />
              {errors.vendor && (
                <HelperText type="error" visible={!!errors.vendor}>
                  {errors.vendor.message}
                </HelperText>
              )}
            </View>
          )}
        />

        {/* Notes */}
        <Controller
          control={control}
          name="notes"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                label={t('expenses.notes', 'Notes (Optional)')}
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                error={!!errors.notes}
                multiline
                numberOfLines={3}
                left={<TextInput.Icon icon="note-text" />}
              />
              {errors.notes && (
                <HelperText type="error" visible={!!errors.notes}>
                  {errors.notes.message}
                </HelperText>
              )}
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
