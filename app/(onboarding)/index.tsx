import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

// Design Constants
const COLORS = {
  primary: '#13ec5b',
  backgroundDark: '#102216',
  white: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  indicatorInactive: 'rgba(255, 255, 255, 0.2)',
};

export default function OnboardingStep1() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Section with Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDvLNHd_lGDVB9hD2VKsLzWkQrNAzRueOkSQO1UNc61uVLpn3Od0G4CAOsth5B0WUXdQXv2G5JlLTOdaBfQM41agELxjkPRlK1b2XSD365aC8X3DLNwQWmepGd55ZPPuRjUy4veRzJWJl7Z2kQlkI7VSBRGuUbmyv_zpaEm0WCX0wZK11OLd06eg3wmZDUdnHi2ABAepkA1_PvTaWatWGingFRfys2PJTYdH7Qk8sTWzRy7X_SrDu4i1jIcqjLpHRyIYZez5peNRUY" }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'transparent', COLORS.backgroundDark]}
          locations={[0, 0.6, 1]}
          style={styles.gradient}
        />
      </View>

      {/* Content Section */}
      <SafeAreaView style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('onboarding.screen1.title')}</Text>
          <Text style={styles.description}>
            {t('onboarding.screen1.description')}
          </Text>

          {/* Page Indicators */}
          <View style={styles.indicatorContainer}>
            <View style={[styles.indicator, styles.indicatorActive]} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
          </View>
        </View>

        {/* Button Section */}
        <View style={styles.buttonContainer}>
          <Pressable 
            style={styles.button}
            onPress={() => router.push('/(onboarding)/step2')}
          >
            <Text style={styles.buttonText}>{t('onboarding.screen1.button')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  imageContainer: {
    height: '60%',
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  textContainer: {
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.indicatorInactive,
  },
  indicatorActive: {
    backgroundColor: COLORS.primary,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    letterSpacing: 0.2,
  },
});
