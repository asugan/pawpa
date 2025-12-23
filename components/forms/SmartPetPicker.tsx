import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import PetPicker, { PetPickerBase } from '@/components/PetPicker';
import { Pet } from '@/lib/types';

interface SmartPetPickerProps {
  name: string;
  label?: string;
  required?: boolean;
  pets?: Pet[];
  disabled?: boolean;
  testID?: string;
}

export const SmartPetPicker = ({
  name,
  label,
  required,
  pets,
  disabled,
  testID,
}: SmartPetPickerProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          {pets ? (
            <PetPickerBase
              pets={pets}
              selectedPetId={value as string}
              onSelect={onChange}
              label={label}
              error={error?.message}
              required={required}
              disabled={disabled}
              testID={testID}
            />
          ) : (
            <PetPicker
              selectedPetId={value as string}
              onSelect={onChange}
              label={label}
              error={error?.message}
              required={required}
              disabled={disabled}
              testID={testID}
            />
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
