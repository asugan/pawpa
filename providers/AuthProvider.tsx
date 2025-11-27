import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/lib/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider handles navigation based on authentication state
 *
 * - Redirects unauthenticated users to login
 * - Redirects authenticated users away from auth screens
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, isPending } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait for session check to complete
    if (isPending) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not on auth screen
      // Redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but on auth screen
      // Redirect to main app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isPending, segments, router]);

  return <>{children}</>;
}
