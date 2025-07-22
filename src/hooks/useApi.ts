import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  cancelOnUnmount?: boolean;
  dedupe?: boolean; // Deduplicate identical requests
  cacheDuration?: number; // Cache duration in milliseconds
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

// Request deduplication and caching
const requestCache = new Map<string, {
  promise: Promise<any>;
  timestamp: number;
  data?: any;
}>();

const DEFAULT_CACHE_DURATION = 30000; // 30 seconds

// Generate cache key for requests
const generateCacheKey = (method: string, url: string, data?: any): string => {
  const dataStr = data ? JSON.stringify(data) : '';
  return `${method}:${url}:${dataStr}`;
};

// Clean expired cache entries
const cleanCache = () => {
  const now = Date.now();
  const entries = Array.from(requestCache.entries());
  for (const [key, entry] of entries) {
    if (now - entry.timestamp > DEFAULT_CACHE_DURATION) {
      requestCache.delete(key);
    }
  }
};

export const useApi = (options: UseApiOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { 
    cancelOnUnmount = true, 
    dedupe = true, 
    cacheDuration = DEFAULT_CACHE_DURATION 
  } = options;

  // Track component mount status
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel any ongoing request when component unmounts
      if (cancelOnUnmount && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cancelOnUnmount]);

  // Clean cache periodically
  useEffect(() => {
    const interval = setInterval(cleanCache, 60000); // Clean every minute
    return () => clearInterval(interval);
  }, []);

  // Helper function to check if component is still mounted
  const isMounted = useCallback(() => {
    return !cancelOnUnmount || mountedRef.current;
  }, [cancelOnUnmount]);

  // Helper function to handle API responses
  const handleResponse = useCallback((data: any, requestOptions?: UseApiOptions) => {
    if (!isMounted()) return null;

    options?.onSuccess?.(data);
    requestOptions?.onSuccess?.(data);
    return data;
  }, [isMounted, options]);

  // Helper function to handle API errors
  const handleError = useCallback((err: any, requestOptions?: UseApiOptions) => {
    if (!isMounted()) return;

    // Don't set error if request was aborted
    if (err.name === 'AbortError') return;

    const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
    setError(errorMessage);
    options?.onError?.(err);
    requestOptions?.onError?.(err);
  }, [isMounted, options]);

  // Generic request handler with caching and deduplication
  const makeRequest = useCallback(async <T = any>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    requestOptions?: UseApiOptions
  ): Promise<T | null> => {
    if (!isMounted()) return null;

    const cacheKey = generateCacheKey(method, url, data);
    
    // Check cache for GET requests
    if (method === 'get' && dedupe) {
      const cached = requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        if (cached.data) {
          return handleResponse(cached.data, requestOptions);
        }
        // If there's an ongoing request, wait for it
        if (cached.promise) {
          try {
            const result = await cached.promise;
            return handleResponse(result, requestOptions);
          } catch (err) {
            handleError(err, requestOptions);
            throw err;
          }
        }
      }
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      let requestPromise: Promise<T>;

      switch (method) {
        case 'get':
          requestPromise = api.get<T>(url, { signal: abortControllerRef.current.signal });
          break;
        case 'post':
          requestPromise = api.post<T>(url, data, { signal: abortControllerRef.current.signal });
          break;
        case 'put':
          requestPromise = api.put<T>(url, data, { signal: abortControllerRef.current.signal });
          break;
        case 'delete':
          requestPromise = api.delete<T>(url, { signal: abortControllerRef.current.signal });
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      // Cache the promise for deduplication
      if (method === 'get' && dedupe) {
        requestCache.set(cacheKey, {
          promise: requestPromise,
          timestamp: Date.now()
        });
      }

      const result = await requestPromise;

      // Cache the result for GET requests
      if (method === 'get' && dedupe) {
        requestCache.set(cacheKey, {
          promise: requestPromise,
          timestamp: Date.now(),
          data: result
        });
      }

      return handleResponse(result, requestOptions);
    } catch (err: any) {
      // Remove failed request from cache
      if (method === 'get' && dedupe) {
        requestCache.delete(cacheKey);
      }
      
      handleError(err, requestOptions);
      throw err;
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
      abortControllerRef.current = null;
    }
  }, [isMounted, handleResponse, handleError, dedupe, cacheDuration]);

  // Memoized API methods
  const get = useCallback(<T = any>(url: string, requestOptions?: UseApiOptions): Promise<T | null> => {
    return makeRequest<T>('get', url, undefined, requestOptions);
  }, [makeRequest]);

  const post = useCallback(<T = any>(url: string, data?: any, requestOptions?: UseApiOptions): Promise<T | null> => {
    return makeRequest<T>('post', url, data, requestOptions);
  }, [makeRequest]);

  const put = useCallback(<T = any>(url: string, data?: any, requestOptions?: UseApiOptions): Promise<T | null> => {
    return makeRequest<T>('put', url, data, requestOptions);
  }, [makeRequest]);

  const del = useCallback(<T = any>(url: string, requestOptions?: UseApiOptions): Promise<T | null> => {
    return makeRequest<T>('delete', url, undefined, requestOptions);
  }, [makeRequest]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset all states
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setError(null);
  }, []);

  // Cancel current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    clearError,
    reset,
    cancel,
  }), [loading, error, get, post, put, del, clearError, reset, cancel]);
};

// Optimized query hook with better caching
export const useApiQuery = <T = any>(
  url: string | null, 
  options?: UseApiOptions & { enabled?: boolean; refreshInterval?: number }
) => {
  const [data, setData] = useState<T | null>(null);
  const { get, loading, error, clearError, cancel } = useApi(options);
  const { enabled = true, refreshInterval } = options || {};
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    try {
      const result = await get<T>(url);
      setData(result);
    } catch (err) {
      // Error is already handled by useApi
    }
  }, [url, enabled, get]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && enabled && url) {
      refreshIntervalRef.current = setInterval(fetchData, refreshInterval);
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [refreshInterval, enabled, url, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [cancel]);

  const refetch = useCallback(() => {
    clearError();
    fetchData();
  }, [clearError, fetchData]);

  return useMemo(() => ({
    data,
    loading,
    error,
    refetch,
    clearError,
  }), [data, loading, error, refetch, clearError]);
};

// Hook for mutations with optimistic updates
export const useApiMutation = <T = any>(options?: UseApiOptions & {
  optimisticUpdate?: (data: any) => void;
  rollback?: () => void;
}) => {
  const [data, setData] = useState<T | null>(null);
  const api = useApi(options);
  const { optimisticUpdate, rollback } = options || {};

  const mutate = useCallback(async (
    method: 'post' | 'put' | 'delete',
    url: string,
    requestData?: any,
    requestOptions?: UseApiOptions
  ): Promise<T | null> => {
    // Apply optimistic update
    if (optimisticUpdate && requestData) {
      optimisticUpdate(requestData);
    }

    try {
      let result: T | null = null;
      
      switch (method) {
        case 'post':
          result = await api.post<T>(url, requestData, requestOptions);
          break;
        case 'put':
          result = await api.put<T>(url, requestData, requestOptions);
          break;
        case 'delete':
          result = await api.delete<T>(url, requestOptions);
          break;
      }
      
      setData(result);
      return result;
    } catch (error) {
      // Rollback optimistic update on error
      if (rollback) {
        rollback();
      }
      throw error;
    }
  }, [api, optimisticUpdate, rollback]);

  const post = useCallback((url: string, data?: any, requestOptions?: UseApiOptions) => {
    return mutate('post', url, data, requestOptions);
  }, [mutate]);

  const put = useCallback((url: string, data?: any, requestOptions?: UseApiOptions) => {
    return mutate('put', url, data, requestOptions);
  }, [mutate]);

  const del = useCallback((url: string, requestOptions?: UseApiOptions) => {
    return mutate('delete', url, undefined, requestOptions);
  }, [mutate]);

  return useMemo(() => ({
    data,
    loading: api.loading,
    error: api.error,
    post,
    put,
    delete: del,
    clearError: api.clearError,
    reset: api.reset,
  }), [api.loading, api.error, api.clearError, api.reset, data, post, put, del]);
};