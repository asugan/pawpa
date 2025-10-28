import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
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
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, style]}>
      <Button
        mode="contained"
        buttonColor={theme.colors.primary}
        textColor={theme.colors.onPrimary}
        style={styles.button}
        contentStyle={styles.buttonContent}
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
        contentStyle={styles.buttonContent}
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
        contentStyle={styles.buttonContent}
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