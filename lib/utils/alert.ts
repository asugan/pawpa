import { Alert } from 'react-native';

export const showAlert = (...args: Parameters<typeof Alert.alert>) => {
  Alert.alert(...args);
};
