import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme, TextInput } from 'react-native-paper';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  testID?: string;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  multiline = false,
  keyboardType = 'default',
  placeholder,
  disabled = false,
  maxLength,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  testID,
}: FormInputProps<T>) {
  const theme = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={styles.container}>
          <TextInput
            {...field}
            value={field.value || ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            label={`${label}${required ? ' *' : ''}`}
            placeholder={placeholder}
            multiline={multiline}
            keyboardType={keyboardType}
            disabled={disabled}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            testID={testID}
            mode="outlined"
            style={[
              multiline && styles.multilineInput
            ]}
            error={!!fieldState.error}
            editable={!disabled}
          />

          {fieldState.error && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {fieldState.error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  multilineInput: {
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'System',
  },
});

export default FormInput;