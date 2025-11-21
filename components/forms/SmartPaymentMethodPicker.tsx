import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { PaymentMethod } from '../../lib/types';
import PaymentMethodPicker from '../PaymentMethodPicker';

interface SmartPaymentMethodPickerProps {
  name: string;
  label?: string;
  optional?: boolean;
}

export const SmartPaymentMethodPicker = ({
  name,
  label,
  optional = true,
}: SmartPaymentMethodPickerProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <PaymentMethodPicker
            selectedMethod={value as PaymentMethod}
            onSelect={onChange}
            label={label}
            error={error?.message}
            optional={optional}
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
