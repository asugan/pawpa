import React from 'react';
import { Modal as RNModal, View, StyleSheet } from 'react-native';
import { useTheme, Text, Button } from 'react-native-paper';
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
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {expense ? 'Edit Expense' : 'Add Expense'}
          </Text>
          <Button
            mode="text"
            onPress={onDismiss}
            disabled={isSubmitting}
            compact
          >
            Close
          </Button>
        </View>

        <ExpenseForm
          petId={petId}
          initialData={expense}
          onSubmit={onSubmit}
          onCancel={onDismiss}
          isSubmitting={isSubmitting}
        />
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ExpenseFormModal;
