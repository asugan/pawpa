import React from 'react';
import { QueryClientProvider, QueryClient, focusManager } from '@tanstack/react-query';
import { MOBILE_QUERY_CONFIG } from '@/lib/config/queryConfig';
import { Platform } from 'react-native';

// Create QueryClient with optimized configuration
const queryClient = new QueryClient(MOBILE_QUERY_CONFIG);

// Configure focus behavior for mobile
focusManager.setEventListener((handleFocus) => {
  if (Platform.OS === 'web') {
    // Web: listen to visibility change events
    const visibilityHandler = () => handleFocus(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', visibilityHandler, false);
    return () => document.removeEventListener('visibilitychange', visibilityHandler);
  } else {
    // Mobile: app state changes handled in useOnlineManager
    return () => {};
  }
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}