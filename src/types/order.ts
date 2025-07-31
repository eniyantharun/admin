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

export interface iOrderPaymentDetails {
  orderId: number;
  paymentMethod: string;
  transactionId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  paymentDate?: string;
}

export interface iOrderShippingDetails {
  orderId: number;
  carrier: string;
  trackingNumber: string;
  shippedDate: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  shippingCost?: number;
}