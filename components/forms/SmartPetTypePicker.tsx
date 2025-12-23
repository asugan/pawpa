import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import PetTypePicker from '@/components/PetTypePicker';

interface SmartPetTypePickerProps {
  name: string;
  label?: string;
  testID?: string;
}

export const SmartPetTypePicker = ({ name, label, testID }: SmartPetTypePickerProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <PetTypePicker
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
