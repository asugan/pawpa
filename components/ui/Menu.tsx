import { useTheme } from "@/lib/theme";
import React from "react";
import {
    Modal,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from "react-native";
import { Text } from "./Text";

export interface MenuItem {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
}

export interface MenuItemProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  leadingIcon?: string | React.ReactNode;
}

export interface MenuProps {
  visible: boolean;
  onDismiss: () => void;
  anchor: React.ReactNode;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const MenuItemComponent: React.FC<MenuItemProps> = (props) => {
  // This is a placeholder component that just passes props
  // The actual rendering happens in the Menu component
  return null;
};

export const Menu: React.FC<MenuProps> & { Item: typeof MenuItemComponent } = ({
  visible,
  onDismiss,
  anchor,
  children,
  style,
}) => {
  const { theme } = useTheme();

  // Convert JSX children to MenuItem array
  const menuItems: MenuItem[] = React.Children.toArray(children)
    .filter((child): child is React.ReactElement<MenuItemProps> =>
      React.isValidElement(child)
    )
    .map((child) => ({
      title: child.props.title,
      onPress: child.props.onPress,
      disabled: child.props.disabled,
      leadingIcon: child.props.leadingIcon,
    }));

  return (
    <View>
      {anchor}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.menu,
                  {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.roundness / 2,
                  },
                  style,
                ]}
              >
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuItem,
                      {
                        borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                        borderBottomColor: theme.colors.surfaceVariant,
                      },
                    ]}
                    onPress={() => {
                      item.onPress();
                      onDismiss();
                    }}
                    disabled={item.disabled}
                  >
                    {item.leadingIcon && <View style={styles.icon}>{item.leadingIcon}</View>}
                    <Text
                      variant="bodyMedium"
                      style={{
                        color: item.disabled
                          ? theme.colors.onSurfaceVariant
                          : theme.colors.onSurface,
                      }}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

Menu.Item = MenuItemComponent;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    minWidth: 200,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  icon: {
    marginRight: 16,
  },
});
