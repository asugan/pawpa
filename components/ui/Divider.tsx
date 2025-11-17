import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useTheme } from "@/lib/theme";

export interface DividerProps extends ViewProps {
  bold?: boolean;
  horizontalInset?: boolean;
  leftInset?: boolean;
}

export const Divider: React.FC<DividerProps> = ({
  bold = false,
  horizontalInset = false,
  leftInset = false,
  style,
  ...rest
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={StyleSheet.flatten([
        styles.divider,
        {
          backgroundColor: theme.colors.onSurfaceVariant,
          height: bold ? 2 : 1,
          opacity: bold ? 0.3 : 0.2,
          marginHorizontal: horizontalInset ? 16 : 0,
          marginLeft: leftInset ? 16 : horizontalInset ? 16 : 0,
        },
        style,
      ])}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    width: "100%",
  },
});
