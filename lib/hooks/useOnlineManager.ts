import { useEffect } from 'react';
import { onlineManager, useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

export function useOnlineManager() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);

      // Set React Query's online status
      onlineManager.setOnline(isOnline);

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
