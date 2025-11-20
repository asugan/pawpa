import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { ExpenseCategory } from '../../lib/types';
import CategoryPicker from '../CategoryPicker';

interface SmartCategoryPickerProps {
  name: string;
  label?: string;
}

export const SmartCategoryPicker = ({
  name,
  label,
}: SmartCategoryPickerProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <CategoryPicker
            selectedCategory={value as ExpenseCategory}
            onSelect={onChange}
            label={label}
            error={error?.message}
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
