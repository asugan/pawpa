import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button,  } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';

interface QuickActionButtonsProps {
  onAddPet?: () => void;
  onAddHealthRecord?: () => void;
  onAddFeedingSchedule?: () => void;
  style?: any;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  onAddPet,
  onAddHealthRecord,
  onAddFeedingSchedule,
  style,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={StyleSheet.flatten([styles.container, style])}>
      <Button
        mode="contained"
        buttonColor={theme.colors.primary}
        textColor={theme.colors.onPrimary}
        style={styles.button}
        onPress={onAddPet}
        icon="plus"
      >
        {t('home.addNewPet')}
      </Button>

      <Button
        mode="contained"
        buttonColor={theme.colors.secondary}
        textColor={theme.colors.onSecondary}
        style={styles.button}
        onPress={onAddHealthRecord}
        icon="heart-plus"
      >
        {t('home.healthRecord')}
      </Button>

      <Button
        mode="contained"
        buttonColor={theme.colors.tertiary}
        textColor={theme.colors.onTertiary}
        style={styles.button}
        onPress={onAddFeedingSchedule}
        icon="clock-plus"
      >
        {t('home.feedingPlan')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  button: {
    paddingVertical: 4,
  },
  buttonContent: {
    paddingVertical: 8,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
  },
});

export default QuickActionButtons;