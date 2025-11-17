import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExpenseCreateSchema, ExpenseCreateInput } from '../lib/schemas/expenseSchema';
import { CreateExpenseInput as CreateExpenseInputType, Expense, ExpenseCategory, PaymentMethod, Currency } from '../lib/types';
import { useTranslation } from 'react-i18next';
import CategoryPicker from './CategoryPicker';
import CurrencyPicker from './CurrencyPicker';
import PaymentMethodPicker from './PaymentMethodPicker';
import { DateTimePicker } from './DateTimePicker';

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

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExpenseCreateInput>({
    resolver: zodResolver(ExpenseCreateSchema),
    defaultValues,
  });

  const selectedDate = watch('date');

  const handleFormSubmit = (data: ExpenseCreateInput) => {
    onSubmit(data as CreateExpenseInputType);
  };

  return (
    <ScrollView style={StyleSheet.flatten([styles.container, { backgroundColor: theme.colors.background }])}>
      <View style={styles.form}>
        {/* Category Picker */}
        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <CategoryPicker
              selectedCategory={value}
              onSelect={onChange}
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
                value={value?.toString() || ''}
                onChangeText={(text) => {
                  const num = parseFloat(text.replace(',', '.'));
                  onChange(isNaN(num) ? 0 : num);
                }}
                onBlur={onBlur}
                keyboardType="decimal-pad"
                mode="outlined"
                error={!!errors.amount}
                left={<TextInput.Icon icon="cash-outline" />}
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
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                onChange={(date: Date) => onChange(date.toISOString().split('T')[0])}
                mode="date"
                maximumDate={new Date()}
                error={!!errors.date}
                errorText={errors.date?.message}
              />
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
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                error={!!errors.vendor}
                left={<TextInput.Icon icon="storefront-outline" />}
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
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                error={!!errors.notes}
                multiline
                numberOfLines={3}
                left={<TextInput.Icon icon="document-text-outline" />}
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
