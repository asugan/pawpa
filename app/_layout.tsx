import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { MOBILE_QUERY_CONFIG } from "../lib/config/queryConfig";
import { useThemeStore } from "../stores/themeStore";
import { lightTheme, darkTheme } from "../lib/theme";
import { LanguageProvider } from "../providers/LanguageProvider";
import { NetworkStatus } from "../lib/components/NetworkStatus";
import { ApiErrorBoundary } from "../lib/components/ApiErrorBoundary";
import { useOnlineManager } from "../lib/hooks/useOnlineManager";
import { AppState, AppStateStatus } from 'react-native';
import { useEffect } from 'react';
import "../lib/i18n"; // Initialize i18n

// Enhanced QueryClient with better configuration
const queryClient = new QueryClient(MOBILE_QUERY_CONFIG);

// Custom hook for app state management
function onAppStateChange(status: AppStateStatus) {
  // React Query already handles refetching on app focus by default
  if (status === 'active') {
    focusManager.setFocused(true);
  } else {
    focusManager.setFocused(false);
  }
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeMode } = useThemeStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      {children}
    </PaperProvider>
  );
}

// Enhanced App Providers with better state management
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <OnlineManagerProvider>
        <NetworkStatus>
          <LanguageProvider>
            <ThemeProvider>
              <ApiErrorBoundary>
                {children}
              </ApiErrorBoundary>
            </ThemeProvider>
          </LanguageProvider>
        </NetworkStatus>
      </OnlineManagerProvider>
    </QueryClientProvider>
  );
}

// Separate component for online management to ensure QueryClient context is available
function OnlineManagerProvider({ children }: { children: React.ReactNode }) {
  // Handle online/offline state - now has access to QueryClient
  useOnlineManager();

  // Listen to app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AppProviders>
  );
}
