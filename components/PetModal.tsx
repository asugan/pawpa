import React from 'react';
import { View, StyleSheet, Modal as RNModal } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Pet } from '../lib/types';
import { PetCreateInput } from '../lib/schemas/petSchema';
import PetForm from './forms/PetForm';

interface PetModalProps {
  visible: boolean;
  pet?: Pet;
  onClose: () => void;
  onSuccess: () => void;
  testID?: string;
}

export function PetModal({
  visible,
  pet,
  onClose,
  onSuccess,
  testID,
}: PetModalProps) {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = React.useCallback(async (data: PetCreateInput) => {
    setLoading(true);
    try {
      // For now, just log the data. In Phase 4, this will be connected to the database
      console.log('Pet form submitted:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Pet creation error:', error);
      // TODO: Show error message to user
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onClose]);

  const handleClose = React.useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [onClose, loading]);

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onDismiss={handleClose}
      onRequestClose={handleClose}
      testID={testID}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <PetForm
          pet={pet}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          loading={loading}
          testID="pet-form-in-modal"
        />
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default PetModal;