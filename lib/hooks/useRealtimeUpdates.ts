import { useEffect, useRef, useCallback, useState } from 'react';
import { QueryKey, useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { NetworkState } from '@/lib/types';

// Type for interval ref
type IntervalRef = NodeJS.Timeout | null;

interface RealtimeConfig {
  enabled: boolean;
  interval: number;
  refetchOnReconnect: boolean;
}

export function useRealtimeUpdates(
  queryKeys: QueryKey[],
  config: Partial<RealtimeConfig> = {}
) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<IntervalRef>(null);
  const configRef = useRef<RealtimeConfig>({
    enabled: true,
    interval: 30000, // 30 seconds
    refetchOnReconnect: true,
    ...config,
  });
  const [isEnabled, setIsEnabled] = useState(configRef.current.enabled);

  // Start real-time updates
  const startRealtimeUpdates = useCallback(() => {
    const { enabled, interval } = configRef.current;
    if (!enabled || intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      // Refetch all specified queries
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    }, interval) as unknown as IntervalRef;

    setIsEnabled(true);
  }, [queryKeys, queryClient]);

  // Stop real-time updates
  const stopRealtimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsEnabled(false);
  }, []);

  // Handle network state changes
  const handleNetworkChange = useCallback((state: NetworkState) => {
    if (state.isConnected && configRef.current.refetchOnReconnect) {
      // Refetch all queries when coming back online
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    }
  }, [queryKeys, queryClient]);

  // Setup network listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);
    return unsubscribe;
  }, [handleNetworkChange]);

  // Start/stop based on configuration
  useEffect(() => {
    const { enabled } = configRef.current;
    if (enabled) {
      startRealtimeUpdates();
    } else {
      stopRealtimeUpdates();
    }

    return stopRealtimeUpdates;
  }, [startRealtimeUpdates, stopRealtimeUpdates]);

  // Manual refresh
  const refresh = useCallback(() => {
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [queryKeys, queryClient]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<RealtimeConfig>) => {
    const current = configRef.current;
    const merged = { ...current, ...newConfig };
    const enabledChanged =
      newConfig.enabled !== undefined && newConfig.enabled !== current.enabled;
    const intervalChanged =
      newConfig.interval !== undefined && newConfig.interval !== current.interval;

    configRef.current = merged;

    if (enabledChanged) {
      if (merged.enabled) {
        startRealtimeUpdates();
      } else {
        stopRealtimeUpdates();
      }
    }

    if (intervalChanged && intervalRef.current) {
      stopRealtimeUpdates();
      startRealtimeUpdates();
    }
  }, [startRealtimeUpdates, stopRealtimeUpdates]);

  useEffect(() => {
    updateConfig(config);
  }, [config, updateConfig]);

  return {
    isEnabled,
    startRealtimeUpdates,
    stopRealtimeUpdates,
    refresh,
    updateConfig,
  };
}
