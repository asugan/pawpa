import { Button, Divider } from '@/components/ui';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  showDivider?: boolean;
  testID?: string;
}

/**
 * FormActions component for standardized form buttons.
 * Displays Cancel (outlined) and Submit (contained) buttons side-by-side.
 */
export const FormActions = ({
  onCancel,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  loading = false,
  disabled = false,
  showDivider = true,
  testID,
}: FormActionsProps) => {
  return (
    <>
      {showDivider && <Divider style={styles.divider} />}
      <View style={styles.container}>
        <Button
          mode="outlined"
          onPress={onCancel}
          disabled={loading || disabled}
          style={styles.cancelButton}
          testID={testID ? `${testID}-cancel` : 'form-cancel-button'}
        >
          {cancelLabel}
        </Button>
        <Button
          mode="contained"
          onPress={onSubmit}
          disabled={loading || disabled}
          style={styles.submitButton}
          testID={testID ? `${testID}-submit` : 'form-submit-button'}
        >
          {submitLabel}
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    marginVertical: 16,
  },
  container: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
