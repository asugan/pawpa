import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text as RNText,
  StyleSheet,
  Modal,
  Pressable,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  TextLayoutEventData
} from 'react-native';
import { Portal } from '@/components/ui/Portal';
import { useTheme } from '@/lib/theme';

interface TooltipProps {
  /** Full text to display in tooltip */
  content: string;
  /** Trigger element (wrapped component) */
  children: React.ReactNode;
  /** Controlled visibility state */
  visible: boolean;
  /** Callback when tooltip dismissed */
  onDismiss: () => void;
  /** Tooltip position relative to trigger */
  position?: 'top' | 'bottom';
  /** Distance from trigger in pixels */
  offset?: number;
  /** Maximum tooltip width */
  maxWidth?: number;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Screen reader announcement */
  accessibilityLabel?: string;
}

interface TooltipLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Tooltip component with Portal rendering and absolute positioning
 *
 * Features:
 * - Portal rendering to avoid z-index issues
 * - Absolute positioning calculated from trigger layout
 * - Accessible with screen reader support
 * - Tap outside to dismiss
 * - Smooth animations
 *
 * @example
 * ```tsx
 * const [showTooltip, setShowTooltip] = useState(false);
 *
 * <Tooltip
 *   content="Full untruncated text here"
 *   visible={showTooltip}
 *   onDismiss={() => setShowTooltip(false)}
 * >
 *   <Pressable onPress={() => setShowTooltip(true)}>
 *     <Text numberOfLines={2}>Truncated text...</Text>
 *   </Pressable>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  visible,
  onDismiss,
  position = 'top',
  offset = 8,
  maxWidth = 300,
  backgroundColor,
  textColor,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const [triggerLayout, setTriggerLayout] = useState<TooltipLayout | null>(null);
  const triggerRef = useRef<View>(null);

  // Measure trigger element position
  const handleLayout = (event: LayoutChangeEvent) => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setTriggerLayout({ x, y, width, height });
      });
    }
  };

  // Re-measure when visibility changes
  useEffect(() => {
    if (visible && triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setTriggerLayout({ x, y, width, height });
      });
    }
  }, [visible]);

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!triggerLayout) {
      return { opacity: 0 };
    }

    const tooltipX = triggerLayout.x + (triggerLayout.width / 2);
    const tooltipY = position === 'top'
      ? triggerLayout.y - offset
      : triggerLayout.y + triggerLayout.height + offset;

    return {
      position: 'absolute' as const,
      top: tooltipY,
      left: tooltipX,
      transform: [{ translateX: -maxWidth / 2 }],
      maxWidth,
      backgroundColor: backgroundColor || theme.colors.surface,
      borderRadius: 8,
      padding: 12,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    };
  };

  return (
    <>
      <View
        ref={triggerRef}
        onLayout={handleLayout}
        collapsable={false}
      >
        {children}
      </View>

      {visible && (
        <Portal>
          <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
            statusBarTranslucent
          >
            <Pressable
              style={styles.backdrop}
              onPress={onDismiss}
              accessible={false}
            >
              <View
                style={getTooltipStyle()}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={accessibilityLabel || content}
                accessibilityHint="Tap outside to dismiss"
              >
                <RNText
                  style={[
                    styles.tooltipText,
                    { color: textColor || theme.colors.onSurface }
                  ]}
                >
                  {content}
                </RNText>
              </View>
            </Pressable>
          </Modal>
        </Portal>
      )}
    </>
  );
};

/**
 * Hook to detect if text is truncated
 *
 * @param maxLines Maximum number of lines before truncation
 * @returns Object with `isTruncated` flag and `onTextLayout` handler
 *
 * @example
 * ```tsx
 * const { isTruncated, onTextLayout } = useTruncatedText(2);
 *
 * <Text
 *   numberOfLines={2}
 *   ellipsizeMode="tail"
 *   onTextLayout={onTextLayout}
 * >
 *   {longText}
 * </Text>
 * ```
 */
export const useTruncatedText = (maxLines: number = 2) => {
  const [isTruncated, setIsTruncated] = useState(false);

  const onTextLayout = (event: NativeSyntheticEvent<TextLayoutEventData>) => {
    const { lines } = event.nativeEvent;
    const truncated = lines && lines.length > maxLines;
    setIsTruncated(truncated);
  };

  return { isTruncated, onTextLayout };
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  tooltipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default Tooltip;
