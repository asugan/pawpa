import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import HealthRecordTypePicker from '@/components/HealthRecordTypePicker';

interface SmartHealthRecordTypePickerProps {
  name: string;
  label?: string;
  testID?: string;
}

export const SmartHealthRecordTypePicker = ({
  name,
  label,
  testID,
}: SmartHealthRecordTypePickerProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <HealthRecordTypePicker
            selectedType={value as string}
            onSelect={onChange}
            label={label}
            error={error?.message}
            testID={testID}
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
