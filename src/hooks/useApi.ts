import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  cancelOnUnmount?: boolean;
  dedupe?: boolean;
  cacheDuration?: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

const requestCache = new Map<string, {
  promise: Promise<any>;
  timestamp: number;
  data?: any;
}>();

const DEFAULT_CACHE_DURATION = 30000; 

const generateCacheKey = (method: string, url: string, data?: any): string => {
  const dataStr = data ? JSON.stringify(data) : '';
  return `${method}:${url}:${dataStr}`;
};

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

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (cancelOnUnmount && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cancelOnUnmount]);

  useEffect(() => {
    const interval = setInterval(cleanCache, 60000); 
    return () => clearInterval(interval);
  }, []);

  const isMounted = useCallback(() => {
    return !cancelOnUnmount || mountedRef.current;
  }, [cancelOnUnmount]);

  const handleResponse = useCallback((data: any, requestOptions?: UseApiOptions) => {
    if (!isMounted()) return null;

    options?.onSuccess?.(data);
    requestOptions?.onSuccess?.(data);
    return data;
  }, [isMounted, options]);

  const handleError = useCallback((err: any, requestOptions?: UseApiOptions) => {
    if (!isMounted()) return;

    if (err.name === 'AbortError' || (err.name === 'CanceledError' && cancelOnUnmount)) {
      console.log('Request was canceled/aborted - this is expected behavior');
      return;
    }

    const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
    setError(errorMessage);
    options?.onError?.(err);
    requestOptions?.onError?.(err);
  }, [isMounted, options, cancelOnUnmount]);

  const makeRequest = useCallback(async <T = any>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    requestOptions?: UseApiOptions
  ): Promise<T | null> => {
    if (!isMounted()) return null;

    const cacheKey = generateCacheKey(method, url, data);
    
    if (method === 'get' && dedupe) {
      const cached = requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        if (cached.data) {
          return handleResponse(cached.data, requestOptions);
        }
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

    if (cancelOnUnmount && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (cancelOnUnmount) {
      abortControllerRef.current = new AbortController();
    }
    
    setLoading(true);
    setError(null);

    try {
      let requestPromise: Promise<T>;
      const config = cancelOnUnmount ? { signal: abortControllerRef.current?.signal } : {};

      switch (method) {
        case 'get':
          requestPromise = api.get<T>(url, config);
          break;
        case 'post':
          requestPromise = api.post<T>(url, data, config);
          break;
        case 'put':
          requestPromise = api.put<T>(url, data, config);
          break;
        case 'delete':
          requestPromise = api.delete<T>(url, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (method === 'get' && dedupe) {
        requestCache.set(cacheKey, {
          promise: requestPromise,
          timestamp: Date.now()
        });
      }

      const result = await requestPromise;

      if (method === 'get' && dedupe) {
        requestCache.set(cacheKey, {
          promise: requestPromise,
          timestamp: Date.now(),
          data: result
        });
      }

      return handleResponse(result, requestOptions);
    } catch (err: any) {
      if (method === 'get' && dedupe) {
        requestCache.delete(cacheKey);
      }
      
      handleError(err, requestOptions);
      throw err;
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
      if (cancelOnUnmount) {
        abortControllerRef.current = null;
      }
    }
  }, [isMounted, handleResponse, handleError, dedupe, cacheDuration, cancelOnUnmount]);

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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    if (cancelOnUnmount && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setError(null);
  }, [cancelOnUnmount]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

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
    }
  }, [url, enabled, get]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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