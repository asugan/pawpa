import React from "react";
import {
  Switch as RNSwitch,
  SwitchProps as RNSwitchProps,
  Platform,
} from "react-native";
import { useTheme } from "@/lib/theme";

export interface SwitchProps extends RNSwitchProps {
  color?: string;
}

export const Switch: React.FC<SwitchProps> = ({ color, value, ...rest }) => {
  const { theme } = useTheme();

  const trackColor = {
    false: theme.colors.surfaceVariant,
    true: color || theme.colors.primary,
  };

  const thumbColor =
    Platform.OS === "android"
      ? value
        ? theme.colors.onPrimary
        : theme.colors.onSurfaceVariant
      : theme.colors.onPrimary;

  return (
    <RNSwitch
      value={value}
      trackColor={trackColor}
      thumbColor={thumbColor}
      ios_backgroundColor={trackColor.false}
      {...rest}
    />
  );
};
