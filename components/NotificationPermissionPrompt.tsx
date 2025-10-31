import React from 'react';
import { View, StyleSheet, Linking, Platform } from 'react-native';
import { Text, Button, Card, useTheme, Portal, Dialog } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotifications } from '@/lib/hooks/useNotifications';

interface NotificationPermissionPromptProps {
  visible: boolean;
  onDismiss: () => void;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export default function NotificationPermissionPrompt({
  visible,
  onDismiss,
  onPermissionGranted,
  onPermissionDenied,
}: NotificationPermissionPromptProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { requestPermission, isLoading } = useNotifications();

  const handleRequestPermission = async () => {
    const granted = await requestPermission();

    if (granted) {
      onPermissionGranted?.();
      onDismiss();
    } else {
      onPermissionDenied?.();
    }
  };

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Content>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="bell-ring"
              size={64}
              color={theme.colors.primary}
            />
          </View>

          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('notifications.enableTitle')}
          </Text>

          <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            {t('notifications.enableDescription')}
          </Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={24}
                color={theme.colors.primary}
                style={styles.benefitIcon}
              />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {t('notifications.benefit1')}
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <MaterialCommunityIcons
                name="medical-bag"
                size={24}
                color={theme.colors.secondary}
                style={styles.benefitIcon}
              />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {t('notifications.benefit2')}
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <MaterialCommunityIcons
                name="food-apple"
                size={24}
                color={theme.colors.tertiary}
                style={styles.benefitIcon}
              />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {t('notifications.benefit3')}
              </Text>
            </View>
          </View>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={onDismiss}>
            {t('common.cancel')}
          </Button>
          <Button
            mode="contained"
            onPress={handleRequestPermission}
            loading={isLoading}
            disabled={isLoading}
          >
            {t('notifications.enable')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

/**
 * Inline notification permission card (for settings page)
 */
export function NotificationPermissionCard() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { permissionStatus, requestPermission, isLoading } = useNotifications();

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  if (permissionStatus === 'granted') {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
        <Card.Content>
          <View style={styles.cardContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={32}
              color={theme.colors.primary}
            />
            <View style={styles.cardText}>
              <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                {t('notifications.enabled')}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
                {t('notifications.enabledDescription')}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.errorContainer }]}>
        <Card.Content>
          <View style={styles.cardContent}>
            <MaterialCommunityIcons
              name="bell-off"
              size={32}
              color={theme.colors.error}
            />
            <View style={styles.cardText}>
              <Text variant="titleMedium" style={{ color: theme.colors.onErrorContainer }}>
                {t('notifications.disabled')}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
                {t('notifications.disabledDescription')}
              </Text>
            </View>
          </View>
          <Button
            mode="outlined"
            onPress={handleOpenSettings}
            style={styles.settingsButton}
            textColor={theme.colors.error}
          >
            {t('notifications.openSettings')}
          </Button>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.secondaryContainer }]}>
      <Card.Content>
        <View style={styles.cardContent}>
          <MaterialCommunityIcons
            name="bell-ring"
            size={32}
            color={theme.colors.secondary}
          />
          <View style={styles.cardText}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSecondaryContainer }}>
              {t('notifications.enableTitle')}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer }}>
              {t('notifications.enablePrompt')}
            </Text>
          </View>
        </View>
        <Button
          mode="contained"
          onPress={requestPermission}
          loading={isLoading}
          disabled={isLoading}
          style={styles.settingsButton}
        >
          {t('notifications.enable')}
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    marginRight: 12,
  },
  card: {
    marginVertical: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardText: {
    flex: 1,
    marginLeft: 16,
  },
  settingsButton: {
    marginTop: 8,
  },
});
