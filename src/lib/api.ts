import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { showToast } from '../components/ui/toast';
import { OrderStatus, QuoteStatus, WebsiteType, PaymentMethod } from '../types/enums';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; 

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
    } else {
      showToast.error('No auth token found in cookies');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    
    return response;
  },
  (error: AxiosError) => {

    if (error.response?.status === 401) {
      showToast.error('Session expired. Please login again.');
      Cookies.remove('auth_token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    if (error.response?.status === 403) {
      showToast.error('403 Forbidden - check user permissions and token validity');
    }
    
    return Promise.reject(error);
  }
);

export const api = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const cacheKey = generateCacheKey(url, config?.params);
    
    if (!url.includes('auth') && !url.includes('login')) {
      const cached = requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }
    
    try {
      const response = await apiClient.get<T>(url, config);
      
      if (!url.includes('auth') && !url.includes('login')) {
        requestCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });
      }
      
      return response.data;
    } catch (error) {
      showToast.error(`API GET Error for ${url}:`);
      throw error;
    }
  },
  
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, data, config);
      
      if (!url.includes('auth') && !url.includes('login')) {
        api.clearCacheByPattern(url);
      }
      
      return response.data;
    } catch (error) {
      showToast.error(`API POST Error for ${url}:`);
      throw error;
    }
  },
  
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.put<T>(url, data, config);
      
      if (!url.includes('auth') && !url.includes('login')) {
        api.clearCacheByPattern(url);
      }
      
      return response.data;
    } catch (error) {
      showToast.error(`API PUT Error for ${url}:`);
      throw error;
    }
  },
  
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(url, config);
      
      if (!url.includes('auth') && !url.includes('login')) {
        api.clearCacheByPattern(url);
      }
      
      return response.data;
    } catch (error) {
       showToast.error(`API DELETE Error for ${url}:`);
      throw error;
    }
  },
  
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
    list: '/Admin/SupplierEditor/GetSupplier',
    create: '/Admin/SupplierList/CreateSupplier',
    update: (id: string | number) => `/Admin/SupplierList/UpdateSupplier/${id}`,
    delete: (id: string | number) => `/Admin/SupplierList/DeleteSupplier/${id}`,
  },
  
  orders: {
    list: 'https://api.promowe.com/Admin/Orders/GetOrdersList',
    create: '/Admin/Orders/CreateOrder',
    update: (id: string | number) => `/Admin/Orders/UpdateOrder/${id}`,
    delete: (id: string | number) => `/Admin/Orders/DeleteOrder/${id}`,
  },
  
  quotes: {
    list: 'https://api.promowe.com/Admin/Quotes/GetQuotesList',
    create: '/Admin/Quotes/CreateQuote',
    update: (id: string | number) => `/Admin/Quotes/UpdateQuote/${id}`,
    delete: (id: string | number) => `/Admin/Quotes/DeleteQuote/${id}`,
  },
  
  sales: {
    list: '/Admin/SaleList/GetSalesList',
    quoteDetail: (id: string | number) => `/Admin/SaleEditor/GetQuoteDetail?id=${id}`,
    orderDetail: (id: string | number) => `/Admin/SaleEditor/GetOrderDetail?Id=${id}`,
    setLineItemsPositions: '/Admin/SaleEditor/SetLineItemsPositions',
    setLineItemDetail: '/Admin/SaleEditor/SetLineItemDetail',
    setSaleDetail: '/Admin/SaleEditor/SetSaleDetail',
    addEmptyLineItem: '/Admin/SaleEditor/AddEmptyLineItem',
    removeLineItems: '/Admin/SaleEditor/RemoveLineItems',
    setOrderDetail: '/Admin/SaleEditor/SetOrderDetail',
    getChargesList: (orderId: string | number) => `/Admin/SaleEditor/GetChargesList?OrderId=${orderId}`,
    getSaleComments: (saleId: string) => `/Admin/SaleEditor/GetSaleComments?SaleId=${saleId}`,
    getSaleInvoices: (saleId: string, supplierId: string | number) => `/Admin/SaleEditor/GetSaleInvoices?SaleId=${saleId}&SupplierId=${supplierId}`,
    getSaleSummary: (saleId: string) => `/Admin/SaleEditor/GetSaleSummary?SaleId=${saleId}`,
    getShippingCompanies: (prefix?: string) => `/Admin/SaleEditor/GetShippingCompanies?Prefix=${prefix || ''}`,
    getShippingTypes: (count?: number, prefix?: string) => `/Admin/SaleEditor/GetShippingTypes?Count=${count || 10}&Prefix=${prefix || ''}`,
    getTrackingLink: (companyName: string, trackingNumber: string) => `/Admin/SaleEditor/GetTrackingLink?CompanyName=${companyName}&TrackingNumber=${trackingNumber}`,
    addEmptyOrder: '/Admin/SaleEditor/AddEmptyOrder',
    addQuotationFollowups: '/Admin/SaleEditor/AddQuotationFollowups',
    addSaleComment: '/Admin/SaleEditor/AddSaleComment',
    convertOrderToQuote: '/Admin/SaleEditor/ConvertOrderToQuote',
    sendQuotationFollowup: '/Admin/SaleEditor/SendQuotationFollowup',
    addEmptyQuote: '/Admin/SaleEditor/AddEmptyQuote',
    setPurchaseOrderDetail: '/Admin/SaleEditor/SetPurchaseOrderDetail',
    setQuoteDetail: '/Admin/SaleEditor/SetQuoteDetail',
  },
  
  dashboard: {
    getDashboardOrders: '/Admin/Dashboard/GetDashboardOrders',
    getOrderStatistics: '/Admin/Dashboard/GetOrderStatistics',
  },
  
  brands: {
    list: '/Admin/Brands/GetBrandsList',
    create: '/Admin/Brands/CreateBrand',
    update: (id: string | number) => `/Admin/Brands/UpdateBrand/${id}`,
    delete: (id: string | number) => `/Admin/Brands/DeleteBrand/${id}`,
  }
};

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

export class QuoteService {
  static async getQuotes(params: {
    isQuote: boolean;
    search?: string;
    pageSize: number;
    pageIndex: number;
    orderStatus?: OrderStatus[];
    quoteStatus?: QuoteStatus[];
    website: WebsiteType;
  }) {
    return api.post(apiEndpoints.sales.list, params);
  }

  static async getQuoteDetail(id: string | number) {
    return api.get(apiEndpoints.sales.quoteDetail(id));
  }

  static async createQuote(customerId: string) {
    return api.post(apiEndpoints.sales.addEmptyQuote, { customerId });
  }

  static async updateQuote(id: number, data: { status?: QuoteStatus }) {
    return api.post(apiEndpoints.sales.setQuoteDetail, { id, ...data });
  }

  static async addQuotationFollowups(quoteId: number) {
    return api.post(apiEndpoints.sales.addQuotationFollowups, { quoteId });
  }

  static async sendQuotationFollowup(quoteId: number) {
    return api.post(apiEndpoints.sales.sendQuotationFollowup, { quoteId });
  }

  static async setLineItemsPositions(saleId: string, lineItemIds: string[]) {
    return api.post(apiEndpoints.sales.setLineItemsPositions, { saleId, lineItemIds });
  }

  static async setLineItemDetail(lineItemId: string, data: any) {
    return api.post(apiEndpoints.sales.setLineItemDetail, { lineItemId, ...data });
  }

  static async addEmptyLineItem(saleId: string, productId: number) {
    return api.post(apiEndpoints.sales.addEmptyLineItem, { saleId, productId });
  }

  static async removeLineItems(saleId: string, lineItemIds: string[]) {
    return api.post(apiEndpoints.sales.removeLineItems, { SaleId: saleId, LineItemIds: lineItemIds });
  }

  static async setSaleDetail(saleId: string, data: any) {
    return api.post(apiEndpoints.sales.setSaleDetail, { saleId, ...data });
  }

  static async getSaleComments(saleId: string) {
    return api.get(apiEndpoints.sales.getSaleComments(saleId));
  }

  static async addSaleComment(saleId: string, comment: string, attachments?: string[]) {
    return api.post(apiEndpoints.sales.addSaleComment, { saleId, comment, attachments });
  }

  static async getSaleSummary(saleId: string) {
    return api.get(apiEndpoints.sales.getSaleSummary(saleId));
  }

  static async getShippingCompanies(prefix?: string) {
    return api.get(apiEndpoints.sales.getShippingCompanies(prefix));
  }

  static async getShippingTypes(count?: number, prefix?: string) {
    return api.get(apiEndpoints.sales.getShippingTypes(count, prefix));
  }

  static async getTrackingLink(companyName: string, trackingNumber: string) {
    return api.get(apiEndpoints.sales.getTrackingLink(companyName, trackingNumber));
  }
}

export class OrderService {
  static async getOrders(params: {
    isQuote: boolean;
    search?: string;
    pageSize: number;
    pageIndex: number;
    orderStatus?: OrderStatus[];
    quoteStatus?: string[];
    website: WebsiteType;
  }) {
    return api.post(apiEndpoints.sales.list, params);
  }

  static async getOrderDetail(id: string | number) {
    return api.get(apiEndpoints.sales.orderDetail(id));
  }

  static async createOrder(customerId: string) {
    return api.post(apiEndpoints.sales.addEmptyOrder, { customerId });
  }

  static async updateOrder(id: number, data: {
    paymentDetails?: { paymentDate?: string };
    paymentMethod?: PaymentMethod;
    isPaid?: boolean;
    status?: OrderStatus;
    creditCardId?: string;
    chequePhotoId?: string;
    companyPaymentOrderId?: string;
    cheque?: { chequeNumber?: string };
  }) {
    return api.post(apiEndpoints.sales.setOrderDetail, { id, ...data });
  }

  static async getChargesList(orderId: string | number) {
    return api.get(apiEndpoints.sales.getChargesList(orderId));
  }

  static async getSaleInvoices(saleId: string, supplierId: string | number) {
    return api.get(apiEndpoints.sales.getSaleInvoices(saleId, supplierId));
  }

  static async setPurchaseOrderDetail(purchaseOrderId: number, data: {
    form?: { shippingCost?: number };
    isDefaultShippingEnabled?: boolean;
    notesId?: string;
  }) {
    return api.post(apiEndpoints.sales.setPurchaseOrderDetail, { purchaseOrderId, ...data });
  }

  static async convertOrderToQuote(quoteId: number) {
    return api.post(apiEndpoints.sales.convertOrderToQuote, { quoteId });
  }
}

export class DashboardService {
  static async getDashboardOrders(startDate: string, endDate: string) {
    const params = new URLSearchParams({
      Start: startDate,
      End: endDate
    });
    return api.get(`${apiEndpoints.dashboard.getDashboardOrders}?${params}`);
  }

  static async getOrderStatistics(month: string) {
    const params = new URLSearchParams({
      Month: month
    });
    return api.get(`${apiEndpoints.dashboard.getOrderStatistics}?${params}`);
  }
}

export default api;