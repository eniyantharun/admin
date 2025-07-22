import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  cancelOnUnmount?: boolean;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

export const useApi = (options: UseApiOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const { cancelOnUnmount = true } = options;

  // Track component mount status
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
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

    const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
    setError(errorMessage);
    options?.onError?.(err);
    requestOptions?.onError?.(err);
  }, [isMounted, options]);

  // GET request
  const get = useCallback(async <T = any>(url: string, requestOptions?: UseApiOptions): Promise<T | null> => {
    if (!isMounted()) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.get<T>(url);
      return handleResponse(data, requestOptions);
    } catch (err: any) {
      handleError(err, requestOptions);
      throw err;
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [isMounted, handleResponse, handleError]);

  // POST request
  const post = useCallback(async <T = any>(url: string, data?: any, requestOptions?: UseApiOptions): Promise<T | null> => {
    if (!isMounted()) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<T>(url, data);
      return handleResponse(response, requestOptions);
    } catch (err: any) {
      handleError(err, requestOptions);
      throw err;
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [isMounted, handleResponse, handleError]);

  // PUT request
  const put = useCallback(async <T = any>(url: string, data?: any, requestOptions?: UseApiOptions): Promise<T | null> => {
    if (!isMounted()) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put<T>(url, data);
      return handleResponse(response, requestOptions);
    } catch (err: any) {
      handleError(err, requestOptions);
      throw err;
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [isMounted, handleResponse, handleError]);

  // DELETE request
  const del = useCallback(async <T = any>(url: string, requestOptions?: UseApiOptions): Promise<T | null> => {
    if (!isMounted()) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete<T>(url);
      return handleResponse(response, requestOptions);
    } catch (err: any) {
      handleError(err, requestOptions);
      throw err;
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [isMounted, handleResponse, handleError]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset all states
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    clearError,
    reset,
  };
};

// Specialized hooks for common patterns
export const useApiQuery = <T = any>(
  url: string | null, 
  options?: UseApiOptions & { enabled?: boolean }
) => {
  const [data, setData] = useState<T | null>(null);
  const { get, loading, error, clearError } = useApi(options);
  const { enabled = true } = options || {};

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    try {
      const result = await get<T>(url);
      setData(result);
    } catch (err) {
      // Error is already handled by useApi
    }
  }, [url, enabled, get]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    clearError();
    fetchData();
  }, [clearError, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    clearError,
  };
};

// Hook for mutations (POST, PUT, DELETE)
export const useApiMutation = <T = any>(options?: UseApiOptions) => {
  const [data, setData] = useState<T | null>(null);
  const api = useApi(options);

  const mutate = useCallback(async (
    method: 'post' | 'put' | 'delete',
    url: string,
    requestData?: any,
    requestOptions?: UseApiOptions
  ): Promise<T | null> => {
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
      throw error;
    }
  }, [api]);

  const post = useCallback((url: string, data?: any, requestOptions?: UseApiOptions) => {
    return mutate('post', url, data, requestOptions);
  }, [mutate]);

  const put = useCallback((url: string, data?: any, requestOptions?: UseApiOptions) => {
    return mutate('put', url, data, requestOptions);
  }, [mutate]);

  const del = useCallback((url: string, requestOptions?: UseApiOptions) => {
    return mutate('delete', url, undefined, requestOptions);
  }, [mutate]);

  return {
    data,
    loading: api.loading,
    error: api.error,
    post,
    put,
    delete: del,
    clearError: api.clearError,
    reset: api.reset,
  };
};