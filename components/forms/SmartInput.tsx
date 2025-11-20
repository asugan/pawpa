import { HelperText, TextInput } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

interface SmartInputProps extends React.ComponentProps<typeof TextInput> {
  name: string;
  label?: string;
  required?: boolean;
}

export const SmartInput = ({ name, label, required, ...props }: SmartInputProps) => {
  const { control } = useFormContext();
  const { theme } = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <TextInput
            label={label ? `${label}${required ? ' *' : ''}` : undefined}
            value={value || ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!error}
            mode="outlined"
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
