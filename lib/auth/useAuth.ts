import { authClient, type Session, type User } from './client';

/**
 * Re-export useSession from authClient for direct access
 */
export const useSession = authClient.useSession;

/**
 * Custom hook that provides authentication functionality
 * including sign in, sign up, sign out, and session data
 *
 * Mirrors the web PawTrack useAuth pattern for consistency
 */
export function useAuth() {
  const { data: session, isPending, error, refetch } = authClient.useSession();

  /**
   * Sign in methods for different providers
   */
  const signIn = {
    /**
     * Sign in with email and password
     */
    email: async (email: string, password: string) => {
      return authClient.signIn.email({
        email,
        password,
      });
    },

    /**
     * Sign in with Google OAuth
     */
    google: async () => {
      return authClient.signIn.social({
        provider: 'google',
      });
    },

    /**
     * Sign in with Apple OAuth
     */
    apple: async () => {
      return authClient.signIn.social({
        provider: 'apple',
      });
    },
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, name: string) => {
    return authClient.signUp.email({
      email,
      password,
      name,
    });
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    return authClient.signOut();
  };

  /**
   * Get the current session cookie for API requests
   */
  const getCookie = () => {
    return authClient.getCookie();
  };

  return {
    // Session data
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    isPending,
    error,
    refetch,

    // Auth methods
    signIn,
    signUp,
    signOut,
    getCookie,
  };
}
