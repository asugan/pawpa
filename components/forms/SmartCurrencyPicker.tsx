import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Currency } from '../../lib/types';
import CurrencyPicker from '../CurrencyPicker';

interface SmartCurrencyPickerProps {
  name: string;
  label?: string;
}

export const SmartCurrencyPicker = ({
  name,
  label,
}: SmartCurrencyPickerProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <CurrencyPicker
            selectedCurrency={value as Currency}
            onSelect={onChange}
            label={label}
            error={error?.message}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
