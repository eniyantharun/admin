import { iCustomerAddressFormData } from './customer';

export interface iOrder {
  id: number;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  status: 'new' | 'in-production' | 'shipped' | 'delivered' | 'cancelled';
  dateTime: string;
  inHandDate: string | null;
  customerTotal: number;
  supplierTotal: number;
  profit: number;
  paymentMethod: string;
  itemCount?: number;
  notes?: string;
  billingAddress?: iOrderAddress;
  shippingAddress?: iOrderAddress;
  items?: iOrderItem[];
  checkoutDetails?: iOrderCheckoutDetails;
  shippingDetails?: iOrderShippingDetails;
}

export interface iOrderAddress {
  type: 'billing' | 'shipping';
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
}

export interface iOrderItem {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierPrice: number;
  customization?: string;
  sku?: string;
  description?: string;
}

export interface iOrderCheckoutDetails {
  inHandDate?: string;
  additionalInstructions?: string;
  paymentMethod?: string;
  paymentDate?: string;
  paymentStatus?: 'Paid' | 'Pending' | 'Failed';
}

export interface iOrderShippingDetails {
  type?: 'Ground' | 'Express' | 'Overnight';
  company?: 'UPS' | 'FedEx' | 'USPS' | 'DHL';
  cost?: number;
  date?: string;
  trackingNumber?: string;
}

export interface iOrderFormData {
  customer: string;
  customerEmail: string;
  status: string;
  paymentMethod: string;
  customerTotal: string;
  supplierTotal: string;
  inHandDate: string;
  notes: string;
  billingAddress: iCustomerAddressFormData;
  shippingAddress: iCustomerAddressFormData;
  sameAsShipping: boolean;
  items: iOrderItem[];
  checkoutDetails?: iOrderCheckoutDetails;
  shippingDetails?: iOrderShippingDetails;
}

export interface iOrderFormProps {
  order?: iOrder | null;
  isEditing: boolean;
  onSubmit: (data: iOrderFormData) => Promise<void>;
  loading?: boolean;
}

export interface iOrderListResponse {
  orders: iOrder[];
  count: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface iCreateOrderRequest {
  customerId: string;
  status: string;
  paymentMethod: string;
  customerTotal: number;
  supplierTotal: number;
  inHandDate?: string;
  notes?: string;
  billingAddress: iOrderAddress;
  shippingAddress: iOrderAddress;
  items: iOrderItem[];
  checkoutDetails?: iOrderCheckoutDetails;
  shippingDetails?: iOrderShippingDetails;
}

export interface iUpdateOrderRequest extends Partial<iCreateOrderRequest> {
  id: number;
}

export interface iOrderStatusUpdate {
  id: number;
  status: iOrder['status'];
  updatedBy: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface iApiSale {
  id: string;
  customer: {
    name: string;
    website: string;
  };
  createdAt: string;
  inHandDate: string | null;
  customerEstimates: {
    items: any[];
    itemsSubTotal: number | string;
    itemsTotal: number | string;
    setupCharge: number | string;
    shipping: number | string;
    discount: number | string;
    subTotal: number | string;
    total: number | string;
  };
  supplierEstimates: {
    items: any[];
    itemsSubTotal: number | string;
    itemsTotal: number | string;
    setupCharge: number | string;
    shipping: number | string;
    subTotal: number | string;
    total: number | string;
  };
  profit: number | string;
  order: {
    id: number;
    status: string;
    paymentMethod: string;
  } | null;
  quote: {
    id: number;
    status: string;
  } | null;
  isAdConversion: boolean;
}

export interface iApiSalesResponse {
  count: number;
  sales: iApiSale[];
}

export interface iApiSalesRequest {
  isQuote: boolean;
  search: string;
  pageSize: number;
  pageIndex: number;
  website: string;
  orderStatus?: string[];
  quoteStatus?: string[];
}

export interface iOrder {
  id: number;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  status: 'new' | 'in-production' | 'shipped' | 'delivered' | 'cancelled';
  dateTime: string;
  inHandDate: string | null;
  customerTotal: number;
  supplierTotal: number;
  profit: number;
  paymentMethod: string;
  itemCount?: number;
  notes?: string;
  billingAddress?: iOrderAddress;
  shippingAddress?: iOrderAddress;
  items?: iOrderItem[];
  checkoutDetails?: iOrderCheckoutDetails;
  shippingDetails?: iOrderShippingDetails;
}