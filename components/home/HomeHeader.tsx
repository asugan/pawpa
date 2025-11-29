import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui";
import { User } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

interface HomeHeaderProps {
  user: User | null;
  petsCount: number;
  eventsCount: number;
}

export const HomeHeader = ({ user, petsCount, eventsCount }: HomeHeaderProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const getDynamicSubtitle = () => {
    if (petsCount === 0) return "Start by adding your first pet 🐕";
    if (eventsCount === 0) return "No scheduled activities for today 📅";
    if (eventsCount === 1) return "You have 1 activity today ✨";
    return `You have ${eventsCount} activities today 🎉`;
  };

  return (
    <>
      <View style={styles.topHeader}>
        <TouchableOpacity style={[styles.avatarContainer, { borderColor: theme.colors.primary }]}>
          {user?.image ? (
            <Image source={{ uri: user.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color={theme.colors.primary} />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={28} color={theme.colors.onBackground} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.greeting, { color: theme.colors.onBackground }]}>
          {t("home.greeting")}, {user?.name || "User"}!
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {getDynamicSubtitle()}
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  header: { marginBottom: 16 },
  greeting: { fontWeight: "bold", marginBottom: 4 },
});
