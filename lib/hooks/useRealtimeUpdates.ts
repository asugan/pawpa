import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

// Type for interval ref
type IntervalRef = NodeJS.Timeout | null;

interface RealtimeConfig {
  enabled: boolean;
  interval: number;
  refetchOnReconnect: boolean;
}

export function useRealtimeUpdates(
  queryKeys: string[][],
  config: Partial<RealtimeConfig> = {}
) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<IntervalRef>(null);
  const isEnabledRef = useRef(config.enabled ?? true);

  const defaultConfig: RealtimeConfig = {
    enabled: true,
    interval: 30000, // 30 seconds
    refetchOnReconnect: true,
    ...config,
  };

  // Start real-time updates
  const startRealtimeUpdates = useCallback(() => {
    if (!defaultConfig.enabled || intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      // Refetch all specified queries
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    }, defaultConfig.interval) as unknown as IntervalRef;

    isEnabledRef.current = true;
  }, [queryKeys, defaultConfig.enabled, defaultConfig.interval, queryClient]);

  // Stop real-time updates
  const stopRealtimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isEnabledRef.current = false;
  }, []);

  // Handle network state changes
  const handleNetworkChange = useCallback((state: any) => {
    if (state.isConnected && defaultConfig.refetchOnReconnect) {
      // Refetch all queries when coming back online
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    }
  }, [queryKeys, defaultConfig.refetchOnReconnect, queryClient]);

  // Setup network listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);
    return unsubscribe;
  }, [handleNetworkChange]);

  // Start/stop based on configuration
  useEffect(() => {
    if (defaultConfig.enabled) {
      startRealtimeUpdates();
    } else {
      stopRealtimeUpdates();
    }

    return stopRealtimeUpdates;
  }, [defaultConfig.enabled, startRealtimeUpdates, stopRealtimeUpdates]);

  // Manual refresh
  const refresh = useCallback(() => {
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [queryKeys, queryClient]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<RealtimeConfig>) => {
    Object.assign(defaultConfig, newConfig);

    if (newConfig.enabled !== undefined && newConfig.enabled !== isEnabledRef.current) {
      if (newConfig.enabled) {
        startRealtimeUpdates();
      } else {
        stopRealtimeUpdates();
      }
    }

    if (newConfig.interval !== undefined && intervalRef.current) {
      stopRealtimeUpdates();
      startRealtimeUpdates();
    }
  }, [defaultConfig, startRealtimeUpdates, stopRealtimeUpdates]);

  return {
    isEnabled: isEnabledRef.current,
    startRealtimeUpdates,
    stopRealtimeUpdates,
    refresh,
    updateConfig,
  };
}