import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme/hooks';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

interface OnboardingScreenProps {
  screen: {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    features: string[];
    actionText: string;
    showSkip?: boolean;
    isLastScreen?: boolean;
  };
  isActive: boolean;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ screen, isActive }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const logoScale = useSharedValue(1);

  React.useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 600 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      
      // Logo pulsing animation for first screen
      if (screen.id === 1) {
        logoScale.value = withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        );
      }
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
    }
  }, [isActive, screen.id, opacity, scale, logoScale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });

  const renderIllustration = () => {
    switch (screen.id) {
      case 1:
        return (
          <Animated.View style={[styles.illustrationContainer, logoAnimatedStyle]}>
            <View style={[styles.logoContainer, { backgroundColor: theme.theme.colors.primary }]}>
              <Text style={[styles.logoText, { color: theme.theme.colors.onPrimary }]}>
                🐾
              </Text>
            </View>
            <Text style={[styles.brandName, { color: theme.theme.colors.primary }]}>
              PawPa
            </Text>
          </Animated.View>
        );
      
      case 2:
        return (
          <View style={styles.illustrationContainer}>
            <View style={styles.petPreview}>
              <View style={[styles.petAvatar, { backgroundColor: theme.theme.colors.secondaryContainer }]}>
                <Text style={styles.petIcon}>🐕</Text>
              </View>
              <View style={styles.petInfo}>
                <View style={[styles.petNameBar, { backgroundColor: theme.theme.colors.surfaceVariant }]} />
                <View style={[styles.petDetailBar, { backgroundColor: theme.theme.colors.surfaceVariant }]} />
              </View>
            </View>
            <View style={styles.calendarPreview}>
              <View style={[styles.calendarIcon, { backgroundColor: theme.theme.colors.primaryContainer }]}>
                <Text style={styles.calendarText}>📅</Text>
              </View>
              <View style={[styles.feedingIcon, { backgroundColor: theme.theme.colors.secondaryContainer }]}>
                <Text style={styles.feedingText}>🍖</Text>
              </View>
            </View>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.illustrationContainer}>
            <View style={styles.budgetPreview}>
              <View style={[styles.budgetBar, { backgroundColor: theme.theme.colors.primary }]} />
              <View style={[styles.budgetBar, { backgroundColor: theme.theme.colors.secondary, width: '70%' }]} />
              <View style={[styles.budgetBar, { backgroundColor: theme.theme.colors.tertiary, width: '40%' }]} />
            </View>
            <View style={styles.expenseCategories}>
              <View style={[styles.category, { backgroundColor: theme.theme.colors.errorContainer }]}>
                <Text style={styles.categoryText}>🏥</Text>
              </View>
              <View style={[styles.category, { backgroundColor: theme.theme.colors.primaryContainer }]}>
                <Text style={styles.categoryText}>🍖</Text>
              </View>
              <View style={[styles.category, { backgroundColor: theme.theme.colors.secondaryContainer }]}>
                <Text style={styles.categoryText}>🧼</Text>
              </View>
            </View>
          </View>
        );
      
      case 4:
        return (
          <View style={styles.illustrationContainer}>
            <View style={styles.featuresGrid}>
              <View style={[styles.featureGridItem, { backgroundColor: theme.theme.colors.primaryContainer }]}>
                <Text style={styles.featureGridIcon}>📱</Text>
              </View>
              <View style={[styles.featureGridItem, { backgroundColor: theme.theme.colors.secondaryContainer }]}>
                <Text style={styles.featureGridIcon}>🌙</Text>
              </View>
              <View style={[styles.featureGridItem, { backgroundColor: theme.theme.colors.tertiaryContainer }]}>
                <Text style={styles.featureGridIcon}>🌍</Text>
              </View>
              <View style={[styles.featureGridItem, { backgroundColor: theme.theme.colors.surfaceVariant }]}>
                <Text style={styles.featureGridIcon}>☁️</Text>
              </View>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={[
          theme.theme.colors.background,
          theme.theme.colors.surface,
        ]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationSection}>
          {renderIllustration()}
        </View>

        {/* Text Content */}
        <View style={styles.textSection}>
          <Text style={[styles.title, { color: theme.theme.colors.onBackground }]}>
            {t(screen.title)}
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.theme.colors.primary }]}>
            {t(screen.subtitle)}
          </Text>
          
          <Text style={[styles.description, { color: theme.theme.colors.onSurfaceVariant }]}>
            {t(screen.description)}
          </Text>

          {/* Features List */}
          <View style={styles.featuresList}>
            {screen.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={[styles.featureBullet, { color: theme.theme.colors.primary }]}>
                  •
                </Text>
                <Text style={[styles.featureText, { color: theme.theme.colors.onSurface }]}>
                  {t(feature)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  illustrationSection: {
    alignItems: 'center',
    marginBottom: 40,
    minHeight: 200,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Screen 1 - Logo
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
  },
  
  // Screen 2 - Pet Preview
  petPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  petAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  petIcon: {
    fontSize: 24,
  },
  petInfo: {
    flex: 1,
  },
  petNameBar: {
    width: '80%',
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  petDetailBar: {
    width: '60%',
    height: 12,
    borderRadius: 6,
  },
  calendarPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  calendarIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarText: {
    fontSize: 20,
  },
  feedingIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedingText: {
    fontSize: 20,
  },
  
  // Screen 3 - Budget Preview
  budgetPreview: {
    width: '100%',
    marginBottom: 24,
  },
  budgetBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  expenseCategories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  category: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
  },
  
  // Screen 4 - Features Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  featureGridItem: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureGridIcon: {
    fontSize: 24,
  },
  
  // Text Content
  textSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  featuresList: {
    width: '100%',
    paddingHorizontal: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureBullet: {
    fontSize: 20,
    marginRight: 12,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 16,
    lineHeight: 20,
    flex: 1,
  },
});