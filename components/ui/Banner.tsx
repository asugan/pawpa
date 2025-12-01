import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";
import { Button } from "./Button";
import { IconButton } from "./IconButton";

export interface BannerProps {
  visible: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  actions?: {
    label: string;
    onPress: () => void;
  }[];
  onDismiss?: () => void;
  style?: ViewStyle;
}

export const Banner: React.FC<BannerProps> = ({
  visible,
  children,
  icon,
  actions,
  onDismiss,
  style,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.surfaceVariant,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <View style={styles.text}>
          {typeof children === "string" ? (
            <Text variant="bodyMedium">{children}</Text>
          ) : (
            children
          )}
        </View>
        {onDismiss && (
          <IconButton icon="close" size={20} onPress={onDismiss} />
        )}
      </View>
      {actions && actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((action, index) => (
            <Button
              key={index}
              mode="text"
              compact
              onPress={action.onPress}
            >
              {action.label}
            </Button>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderBottomWidth: 1,
    padding: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 16,
  },
  text: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  },
});
