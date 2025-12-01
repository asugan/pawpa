import React from "react";
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";


export interface DialogProps {
  visible: boolean;
  onDismiss: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
}

const DialogBase: React.FC<DialogProps> = ({
  visible,
  onDismiss,
  children,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.dialog,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.roundness,
                },
                style,
              ]}
            >
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  return (
    <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
      {children}
    </Text>
  );
};

export const DialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <View style={styles.content}>{children}</View>;
};

export const DialogActions: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <View style={styles.actions}>{children}</View>;
};

// Compose Dialog with sub-components
export const Dialog = Object.assign(DialogBase, {
  Title: DialogTitle,
  Content: DialogContent,
  Actions: DialogActions,
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    minWidth: 280,
    maxWidth: "90%",
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  title: {
    padding: 24,
    paddingBottom: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 8,
    gap: 8,
  },
});
