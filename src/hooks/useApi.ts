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

  // Clear cache method to force refresh
  const clearCache = useCallback(() => {
    requestCache.clear();
    // Also clear the main API cache
    if (api.clearCache) {
      api.clearCache();
    }
  }, []);

  // Clear cache by pattern for related endpoints
  const clearCacheByPattern = useCallback((pattern: string) => {
    const keys = Array.from(requestCache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        requestCache.delete(key);
      }
    });
    // Also clear the main API cache by pattern
    if (api.clearCacheByPattern) {
      api.clearCacheByPattern(pattern);
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
    clearCache,
    clearCacheByPattern,
  }), [loading, error, get, post, put, del, clearError, reset, cancel, clearCache, clearCacheByPattern]);
};