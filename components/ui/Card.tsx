import React from "react";
import { View, ViewProps, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";

export interface CardProps extends ViewProps {
  elevation?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  elevation = 1,
  children,
  style,
  ...rest
}) => {
  const { theme } = useTheme();

  const elevationStyle = {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.1 + elevation * 0.05,
    shadowRadius: elevation * 2,
    elevation: elevation * 2,
  };

  return (
    <View
      style={StyleSheet.flatten([
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.roundness,
        },
        elevationStyle,
        style,
      ])}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
});
