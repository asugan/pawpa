import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface FormWeightInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  testID?: string;
}

export function FormWeightInput<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  disabled = false,
  placeholder,
  min = 0.1,
  max = 200,
  step = 0.1,
  unit = 'kg',
  testID,
}: FormWeightInputProps<T>) {
  const theme = useTheme();

  const parseWeightValue = (text: string): number | undefined => {
    if (!text.trim()) return undefined;

    const cleanText = text.replace(',', '.').replace(/[^\d.]/g, '');
    const numValue = parseFloat(cleanText);

    if (isNaN(numValue)) return undefined;
    if (numValue < min) return min;
    if (numValue > max) return max;

    // Round to step precision
    const roundedValue = Math.round(numValue / step) * step;
    return parseFloat(roundedValue.toFixed(1));
  };

  const formatWeightValue = (value: number | undefined): string => {
    if (value === undefined || value === null) return '';
    return value.toFixed(1);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const [displayText, setDisplayText] = React.useState(
          formatWeightValue(field.value)
        );

        // Sync display text with field value changes
        React.useEffect(() => {
          setDisplayText(formatWeightValue(field.value));
        }, [field.value]);

        const handleTextChange = (text: string) => {
          setDisplayText(text);

          const parsedValue = parseWeightValue(text);
          if (parsedValue !== undefined) {
            field.onChange(parsedValue);
          } else if (text.trim() === '') {
            field.onChange(undefined);
          }
        };

        const handleBlur = () => {
          field.onBlur();

          // Format the display text on blur
          const formattedValue = formatWeightValue(field.value);
          setDisplayText(formattedValue);
        };

        return (
          <View style={styles.container}>
            <View style={styles.inputContainer}>
              <TextInput
                value={displayText}
                onChangeText={handleTextChange}
                onBlur={handleBlur}
                placeholder={placeholder || '0.0'}
                keyboardType="decimal-pad"
                editable={!disabled}
                maxLength={6} // Max like 999.9 kg
                style={[
                  styles.weightInput,
                  {
                    borderColor: fieldState.error
                      ? theme.colors.error
                      : fieldState.isTouched
                        ? theme.colors.primary
                        : theme.colors.outline,
                    backgroundColor: disabled
                      ? theme.colors.surfaceDisabled
                      : theme.colors.surface,
                    color: theme.colors.onSurface,
                  }
                ]}
                placeholderTextColor={theme.colors.onSurfaceVariant}
                testID={testID}
              />

              <View style={[styles.unitContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.unitText, { color: theme.colors.onSurfaceVariant }]}>
                  {unit}
                </Text>
              </View>
            </View>

            {fieldState.error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {fieldState.error.message}
              </Text>
            )}

            <View style={styles.helperContainer}>
              <Text style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
                Min: {min}{unit} - Max: {max}{unit}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  weightInput: {
    flex: 1,
    borderWidth: 2,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'System',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  unitContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 2,
    borderLeftWidth: 1,
    minWidth: 50,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'System',
  },
  helperContainer: {
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'System',
  },
});

export default FormWeightInput;