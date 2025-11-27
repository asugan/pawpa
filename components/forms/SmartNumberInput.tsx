import { HelperText, TextInput } from '@/components/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

interface SmartNumberInputProps extends Omit<React.ComponentProps<typeof TextInput>, 'value' | 'onChangeText'> {
  name: string;
  label?: string;
  required?: boolean;
  min?: number;
  max?: number;
  decimal?: boolean;
  precision?: number;
}

export const SmartNumberInput = ({
  name,
  label,
  required,
  min,
  max,
  decimal = true,
  precision = 2,
  ...props
}: SmartNumberInputProps) => {
  const { control } = useFormContext();

  // Convert number to display string
  const formatValue = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null || value === '') {
      return '';
    }
    if (typeof value === 'number') {
      return isNaN(value) ? '' : String(value);
    }
    return String(value);
  };

  // Convert string input to number
  const parseValue = (text: string): number | undefined => {
    if (!text || text.trim() === '') {
      return undefined;
    }

    // Replace comma with dot for decimal parsing
    const normalizedText = text.replace(',', '.');

    // Remove any non-numeric characters except dot and minus
    const cleanedText = normalizedText.replace(/[^0-9.-]/g, '');

    const parsed = decimal ? parseFloat(cleanedText) : parseInt(cleanedText, 10);

    if (isNaN(parsed)) {
      return undefined;
    }

    // Apply precision for decimals
    if (decimal && precision !== undefined) {
      return Number(parsed.toFixed(precision));
    }

    return parsed;
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <TextInput
            label={label ? `${label}${required ? ' *' : ''}` : undefined}
            value={formatValue(value)}
            onChangeText={(text) => {
              const numericValue = parseValue(text);
              onChange(numericValue);
            }}
            onBlur={onBlur}
            error={!!error}
            mode="outlined"
            keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
            {...props}
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
