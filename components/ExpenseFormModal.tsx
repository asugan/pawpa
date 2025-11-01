import React from 'react';
import { Modal, Portal, useTheme } from 'react-native-paper';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import ExpenseForm from './ExpenseForm';
import { CreateExpenseInput, Expense } from '../lib/types';

interface ExpenseFormModalProps {
  visible: boolean;
  petId: string;
  expense?: Expense;
  onDismiss: () => void;
  onSubmit: (data: CreateExpenseInput) => void;
  isSubmitting?: boolean;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  visible,
  petId,
  expense,
  onDismiss,
  onSubmit,
  isSubmitting,
}) => {
  const theme = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ExpenseForm
            petId={petId}
            initialData={expense}
            onSubmit={onSubmit}
            onCancel={onDismiss}
            isSubmitting={isSubmitting}
          />
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 20,
    marginVertical: 40,
    borderRadius: 12,
    maxHeight: '90%',
  },
  keyboardAvoid: {
    flex: 1,
  },
});

export default ExpenseFormModal;
