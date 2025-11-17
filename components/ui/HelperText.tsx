import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";
import { Ionicons } from "@expo/vector-icons";

type HelperTextType = "info" | "error";

export interface HelperTextProps {
  children?: React.ReactNode;
  type?: HelperTextType;
  visible?: boolean;
  padding?: "none" | "normal";
  style?: ViewStyle;
}

export const HelperText: React.FC<HelperTextProps> = ({
  children,
  type = "info",
  visible = true,
  padding = "normal",
  style,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  const getColor = () => {
    switch (type) {
      case "error":
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "error":
        return "alert-circle-outline";
      default:
        return "information-circle-outline";
    }
  };

  const color = getColor();

  return (
    <View
      style={StyleSheet.flatten([
        styles.container,
        padding === "normal" && styles.paddingNormal,
        style,
      ])}
    >
      <Ionicons name={getIcon()} size={14} color={color} />
      {typeof children === "string" ? (
        <Text variant="bodySmall" style={{ color, flex: 1 }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  paddingNormal: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
});
