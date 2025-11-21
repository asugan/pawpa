import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";

export interface ListItemProps {
  title: string;
  description?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  description,
  left,
  right,
  onPress,
  disabled,
  style,
  titleStyle,
  descriptionStyle,
}) => {
  const { theme } = useTheme();

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.listItem, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {left && <View style={styles.left}>{left}</View>}
      <View style={styles.content}>
        <Text variant="bodyLarge" style={[{ color: theme.colors.onSurface }, titleStyle]}>
          {title}
        </Text>
        {description && (
          <Text variant="bodySmall" style={[{ color: theme.colors.onSurfaceVariant }, descriptionStyle]}>
            {description}
          </Text>
        )}
      </View>
      {right && <View style={styles.right}>{right}</View>}
    </Container>
  );
};

export interface ListSectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ListSection: React.FC<ListSectionProps> = ({ title, children, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.section, style]}>
      {title && (
        <Text
          variant="titleSmall"
          style={[styles.sectionTitle, { color: theme.colors.primary }]}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    minHeight: 56,
  },
  left: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  right: {
    marginLeft: 16,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
