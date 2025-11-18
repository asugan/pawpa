import { Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { format, isAfter } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import React from 'react';
import { Control, FieldValues, Path, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { FormDatePicker } from './FormDatePicker';
import { FormTimePicker } from './FormTimePicker';

interface FormDateTimePickerProps<T extends FieldValues> {
  control: Control<T>;
  dateName: Path<T>;
  timeName: Path<T>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  testID?: string;
  minuteInterval?: number;
  mode?: 'past' | 'future'; // 'past' for historical dates, 'future' for upcoming events
}

export function FormDateTimePicker<T extends FieldValues>({
  control,
  dateName,
  timeName,
  label,
  required = false,
  disabled = false,
  testID,
  minuteInterval = 15,
  mode = 'future',
}: FormDateTimePickerProps<T>) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  // Watch both date and time values
  const dateValue = useWatch({ control, name: dateName });
  const timeValue = useWatch({ control, name: timeName });

  const locale = i18n.language === 'tr' ? tr : enUS;

  // Combine date and time for validation
  const getCombinedDateTime = () => {
    if (!dateValue || !timeValue) return null;

    const [year, month, day] = dateValue.split('-').map(Number);
    const [hours, minutes] = timeValue.split(':').map(Number);

    const date = new Date(year, month - 1, day, hours, minutes);
    return date;
  };

  const formatDateTimeDisplay = () => {
    if (!dateValue || !timeValue) return '';

    const [year, month, day] = dateValue.split('-').map(Number);
    const [hours, minutes] = timeValue.split(':').map(Number);

    const date = new Date(year, month - 1, day, hours, minutes);
    return format(date, 'dd MMMM yyyy HH:mm', { locale });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={StyleSheet.flatten([styles.headerText, { color: theme.colors.onSurface }])}>
          {label}
          {required && ' *'}
        </Text>
        {dateValue && timeValue && (
          <Text style={StyleSheet.flatten([styles.combinedDisplay, { color: theme.colors.primary }])}>
            {formatDateTimeDisplay()}
          </Text>
        )}
      </View>

      <View style={styles.pickerRow}>
        <View style={styles.pickerContainer}>
          <FormDatePicker
            control={control}
            name={dateName}
            required={required}
            disabled={disabled}
            testID={`${testID}-date`}
            label={t('forms.dateTimePicker.date')}
            mode={mode}
          />
        </View>

        <View style={styles.pickerContainer}>
          <FormTimePicker
            control={control}
            name={timeName}
            required={required}
            disabled={disabled}
            testID={`${testID}-time`}
            label={t('forms.dateTimePicker.time')}
            minuteInterval={minuteInterval}
          />
        </View>
      </View>

      {/* Validation hint */}
      {dateValue && timeValue && (
        <View style={StyleSheet.flatten([styles.validationHint, { backgroundColor: theme.colors.surfaceVariant }])}>
          <Text style={StyleSheet.flatten([styles.hintText, { color: theme.colors.onSurfaceVariant }])}>
            {(() => {
              const combinedDateTime = getCombinedDateTime();
              if (!combinedDateTime) return '';

              const now = new Date();
              const isFuture = isAfter(combinedDateTime, now);

              if (isFuture) {
                const timeDiff = combinedDateTime.getTime() - now.getTime();
                const hoursFromNow = Math.floor(timeDiff / (1000 * 60 * 60));
                const minutesFromNow = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

                if (hoursFromNow === 0) {
                  return t('forms.dateTimePicker.minutesFromNow', { minutes: minutesFromNow });
                } else if (hoursFromNow < 24) {
                  return t('forms.dateTimePicker.hoursFromNow', { hours: hoursFromNow });
                } else {
                  return t('forms.dateTimePick er.daysFromNow', { days: Math.floor(hoursFromNow / 24) });
                }
              } else {
                return t('forms.dateTimePicker.pastDateTimeWarning');
              }
            })()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'System',
  },
  combinedDisplay: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'System',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerContainer: {
    flex: 1,
  },
  validationHint: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    fontFamily: 'System',
  },
});

export default FormDateTimePicker;