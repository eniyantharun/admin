export enum OrderStatus {
  NEW_ORDER = 'NewOrder',
  IN_PROCESS = 'InProgress',
  WAITING_FOR_CUSTOMER_APPROVAL = 'WaitingForApproval',
  IN_PRODUCTION = 'OrderInProduction',
  SHIPPED = 'Shipped',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  HOLD = 'OnHold',
  IS_QUOTE = 'IsQuote',
  QUOTE_CONVERTED_TO_ORDER = 'QuoteConvertedToOrder',
  SENT_ORDER_ACKNOWLEDGE_TO_THE_CUSTOMER = 'SentOrderAcknowledgeToTheCustomer',
  SENT_ORDER_TO_SUPPLIER = 'SentOrderToSupplier',
  WAITING_FOR_CUSTOMER_VISUAL_PROOF_APPROVAL = 'WaitingForCustomerVisualProofApproval',
  VISUAL_PROOF_IN_PROCESS = 'VisualProofInProcess',
  VISUAL_PROOF_APPROVED_BY_CUSTOMER = 'VisualProofApprovedByCustomer',
  REORDER = 'ReOrder'
}

export enum QuoteStatus {
  NEW_QUOTE = 'NewQuote',
  WAITING_FOR_SUPPLIER = 'WaitingForSupplier',
  QUOTE_SENT_TO_CUSTOMER = 'QuoteSentToCustomer',
  ON_HOLD = 'OnHold',
  QUOTE_CONVERTED_TO_ORDER = 'QuoteConvertedToOrder',
  CANCELLED = 'Cancelled',
  CONVERTED_TO_ORDER_BY_CUSTOMER = 'ConvertedToOrderByCustomer'
}

export enum WebsiteType {
  PROMOTIONAL_PRODUCT_INC = 'promotional_product_inc'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  CHEQUE = 'cheque',
  COMPANY_PAYMENT_ORDER = 'company_payment_order'
}

export const ORDER_STATUS_VALUES = Object.values(OrderStatus);
export const QUOTE_STATUS_VALUES = Object.values(QuoteStatus);
export const WEBSITE_TYPE_VALUES = Object.values(WebsiteType);
export const PAYMENT_METHOD_VALUES = Object.values(PaymentMethod);

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