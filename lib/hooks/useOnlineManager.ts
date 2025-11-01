import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { focusManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

export function useOnlineManager() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected ?? false;

      // Set React Query's online status
      focusManager.setFocused(isOnline);

      // When coming back online, refetch all stale queries
      if (isOnline) {
        queryClient.refetchQueries({
          queryKey: undefined,
          type: 'active',
          stale: true,
        });
      }
    });

    return () => unsubscribe();
  }, [queryClient]);
}