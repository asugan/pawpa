import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useOnboardingStore } from "@/stores/onboardingStore";


export default function Index() {
  const { isAuthenticated, isPending } = useAuth();
  const { theme } = useTheme();
  const { hasSeenOnboarding, hasHydrated } = useOnboardingStore();

  // Show loading while checking auth state
  if (isPending || !hasHydrated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Show onboarding if not completed
  if (!hasSeenOnboarding) {
    return <Redirect href="/(onboarding)" />;
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
