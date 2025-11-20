import { Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { format, isAfter } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SmartDatePicker } from './SmartDatePicker';

interface SmartDateTimePickerProps {
  dateName: string;
  timeName: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  testID?: string;
  minuteInterval?: number;
  mode?: 'past' | 'future';
}

export const SmartDateTimePicker = ({
  dateName,
  timeName,
  label,
  required = false,
  disabled = false,
  testID,
  minuteInterval = 15,
  mode = 'future',
}: SmartDateTimePickerProps) => {
  const { control } = useFormContext();
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
        <Text style={[styles.headerText, { color: theme.colors.onSurface }]}>
          {label}
          {required && ' *'}
        </Text>
        {dateValue && timeValue && (
          <Text style={[styles.combinedDisplay, { color: theme.colors.primary }]}>
            {formatDateTimeDisplay()}
          </Text>
        )}
      </View>

      <View style={styles.pickerRow}>
        <View style={styles.pickerContainer}>
          <SmartDatePicker
            name={dateName}
            label={t('forms.dateTimePicker.date')}
            disabled={disabled}
            testID={`${testID}-date`}
            mode="date"
          />
        </View>

        <View style={styles.pickerContainer}>
          <SmartDatePicker
            name={timeName}
            label={t('forms.dateTimePicker.time')}
            disabled={disabled}
            testID={`${testID}-time`}
            mode="time"
          />
        </View>
      </View>

      {/* Validation hint */}
      {dateValue && timeValue && (
        <View style={[styles.validationHint, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.hintText, { color: theme.colors.onSurfaceVariant }]}>
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
                  return t('forms.dateTimePicker.daysFromNow', { days: Math.floor(hoursFromNow / 24) });
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
};

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
