// Enums for Quotes and Orders API
// These enums must be used strictly in all API calls and type definitions

export enum OrderStatus {
  NEW_ORDER = 'new_order',
  IN_PROCESS = 'in_process',
  WAITING_FOR_CUSTOMER_APPROVAL = 'waiting_for_customer_approval',
  IN_PRODUCTION = 'in_production',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  HOLD = 'hold',
  IS_QUOTE = 'is_quote',
  QUOTE_CONVERTED_TO_ORDER = 'quote_converted_to_order',
  SENT_ORDER_ACKNOWLEDGE_TO_THE_CUSTOMER = 'sent_order_acknowledge_to_the_customer',
  SENT_ORDER_TO_SUPPLIER = 'sent_order_to_supplier',
  WAITING_FOR_CUSTOMER_VISUAL_PROOF_APPROVAL = 'waiting_for_customer_visual_proof_approval',
  VISUAL_PROOF_IN_PROCESS = 'visual_proof_in_process',
  VISUAL_PROOF_APPROVED_BY_CUSTOMER = 'visual_proof_approved_by_customer',
  REORDER = 'reorder'
}

export enum QuoteStatus {
  IS_ORDER = 'is_order',
  NEW_QUOTE = 'new_quote',
  WAITING_FOR_SUPPLIER = 'waiting_for_supplier',
  QUOTE_SENT_TO_CUSTOMER = 'quote_sent_to_customer',
  ON_HOLD = 'on_hold',
  QUOTE_CONVERTED_TO_ORDER = 'quote_converted_to_order',
  CANCELLED = 'cancelled',
  CONVERTED_TO_ORDER_BY_CUSTOMER = 'converted_to_order_by_customer'
}

export enum WebsiteType {
  PROMOTIONAL_PRODUCT_INC = 'promotional_product_inc'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  CHEQUE = 'cheque',
  COMPANY_PAYMENT_ORDER = 'company_payment_order'
}

// Type-safe arrays for validation
export const ORDER_STATUS_VALUES = Object.values(OrderStatus);
export const QUOTE_STATUS_VALUES = Object.values(QuoteStatus);
export const WEBSITE_TYPE_VALUES = Object.values(WebsiteType);
export const PAYMENT_METHOD_VALUES = Object.values(PaymentMethod);

// Type guards for runtime validation
export const isValidOrderStatus = (status: string): status is OrderStatus => {
  return ORDER_STATUS_VALUES.includes(status as OrderStatus);
};

export const isValidQuoteStatus = (status: string): status is QuoteStatus => {
  return QUOTE_STATUS_VALUES.includes(status as QuoteStatus);
};

export const isValidWebsiteType = (website: string): website is WebsiteType => {
  return WEBSITE_TYPE_VALUES.includes(website as WebsiteType);
};

export const isValidPaymentMethod = (method: string): method is PaymentMethod => {
  return PAYMENT_METHOD_VALUES.includes(method as PaymentMethod);
}; 