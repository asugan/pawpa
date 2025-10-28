import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from "../stores/themeStore";
import { lightTheme, darkTheme } from "../lib/theme";
import { LanguageProvider } from "../providers/LanguageProvider";
import { NetworkStatus } from "../lib/components/NetworkStatus";
import { ApiErrorBoundary } from "../lib/components/ApiErrorBoundary";
import "../lib/i18n"; // Initialize i18n

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Network error'larında daha az retry
        if (error instanceof Error && error.message.includes('Ağ bağlantısı')) {
          return failureCount < 2;
        }
        // 404 hatalarında retry yok
        if (error instanceof Error && error.message.includes('bulunamadı')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime renamed to gcTime)
      refetchOnWindowFocus: false, // Mobil için uygun değil
      refetchOnReconnect: true, // Network geri gelince yenile
      // Error handling için custom logic
      throwOnError: (error) => {
        // Sadece network error'larda error boundary kullan
        return error instanceof Error && error.message.includes('Ağ bağlantısı');
      },
    },
    mutations: {
      retry: 1, // Mutation'lar genellikle bir kereden fazla denenmemeli
      // Mutation error'larında error boundary kullanma
      throwOnError: false,
    },
  },
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeMode } = useThemeStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      {children}
    </PaperProvider>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <NetworkStatus>
          <ThemeProvider>
            <ApiErrorBoundary>
              {children}
            </ApiErrorBoundary>
          </ThemeProvider>
        </NetworkStatus>
      </LanguageProvider>
    </QueryClientProvider>
  );
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
