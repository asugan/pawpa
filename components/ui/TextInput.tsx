import React, { useState } from "react";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: boolean;
  disabled?: boolean;
  mode?: "flat" | "outlined";
  left?: React.ReactNode;
  right?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export interface TextInputIconProps {
  icon?: keyof typeof Ionicons.glyphMap;
  name?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

export interface TextInputAffixProps {
  text: string;
  type?: "prefix" | "suffix";
}

type TextInputComponent = React.FC<TextInputProps> & {
  Icon: React.FC<TextInputIconProps>;
  Affix: React.FC<TextInputAffixProps>;
};

const TextInputBase: React.FC<TextInputProps> = ({
  label,
  error = false,
  disabled = false,
  mode = "outlined",
  left,
  right,
  containerStyle,
  inputStyle,
  style,
  ...rest
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.onSurfaceVariant;
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.surfaceVariant;
    if (mode === "flat") return theme.colors.surfaceVariant;
    return theme.colors.surface;
  };

  return (
    <View style={StyleSheet.flatten([styles.container, containerStyle])}>
      {label && (
        <Text
          variant="bodySmall"
          style={StyleSheet.flatten([
            styles.label,
            { color: error ? theme.colors.error : theme.colors.onSurfaceVariant },
          ])}
        >
          {label}
        </Text>
      )}
      <View
        style={StyleSheet.flatten([
          styles.inputContainer,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: mode === "outlined" ? 1 : 0,
            borderRadius: theme.roundness / 2,
            borderBottomWidth: mode === "flat" ? 2 : mode === "outlined" ? 1 : 0,
          },
        ])}
      >
        {left && <View style={styles.leftElement}>{left}</View>}
        <RNTextInput
          style={StyleSheet.flatten([
            styles.input,
            {
              color: disabled ? theme.colors.onSurfaceVariant : theme.colors.onSurface,
            },
            inputStyle,
            style,
          ])}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {right && <View style={styles.rightElement}>{right}</View>}
      </View>
    </View>
  );
};

// Icon subcomponent for backward compatibility
const TextInputIcon: React.FC<TextInputIconProps> = ({ icon, name, size = 24, color }) => {
  const { theme } = useTheme();
  const iconName = icon || name || "help-circle";
  return <Ionicons name={iconName as any} size={size} color={color || theme.colors.onSurfaceVariant} />;
};

// Affix subcomponent for backward compatibility
const TextInputAffix: React.FC<TextInputAffixProps> = ({ text }) => {
  const { theme } = useTheme();
  return (
    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
      {text}
    </Text>
  );
};

// Create TextInput with subcomponents
export const TextInput = TextInputBase as TextInputComponent;

// Attach subcomponents
TextInput.Icon = TextInputIcon;
TextInput.Affix = TextInputAffix;

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  leftElement: {
    marginRight: 8,
  },
  rightElement: {
    marginLeft: 8,
  },
});
