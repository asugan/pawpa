import React from "react";
import {
  Modal as RNModal,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  ViewStyle,
  Pressable,
} from "react-native";
import { useTheme } from "@/lib/theme";

export interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  children?: React.ReactNode;
  contentContainerStyle?: ViewStyle | ViewStyle[];
  dismissable?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onDismiss,
  children,
  contentContainerStyle,
  dismissable = true,
}) => {
  const { theme } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissable ? onDismiss : undefined}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissable ? onDismiss : undefined}
        />
        <View
          style={StyleSheet.flatten([
            styles.contentContainer,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.roundness * 2,
            },
            contentContainerStyle,
          ])}
        >
          {children}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentContainer: {
    maxWidth: 500,
    width: "100%",
    padding: 24,
  },
});
