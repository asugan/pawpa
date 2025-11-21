import React from "react";
import {
  ActivityIndicator as RNActivityIndicator,
  ActivityIndicatorProps as RNActivityIndicatorProps,
} from "react-native";
import { useTheme } from "@/lib/theme";

export interface ActivityIndicatorProps extends RNActivityIndicatorProps {
  animating?: boolean;
}

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  animating = true,
  color,
  size = "small",
  ...rest
}) => {
  const { theme } = useTheme();

  return (
    <RNActivityIndicator
      animating={animating}
      color={color || theme.colors.primary}
      size={size}
      {...rest}
    />
  );
};
