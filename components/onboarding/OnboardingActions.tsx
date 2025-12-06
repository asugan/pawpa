import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/lib/theme/hooks';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';

interface OnboardingActionsProps {
  currentScreen: number;
  totalScreens: number;
  screenData: {
    actionText: string;
    showSkip?: boolean;
    isLastScreen?: boolean;
  };
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  style?: any;
}

export const OnboardingActions: React.FC<OnboardingActionsProps> = ({
  currentScreen,
  totalScreens,
  screenData,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  style,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const isLastScreen = currentScreen === totalScreens - 1;
  const isFirstScreen = currentScreen === 0;

  const handlePrimaryAction = () => {
    if (isLastScreen) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Skip Button - Show on screens 2 and 3 */}
      {screenData.showSkip && !isLastScreen && (
        <View style={styles.skipContainer}>
          <TouchableOpacity
            onPress={onSkip}
            style={styles.skipButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipText, { color: theme.theme.colors.onSurfaceVariant }]}>
              {t('onboarding.skip')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Previous Button - Show on screens 2, 3, and 4 */}
        {!isFirstScreen && (
          <TouchableOpacity
            onPress={onPrevious}
            style={[
              styles.previousButton,
              { 
                backgroundColor: theme.theme.colors.surface,
                borderColor: theme.theme.colors.outline,
              }
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.previousButtonText, { color: theme.theme.colors.onSurface }]}>
              {t('onboarding.previous')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Primary Action Button */}
        <Button
          mode="contained"
          onPress={handlePrimaryAction}
          style={styles.primaryButton}
          labelStyle={styles.primaryButtonLabel}
        >
          {t(screenData.actionText)}
        </Button>
      </View>

      {/* Last Screen - Additional Actions */}
      {isLastScreen && (
        <View style={styles.lastScreenActions}>
          <TouchableOpacity
            onPress={() => {
              // Navigate to login
              onComplete();
            }}
            style={styles.secondaryAction}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryActionText, { color: theme.theme.colors.primary }]}>
              {t('onboarding.signIn')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  skipContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  previousButton: {
    flex: 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastScreenActions: {
    marginTop: 16,
    alignItems: 'center',
  },
  secondaryAction: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});