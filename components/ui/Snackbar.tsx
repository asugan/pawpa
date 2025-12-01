import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { StyleSheet, Animated, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";
import { Text } from "./Text";
import { Button } from "./Button";

interface SnackbarContextValue {
  showSnackbar: (message: string, action?: SnackbarAction) => void;
  hideSnackbar: () => void;
}

interface SnackbarAction {
  label: string;
  onPress: () => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return context;
};

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<SnackbarAction | undefined>();
  const [opacity] = useState(new Animated.Value(0));

  const showSnackbar = (msg: string, act?: SnackbarAction) => {
    setMessage(msg);
    setAction(act);
    setVisible(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Auto hide after 4 seconds
    setTimeout(() => hideSnackbar(), 4000);
  };

  const hideSnackbar = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setMessage("");
      setAction(undefined);
    });
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      {visible && (
        <Snackbar
          visible={visible}
          message={message}
          action={action}
          onDismiss={hideSnackbar}
          opacity={opacity}
        />
      )}
    </SnackbarContext.Provider>
  );
};

interface SnackbarProps {
  visible: boolean;
  message: string;
  action?: SnackbarAction;
  onDismiss: () => void;
  opacity?: Animated.Value;
  style?: ViewStyle;
  duration?: number;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  action,
  onDismiss,
  opacity: externalOpacity,
  style,
  duration,
}) => {
  const { theme } = useTheme();
  const [internalOpacity] = useState(new Animated.Value(1));
  const opacity = externalOpacity || internalOpacity;

  // Auto-dismiss after duration
  useEffect(() => {
    if (visible && duration && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.snackbar,
        {
          backgroundColor: theme.colors.onSurface,
          opacity,
        },
        style,
      ]}
    >
      <Text variant="bodyMedium" style={{ color: theme.colors.surface, flex: 1 }}>
        {message}
      </Text>
      {action && (
        <Button
          mode="text"
          compact
          textColor={theme.colors.secondary}
          onPress={() => {
            action.onPress();
            onDismiss();
          }}
        >
          {action.label}
        </Button>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 4,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
