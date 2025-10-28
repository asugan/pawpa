import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Avatar,
  Button,
  Surface,
  Text,
  Portal,
  Modal,
  List,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Pet } from '../../lib/types';

interface PetPhotoPickerProps {
  value?: string;
  onChange: (photoUri: string | undefined) => void;
  petType?: Pet['type'];
  disabled?: boolean;
}

const getDefaultIcon = (petType?: Pet['type']): string => {
  switch (petType) {
    case 'dog':
      return 'dog';
    case 'cat':
      return 'cat';
    case 'bird':
      return 'bird';
    case 'rabbit':
      return 'rabbit';
    case 'hamster':
      return 'hamster';
    case 'fish':
      return 'fish';
    case 'reptile':
      return 'lizard';
    default:
      return 'paw';
  }
};

const getDefaultColor = (petType?: Pet['type']): string => {
  switch (petType) {
    case 'dog':
      return '#FFB3D1'; // Pink
    case 'cat':
      return '#B3FFD9'; // Mint
    case 'bird':
      return '#C8B3FF'; // Lavender
    case 'rabbit':
      return '#FFDAB3'; // Peach
    case 'hamster':
      return '#FFF3B3'; // Light yellow
    case 'fish':
      return '#87CEEB'; // Sky blue
    case 'reptile':
      return '#98FB98'; // Pale green
    default:
      return '#FFB3D1'; // Default pink
  }
};

export const PetPhotoPicker: React.FC<PetPhotoPickerProps> = ({
  value,
  onChange,
  petType,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        cameraPermission.status !== 'granted' ||
        mediaLibraryPermission.status !== 'granted'
      ) {
        Alert.alert(
          'İzin Gerekli',
          'Fotoğraf seçmek için kamera ve galeri izinleri gerekli.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Ayarlar', onPress: () => {/* Settings'e yönlendirme eklenebilir */} },
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  const pickFromGallery = async () => {
    setModalVisible(false);

    if (!(await requestPermissions())) {
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        onChange(photoUri);
      }
    } catch (error) {
      console.error('Gallery picker error:', error);
      Alert.alert('Hata', 'Fotoğraf seçilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    setModalVisible(false);

    if (!(await requestPermissions())) {
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        onChange(photoUri);
      }
    } catch (error) {
      console.error('Camera picker error:', error);
      Alert.alert('Hata', 'Fotoğraf çekilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = () => {
    setModalVisible(false);
    onChange(undefined);
  };

  const openPicker = () => {
    if (!disabled) {
      console.log('Pet photo picker açılıyor...');
      setModalVisible(true);
    }
  };

  const defaultIcon = getDefaultIcon(petType);
  const defaultColor = getDefaultColor(petType);

  return (
    <>
      <View style={styles.container} pointerEvents="box-none">
        <TouchableOpacity
          onPress={openPicker}
          style={[styles.photoContainer, disabled && styles.disabled]}
          disabled={disabled}
          activeOpacity={0.8}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          {value ? (
            <>
              <Image source={{ uri: value }} style={styles.photo} />
              {!disabled && (
                <View style={styles.overlay}>
                  <Avatar.Icon size={24} icon="camera" style={styles.cameraIcon} />
                </View>
              )}
            </>
          ) : (
            <Avatar.Icon
              size={100}
              icon={defaultIcon}
              style={[styles.defaultAvatar, { backgroundColor: defaultColor }]}
            />
          )}
          {loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={openPicker}
            disabled={disabled}
            style={styles.button}
            compact
          >
            {value ? 'Değiştir' : 'Fotoğraf Ekle'}
          </Button>
          {value && !disabled && (
            <Button
              mode="text"
              onPress={() => onChange(undefined)}
              textColor="#FF6B6B"
              compact
            >
              Kaldır
            </Button>
          )}
        </View>
      </View>

        <Modal
          visible={modalVisible}
          onDismiss={() => {
            console.log('Photo picker modal kapanıyor');
            setModalVisible(false);
          }}
          contentContainerStyle={[
            styles.modal,
            {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }
          ]}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Fotoğraf Seç
          </Text>

          <Surface style={styles.modalContent}>
            <List.Item
              title="Galeriden Seç"
              description="Cihazınızdaki fotoğrafları seçin"
              left={(props) => <List.Icon {...props} icon="image" />}
              onPress={pickFromGallery}
              style={styles.modalItem}
            />

            <List.Item
              title="Fotoğraf Çek"
              description="Yeni bir fotoğraf çekin"
              left={(props) => <List.Icon {...props} icon="camera" />}
              onPress={takePhoto}
              style={styles.modalItem}
            />

            {value && (
              <List.Item
                title="Fotoğrafı Kaldır"
                description="Mevcut fotoğrafı silin"
                left={(props) => <List.Icon {...props} icon="delete" />}
                onPress={removePhoto}
                style={[styles.modalItem, styles.dangerItem]}
                titleStyle={{ color: '#FF6B6B' }}
              />
            )}
          </Surface>

          <Button
            mode="text"
            onPress={() => setModalVisible(false)}
            style={styles.cancelButton}
          >
            İptal
          </Button>
        </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    backgroundColor: '#FFB3D1',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 4,
  },
  cameraIcon: {
    backgroundColor: 'transparent',
  },
  loaderContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    minWidth: 120,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalContent: {
    borderRadius: 8,
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 4,
  },
  dangerItem: {
    backgroundColor: '#FFE5E5',
  },
  cancelButton: {
    width: '100%',
  },
});