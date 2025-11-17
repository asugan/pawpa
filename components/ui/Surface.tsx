import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useTheme } from "@/lib/theme";

export interface SurfaceProps extends ViewProps {
  elevation?: number;
}

export const Surface: React.FC<SurfaceProps> = ({
  elevation = 1,
  style,
  children,
  ...rest
}) => {
  const { theme } = useTheme();

  const elevationStyle = {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.1 + elevation * 0.03,
    shadowRadius: elevation * 1.5,
    elevation: elevation * 2,
  };

  return (
    <View
      style={StyleSheet.flatten([
        {
          backgroundColor: theme.colors.surface,
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

const styles = StyleSheet.create({});
