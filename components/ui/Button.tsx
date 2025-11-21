import { useTheme } from "@/lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    StyleProp,
    StyleSheet,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from "react-native";
import { Text } from "./Text";

type ButtonMode = "contained" | "outlined" | "text";

export interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  mode?: ButtonMode;
  children?: React.ReactNode;
  compact?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap | React.ReactNode;
  textColor?: string;
  buttonColor?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  uppercase?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  mode = "contained",
  children,
  compact = false,
  icon,
  textColor,
  buttonColor,
  style,
  labelStyle,
  uppercase = false,
  disabled,
  ...rest
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) {
      return mode === "text" ? "transparent" : theme.colors.surfaceVariant;
    }
    if (buttonColor) return buttonColor;
    if (mode === "text" || mode === "outlined") return "transparent";
    return theme.colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.onSurfaceVariant;
    if (textColor) return textColor;
    if (mode === "text" || mode === "outlined") return theme.colors.primary;
    return theme.colors.onPrimary;
  };

  const getBorderStyle = () => {
    if (mode === "outlined") {
      return {
        borderWidth: 1,
        borderColor: disabled ? theme.colors.onSurfaceVariant : theme.colors.primary,
      };
    }
    return {};
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          paddingVertical: compact ? 6 : 10,
          paddingHorizontal: compact ? 12 : 16,
          borderRadius: theme.roundness / 2,
        },
        getBorderStyle(),
        style,
      ]}
      disabled={disabled}
      activeOpacity={0.7}
      {...rest}
    >
      {icon && (
        <>{typeof icon === "string" ? <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={compact ? 16 : 18} color={getTextColor()} /> : icon}</>
      )}
      {typeof children === "string" ? (
        <Text
          variant={compact ? "labelMedium" : "labelLarge"}
          style={[
            {
              color: getTextColor(),
              textTransform: uppercase ? "uppercase" : "none",
            },
            labelStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
