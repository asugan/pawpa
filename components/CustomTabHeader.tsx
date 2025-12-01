import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { NetworkStatusBadge } from './NetworkStatusBadge';

interface CustomTabHeaderProps {
  showNetworkBadge?: boolean;
  pageTitle?: string;
}

export default function CustomTabHeader({ showNetworkBadge = true, pageTitle }: CustomTabHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Logo - Left */}
      <View style={styles.left}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Network Badge - Center */}
      <View style={styles.center}>
        {showNetworkBadge && <NetworkStatusBadge />}
      </View>

      {/* Page Title - Right */}
      <View style={styles.right}>
        {pageTitle && (
          <Text
            variant="titleMedium"
            style={[styles.pageTitle, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {pageTitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 4,
    paddingRight: 16,
    height: 56,
  },
  left: {
    width: 200,
  },
  center: {
    position: 'absolute',
    left: '50%',
    marginLeft: -40,
  },
  right: {
    width: 100,
    alignItems: 'flex-end',
  },
  logo: {
    width: 200,
    height: 64,
  },
  pageTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
});
