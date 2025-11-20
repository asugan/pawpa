import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";

export interface FABProps extends Omit<TouchableOpacityProps, "style"> {
  icon?: keyof typeof Ionicons.glyphMap | React.ReactNode;
  size?: "small" | "medium" | "large";
  color?: string;
  style?: ViewStyle;
}

export const FAB: React.FC<FABProps> = ({
  icon = "add",
  size = "medium",
  color,
  style,
  ...rest
}) => {
  const { theme } = useTheme();

  const getSize = () => {
    switch (size) {
      case "small":
        return 40;
      case "large":
        return 64;
      default:
        return 56;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 20;
      case "large":
        return 32;
      default:
        return 24;
    }
  };

  const fabSize = getSize();
  const backgroundColor = color || theme.colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          backgroundColor,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
        style,
      ]}
      activeOpacity={0.8}
      {...rest}
    >
      {typeof icon === "string" ? (
        <Ionicons
          name={icon as any}
          size={getIconSize()}
          color={theme.colors.onPrimary}
        />
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    alignItems: "center",
    justifyContent: "center",
  },
});
