import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View, Text, Pressable, StyleSheet, ScrollView, Modal as RNModal, TouchableWithoutFeedback } from 'react-native';
import { useTheme, IconButton, TextInput } from 'react-native-paper';

interface DropdownOption {
  value: string;
  label: string;
}

interface FormDropdownProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: DropdownOption[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchable?: boolean;
  testID?: string;
}

export function FormDropdown<T extends FieldValues>({
  control,
  name,
  label,
  options,
  required = false,
  disabled = false,
  placeholder,
  searchable = false,
  testID,
}: FormDropdownProps<T>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery) return options;

    return options.filter(option =>
      option && option.label && typeof option.label === 'string' &&
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, searchable]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedOption = options.find(option => option.value === field.value);

        const openDropdown = () => {
        if (!disabled) {
          setModalVisible(true);
        }
      };

      return (
          <View style={styles.container}>
            <Pressable
              onPress={openDropdown}
              disabled={disabled}
              style={[
                styles.dropdown,
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
              ]}
              testID={testID}
            >
              <Text
                style={[
                  styles.dropdownText,
                  {
                    color: field.value
                      ? theme.colors.onSurface
                      : theme.colors.onSurfaceVariant,
                  }
                ]}
                numberOfLines={1}
              >
                {selectedOption?.label || placeholder || `${label}${required ? ' *' : ''}`}
              </Text>

              <IconButton
                icon="chevron-down"
                size={20}
                iconColor={theme.colors.onSurfaceVariant}
                disabled={disabled}
              />
            </Pressable>

            {fieldState.error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {fieldState.error.message}
              </Text>
            )}

            <RNModal
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(false);
                setSearchQuery('');
              }}
              animationType="slide"
              presentationStyle="pageSheet"
              transparent={false}
            >
              <TouchableWithoutFeedback onPress={() => {
                setModalVisible(false);
                setSearchQuery('');
              }}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                  <TouchableWithoutFeedback onPress={() => {}}>
                    <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
                      <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                          {label}
                        </Text>
                        <IconButton
                          icon="close"
                          onPress={() => {
                            setModalVisible(false);
                            setSearchQuery('');
                          }}
                        />
                      </View>

                      {searchable && (
                        <View style={styles.searchContainer}>
                          <TextInput
                            placeholder={t('forms.dropdown.searchPlaceholder')}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={[
                              styles.searchInput,
                              {
                                borderColor: theme.colors.outline,
                                color: theme.colors.onSurface,
                              }
                            ]}
                            placeholderTextColor={theme.colors.onSurfaceVariant}
                          />
                        </View>
                      )}

                      <ScrollView
                        style={styles.optionsList}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        removeClippedSubviews={false}
                      >
                        {filteredOptions && filteredOptions.length > 0 ? (
                          filteredOptions.map((option) => (
                          <Pressable
                            key={option.value}
                            onPress={() => {
                              field.onChange(option.value);
                              setModalVisible(false);
                              setSearchQuery('');
                            }}
                            style={[
                              styles.option,
                              {
                                backgroundColor: field.value === option.value
                                  ? theme.colors.primaryContainer
                                  : 'transparent',
                              }
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                {
                                  color: field.value === option.value
                                    ? theme.colors.onPrimaryContainer
                                    : theme.colors.onSurface,
                                }
                              ]}
                            >
                              {option.label}
                            </Text>

                            {field.value === option.value && (
                              <IconButton
                                icon="check"
                                size={20}
                                iconColor={theme.colors.primary}
                              />
                            )}
                          </Pressable>
                        ))
                        ) : (
                          <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                              {searchable && searchQuery
                                ? t('forms.dropdown.noMatchingOptions')
                                : t('forms.dropdown.noOptionsAvailable')}
                            </Text>
                            {searchable && searchQuery && (
                              <Pressable onPress={() => setSearchQuery('')}>
                                <Text style={[styles.clearSearchText, { color: theme.colors.primary }]}>
                                  {t('forms.dropdown.clearSearch')}
                                </Text>
                              </Pressable>
                            )}
                          </View>
                        )}
                      </ScrollView>
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
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    justifyContent: 'space-between',
  },
  dropdownText: {
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
    minHeight: '50%',
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
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'System',
  },
  optionsList: {
    flex: 1,
    minHeight: 200,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'System',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'System',
    marginBottom: 12,
  },
  clearSearchText: {
    fontSize: 14,
    fontFamily: 'System',
    textDecorationLine: 'underline',
  },
});

export default FormDropdown;