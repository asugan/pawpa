import { useEffect } from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, Button, Card } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { SubscriptionCard } from './SubscriptionCard';
import { usePaywallStore } from '@/stores/paywallStore';

/**
 * GlobalSubscriptionModal - Single global instance rendered at app root
 * Replaces per-tab SubscriptionModal instances
 */
export function GlobalSubscriptionModal() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isLoading } = useSubscription();
  const router = useRouter();
  
  // Global paywall state
  const { isOpen, triggerReason, closePaywall } = usePaywallStore();
  
  const handleUpgrade = () => {
    // Close the modal and navigate to subscription page
    closePaywall();
    router.push('/subscription');
  };
  
  const handleClose = () => {
    closePaywall();
  };
  
  // Log for debugging
  useEffect(() => {
    if (isOpen) {
      console.log(`[GlobalSubscriptionModal] Modal opened - Reason: ${triggerReason}`);
    }
  }, [isOpen, triggerReason]);
  
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View style={styles.centeredView}>
          <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <Card style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
              {/* Content identical to original SubscriptionModal */}
              <View style={styles.cardContent}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name="crown"
                      size={32}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
                    {t('subscription.modal.title')}
                  </Text>
                </View>

                {/* Description */}
                <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                  {triggerReason
                    ? t('subscription.modal.featureDescription', { feature: triggerReason })
                    : t('subscription.modal.description')}
                </Text>

                {/* Current Subscription Status */}
                <View style={styles.statusContainer}>
                  <SubscriptionCard compact={false} showManageButton={false} />
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                  <Button
                    mode="contained"
                    onPress={handleUpgrade}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.upgradeButton}
                  >
                    {t('subscription.modal.upgradeNow')}
                  </Button>
                  <Button
                    mode="text"
                    onPress={handleClose}
                    disabled={isLoading}
                    style={styles.laterButton}
                    textColor={theme.colors.onSurfaceVariant}
                  >
                    {t('subscription.modal.maybeLater')}
                  </Button>
                </View>

                {/* Features Preview */}
                <View style={styles.featuresPreview}>
                  <Text variant="labelMedium" style={[styles.featuresTitle, { color: theme.colors.onSurfaceVariant }]}>
                    {t('subscription.modal.includes')}
                  </Text>
                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="check" size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('subscription.features.unlimited')}
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="check" size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('subscription.features.advanced')}
                      </Text>
                    </View>
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="check" size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={[styles.featureText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('subscription.features.export')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

// Copy styles from SubscriptionModal.tsx
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    width: '100%',
    elevation: 8,
    borderRadius: 16,
  },
  cardContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 179, 209, 0.2)',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  statusContainer: {
    marginBottom: 24,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  upgradeButton: {
    marginBottom: 8,
  },
  laterButton: {
    alignSelf: 'center',
  },
  featuresPreview: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  featuresTitle: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    flex: 1,
  },
});
