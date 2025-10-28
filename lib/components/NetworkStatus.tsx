import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useTheme } from 'react-native-paper';

interface NetworkStatusProps {
  children: React.ReactNode;
}

export function NetworkStatus({ children }: NetworkStatusProps) {
  const netInfo = useNetInfo();
  const theme = useTheme();

  if (netInfo.isConnected === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.errorContainer }]}>
        <Text style={[styles.message, { color: theme.colors.onErrorContainer }]}>
          📵 İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.
        </Text>
        {children}
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  message: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
});