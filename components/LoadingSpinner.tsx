import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

interface LoadingSpinnerProps {
  size?: 'small' | 'large' | number;
  text?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  text,
  overlay = false,
}) => {
  const theme = useTheme();

  const spinner = (
    <View style={[styles.container, overlay && styles.overlay]}>
      <ActivityIndicator
        size={size}
        animating={true}
        color={theme.colors.primary}
        style={styles.spinner}
      />
      {text && (
        <Text
          variant="bodyMedium"
          style={[styles.text, { color: theme.colors.onSurface }]}
        >
          {text}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View style={[styles.overlayContainer, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
        {spinner}
      </View>
    );
  }

  return spinner;
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  spinner: {
    marginBottom: 12,
  },
  text: {
    textAlign: 'center',
  },
});

export default LoadingSpinner;