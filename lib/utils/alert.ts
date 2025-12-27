import { Alert } from 'react-native';

// Central wrapper for alerts to allow future logging/analytics or custom styling.
export const showAlert = (...args: Parameters<typeof Alert.alert>) => {
  Alert.alert(...args);
};
