import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useNetInfo } from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function NetworkStatusBadge() {
  const netInfo = useNetInfo();
  const { theme } = useTheme();

  if (netInfo.isConnected === false) {
    return (
      <View style={StyleSheet.flatten([styles.container, { backgroundColor: theme.colors.errorContainer }])}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={16}
          color={theme.colors.onErrorContainer}
        />
        <Text variant="bodySmall" style={StyleSheet.flatten([styles.text, { color: theme.colors.onErrorContainer }])}>
          Çevrimdışı
        </Text>
      </View>
    );
  }

  if (netInfo.type === 'wifi') {
    return (
      <View style={StyleSheet.flatten([styles.container, { backgroundColor: theme.colors.primaryContainer }])}>
        <MaterialCommunityIcons
          name="wifi"
          size={16}
          color={theme.colors.onPrimaryContainer}
        />
        <Text variant="bodySmall" style={StyleSheet.flatten([styles.text, { color: theme.colors.onPrimaryContainer }])}>
          Wi-Fi
        </Text>
      </View>
    );
  }

  if (netInfo.type === 'cellular') {
    return (
      <View style={StyleSheet.flatten([styles.container, { backgroundColor: theme.colors.secondaryContainer }])}>
        <MaterialCommunityIcons
          name="signal-cellular-1"
          size={16}
          color={theme.colors.onSecondaryContainer}
        />
        <Text variant="bodySmall" style={StyleSheet.flatten([styles.text, { color: theme.colors.onSecondaryContainer }])}>
          Mobil
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default NetworkStatusBadge;