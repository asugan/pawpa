import { Chip, HelperText, Text } from '@/components/ui';
import { DAYS_OF_WEEK } from '@/constants';
import { useTheme } from '@/lib/theme';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type DayValue = (typeof DAYS_OF_WEEK)[keyof typeof DAYS_OF_WEEK];

interface SmartDayPickerProps {
  name: string;
  label?: string;
  disabled?: boolean;
  showQuickSelect?: boolean;
  testID?: string;
}

/**
 * SmartDayPicker component for selecting days of the week.
 * Provides Chip-based selection with optional quick select buttons.
 */
export const SmartDayPicker = ({
  name,
  label,
  disabled,
  showQuickSelect = false,
  testID,
}: SmartDayPickerProps) => {
  const { control, setValue } = useFormContext();
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Days of the week with translations
  const daysOfWeek = React.useMemo(
    () => [
      { value: DAYS_OF_WEEK.MONDAY, label: t('days.monday') },
      { value: DAYS_OF_WEEK.TUESDAY, label: t('days.tuesday') },
      { value: DAYS_OF_WEEK.WEDNESDAY, label: t('days.wednesday') },
      { value: DAYS_OF_WEEK.THURSDAY, label: t('days.thursday') },
      { value: DAYS_OF_WEEK.FRIDAY, label: t('days.friday') },
      { value: DAYS_OF_WEEK.SATURDAY, label: t('days.saturday') },
      { value: DAYS_OF_WEEK.SUNDAY, label: t('days.sunday') },
    ],
    [t]
  );

  // Handle day toggle
  const toggleDay = (currentDays: DayValue[] | undefined, day: DayValue) => {
    const days = currentDays || [];
    const newDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    return newDays;
  };

  // Quick select functions
  const selectAllDays = () => {
    setValue(name, Object.values(DAYS_OF_WEEK), { shouldValidate: true, shouldDirty: true });
  };

  const selectWeekdays = () => {
    setValue(
      name,
      [
        DAYS_OF_WEEK.MONDAY,
        DAYS_OF_WEEK.TUESDAY,
        DAYS_OF_WEEK.WEDNESDAY,
        DAYS_OF_WEEK.THURSDAY,
        DAYS_OF_WEEK.FRIDAY,
      ],
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const selectWeekend = () => {
    setValue(name, [DAYS_OF_WEEK.SATURDAY, DAYS_OF_WEEK.SUNDAY], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const clearDays = () => {
    setValue(name, [], { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          {label && (
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>{label}</Text>
          )}

          {/* Quick select buttons */}
          {showQuickSelect && (
            <View style={styles.quickSelectContainer}>
              <Chip
                mode="outlined"
                onPress={selectAllDays}
                disabled={disabled}
                style={styles.quickSelectChip}
                textStyle={styles.quickSelectText}
              >
                {t('common.all')}
              </Chip>
              <Chip
                mode="outlined"
                onPress={selectWeekdays}
                disabled={disabled}
                style={styles.quickSelectChip}
                textStyle={styles.quickSelectText}
              >
                {t('common.weekdays')}
              </Chip>
              <Chip
                mode="outlined"
                onPress={selectWeekend}
                disabled={disabled}
                style={styles.quickSelectChip}
                textStyle={styles.quickSelectText}
              >
                {t('common.weekend')}
              </Chip>
              <Chip
                mode="outlined"
                onPress={clearDays}
                disabled={disabled}
                style={styles.quickSelectChip}
                textStyle={styles.quickSelectText}
              >
                {t('common.clear')}
              </Chip>
            </View>
          )}

          {/* Day chips */}
          <View style={styles.daysContainer}>
            {daysOfWeek.map((day) => {
              const isSelected = value?.includes(day.value) ?? false;
              return (
                <Chip
                  key={day.value}
                  mode={isSelected ? 'flat' : 'outlined'}
                  selected={isSelected}
                  onPress={() => {
                    const newValue = toggleDay(value, day.value);
                    onChange(newValue);
                  }}
                  disabled={disabled}
                  style={[
                    styles.dayChip,
                    isSelected && {
                      backgroundColor: theme.colors.primaryContainer,
                    },
                  ]}
                  textStyle={[
                    styles.dayChipText,
                    isSelected && { color: theme.colors.onPrimaryContainer },
                  ]}
                  testID={testID ? `${testID}-day-${day.value}` : undefined}
                >
                  {day.label}
                </Chip>
              );
            })}
          </View>

          {error && (
            <HelperText type="error" visible={!!error}>
              {error.message}
            </HelperText>
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
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  quickSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  quickSelectChip: {
    height: 32,
  },
  quickSelectText: {
    fontSize: 12,
    marginVertical: 0,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    minWidth: 80,
  },
  dayChipText: {
    fontSize: 13,
  },
});
