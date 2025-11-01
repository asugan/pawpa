import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axios, { CancelTokenSource } from 'axios';

interface CancellableRequest {
  cancelTokenSource: CancelTokenSource;
  cancel: () => void;
}

export function useRequestCancellation() {
  const queryClient = useQueryClient();
  const activeRequests = useRef<Map<string, CancelTokenSource>>(new Map());

  // Cancel a specific request
  const cancelRequest = (queryKey: string[]) => {
    const key = JSON.stringify(queryKey);
    const source = activeRequests.current.get(key);

    if (source) {
      source.cancel('Request cancelled');
      activeRequests.current.delete(key);
    }
  };

  // Cancel all active requests
  const cancelAllRequests = () => {
    activeRequests.current.forEach((source) => {
      source.cancel('Request cancelled');
    });
    activeRequests.current.clear();
  };

  // Create a cancellable request
  const createCancellableRequest = (queryKey: string[]): CancellableRequest => {
    const key = JSON.stringify(queryKey);

    // Cancel existing request for same query
    cancelRequest(queryKey);

    // Create new cancel token source
    const cancelTokenSource = axios.CancelToken.source();
    activeRequests.current.set(key, cancelTokenSource);

    return {
      cancelTokenSource,
      cancel: () => {
        const source = activeRequests.current.get(key);
        if (source) {
          source.cancel('Request cancelled');
          activeRequests.current.delete(key);
        }
      },
    };
  };

  // Cancel requests when component unmounts
  useEffect(() => {
    return () => {
      cancelAllRequests();
    };
  }, []);

  // Cancel requests when going offline
  useEffect(() => {
    const handleOffline = () => {
      cancelAllRequests();
    };

    // Listen to offline events (web only, for mobile we handle differently)
    if (typeof window !== 'undefined') {
      window?.addEventListener('offline', handleOffline);
      return () => {
        window?.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return {
    cancelRequest,
    cancelAllRequests,
    createCancellableRequest,
    activeRequestsCount: activeRequests.current.size,
  };
}

// Hook for preventing duplicate requests
export function useRequestDeduplication() {
  const queryClient = useQueryClient();
  const pendingRequests = useRef<Map<string, Promise<any>>>(new Map());

  const executeWithDeduplication = async <T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    // Check if request is already in progress
    if (pendingRequests.current.has(key)) {
      return pendingRequests.current.get(key) as Promise<T>;
    }

    // Create new request
    const requestPromise = requestFn().finally(() => {
      // Remove from pending requests when done
      pendingRequests.current.delete(key);
    });

    // Store pending request
    pendingRequests.current.set(key, requestPromise);

    return requestPromise;
  };

  const clearPendingRequests = () => {
    pendingRequests.current.clear();
  };

  // Clear pending requests on unmount
  useEffect(() => {
    return () => {
      clearPendingRequests();
    };
  }, []);

  return {
    executeWithDeduplication,
    clearPendingRequests,
    pendingRequestsCount: pendingRequests.current.size,
  };
}