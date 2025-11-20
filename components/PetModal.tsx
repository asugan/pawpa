import { Portal, Snackbar } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import React from 'react';
import { Modal as RNModal, StyleSheet, Text, View } from 'react-native';
import { useCreatePet, useUpdatePet } from '../lib/hooks/usePets';
import { PetCreateInput } from '../lib/schemas/petSchema';
import { Pet } from '../lib/types';
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
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  // ✅ React Query hooks for server state
  const createPetMutation = useCreatePet();
  const updatePetMutation = useUpdatePet();

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
          breed: data.breed || undefined,
          birthDate: data.birthDate ? data.birthDate : undefined,
          weight: data.weight || undefined,
          gender: data.gender || undefined,
          profilePhoto: data.profilePhoto || undefined,
        };
        await updatePetMutation.mutateAsync({ id: pet.id, data: updateData });
        showSnackbar('Pet başarıyla güncellendi');
      } else {
        // Yeni pet oluşturma - breed undefined'ı null'a çevir
        const createData = {
          ...data,
          breed: data.breed || undefined,
          birthDate: data.birthDate ? data.birthDate : undefined,
          weight: data.weight || undefined,
          gender: data.gender || undefined,
          profilePhoto: data.profilePhoto || undefined,
        };
        await createPetMutation.mutateAsync(createData);
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
  }, [pet, createPetMutation, updatePetMutation, onSuccess, onClose, showSnackbar]);

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
        <View style={StyleSheet.flatten([styles.container, { backgroundColor: theme.colors.surface }])}>
          <View style={styles.header}>
            <Text style={StyleSheet.flatten([styles.title, { color: theme.colors.onSurface }])}>
              {pet ? 'Pet Düzenle' : 'Yeni Pet Ekle'}
            </Text>
          </View>

          <PetForm
            pet={pet}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            testID="pet-form-in-modal"
          />
        </View>
      </RNModal>

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={handleSnackbarDismiss}
          duration={3000}
          style={StyleSheet.flatten([
            styles.snackbar,
            { backgroundColor: snackbarMessage.includes('başarıyla') ? theme.colors.primary : theme.colors.error }
          ])}
         message={snackbarMessage} />
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