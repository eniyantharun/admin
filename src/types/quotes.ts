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