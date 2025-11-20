import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export interface IconButtonProps extends Omit<TouchableOpacityProps, "style"> {
  icon: keyof typeof MaterialCommunityIcons.glyphMap | React.ReactNode;
  size?: number;
  iconColor?: string;
  containerColor?: string;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 24,
  iconColor,
  containerColor,
  style,
  disabled,
  ...rest
}) => {
  const { theme } = useTheme();

  const color = iconColor || (disabled ? theme.colors.onSurfaceVariant : theme.colors.onSurface);
  const bgColor = containerColor || "transparent";

  return (
    <TouchableOpacity
      style={[
        styles.iconButton,
        {
          backgroundColor: bgColor,
          width: size * 1.75,
          height: size * 1.75,
          borderRadius: (size * 1.75) / 2,
        },
        style,
      ]}
      disabled={disabled}
      activeOpacity={0.7}
      {...rest}
    >
      {typeof icon === "string" ? (
        <MaterialCommunityIcons name={icon as any} size={size} color={color} />
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
  },
});
