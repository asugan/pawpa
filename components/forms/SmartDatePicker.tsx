import { Text as PaperText, Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { fromUTCWithOffset, parseISODate, toTimeString, toUTCWithOffset } from '@/lib/utils/dateConversion';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type OutputFormat = 'iso' | 'iso-date' | 'iso-time' | 'date-object' | 'yyyy-mm-dd';

interface SmartDatePickerProps {
  name: string;
  label?: string;
  mode?: 'date' | 'datetime' | 'time';
  outputFormat?: OutputFormat;
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
  outputFormat = 'iso',
  minimumDate,
  maximumDate,
  disabled = false,
  testID,
  required = false,
}: SmartDatePickerProps) => {
  const { control } = useFormContext();
  const { theme } = useTheme();
  const [isPickerVisible, setPickerVisible] = useState(false);

  // Parse time string (HH:MM) to Date object
  const parseTimeStringToDate = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const date = new Date();
    date.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
    return date;
  };

  // Get Date object from stored value for display and picker
  const getDisplayDate = (val: unknown): Date => {
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
      // Handle time-only format (HH:MM)
      if (outputFormat === 'iso-time' || /^\d{1,2}:\d{2}$/.test(val)) {
        return parseTimeStringToDate(val) ?? new Date();
      }
      // Handle simple date format (YYYY-MM-DD)
      if (outputFormat === 'yyyy-mm-dd' || /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return parseISODate(val) ?? new Date();
      }
      // Handle ISO date/datetime format - convert from UTC to local
      if (val.includes('T')) {
        return fromUTCWithOffset(val);
      }
      return parseISODate(val) ?? new Date();
    }
    return new Date();
  };

  // Convert selected date to the desired output format (always store as UTC)
  const convertToOutputFormat = (date: Date): Date | string => {
    switch (outputFormat) {
      case 'iso':
        return toUTCWithOffset(date);
      case 'iso-date':
        // For date-only, still store as UTC with time set to 00:00:00
        const utcDate = new Date(date);
        utcDate.setHours(0, 0, 0, 0);
        return toUTCWithOffset(utcDate);
      case 'yyyy-mm-dd':
        // Return simple date string in YYYY-MM-DD format (local date)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      case 'iso-time':
        return toTimeString(date) ?? date.toISOString().split('T')[1].slice(0, 5);
      case 'date-object':
        return date;
      default:
        return toUTCWithOffset(date);
    }
  };

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

  const handlePickerChange = (onChange: (value: any) => void) => (event: any, selectedDate?: Date) => {
    setPickerVisible(Platform.OS === 'ios'); // Keep picker open on iOS

    if (event.type === 'dismissed' || (event.type === 'set' && selectedDate)) {
      if (selectedDate) {
        const outputValue = convertToOutputFormat(selectedDate);
        onChange(outputValue);
      }
      if (Platform.OS !== 'ios') {
        hidePicker();
      }
    }

    // Handle Android picker errors
    if (event.type === 'error') {
      console.error('DateTimePicker error:', event.nativeEvent?.error || 'Unknown error');
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
              {value ? formatDate(getDisplayDate(value)) : ''}
            </PaperText>
          </TouchableOpacity>

          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error.message}
            </Text>
          )}

          {isPickerVisible && (
            <DateTimePicker
              mode={mode}
              value={value ? getDisplayDate(value) : new Date()}
              onChange={handlePickerChange(onChange)}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              locale={Platform.OS === 'ios' ? 'tr_TR' : undefined}
              timeZoneName={Platform.OS === 'ios' ? 'Europe/Istanbul' : undefined}
              onError={(error) => {
                if (Platform.OS === 'android' && error) {
                  console.error('DateTimePicker error:', error);
                }
              }}
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
