import { create } from 'zustand';

interface AuthUIState {
  isLoading: boolean;
  authError: string | null;
  lastAuthAction: 'signIn' | 'signUp' | 'signOut' | null;
}

interface AuthUIActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastAction: (action: AuthUIState['lastAuthAction']) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Zustand store for auth UI state
 *
 * Note: Actual session state is managed by better-auth/useSession
 * This store handles UI concerns (loading states, error messages)
 */
export const useAuthStore = create<AuthUIState & AuthUIActions>()((set) => ({
  // Initial state
  isLoading: false,
  authError: null,
  lastAuthAction: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (authError) => set({ authError }),
  setLastAction: (lastAuthAction) => set({ lastAuthAction }),
  clearError: () => set({ authError: null }),
  reset: () => set({ isLoading: false, authError: null, lastAuthAction: null }),
}));
