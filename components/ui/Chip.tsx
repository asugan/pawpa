import { useTheme } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
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

export interface ChipProps extends Omit<TouchableOpacityProps, "style"> {
  children?: React.ReactNode;
  selected?: boolean;
  icon?: keyof typeof Ionicons.glyphMap | React.ReactNode | ((props: { size: number; color: string }) => React.ReactNode);
  onClose?: () => void;
  mode?: "flat" | "outlined";
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  textStyle?: StyleProp<TextStyle>;
  selectedColor?: string;
  compact?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  selected = false,
  icon,
  onClose,
  mode = "flat",
  style,
  textColor,
  textStyle,
  selectedColor,
  compact = false,
  disabled,
  ...rest
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.surfaceVariant;
    if (selected) return selectedColor || theme.colors.secondary;
    if (mode === "outlined") return "transparent";
    return theme.colors.surfaceVariant;
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.onSurfaceVariant;
    if (textColor) return textColor;
    if (selected) return theme.colors.onSecondary;
    return theme.colors.onSurfaceVariant;
  };

  const getBorderStyle = () => {
    if (mode === "outlined") {
      return {
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.onSurfaceVariant,
      };
    }
    return {};
  };

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: theme.roundness,
          paddingVertical: compact ? 4 : 6,
          paddingHorizontal: compact ? 8 : 12,
        },
        getBorderStyle(),
        style,
      ]}
      disabled={disabled}
      activeOpacity={0.7}
      {...rest}
    >
      {icon && (
        <>
          {typeof icon === "string"
            ? <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={16} color={getTextColor()} />
            : typeof icon === "function"
            ? icon({ size: 16, color: getTextColor() })
            : icon}
        </>
      )}
      {children && (
        <Text
          variant={compact ? "labelSmall" : "labelMedium"}
          style={[{ color: getTextColor() }, textStyle]}
        >
          {children}
        </Text>
      )}
      {onClose && (
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={16} color={getTextColor()} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
