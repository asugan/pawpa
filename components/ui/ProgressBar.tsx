import React from "react";
import { View, StyleSheet, ViewStyle, DimensionValue } from "react-native";
import { useTheme } from "@/lib/theme";

export interface ProgressBarProps {
  progress?: number; // 0 to 1
  color?: string;
  indeterminate?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  color,
  indeterminate = false,
  style,
}) => {
  const { theme } = useTheme();

  const progressColor = color || theme.colors.primary;
  const progressWidth: DimensionValue = indeterminate ? "100%" : `${Math.min(Math.max(progress * 100, 0), 100)}%`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: theme.roundness / 4,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.progress,
          {
            width: progressWidth,
            backgroundColor: progressColor,
            borderRadius: theme.roundness / 4,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 4,
    width: "100%",
    overflow: "hidden",
  },
  progress: {
    height: "100%",
  },
});
