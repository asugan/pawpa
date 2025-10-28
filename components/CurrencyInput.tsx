import React from 'react';
import { TextInput } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

interface CurrencyInputProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
  errorText?: string;
  placeholder?: string;
  testID?: string;
}

export function CurrencyInput({
  value,
  onChange,
  label,
  disabled = false,
  error = false,
  errorText,
  placeholder,
  testID,
}: CurrencyInputProps) {
  const theme = useTheme();

  const formatValue = (num?: number) => {
    if (num === undefined || num === null) return '';
    return num.toLocaleString('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const parseValue = (text: string) => {
    const cleaned = text.replace(/[^\d.,]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? undefined : parsed;
  };

  const handleChangeText = (text: string) => {
    const parsed = parseValue(text);
    onChange(parsed);
  };

  return (
    <TextInput
      label={label}
      value={formatValue(value)}
      onChangeText={handleChangeText}
      keyboardType="numeric"
      disabled={disabled}
      error={error}
      placeholder={placeholder}
      testID={testID}
      left={<TextInput.Icon icon="currency-try" />}
      style={{
        backgroundColor: disabled
          ? theme.colors.surfaceDisabled
          : theme.colors.surface,
      }}
    />
  );
}