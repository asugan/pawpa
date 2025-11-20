import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { PetPhotoPicker } from './PetPhotoPicker';

interface SmartPetPhotoPickerProps {
  name: string;
  petType?: string;
  disabled?: boolean;
}

export const SmartPetPhotoPicker = ({
  name,
  petType,
  disabled = false,
}: SmartPetPhotoPickerProps) => {
  const { control, watch } = useFormContext();
  
  // If petType is not provided, try to watch it from the form
  const watchedPetType = petType || watch('type');

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <PetPhotoPicker
          value={value}
          onChange={onChange}
          petType={watchedPetType}
          disabled={disabled}
        />
      )}
    />
  );
};
