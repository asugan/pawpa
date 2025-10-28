import React from 'react';
import { View, StyleSheet, Modal as RNModal, Text } from 'react-native';
import { useTheme, Portal, Snackbar } from 'react-native-paper';
import { Pet } from '../lib/types';
import { PetCreateInput } from '../lib/schemas/petSchema';
import PetForm from './forms/PetForm';
import { usePetStore } from '../stores/petStore';

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
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const { createPet, updatePet } = usePetStore();

  const showSnackbar = React.useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  const handleSubmit = React.useCallback(async (data: PetCreateInput) => {
    setLoading(true);
    try {
      if (pet) {
        // Pet güncelleme - breed undefined'ı null'a çevir
        const updateData = {
          ...data,
          breed: data.breed || null,
          birthDate: data.birthDate ? data.birthDate.toISOString() : null,
          weight: data.weight || null,
          gender: data.gender || null,
          profilePhoto: data.profilePhoto || null,
        };
        await updatePet(pet.id, updateData);
        showSnackbar('Pet başarıyla güncellendi');
      } else {
        // Yeni pet oluşturma - breed undefined'ı null'a çevir
        const createData = {
          ...data,
          breed: data.breed || null,
          birthDate: data.birthDate ? data.birthDate.toISOString() : null,
          weight: data.weight || null,
          gender: data.gender || null,
          profilePhoto: data.profilePhoto || null,
        };
        await createPet(createData);
        showSnackbar('Pet başarıyla eklendi');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Pet operation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'İşlem başarısız oldu';
      showSnackbar(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pet, createPet, updatePet, onSuccess, onClose, showSnackbar]);

  const handleClose = React.useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [onClose, loading]);

  const handleSnackbarDismiss = React.useCallback(() => {
    setSnackbarVisible(false);
  }, []);

  return (
    <>
      <RNModal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onDismiss={handleClose}
        onRequestClose={handleClose}
        testID={testID}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              {pet ? 'Pet Düzenle' : 'Yeni Pet Ekle'}
            </Text>
          </View>

          <PetForm
            pet={pet}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={loading}
            testID="pet-form-in-modal"
          />
        </View>
      </RNModal>

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={handleSnackbarDismiss}
          duration={3000}
          style={[
            styles.snackbar,
            { backgroundColor: snackbarMessage.includes('başarıyla') ? theme.colors.primary : theme.colors.error }
          ]}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
  },
  snackbar: {
    marginBottom: 16,
  },
});

export default PetModal;