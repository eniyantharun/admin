import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

// Simple in-memory cache for GET requests only
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

// Request interceptor to add authentication token
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

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
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
    
    try {
      const response = await apiClient.get<T>(url, config);
      
      // Cache successful responses (excluding auth endpoints)
      if (!url.includes('auth') && !url.includes('login')) {
        requestCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });
      }
      
      return response.data;
    } catch (error) {
      console.error(`API GET Error for ${url}:`, error);
      throw error;
    }
  },
  
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, data, config);
      
      // Clear related cache entries on successful mutations
      if (!url.includes('auth') && !url.includes('login')) {
        api.clearCacheByPattern(url);
      }
      
      return response.data;
    } catch (error) {
      console.error(`API POST Error for ${url}:`, error);
      throw error;
    }
  },
  
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.put<T>(url, data, config);
      
      // Clear related cache entries on successful mutations
      if (!url.includes('auth') && !url.includes('login')) {
        api.clearCacheByPattern(url);
      }
      
      return response.data;
    } catch (error) {
      console.error(`API PUT Error for ${url}:`, error);
      throw error;
    }
  },
  
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(url, config);
      
      // Clear related cache entries on successful mutations
      if (!url.includes('auth') && !url.includes('login')) {
        api.clearCacheByPattern(url);
      }
      
      return response.data;
    } catch (error) {
      console.error(`API DELETE Error for ${url}:`, error);
      throw error;
    }
  },
  
  // Utility methods for cache management
  clearCache: (): void => {
    requestCache.clear();
  },
  
  clearCacheByPattern: (pattern: string): void => {
    const urlBase = pattern.split('/').slice(0, -1).join('/');
    Array.from(requestCache.keys()).forEach(key => {
      if (key.includes(urlBase)) {
        requestCache.delete(key);
      }
    });
  },
  
  getCacheStats: (): { size: number; entries: string[] } => {
    return {
      size: requestCache.size,
      entries: Array.from(requestCache.keys())
    };
  }
};

// API endpoint collections for better organization
export const apiEndpoints = {
  auth: {
    login: '/Admin/Login/Login',
    logout: '/auth/logout',
    isAuthorized: '/Admin/User/IsAuthorized',
  },
  
  customers: {
    list: '/Admin/CustomerEditor/GetCustomersList',
    create: '/Admin/CustomerEditor/CreateCustomer',
    update: (id: string | number) => `/Admin/CustomerEditor/UpdateCustomer/${id}`,
    delete: (id: string | number) => `/Admin/CustomerEditor/DeleteCustomer/${id}`,
    sendResetPassword: '/Admin/CustomerEditor/SendResetPasswordEmail',
    sendNewAccount: '/Admin/CustomerEditor/SendNewAccountEmail',
  },
  
  suppliers: {
    list: '/Admin/SupplierList/GetSuppliersList',
    create: '/Admin/SupplierList/CreateSupplier',
    update: (id: string | number) => `/Admin/SupplierList/UpdateSupplier/${id}`,
    delete: (id: string | number) => `/Admin/SupplierList/DeleteSupplier/${id}`,
  },
  
  orders: {
    list: '/Admin/Orders/GetOrdersList',
    create: '/Admin/Orders/CreateOrder',
    update: (id: string | number) => `/Admin/Orders/UpdateOrder/${id}`,
    delete: (id: string | number) => `/Admin/Orders/DeleteOrder/${id}`,
  },
  
  quotes: {
    list: '/Admin/Quotes/GetQuotesList',
    create: '/Admin/Quotes/CreateQuote',
    update: (id: string | number) => `/Admin/Quotes/UpdateQuote/${id}`,
    delete: (id: string | number) => `/Admin/Quotes/DeleteQuote/${id}`,
  },
  
  brands: {
    list: '/Admin/Brands/GetBrandsList',
    create: '/Admin/Brands/CreateBrand',
    update: (id: string | number) => `/Admin/Brands/UpdateBrand/${id}`,
    delete: (id: string | number) => `/Admin/Brands/DeleteBrand/${id}`,
  }
};

// Specialized API service classes for complex operations
export class CustomerService {
  static async getCustomers(params: {
    website: string;
    search?: string;
    count?: number;
    index?: number;
  }) {
    const queryParams = new URLSearchParams({
      website: params.website,
      search: params.search || '',
      count: (params.count || 20).toString(),
      index: (params.index || 0).toString()
    });

    return api.get(apiEndpoints.customers.list + '?' + queryParams);
  }

  static async createCustomer(customerData: {
    website: string;
    form: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
      companyName?: string;
    };
  }) {
    return api.post(apiEndpoints.customers.create, customerData);
  }

  static async updateCustomer(id: string | number, customerData: any) {
    return api.put(apiEndpoints.customers.update(id), customerData);
  }

  static async sendResetPasswordEmail(email: string, website: string) {
    return api.post(apiEndpoints.customers.sendResetPassword, { email, website });
  }

  static async sendNewAccountEmail(email: string, website: string) {
    return api.post(apiEndpoints.customers.sendNewAccount, { email, website });
  }
}

export class SupplierService {
  static async getSuppliers() {
    return api.get(apiEndpoints.suppliers.list);
  }

  static async createSupplier(supplierData: {
    companyName: string;
    webUrl: string;
    emailAddress?: string;
    telephoneNumber?: string;
    enabled: boolean;
    exclusive: boolean;
  }) {
    return api.post(apiEndpoints.suppliers.create, supplierData);
  }

  static async updateSupplier(id: string | number, supplierData: any) {
    return api.put(apiEndpoints.suppliers.update(id), supplierData);
  }
}

// Export the main api object as default
export default api;