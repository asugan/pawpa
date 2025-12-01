import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, TextInputProps } from "./TextInput";
import { IconButton } from "./IconButton";

export interface SearchbarProps extends Omit<TextInputProps, "left" | "right" | "mode"> {
  icon?: string;
  onIconPress?: () => void;
  onClearIconPress?: () => void;
}

export const Searchbar: React.FC<SearchbarProps> = ({
  icon = "search",
  onIconPress,
  onClearIconPress,
  value,
  containerStyle,
  ...rest
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        value={value}
        mode="outlined"
        left={
          <IconButton
            icon={icon}
            size={20}
            onPress={onIconPress}
          />
        }
        right={
          value ? (
            <IconButton
              icon="close-circle"
              size={20}
              onPress={onClearIconPress}
            />
          ) : undefined
        }
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
