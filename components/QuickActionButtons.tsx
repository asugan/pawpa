import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

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
        Yeni Pet Ekle
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
        Sağlık Kaydı
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
        Besleme Planı
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