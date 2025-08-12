import { api } from '@/lib/api';
import { OrderStatus, QuoteStatus, WebsiteType } from '@/types/enums';
import { iOrder } from '@/types/order';
import { iQuote } from '@/types/quotes';

export interface SalesListRequest {
  isQuote: boolean;
  pageSize: number;
  pageIndex: number;
  website: WebsiteType;
  search?: string;
  orderStatus?: OrderStatus[];
  quoteStatus?: QuoteStatus[];
}

export interface SalesListResponse {
  count: number;
  sales: any[];
}

export interface TransformedSalesResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Transform API sale item to Order
export const transformToOrder = (apiSale: any): iOrder => {
  return {
    id: apiSale.order?.id || Math.floor(Math.random() * 10000),
    saleId: apiSale.id,
    status: apiSale.order?.status || OrderStatus.NEW_ORDER,
    customer: {
      id: apiSale.customer?.id || '',
      idNum: 0,
      name: apiSale.customer?.name || 'Unknown Customer',
      email: apiSale.customer?.email || '',
      companyName: apiSale.customer?.companyName || '',
      phoneNumber: apiSale.customer?.phoneNumber || '',
    },
    createdAt: apiSale.createdAt,
    inHandDate: apiSale.inHandDate,
    paidAt: apiSale.paidAt,
    customerEstimates: apiSale.customerEstimates || {
      items: [],
      itemsSubTotal: 0,
      itemsTotal: 0,
      setupCharge: 0,
      shipping: 0,
      discount: 0,
      subTotal: 0,
      total: 0,
    },
    supplierEstimates: apiSale.supplierEstimates || {
      items: [],
      itemsSubTotal: 0,
      itemsTotal: 0,
      setupCharge: 0,
      shipping: 0,
      subTotal: 0,
      total: 0,
    },
    profit: parseFloat(apiSale.profit || 0),
    lineItems: [],
    isPaid: apiSale.order?.status === OrderStatus.COMPLETED,
    paymentMethod: apiSale.order?.paymentMethod,
    notes: apiSale.notes,
    comments: [],
    purchaseOrders: [],
    shippingAddress: apiSale.shippingAddress,
    billingAddress: apiSale.billingAddress,
    checkoutDetails: apiSale.checkoutDetails,
    shippingDetails: apiSale.shippingDetails,
  };
};

// Transform API sale item to Quote
export const transformToQuote = (apiSale: any): iQuote => {
  return {
    id: apiSale.quote?.id || Math.floor(Math.random() * 10000),
    saleId: apiSale.id,
    status: apiSale.quote?.status || QuoteStatus.NEW_QUOTE,
    customer: {
      id: apiSale.customer?.id || '',
      name: apiSale.customer?.name || 'Unknown Customer',
      email: apiSale.customer?.email || '',
      companyName: apiSale.customer?.companyName || '',
      phoneNumber: apiSale.customer?.phoneNumber || '',
    },
    createdAt: apiSale.createdAt,
    inHandDate: apiSale.inHandDate,
    customerEstimates: apiSale.customerEstimates || {
      items: [],
      itemsSubTotal: 0,
      itemsTotal: 0,
      setupCharge: 0,
      shipping: 0,
      discount: 0,
      subTotal: 0,
      total: 0,
    },
    supplierEstimates: apiSale.supplierEstimates || {
      items: [],
      itemsSubTotal: 0,
      itemsTotal: 0,
      setupCharge: 0,
      shipping: 0,
      subTotal: 0,
      total: 0,
    },
    profit: parseFloat(apiSale.profit || 0),
    lineItems: [],
    notes: apiSale.notes,
    comments: [],
    followups: [],
    shippingAddress: apiSale.shippingAddress,
    billingAddress: apiSale.billingAddress,
    checkoutDetails: apiSale.checkoutDetails,
    shippingDetails: apiSale.shippingDetails,
  };
};

export class SalesService {
  /**
   * Fetch orders from the sales list API
   */
  static async getOrders(params: {
    pageSize: number;
    pageIndex: number; // 0-based index for API
    search?: string;
    orderStatus?: OrderStatus[];
    website?: WebsiteType;
  }): Promise<TransformedSalesResponse<iOrder>> {
    const request: SalesListRequest = {
      isQuote: false,
      pageSize: params.pageSize,
      pageIndex: params.pageIndex,
      website: params.website || WebsiteType.PROMOTIONAL_PRODUCT_INC,
      ...(params.search && { search: params.search }),
      ...(params.orderStatus && { orderStatus: params.orderStatus }),
    };

    console.log('SalesService.getOrders request:', request);

    try {
      const response: SalesListResponse = await api.post('/Admin/SaleList/GetSalesList', request);
      
      console.log('SalesService.getOrders response:', response);

      if (!response || !Array.isArray(response.sales)) {
        throw new Error('Invalid response format from sales API');
      }

      // Filter and transform sales that are orders
      const orders = response.sales
        .filter(sale => sale.order || (!sale.quote && !sale.order)) // Include items with order data or ambiguous items
        .map(transformToOrder);

      const totalCount = response.count || 0;
      const totalPages = Math.ceil(totalCount / params.pageSize);
      const currentPage = params.pageIndex + 1; // Convert back to 1-based

      return {
        data: orders,
        totalCount,
        currentPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      };
    } catch (error) {
      console.error('SalesService.getOrders error:', error);
      throw error;
    }
  }

  /**
   * Fetch quotes from the sales list API
   */
  static async getQuotes(params: {
    pageSize: number;
    pageIndex: number; // 0-based index for API
    search?: string;
    quoteStatus?: QuoteStatus[];
    website?: WebsiteType;
  }): Promise<TransformedSalesResponse<iQuote>> {
    const request: SalesListRequest = {
      isQuote: true,
      pageSize: params.pageSize,
      pageIndex: params.pageIndex,
      website: params.website || WebsiteType.PROMOTIONAL_PRODUCT_INC,
      ...(params.search && { search: params.search }),
      ...(params.quoteStatus && { quoteStatus: params.quoteStatus }),
    };

    console.log('SalesService.getQuotes request:', request);

    try {
      const response: SalesListResponse = await api.post('/Admin/SaleList/GetSalesList', request);
      
      console.log('SalesService.getQuotes response:', response);

      if (!response || !Array.isArray(response.sales)) {
        throw new Error('Invalid response format from sales API');
      }

      // Filter and transform sales that are quotes
      const quotes = response.sales
        .filter(sale => sale.quote || (!sale.order && !sale.quote)) // Include items with quote data or ambiguous items
        .map(transformToQuote);

      const totalCount = response.count || 0;
      const totalPages = Math.ceil(totalCount / params.pageSize);
      const currentPage = params.pageIndex + 1; // Convert back to 1-based

      return {
        data: quotes,
        totalCount,
        currentPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      };
    } catch (error) {
      console.error('SalesService.getQuotes error:', error);
      throw error;
    }
  }

  /**
   * Create a new order
   */
  static async createOrder(customerId: string): Promise<any> {
    return api.post('/Admin/SaleEditor/AddEmptyOrder', { customerId });
  }

  /**
   * Create a new quote
   */
  static async createQuote(customerId: string): Promise<any> {
    return api.post('/Admin/SaleEditor/AddEmptyQuote', { customerId });
  }

  /**
   * Update order details
   */
  static async updateOrder(orderId: number, data: any): Promise<any> {
    return api.post('/Admin/SaleEditor/SetOrderDetail', { id: orderId, ...data });
  }

  /**
   * Update quote details
   */
  static async updateQuote(quoteId: number, data: any): Promise<any> {
    return api.post('/Admin/SaleEditor/SetQuoteDetail', { id: quoteId, ...data });
  }

  /**
   * Get detailed information for a specific sale
   */
  static async getSaleDetail(saleId: string, isQuote: boolean): Promise<any> {
    const endpoint = isQuote 
      ? `/Admin/SaleEditor/GetQuoteDetail?id=${saleId}`
      : `/Admin/SaleEditor/GetOrderDetail?Id=${saleId}`;
    
    return api.get(endpoint);
  }

  /**
   * Add a comment to a sale
   */
  static async addSaleComment(saleId: string, comment: string, attachments?: string[]): Promise<any> {
    return api.post('/Admin/SaleEditor/AddSaleComment', {
      saleId,
      comment,
      attachments: attachments || []
    });
  }

  /**
   * Get comments for a sale
   */
  static async getSaleComments(saleId: string): Promise<any> {
    return api.get(`/Admin/SaleEditor/GetSaleComments?SaleId=${saleId}`);
  }
}

// Export updated services for existing code compatibility
export const OrderService = {
  async getOrders(params: {
    isQuote: boolean;
    search?: string;
    pageSize: number;
    pageIndex: number;
    orderStatus?: OrderStatus[];
    website: WebsiteType;
  }) {
    const result = await SalesService.getOrders({
      pageSize: params.pageSize,
      pageIndex: params.pageIndex,
      search: params.search,
      orderStatus: params.orderStatus,
      website: params.website,
    });
    
    return {
      data: result.data,
      totalCount: result.totalCount,
    };
  },

  async createOrder(customerId: string) {
    return SalesService.createOrder(customerId);
  },

  async updateOrder(orderId: number, data: any) {
    return SalesService.updateOrder(orderId, data);
  }
};

export const QuoteService = {
  async getQuotes(params: {
    isQuote: boolean;
    search?: string;
    pageSize: number;
    pageIndex: number;
    quoteStatus?: QuoteStatus[];
    website: WebsiteType;
  }) {
    const result = await SalesService.getQuotes({
      pageSize: params.pageSize,
      pageIndex: params.pageIndex,
      search: params.search,
      quoteStatus: params.quoteStatus,
      website: params.website,
    });
    
    return {
      data: result.data,
      totalCount: result.totalCount,
    };
  },

  async createQuote(customerId: string) {
    return SalesService.createQuote(customerId);
  },

  async updateQuote(quoteId: number, data: any) {
    return SalesService.updateQuote(quoteId, data);
  }
};