import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Text as PaperText,  } from '@/components/ui';
import { useTheme } from '@/lib/theme';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'datetime' | 'time';
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  error?: boolean;
  errorText?: string;
}

export function DateTimePicker({
  value,
  onChange,
  mode = 'date',
  label,
  minimumDate,
  maximumDate,
  disabled = false,
  error = false,
  errorText,
}: DateTimePickerProps) {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const { theme } = useTheme();

  const showPicker = () => {
    if (!disabled) {
      setPickerVisible(true);
    }
  };

  const hidePicker = () => {
    setPickerVisible(false);
  };

  const handleConfirm = (date: Date) => {
    onChange(date);
    hidePicker();
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
    <View style={styles.container}>
      {label && (
        <Text style={StyleSheet.flatten([
          styles.label,
          { color: error ? theme.colors.error : theme.colors.onSurface }
        ])}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={showPicker}
        disabled={disabled}
        style={StyleSheet.flatten([
          styles.datePicker,
          {
            borderColor: error
              ? theme.colors.error
              : theme.colors.outline,
            backgroundColor: disabled
              ? theme.colors.surfaceDisabled
              : theme.colors.surface,
          }
        ])}
      >
        <PaperText style={StyleSheet.flatten([
          styles.dateText,
          {
            color: value
              ? theme.colors.onSurface
              : theme.colors.onSurfaceVariant,
          }
        ])}>
          {formatDate(value)}
        </PaperText>
      </TouchableOpacity>

      {error && errorText && (
        <Text style={StyleSheet.flatten([styles.errorText, { color: theme.colors.error }])}>
          {errorText}
        </Text>
      )}

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode={mode}
        date={value}
        onConfirm={handleConfirm}
        onCancel={hidePicker}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        locale="tr_TR"
        confirmTextIOS="Tamam"
        cancelTextIOS="İptal"
      />
    </View>
  );
}

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