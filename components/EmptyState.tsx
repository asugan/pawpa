import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  buttonColor?: string;
  style?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'emoticon-sad-outline',
  buttonText,
  onButtonPress,
  buttonColor,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Card.Content style={styles.content}>
          <MaterialCommunityIcons
            name={icon}
            size={64}
            color={theme.colors.onSurfaceVariant}
            style={styles.icon}
          />

          <Text
            variant="headlineSmall"
            style={[styles.title, { color: theme.colors.onSurfaceVariant }]}
          >
            {title}
          </Text>

          {description && (
            <Text
              variant="bodyMedium"
              style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            >
              {description}
            </Text>
          )}

          {buttonText && onButtonPress && (
            <Button
              mode="contained"
              buttonColor={buttonColor || theme.colors.primary}
              textColor={theme.colors.onPrimary}
              onPress={onButtonPress}
              style={styles.button}
            >
              {buttonText}
            </Button>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    elevation: 2,
  },
  content: {
    padding: 32,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    minWidth: 160,
  },
});

export default EmptyState;