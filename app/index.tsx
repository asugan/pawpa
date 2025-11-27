import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

export default function Index() {
  const { isAuthenticated, isPending } = useAuth();
  const { theme } = useTheme();

  // Show loading while checking auth state
  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
