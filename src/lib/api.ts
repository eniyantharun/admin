import axios, { AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

// Simple cache for GET requests only
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const generateCacheKey = (url: string, params?: any): string => {
  const paramString = params ? JSON.stringify(params) : '';
  return `${url}_${paramString}`;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const cacheKey = generateCacheKey(url, config?.params);
    
    // Check cache for non-auth URLs
    if (!url.includes('auth') && !url.includes('login')) {
      const cached = requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }
    
    const response = await apiClient.get<T>(url, config);
    
    // Cache successful responses
    if (!url.includes('auth') && !url.includes('login')) {
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    
    return response.data;
  },
  
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    
    // Clear related cache entries
    if (!url.includes('auth') && !url.includes('login')) {
      const urlBase = url.split('/').slice(0, -1).join('/');
      Array.from(requestCache.keys()).forEach(key => {
        if (key.includes(urlBase)) {
          requestCache.delete(key);
        }
      });
    }
    
    return response.data;
  },
  
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    
    // Clear related cache entries
    if (!url.includes('auth') && !url.includes('login')) {
      const urlBase = url.split('/').slice(0, -1).join('/');
      Array.from(requestCache.keys()).forEach(key => {
        if (key.includes(urlBase)) {
          requestCache.delete(key);
        }
      });
    }
    
    return response.data;
  },
  
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    
    // Clear related cache entries
    if (!url.includes('auth') && !url.includes('login')) {
      const urlBase = url.split('/').slice(0, -1).join('/');
      Array.from(requestCache.keys()).forEach(key => {
        if (key.includes(urlBase)) {
          requestCache.delete(key);
        }
      });
    }
    
    return response.data;
  },
  
  clearCache: (): void => {
    requestCache.clear();
  },
};