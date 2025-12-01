import { HelperText, SegmentedButtons } from '@/components/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

interface SegmentedButton {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface SmartSegmentedButtonsProps {
  name: string;
  buttons: SegmentedButton[];
  density?: 'regular' | 'small' | 'medium' | 'high';
  disabled?: boolean;
  testID?: string;
}

/**
 * SmartSegmentedButtons component wraps SegmentedButtons with react-hook-form Controller.
 * Provides automatic form integration and error handling.
 */
export const SmartSegmentedButtons = ({
  name,
  buttons,
  density = 'small',
  disabled,
  testID,
}: SmartSegmentedButtonsProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <SegmentedButtons
            value={value}
            onValueChange={onChange}
            buttons={buttons}
            density={density}
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
