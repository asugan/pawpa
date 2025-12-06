import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Design Constants
const COLORS = {
  primary: '#13ec5b',
  backgroundDark: '#102216',
  white: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  cardBg: 'rgba(255, 255, 255, 0.05)',
  iconBg: 'rgba(19, 236, 91, 0.2)', // primary with opacity
};

const FEATURES = [
  {
    icon: 'pets',
    key: 'tracking',
  },
  {
    icon: 'healing', 
    key: 'health',
  },
  {
    icon: 'event',
    key: 'events',
  },
  {
    icon: 'account-balance-wallet',
    key: 'finance',
  },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleNext = () => {
    router.push('/(onboarding)/completed');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/completed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios-new" size={24} color={COLORS.white} />
        </Pressable>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>{t('onboarding.screen2.skip')}</Text>
        </Pressable>
      </View>

      {/* Indicators (Designed as bars in this step) */}
      <View style={styles.indicatorContainer}>
        <View style={styles.indicatorInactive} />
        <View style={styles.indicatorActive} />
        <View style={styles.indicatorInactive} />
        <View style={styles.indicatorInactive} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{t('onboarding.screen2.title')}</Text>
          <Text style={styles.description}>{t('onboarding.screen2.description')}</Text>
        </View>

        <View style={styles.featureList}>
          {FEATURES.map((item, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <View style={styles.iconCircle}>
                  {/* @ts-ignore: icon names are loose strings here */}
                  <MaterialIcons name={item.icon} size={28} color={COLORS.primary} />
                </View>
                <View style={styles.featureTextContent}>
                  <Text style={styles.featureTitle} numberOfLines={1}>
                    {t(`onboarding.screen2.features.${item.key}.title`)}
                  </Text>
                  <Text style={styles.featureDescription} numberOfLines={2}>
                    {t(`onboarding.screen2.features.${item.key}.description`)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <Pressable 
          style={styles.button}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>{t('onboarding.screen2.next')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  indicatorActive: {
    height: 6,
    width: 24,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  indicatorInactive: {
    height: 6,
    width: 24,
    borderRadius: 3,
    backgroundColor: 'rgba(19, 236, 91, 0.3)',
  },
  content: {
    paddingHorizontal: 16,
  },
  headerTextContainer: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  featureList: {
    gap: 12,
    paddingVertical: 8,
  },
  featureCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 56, // Slightly taller as per design
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.backgroundDark,
    fontSize: 16,
    fontWeight: '700',
  },
});
