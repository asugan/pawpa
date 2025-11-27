import { Card, Text } from '@/components/ui';
import { getGradientColors, STAT_CARD_CONSTRAINTS } from '@/constants/ui';
import { useTheme } from '@/lib/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useResponsiveSize } from '../lib/hooks';
import { Tooltip, useTruncatedText } from './Tooltip';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  onPress: () => void;
  loading?: boolean;
  error?: string;
  /** Minimum card width (default: 160px) */
  minWidth?: number;
  /** Maximum title lines before truncation (default: 2) */
  maxTitleLines?: number;
  /** Enable tooltip for truncated text (default: true) */
  showTooltip?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  onPress,
  loading,
  error,
  minWidth = STAT_CARD_CONSTRAINTS.MIN_WIDTH,
  maxTitleLines = STAT_CARD_CONSTRAINTS.MAX_TITLE_LINES,
  showTooltip = true,
}) => {
  const { theme, isDark } = useTheme();
  const { isMobile, cardPadding, iconSize } = useResponsiveSize();
  const { isTruncated, onTextLayout } = useTruncatedText(maxTitleLines);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Handle tooltip toggle
  const handleTooltipPress = () => {
    if (showTooltip && isTruncated) {
      setTooltipVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.content, styles.loadingContent, { padding: cardPadding }]}>
          <ActivityIndicator size="small" color={color} />
          <View style={styles.loadingPlaceholder}>
            <View style={[styles.placeholderLine, { backgroundColor: theme.colors.surfaceVariant }]} />
            <View style={[styles.placeholderLine, { backgroundColor: theme.colors.surfaceVariant, width: '60%' }]} />
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        <Card style={[styles.card, { borderColor: theme.colors.error, borderWidth: 1 }]}>
          <View style={[styles.content, { padding: cardPadding, gap: isMobile ? 6 : 8 }]}>
            <LinearGradient
              colors={[theme.colors.error, theme.colors.error + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.iconContainer, { width: iconSize, height: iconSize, borderRadius: iconSize / 2 }]}
            >
              <MaterialCommunityIcons
                name="alert-circle"
                size={isMobile ? iconSize * 0.6 : 36}
                color="#FFFFFF"
              />
            </LinearGradient>
            <Text variant="headlineMedium" style={{ color: theme.colors.error, fontWeight: '800', fontSize: isMobile ? 20 : 28 }}>
                --
            </Text>
            <Text variant="bodyMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              {title}
            </Text>
          </View>
        </Card>
      </Pressable>
    );
  }

  return (
    <Tooltip
      content={title}
      visible={tooltipVisible}
      onDismiss={() => setTooltipVisible(false)}
      position="top"
      accessibilityLabel={`Full text: ${title}`}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          { width: minWidth },
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
        ]}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: '#4B5563', borderWidth: 1 }]}>
          <View style={[styles.content, { padding: 12, gap: 4 }]}>
            <Pressable
              onPress={handleTooltipPress}
              style={styles.header}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={title}
              accessibilityHint={isTruncated ? "Double tap to see full text" : undefined}
            >
              <MaterialCommunityIcons
                name={icon}
                size={16}
                color={color}
              />
              <Text
                variant="labelSmall"
                style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={maxTitleLines}
                ellipsizeMode="tail"
                onTextLayout={onTextLayout}
              >
                {title}
              </Text>
            </Pressable>
            <Text variant="headlineMedium" style={{ color: theme.colors.onSurface, fontWeight: '600', fontSize: 24 }}>
              {value}
            </Text>
          </View>
        </Card>
      </Pressable>
    </Tooltip>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    padding: 16,
  },
  pressable: {
  },
  card: {
    elevation: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    textTransform: 'uppercase',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loadingContent: {
    justifyContent: 'center',
    gap: 12,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingPlaceholder: {
    width: '100%',
    gap: 6,
  },
  placeholderLine: {
    height: 8,
    borderRadius: 4,
    width: '80%',
    alignSelf: 'center',
  },
});

export default StatCard;