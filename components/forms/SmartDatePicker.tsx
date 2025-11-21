import { Text as PaperText, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface SmartDatePickerProps {
  name: string;
  label?: string;
  mode?: 'date' | 'datetime' | 'time';
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  testID?: string;
  required?: boolean;
}

export const SmartDatePicker = ({
  name,
  label,
  mode = 'date',
  minimumDate,
  maximumDate,
  disabled = false,
  testID,
  required = false,
}: SmartDatePickerProps) => {
  const { control } = useFormContext();
  const { theme } = useTheme();
  const [isPickerVisible, setPickerVisible] = useState(false);

  const showPicker = () => {
    if (!disabled) {
      setPickerVisible(true);
    }
  };

  const hidePicker = () => {
    setPickerVisible(false);
  };

  const formatDate = (date: Date) => {
    if (mode === 'time') {
      return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (mode === 'datetime') {
      return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={styles.container}>
          {label && (
            <Text style={[
              styles.label,
              { color: error ? theme.colors.error : theme.colors.onSurface }
            ]}>
              {label}
              {required && ' *'}
            </Text>
          )}

          <TouchableOpacity
            onPress={showPicker}
            disabled={disabled}
            style={[
              styles.datePicker,
              {
                borderColor: error
                  ? theme.colors.error
                  : theme.colors.outline,
                backgroundColor: disabled
                  ? theme.colors.surfaceDisabled
                  : theme.colors.surface,
              }
            ]}
            testID={testID}
          >
            <PaperText style={[
              styles.dateText,
              {
                color: value
                  ? theme.colors.onSurface
                  : theme.colors.onSurfaceVariant,
              }
            ]}>
              {value ? formatDate(new Date(value)) : ''}
            </PaperText>
          </TouchableOpacity>

          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error.message}
            </Text>
          )}

          <DateTimePickerModal
            isVisible={isPickerVisible}
            mode={mode}
            date={value ? new Date(value) : new Date()}
            onConfirm={(date) => {
              onChange(date);
              hidePicker();
            }}
            onCancel={hidePicker}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale="tr_TR"
            confirmTextIOS="Tamam"
            cancelTextIOS="İptal"
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  datePicker: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    minHeight: 56,
  },
  dateText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
