import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";

export interface BadgeProps {
  children?: React.ReactNode;
  size?: number;
  visible?: boolean;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  size = 20,
  visible = true,
  style,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.colors.error,
          minWidth: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          variant="labelSmall"
          style={{
            color: theme.colors.onError,
            fontSize: size * 0.6,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
});
