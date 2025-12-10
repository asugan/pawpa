import { HelperText } from '@/components/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { CurrencyInput } from '../CurrencyInput';

interface SmartCurrencyInputProps {
  name: string;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  testID?: string;
}

export const SmartCurrencyInput = ({
  name,
  label,
  disabled = false,
  placeholder,
  testID,
}: SmartCurrencyInputProps) => {
  const formContext = useFormContext();
  const { control } = formContext || { control: undefined };

  // If no form context, render as a simple currency input
  if (!control) {
    return (
      <CurrencyInput
        label={label}
        value={0}
        onChange={() => {}}
        disabled={disabled}
        error={false}
        errorText={undefined}
        placeholder={placeholder}
        testID={testID}
      />
    );
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <CurrencyInput
            label={label}
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={!!error}
            errorText={error?.message}
            placeholder={placeholder}
            testID={testID}
          />
          {error && (
            <HelperText type="error" visible={!!error}>
              {error.message}
            </HelperText>
          )}
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
