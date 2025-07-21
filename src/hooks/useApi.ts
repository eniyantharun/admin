import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  cancelOnUnmount?: boolean;
}

export const useApi = (options: UseApiOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const { cancelOnUnmount = true } = options;

  // Track mount status
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const get = useCallback(async (url: string, requestOptions?: UseApiOptions) => {
    if (cancelOnUnmount && !mountedRef.current) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.get(url);
      
      if (cancelOnUnmount && !mountedRef.current) return null;
      
      options?.onSuccess?.(data);
      requestOptions?.onSuccess?.(data);
      return data;
    } catch (err: any) {
      if (cancelOnUnmount && !mountedRef.current) return null;
      
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      options?.onError?.(err);
      requestOptions?.onError?.(err);
      throw err;
    } finally {
      if (!cancelOnUnmount || mountedRef.current) {
        setLoading(false);
      }
    }
  }, [options, cancelOnUnmount]);

  const post = useCallback(async (url: string, data?: any, requestOptions?: UseApiOptions) => {
    if (cancelOnUnmount && !mountedRef.current) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(url, data);
      
      if (cancelOnUnmount && !mountedRef.current) return null;
      
      options?.onSuccess?.(response);
      requestOptions?.onSuccess?.(response);
      return response;
    } catch (err: any) {
      if (cancelOnUnmount && !mountedRef.current) return null;
      
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      options?.onError?.(err);
      requestOptions?.onError?.(err);
      throw err;
    } finally {
      if (!cancelOnUnmount || mountedRef.current) {
        setLoading(false);
      }
    }
  }, [options, cancelOnUnmount]);

  const put = useCallback(async (url: string, data?: any, requestOptions?: UseApiOptions) => {
    if (cancelOnUnmount && !mountedRef.current) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(url, data);
      
      if (cancelOnUnmount && !mountedRef.current) return null;
      
      options?.onSuccess?.(response);
      requestOptions?.onSuccess?.(response);
      return response;
    } catch (err: any) {
      if (cancelOnUnmount && !mountedRef.current) return null;
      
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      options?.onError?.(err);
      requestOptions?.onError?.(err);
      throw err;
    } finally {
      if (!cancelOnUnmount || mountedRef.current) {
        setLoading(false);
      }
    }
  }, [options, cancelOnUnmount]);

  const del = useCallback(async (url: string, requestOptions?: UseApiOptions) => {
    if (cancelOnUnmount && !mountedRef.current) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete(url);
      
      if (cancelOnUnmount && !mountedRef.current) return null;
      
      options?.onSuccess?.(response);
      requestOptions?.onSuccess?.(response);
      return response;
    } catch (err: any) {
      if (cancelOnUnmount && !mountedRef.current) return null;
      
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      options?.onError?.(err);
      requestOptions?.onError?.(err);
      throw err;
    } finally {
      if (!cancelOnUnmount || mountedRef.current) {
        setLoading(false);
      }
    }
  }, [options, cancelOnUnmount]);

  const clearError = useCallback(() => {
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
  };
};