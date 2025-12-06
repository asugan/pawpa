import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useTheme } from '@/lib/theme/hooks';
import { OnboardingScreen } from './OnboardingScreen';
import { OnboardingPagination } from './OnboardingPagination';
import { OnboardingActions } from './OnboardingActions';
import { OnboardingProgress } from './OnboardingProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingWrapperProps {
  onComplete: () => void;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ onComplete }) => {
  const theme = useTheme();
  const {
    currentScreen,
    totalScreens,
    isAnimating,
    nextScreen,
    previousScreen,
    setHasSeenOnboarding,
  } = useOnboardingStore();

  const translateX = useSharedValue(0);
  const gestureActive = useSharedValue(false);

  // Onboarding screens data
  const screens = [
    {
      id: 1,
      title: 'onboarding.screen1.title',
      subtitle: 'onboarding.screen1.subtitle',
      description: 'onboarding.screen1.description',
      features: [
        'onboarding.screen1.features.reminders',
        'onboarding.screen1.features.expenses',
        'onboarding.screen1.features.health',
        'onboarding.screen1.features.calendar',
      ],
      actionText: 'onboarding.screen1.action',
      showSkip: false,
    },
    {
      id: 2,
      title: 'onboarding.screen2.title',
      subtitle: 'onboarding.screen2.subtitle',
      description: 'onboarding.screen2.description',
      features: [
        'onboarding.screen2.features.feeding',
        'onboarding.screen2.features.vet',
        'onboarding.screen2.features.weight',
        'onboarding.screen2.features.photos',
      ],
      actionText: 'onboarding.screen2.action',
      showSkip: true,
    },
    {
      id: 3,
      title: 'onboarding.screen3.title',
      subtitle: 'onboarding.screen3.subtitle',
      description: 'onboarding.screen3.description',
      features: [
        'onboarding.screen3.features.categories',
        'onboarding.screen3.features.budget',
        'onboarding.screen3.features.trends',
        'onboarding.screen3.features.emergency',
      ],
      actionText: 'onboarding.screen3.action',
      showSkip: true,
    },
    {
      id: 4,
      title: 'onboarding.screen4.title',
      subtitle: 'onboarding.screen4.subtitle',
      description: 'onboarding.screen4.description',
      features: [
        'onboarding.screen4.features.notifications',
        'onboarding.screen4.features.theme',
        'onboarding.screen4.features.language',
        'onboarding.screen4.features.sync',
      ],
      actionText: 'onboarding.screen4.action',
      showSkip: false,
      isLastScreen: true,
    },
  ];

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      gestureActive.value = true;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      gestureActive.value = false;
      
      const shouldGoNext = event.translationX < -50 && event.velocityX < -500;
      const shouldGoPrev = event.translationX > 50 && event.velocityX > 500;
      
      if (shouldGoNext && currentScreen < totalScreens - 1) {
        translateX.value = withSpring(-SCREEN_WIDTH);
        runOnJS(nextScreen)();
      } else if (shouldGoPrev && currentScreen > 0) {
        translateX.value = withSpring(SCREEN_WIDTH);
        runOnJS(previousScreen)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleNext = () => {
    if (currentScreen < totalScreens - 1) {
      translateX.value = withSpring(-SCREEN_WIDTH);
      setTimeout(() => {
        nextScreen();
        translateX.value = 0;
      }, 300);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentScreen > 0) {
      translateX.value = withSpring(SCREEN_WIDTH);
      setTimeout(() => {
        previousScreen();
        translateX.value = 0;
      }, 300);
    }
  };

  const handleSkip = () => {
    setHasSeenOnboarding(true);
    onComplete();
  };

  const handleComplete = () => {
    setHasSeenOnboarding(true);
    onComplete();
  };

  const handleGoToScreen = (screenIndex: number) => {
    if (screenIndex !== currentScreen && !isAnimating) {
      const direction = screenIndex > currentScreen ? -1 : 1;
      translateX.value = withSpring(direction * SCREEN_WIDTH);
      setTimeout(() => {
        useOnboardingStore.getState().goToScreen(screenIndex);
        translateX.value = 0;
      }, 300);
    }
  };

  useEffect(() => {
    translateX.value = 0;
  }, [currentScreen, translateX]);

  const currentScreenData = screens[currentScreen];

  return (
    <View style={[styles.container, { backgroundColor: theme.theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      
      {/* Progress Bar */}
      <OnboardingProgress 
        current={currentScreen} 
        total={totalScreens} 
        style={styles.progress}
      />

      {/* Gesture Handler */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <OnboardingScreen 
            screen={currentScreenData}
            isActive={true}
          />
        </Animated.View>
      </GestureDetector>

      {/* Pagination */}
      <OnboardingPagination 
        current={currentScreen}
        total={totalScreens}
        onDotPress={handleGoToScreen}
        style={styles.pagination}
      />

      {/* Actions */}
      <OnboardingActions
        currentScreen={currentScreen}
        totalScreens={totalScreens}
        screenData={currentScreenData}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        onComplete={handleComplete}
        style={styles.actions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  progress: {
    paddingTop: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  pagination: {
    paddingVertical: 20,
  },
  actions: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
});