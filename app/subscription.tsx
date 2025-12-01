import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RevenueCatUI from 'react-native-purchases-ui';
import { Text, Button, Card, IconButton } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { SubscriptionCard } from '@/components/subscription';

/**
 * Subscription screen with RevenueCat paywall
 * Allows users to view plans, subscribe, and manage their subscription
 */
export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const {
    isSubscribed,
    isLoading,
    restorePurchases,
  } = useSubscription();

  const handleRestore = async () => {
    await restorePurchases();
  };

  const handleTerms = () => {
    // Replace with your actual terms URL
    Linking.openURL('https://dekadans.com/terms');
  };

  const handlePrivacy = () => {
    // Replace with your actual privacy URL
    Linking.openURL('https://dekadans.com/privacy');
  };

  const handleBack = () => {
    router.back();
  };

  // Pro features list
  const proFeatures = [
    {
      icon: 'paw' as const,
      title: t('subscription.features.unlimited'),
      description: t('subscription.features.unlimitedDesc'),
    },
    {
      icon: 'heart-pulse' as const,
      title: t('subscription.features.advanced'),
      description: t('subscription.features.advancedDesc'),
    },
    {
      icon: 'export' as const,
      title: t('subscription.features.export'),
      description: t('subscription.features.exportDesc'),
    },
    {
      icon: 'headset' as const,
      title: t('subscription.features.priority'),
      description: t('subscription.features.priorityDesc'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBack}
          iconColor={theme.colors.onBackground}
        />
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
          {t('subscription.title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Status Card */}
        <SubscriptionCard showManageButton={isSubscribed} />

        {/* Paywall - Only show if not subscribed */}
        {!isSubscribed && (
          <View style={styles.paywallContainer}>
            <RevenueCatUI.Paywall
              onDismiss={() => {
                // Handle dismiss - stay on screen
                console.log('[Subscription] Paywall dismissed');
              }}
              onRestoreCompleted={({ customerInfo }) => {
                console.log('[Subscription] Restore completed from paywall');
              }}
            />
          </View>
        )}

        {/* Features List - Show if not subscribed */}
        {!isSubscribed && (
          <Card style={[styles.featuresCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.cardContent}>
              <Text variant="titleMedium" style={[styles.featuresTitle, { color: theme.colors.onSurface }]}>
                {t('subscription.features.title')}
              </Text>
              {proFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                    <MaterialCommunityIcons
                      name={feature.icon}
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.featureText}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                      {feature.title}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Restore Purchases */}
        <View style={styles.restoreContainer}>
          <Button
            mode="text"
            onPress={handleRestore}
            loading={isLoading}
            disabled={isLoading}
          >
            {t('subscription.restorePurchases')}
          </Button>
        </View>

        {/* Legal Links */}
        <View style={styles.legalContainer}>
          <Button mode="text" onPress={handleTerms} textColor={theme.colors.onSurfaceVariant}>
            {t('subscription.terms')}
          </Button>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>•</Text>
          <Button mode="text" onPress={handlePrivacy} textColor={theme.colors.onSurfaceVariant}>
            {t('subscription.privacy')}
          </Button>
        </View>

        {/* Spacer for bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  paywallContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 400,
  },
  featuresCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  featuresTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
  },
  restoreContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  legalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
});
