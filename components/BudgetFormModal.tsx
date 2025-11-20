import React from 'react';
import { Modal as RNModal, View, StyleSheet } from 'react-native';
import { Text, Button } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import BudgetForm from './forms/BudgetForm';
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
  const { theme } = useTheme();

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
            {budget ? 'Edit Budget' : 'Add Budget'}
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

        <BudgetForm
          petId={petId}
          initialData={budget}
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

export default BudgetFormModal;
