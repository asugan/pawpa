import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

// Design Constants
const COLORS = {
  primary: '#13ec5b',
  backgroundDark: '#102216',
  white: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)', // Keeping consistent with previous steps, though design says slate-600/slate-400 which is gray. Dark mode uses slate-400.
  circleOuter: 'rgba(19, 236, 91, 0.2)',
  circleInner: 'rgba(19, 236, 91, 0.3)',
};

export default function OnboardingCompleted() {
  const router = useRouter();
  const { setHasSeenOnboarding } = useOnboardingStore();
  const { t } = useTranslation();

  const handleComplete = async () => {
    // Mark onboarding as seen
    setHasSeenOnboarding(true);
    
    // Navigate to root, which will handle redirection based on auth state

    router.replace('/(auth)/login');
  };

  const swipeRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      scheduleOnRN(router.back);
    });

  return (
    <GestureDetector gesture={swipeRight}>
      <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          
          {/* Hero Icon */}
          <View style={styles.heroContainer}>
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <MaterialIcons name="pets" size={64} color={COLORS.primary} />
              </View>
            </View>
          </View>

          {/* Text Content */}
          <Text style={styles.title}>{t('onboarding.screen3.title')}</Text>
          <Text style={styles.description}>
            {t('onboarding.screen3.description')}
          </Text>

        </View>

        {/* Footer Button */}
        <View style={styles.footer}>
          <Pressable 
            style={styles.button}
            onPress={handleComplete}
          >
            <Text style={styles.buttonText}>{t('onboarding.screen3.button')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroContainer: {
    marginBottom: 32,
  },
  outerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.circleOuter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: COLORS.circleInner,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 12,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.backgroundDark,
    fontSize: 16,
    fontWeight: '700',
  },
});
