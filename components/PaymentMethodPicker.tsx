import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text,  } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { PaymentMethod } from '../lib/types';
import { PAYMENT_METHODS } from '../lib/schemas/expenseSchema';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

  const getMethodIcon = (method: PaymentMethod): string => {
    const icons: Record<PaymentMethod, string> = {
      cash: 'cash',
      credit_card: 'credit-card',
      debit_card: 'credit-card-outline',
      bank_transfer: 'bank-transfer',
    };
    return icons[method] || 'cash';
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
        <Text variant="labelLarge" style={StyleSheet.flatten([styles.label, { color: theme.colors.onSurface }])}>
          {label} {optional && <Text style={{ opacity: 0.6 }}>(Optional)</Text>}
        </Text>
      )}
      <View style={styles.chipContainer}>
        {PAYMENT_METHODS.map((method) => (
          <Chip
            key={method}
            selected={selectedMethod === method}
            onPress={() => handleSelect(method)}
            style={styles.chip}
            icon={({ size, color }: { size: number, color: string }) => (
              <MaterialCommunityIcons
                name={getMethodIcon(method) as any}
                size={size}
                color={selectedMethod === method ? theme.colors.primary : color}
              />
            )}
            mode={selectedMethod === method ? 'flat' : 'outlined'}
            selectedColor={theme.colors.primary}
          >
            {t(`expenses.paymentMethods.${method}`, method)}
          </Chip>
        ))}
      </View>
      {error && (
        <Text variant="bodySmall" style={StyleSheet.flatten([styles.error, { color: theme.colors.error }])}>
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
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
