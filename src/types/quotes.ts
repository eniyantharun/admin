export interface iQuote {
  id: number;
  quoteNumber: string;
  customer: string;
  customerEmail: string;
  status: 'new-quote' | 'quote-sent-to-customer' | 'quote-converted-to-order';
  dateTime: string;
  inHandDate: string | null;
  customerTotal: number;
  notes?: string;
  billingAddress?: iQuoteAddress;
  shippingAddress?: iQuoteAddress;
  checkoutDetails?: iQuoteCheckoutDetails;
  shippingDetails?: iQuoteShippingDetails;
}

export interface iQuoteAddress {
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

export interface iQuoteCheckoutDetails {
  inHandDate?: string;
  additionalInstructions?: string;
  paymentMethod?: string;
  paymentDate?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
}

export interface iQuoteShippingDetails {
  type?: 'Ground' | 'Express' | 'Overnight';
  company?: 'UPS' | 'FedEx' | 'USPS' | 'DHL';
  cost?: number;
  date?: string;
  trackingNumber?: string;
}

export interface iQuoteFormData {
  customer: string;
  customerEmail: string;
  status: string;
  customerTotal: string;
  inHandDate: string;
  notes: string;
  billingAddress: iQuoteAddress;
  shippingAddress: iQuoteAddress;
  sameAsShipping: boolean;
  checkoutDetails?: iQuoteCheckoutDetails;
  shippingDetails?: iQuoteShippingDetails;
}

export interface iQuoteFormProps {
  quote?: iQuote | null;
  isEditing: boolean;
  onSubmit: (data: iQuoteFormData) => Promise<void>;
  loading?: boolean;
}

export interface iQuoteItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: string;
}

export interface iQuoteListResponse {
  quotes: iQuote[];
  count: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface iCreateQuoteRequest {
  customerId: string;
  status: string;
  customerTotal: number;
  inHandDate?: string;
  notes?: string;
  billingAddress: iQuoteAddress;
  shippingAddress: iQuoteAddress;
  items: iQuoteItem[];
  checkoutDetails?: iQuoteCheckoutDetails;
  shippingDetails?: iQuoteShippingDetails;
}

export interface iUpdateQuoteRequest extends Partial<iCreateQuoteRequest> {
  id: number;
}

export interface iQuoteStatusUpdate {
  id: number;
  status: iQuote['status'];
  updatedBy: string;
  updatedAt: string;
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

export interface iApiQuote extends iApiSale {
  quote: {
    id: number;
    status: string;
  };
}

export interface iQuote {
  id: number;
  quoteNumber: string;
  customer: string;
  customerEmail: string;
  status: 'new-quote' | 'quote-sent-to-customer' | 'quote-converted-to-order';
  dateTime: string;
  inHandDate: string | null;
  customerTotal: number;
  notes?: string;
  billingAddress?: iQuoteAddress;
  shippingAddress?: iQuoteAddress;
  checkoutDetails?: iQuoteCheckoutDetails;
  shippingDetails?: iQuoteShippingDetails;
}