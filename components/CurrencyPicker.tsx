import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { Currency } from '../lib/types';
import { CURRENCIES } from '../lib/schemas/expenseSchema';

interface CurrencyPickerProps {
  selectedCurrency: Currency;
  onSelect: (currency: Currency) => void;
  label?: string;
  error?: string;
}

const CurrencyPicker: React.FC<CurrencyPickerProps> = ({
  selectedCurrency,
  onSelect,
  label,
  error,
}) => {
  const theme = useTheme();

  const currencyButtons = CURRENCIES.map((currency) => {
    const symbols: Record<string, string> = {
      TRY: '₺',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    return {
      value: currency,
      label: `${symbols[currency]} ${currency}`,
      icon: undefined,
    };
  });

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]}>
          {label}
        </Text>
      )}
      <SegmentedButtons
        value={selectedCurrency}
        onValueChange={(value) => onSelect(value as Currency)}
        buttons={currencyButtons}
        style={styles.segmentedButtons}
      />
      {error && (
        <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
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
  segmentedButtons: {
    marginVertical: 4,
  },
  error: {
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CurrencyPicker;
