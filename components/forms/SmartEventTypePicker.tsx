import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import EventTypePicker from '@/components/EventTypePicker';

interface SmartEventTypePickerProps {
  name: string;
  label?: string;
  testID?: string;
}

export const SmartEventTypePicker = ({ name, label, testID }: SmartEventTypePickerProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <EventTypePicker
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
