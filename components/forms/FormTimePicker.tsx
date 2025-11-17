import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View, Text, Pressable, StyleSheet, Modal as RNModal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { IconButton, Button } from '@/components/ui';
import { useTheme } from '@/lib/theme';

interface FormTimePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  testID?: string;
  minuteInterval?: number;
}

export function FormTimePicker<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  disabled = false,
  placeholder,
  testID,
  minuteInterval = 15,
}: FormTimePickerProps<T>) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [tempHour, setTempHour] = React.useState(12);
  const [tempMinute, setTempMinute] = React.useState(0);

  const formatTime = (hour: number, minute: number) => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const parseTimeString = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  };

  const handleTimeSelect = (onChange: (value: string) => void, currentValue?: string) => {
    if (currentValue) {
      const { hours, minutes } = parseTimeString(currentValue);
      setTempHour(hours);
      setTempMinute(minutes);
    } else {
      const now = new Date();
      setTempHour(now.getHours());
      setTempMinute(Math.floor(now.getMinutes() / minuteInterval) * minuteInterval);
    }
    setModalVisible(true);
  };

  const adjustHour = (delta: number) => {
    const newHour = (tempHour + delta + 24) % 24;
    setTempHour(newHour);
  };

  const adjustMinute = (delta: number) => {
    const newMinute = (tempMinute + delta * minuteInterval + 60) % 60;
    setTempMinute(newMinute);
  };

  const generateMinuteOptions = () => {
    const options = [];
    for (let i = 0; i < 60; i += minuteInterval) {
      options.push(i);
    }
    return options;
  };

  const generateHourOptions = () => {
    return Array.from({ length: 24 }, (_, i) => i);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const openTimePicker = () => {
          if (!disabled) {
            handleTimeSelect(field.onChange, field.value);
          }
        };

        const getTimeDisplay = () => {
          if (!field.value) return placeholder || `${label}${required ? ' *' : ''}`;

          const { hours, minutes } = parseTimeString(field.value);
          return formatTime(hours, minutes);
        };

        return (
          <View style={styles.container}>
            <Pressable
              onPress={openTimePicker}
              disabled={disabled}
              style={StyleSheet.flatten([
                styles.timePicker,
                {
                  borderColor: fieldState.error
                    ? theme.colors.error
                    : fieldState.isTouched
                      ? theme.colors.primary
                      : theme.colors.outline,
                  backgroundColor: disabled
                    ? theme.colors.surfaceDisabled
                    : theme.colors.surface,
                }
              ])}
              testID={testID}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.timeText,
                  {
                    color: field.value
                      ? theme.colors.onSurface
                      : theme.colors.onSurfaceVariant,
                  }
                ])}
              >
                {getTimeDisplay()}
              </Text>

              <IconButton
                icon="clock"
                size={20}
                iconColor={theme.colors.onSurfaceVariant}
                disabled={disabled}
              />
            </Pressable>

            {fieldState.error && (
              <Text style={StyleSheet.flatten([styles.errorText, { color: theme.colors.error }])}>
                {fieldState.error.message}
              </Text>
            )}

            <RNModal
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
              animationType="slide"
              presentationStyle="pageSheet"
              transparent={false}
            >
              <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={StyleSheet.flatten([styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }])}>
                  <TouchableWithoutFeedback onPress={() => {}}>
                    <View style={StyleSheet.flatten([styles.modal, { backgroundColor: theme.colors.surface }])}>
                      <View style={styles.modalHeader}>
                        <Text style={StyleSheet.flatten([styles.modalTitle, { color: theme.colors.onSurface }])}>
                          {label}
                        </Text>
                        <IconButton
                          icon="close"
                          onPress={() => setModalVisible(false)}
                        />
                      </View>

                      <View style={styles.modalContent}>
                        <View style={StyleSheet.flatten([styles.timeDisplay, { backgroundColor: theme.colors.surfaceVariant }])}>
                          <Text style={StyleSheet.flatten([styles.timeDisplayText, { color: theme.colors.onSurface }])}>
                            {formatTime(tempHour, tempMinute)}
                          </Text>
                        </View>

                        {/* Quick Time Selections */}
                        <View style={styles.quickSelections}>
                          <Text style={StyleSheet.flatten([styles.sectionTitle, { color: theme.colors.onSurface }])}>
                            {t('forms.timePicker.quickSelect')}
                          </Text>
                          <View style={styles.quickButtonRow}>
                            {[
                              { label: t('forms.timePicker.now'), value: () => {
                                const now = new Date();
                                setTempHour(now.getHours());
                                setTempMinute(Math.floor(now.getMinutes() / minuteInterval) * minuteInterval);
                              }},
                              { label: '06:00', value: () => { setTempHour(6); setTempMinute(0); }},
                              { label: '12:00', value: () => { setTempHour(12); setTempMinute(0); }},
                              { label: '18:00', value: () => { setTempHour(18); setTempMinute(0); }},
                            ].map((option, index) => (
                              <Button
                                key={index}
                                mode="outlined"
                                onPress={option.value}
                                style={styles.quickButton}
                                compact
                              >
                                {option.label}
                              </Button>
                            ))}
                          </View>
                        </View>

                        {/* Hour Selection */}
                        <View style={styles.selectionSection}>
                          <Text style={StyleSheet.flatten([styles.sectionTitle, { color: theme.colors.onSurface }])}>
                            {t('forms.timePicker.hour')}
                          </Text>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.pickerScroll}
                          >
                            <View style={styles.pickerContainer}>
                              {generateHourOptions().map((hour) => (
                                <Pressable
                                  key={hour}
                                  onPress={() => setTempHour(hour)}
                                  style={StyleSheet.flatten([
                                    styles.pickerItem,
                                    {
                                      backgroundColor: tempHour === hour
                                        ? theme.colors.primary
                                        : theme.colors.surfaceVariant,
                                    }
                                  ])}
                                >
                                  <Text style={StyleSheet.flatten([
                                    styles.pickerItemText,
                                    {
                                      color: tempHour === hour
                                        ? theme.colors.onPrimary
                                        : theme.colors.onSurfaceVariant,
                                    }
                                  ])}>
                                    {hour.toString().padStart(2, '0')}
                                  </Text>
                                </Pressable>
                              ))}
                            </View>
                          </ScrollView>
                        </View>

                        {/* Minute Selection */}
                        <View style={styles.selectionSection}>
                          <Text style={StyleSheet.flatten([styles.sectionTitle, { color: theme.colors.onSurface }])}>
                            {t('forms.timePicker.minute')}
                          </Text>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.pickerScroll}
                          >
                            <View style={styles.pickerContainer}>
                              {generateMinuteOptions().map((minute) => (
                                <Pressable
                                  key={minute}
                                  onPress={() => setTempMinute(minute)}
                                  style={StyleSheet.flatten([
                                    styles.pickerItem,
                                    {
                                      backgroundColor: tempMinute === minute
                                        ? theme.colors.primary
                                        : theme.colors.surfaceVariant,
                                    }
                                  ])}
                                >
                                  <Text style={StyleSheet.flatten([
                                    styles.pickerItemText,
                                    {
                                      color: tempMinute === minute
                                        ? theme.colors.onPrimary
                                        : theme.colors.onSurfaceVariant,
                                    }
                                  ])}>
                                    {minute.toString().padStart(2, '0')}
                                  </Text>
                                </Pressable>
                              ))}
                            </View>
                          </ScrollView>
                        </View>

                        <View style={styles.modalActions}>
                          <Button
                            mode="outlined"
                            onPress={() => setModalVisible(false)}
                            style={styles.cancelButton}
                          >
                            {t('forms.timePicker.cancel')}
                          </Button>
                          <Button
                            mode="contained"
                            onPress={() => {
                              const timeString = formatTime(tempHour, tempMinute);
                              field.onChange(timeString);
                              setModalVisible(false);
                            }}
                            style={styles.confirmButton}
                          >
                            {t('forms.timePicker.select')}
                          </Button>
                        </View>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </RNModal>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    justifyContent: 'space-between',
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'System',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'System',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxHeight: '80%',
    padding: 0,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  modalContent: {
    padding: 20,
  },
  timeDisplay: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  timeDisplayText: {
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'System',
  },
  quickSelections: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    fontFamily: 'System',
  },
  quickButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  quickButton: {
    flex: 1,
  },
  selectionSection: {
    marginBottom: 20,
  },
  pickerScroll: {
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

export default FormTimePicker;