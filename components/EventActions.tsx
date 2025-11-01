import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Menu, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface EventActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onShare?: () => void;
  compact?: boolean;
  iconSize?: number;
}

export default function EventActions({
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  compact = false,
  iconSize = 24,
}: EventActionsProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleEdit = () => {
    closeMenu();
    onEdit?.();
  };

  const handleDelete = () => {
    closeMenu();
    onDelete?.();
  };

  const handleDuplicate = () => {
    closeMenu();
    onDuplicate?.();
  };

  const handleShare = () => {
    closeMenu();
    onShare?.();
  };

  if (compact) {
    // Compact mode: Show menu with all actions
    return (
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <IconButton
            icon="dots-vertical"
            size={iconSize}
            onPress={openMenu}
            iconColor={theme.colors.onSurface}
          />
        }
      >
        {onEdit && (
          <Menu.Item
            leadingIcon="pencil"
            onPress={handleEdit}
            title={t('common.edit')}
          />
        )}
        {onDuplicate && (
          <Menu.Item
            leadingIcon="content-copy"
            onPress={handleDuplicate}
            title={t('events.duplicate')}
          />
        )}
        {onShare && (
          <Menu.Item
            leadingIcon="share-variant"
            onPress={handleShare}
            title={t('common.share')}
          />
        )}
        {onDelete && (
          <Menu.Item
            leadingIcon="delete"
            onPress={handleDelete}
            title={t('common.delete')}
            titleStyle={{ color: theme.colors.error }}
          />
        )}
      </Menu>
    );
  }

  // Full mode: Show individual icon buttons
  return (
    <View style={styles.container}>
      {onEdit && (
        <IconButton
          icon="pencil"
          size={iconSize}
          onPress={onEdit}
          iconColor={theme.colors.primary}
        />
      )}
      {onDuplicate && (
        <IconButton
          icon="content-copy"
          size={iconSize}
          onPress={onDuplicate}
          iconColor={theme.colors.secondary}
        />
      )}
      {onShare && (
        <IconButton
          icon="share-variant"
          size={iconSize}
          onPress={onShare}
          iconColor={theme.colors.tertiary}
        />
      )}
      {onDelete && (
        <IconButton
          icon="delete"
          size={iconSize}
          onPress={onDelete}
          iconColor={theme.colors.error}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
