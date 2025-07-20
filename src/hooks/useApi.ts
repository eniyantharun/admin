import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const get = useCallback(async (url: string, options?: UseApiOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.get(url);
      options?.onSuccess?.(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const post = useCallback(async (url: string, data?: any, options?: UseApiOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(url, data);
      options?.onSuccess?.(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const put = useCallback(async (url: string, data?: any, options?: UseApiOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(url, data);
      options?.onSuccess?.(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const del = useCallback(async (url: string, options?: UseApiOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete(url);
      options?.onSuccess?.(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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