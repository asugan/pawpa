import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View, Text, Pressable, StyleSheet, Modal as RNModal, TouchableWithoutFeedback } from 'react-native';
import { IconButton, Button } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { format } from 'date-fns';
import { tr , enUS } from 'date-fns/locale';

interface FormDatePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  testID?: string;
  mode?: 'past' | 'future'; // 'past' for historical dates, 'future' for upcoming events
}

export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  disabled = false,
  placeholder,
  testID,
  mode = 'past',
}: FormDatePickerProps<T>) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [tempDate, setTempDate] = React.useState(new Date());

  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return '';
    const locale = i18n.language === 'tr' ? tr : enUS;
    // Convert string to Date if needed
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return format(date, 'dd MMMM yyyy', { locale });
  };

  const handleDateSelect = (onChange: (date: string) => void, currentValue?: string) => {
    const now = new Date();

    // Convert string value to Date if provided
    const initialDate = currentValue ? new Date(currentValue) : now;
    setTempDate(initialDate);
    setModalVisible(true);
  };

  const adjustDate = (days: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(newDate.getDate() + days);

    const now = new Date();

    if (mode === 'future') {
      // For future dates: allow from today up to 10 years in the future
      const maxDate = new Date(now.getFullYear() + 10, 11, 31);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (newDate >= todayStart && newDate <= maxDate) {
        setTempDate(newDate);
      }
    } else {
      // For past dates: don't allow future dates or dates older than 30 years
      const minDate = new Date(now.getFullYear() - 30, 0, 1);

      if (newDate <= now && newDate >= minDate) {
        setTempDate(newDate);
      }
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const openDatePicker = () => {
          if (!disabled) {
            console.log('Date picker opening:', label);
            handleDateSelect(field.onChange, field.value);
          }
        };

        return (
          <View style={styles.container}>
            <Pressable
              onPress={openDatePicker}
              disabled={disabled}
              style={StyleSheet.flatten([
                styles.datePicker,
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
                  styles.dateText,
                  {
                    color: field.value
                      ? theme.colors.onSurface
                      : theme.colors.onSurfaceVariant,
                  }
                ])}
              >
                {field.value ? formatDate(field.value) : (placeholder || `${label}${required ? ' *' : ''}`)}
              </Text>

              <IconButton
                icon="calendar"
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
              onRequestClose={() => {
                console.log('Date picker modal closing');
                setModalVisible(false);
              }}
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
                        <View style={StyleSheet.flatten([styles.dateDisplay, { backgroundColor: theme.colors.surfaceVariant }])}>
                          <Text style={StyleSheet.flatten([styles.dateDisplayText, { color: theme.colors.onSurface }])}>
                            {formatDate(tempDate)}
                          </Text>
                        </View>

                        <View style={styles.dateControls}>
                          {mode === 'past' ? (
                            <>
                              <View style={styles.controlRow}>
                                <Button
                                  mode="outlined"
                                  onPress={() => adjustDate(-365)}
                                  style={styles.controlButton}
                                >
                                  {t('forms.datePicker.minusOneYear')}
                                </Button>
                                <Button
                                  mode="outlined"
                                  onPress={() => adjustDate(-30)}
                                  style={styles.controlButton}
                                >
                                  {t('forms.datePicker.minusOneMonth')}
                                </Button>
                                <Button
                                  mode="outlined"
                                  onPress={() => adjustDate(-7)}
                                  style={styles.controlButton}
                                >
                                  {t('forms.datePicker.minusOneWeek')}
                                </Button>
                              </View>

                              <View style={styles.controlRow}>
                                <Button
                                  mode="outlined"
                                  onPress={() => adjustDate(-1)}
                                  style={styles.controlButton}
                                >
                                  {t('forms.datePicker.minusOneDay')}
                                </Button>
                                <Button
                                  mode="outlined"
                                  onPress={() => adjustDate(1)}
                                  style={styles.controlButton}
                                >
                                  {t('forms.datePicker.plusOneDay')}
                                </Button>
                              </View>
                            </>
                          ) : (
                            <>
                              <View style={styles.controlRow}>
                                <Button
                                  mode="outlined"
                                  onPress={() => adjustDate(1)}
                                  style={styles.controlButton}
                                >
                                  {t('forms.datePicker.plusOneDay')}
                                </Button>
                                <Button
                                  mode="outlined"
                                  onPress={() => adjustDate(7)}
                                  style={styles.controlButton}
                                >
                                  {t('forms.datePicker.plusOneWeek')}
                                </Button>
                              </View>

                              <View style={styles.controlRow}>
                                <Button
                                  mode="outlined"
                                  onPress={() => adjustDate(30)}
                                  style={styles.controlButton}
                                >
                                  {t('forms.datePicker.plusOneMonth')}
                                </Button>
                                <Button
                                  mode="outlined"
                                  onPress={() => adjustDate(365)}
                                  style={styles.controlButton}
                                >
                                  {t('forms.datePicker.plusOneYear')}
                                </Button>
                              </View>
                            </>
                          )}
                        </View>

                        <View style={styles.modalActions}>
                          <Button
                            mode="outlined"
                            onPress={() => setModalVisible(false)}
                            style={styles.cancelButton}
                          >
                            {t('forms.datePicker.cancel')}
                          </Button>
                          <Button
                            mode="contained"
                            onPress={() => {
                              console.log('Date selected:', formatDate(tempDate));
                              // Convert Date object to 'YYYY-MM-DD' string format
                              const dateString = format(tempDate, 'yyyy-MM-dd');
                              field.onChange(dateString);
                              setModalVisible(false);
                            }}
                            style={styles.confirmButton}
                          >
                            {t('forms.datePicker.select')}
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
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    justifyContent: 'space-between',
  },
  dateText: {
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
  dateDisplay: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  dateDisplayText: {
    fontSize: 16,
    fontFamily: 'System',
  },
  dateControls: {
    marginBottom: 24,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

export default FormDatePicker;