import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from "../stores/themeStore";
import { useLanguageStore } from "../stores/languageStore";
import { lightTheme, darkTheme } from "../lib/theme";
import { LanguageProvider } from "../providers/LanguageProvider";
import { db } from "../db";
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../drizzle/migrations';
import { View, Text } from 'react-native';
import "../lib/i18n"; // Initialize i18n

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
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

function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: 'red', textAlign: 'center' }}>
          Migration error: {error.message}
        </Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center' }}>
          Migration is in progress...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <DatabaseProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </DatabaseProvider>
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
