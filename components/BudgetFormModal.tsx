import React from 'react';
import { Modal, Portal, useTheme } from 'react-native-paper';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import BudgetForm from './BudgetForm';
import { CreateBudgetLimitInput, BudgetLimit } from '../lib/types';

interface BudgetFormModalProps {
  visible: boolean;
  petId: string;
  budget?: BudgetLimit;
  onDismiss: () => void;
  onSubmit: (data: CreateBudgetLimitInput) => void;
  isSubmitting?: boolean;
}

const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  visible,
  petId,
  budget,
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
          <BudgetForm
            petId={petId}
            initialData={budget}
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

export default BudgetFormModal;
