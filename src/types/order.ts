import { iCustomerAddressFormData } from './customer';
import { OrderStatus, PaymentMethod, WebsiteType } from './enums';

export interface iOrder {
  id: number;
  saleId: string;
  status: OrderStatus;
  customer: {
    id: string;
    idNum: number;
    name: string;
    email: string;
    companyName?: string;
    phoneNumber?: string;
  };
  createdAt: string;
  inHandDate?: string;
  paidAt?: string;
  customerEstimates: {
    items: iOrderLineItem[];
    itemsSubTotal: number;
    itemsTotal: number;
    setupCharge: number;
    shipping: number;
    discount: number;
    subTotal: number;
    total: number;
  };
  supplierEstimates: {
    items: iOrderLineItem[];
    itemsSubTotal: number;
    itemsTotal: number;
    setupCharge: number;
    shipping: number;
    subTotal: number;
    total: number;
  };
  profit: number;
  lineItems: iOrderLineItem[];
  shippingAddress?: iOrderAddress;
  billingAddress?: iOrderAddress;
  checkoutDetails?: iOrderCheckoutDetails;
  shippingDetails?: iOrderShippingDetails;
  notes?: string;
  comments?: iOrderComment[];
  purchaseOrders?: iPurchaseOrder[];
  paymentDetails?: {
    paymentDate?: string;
  };
  paymentMethod?: PaymentMethod;
  isPaid: boolean;
  creditCardId?: string;
  chequePhoto?: iAsset;
  companyPaymentOrder?: any;
  cheque?: {
    chequeNumber?: string;
  };
  charges?: iCharge[];
}

export interface iOrderLineItem {
  id: string;
  form: {
    productName: string;
    variantName?: string;
    methodName?: string;
    color?: string;
    quantity: number;
    productItemNumber?: string;
    supplierItemNumber?: string;
    customerPricePerQuantity: number;
    customerSetupCharge: number;
    supplierPricePerQuantity: number;
    supplierSetupCharge: number;
    artworkText?: string;
    artworkSpecialInstructions?: string;
  };
  customThumbnail?: iAsset;
  customPicture?: iProductPicture;
  product?: iProduct;
  supplier?: iSupplier;
  customerEstimates: {
    quantity: number;
    setupCharge: number;
    pricePerQuantity: number;
    subTotal: number;
    total: number;
  };
  supplierEstimates: {
    quantity: number;
    setupCharge: number;
    pricePerQuantity: number;
    subTotal: number;
    total: number;
  };
  profit: number;
  artworkType?: 'artwork' | 'text' | 'artwork_and_text' | 'none';
  artworkImage?: iArtworkImage;
  supplierPage?: iSupplierPage;
}

export interface iAsset {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  sourceKey: string;
  webpKey: string;
}

export interface iProductPicture {
  productId: number;
  pictureId: number;
  slug: string;
  index: number;
  url: string;
  thumbnail226X240: string;
  sourceKey800X800: string;
  slugKey800X800: string;
  urlSlugKey800X800: string;
}

export interface iProduct {
  id: number;
  name: string;
  primaryPicture?: iProductPicture;
  supplierPages?: iSupplierPage[];
}

export interface iSupplier {
  id: number;
  companyName: string;
  webUrl?: string;
  emailAddress?: string;
  telephoneNumber?: string;
  importerKey?: string;
  website: string;
}

export interface iArtworkImage {
  id: string;
  asset: iAsset;
  assetPreview?: iAsset;
}

export interface iSupplierPage {
  url: string;
  sku: string;
}

export interface iOrderAddress {
  name: string;
  addressLine: string;
  addressLine2?: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
}

export interface iOrderCheckoutDetails {
  dateOrderNeededBy?: string;
  additionalInstructions?: string;
}

export interface iOrderShippingDetails {
  shippingType?: string;
  shippingCost?: number;
  shippingCompany?: string;
  shippingDate?: string;
  shippingTrackingNumber?: string;
}

export interface iOrderComment {
  id: string;
  createdAt: string;
  comment: string;
  assets?: iAsset[];
}

export interface iPurchaseOrder {
  id: number;
  form: {
    shippingCost?: number;
  };
  isDefaultShippingCost: boolean;
  notes?: {
    documentId: string;
    lastEditedAt?: string;
  };
  lineItemsCount: number;
  productCount: number;
  customCount: number;
  supplier: iSupplier;
  defaultShippingCost?: number;
}

export interface iCharge {
  id: string;
  responseDocument: {
    id: string;
    paid: boolean;
    amount: number;
    source: {
      id: string;
      brand: string;
      last4: string;
      first6: string;
      exp_year: string;
      exp_month: string;
      cvc_check: string;
    };
    status: string;
    created: number;
    outcome: {
      type: string;
      network_status: string;
    };
    ref_num: string;
    captured: boolean;
    currency: string;
    auth_code: string;
    amount_refunded: number;
    payment_method_details: string;
  };
  amount: number;
  createdAt: string;
  paid: boolean;
  status: string;
  brand: string;
  last4: string;
}

export interface iOrderFormData {
  customerId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  inHandDate?: string;
  notes?: string;
  shippingAddress?: iCustomerAddressFormData;
  billingAddress?: iCustomerAddressFormData;
  sameAsShipping: boolean;
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
  count: number;
  sales: iOrder[];
}

export interface iCreateOrderRequest {
  customerId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  inHandDate?: string;
  notes?: string;
  shippingAddress?: iOrderAddress;
  billingAddress?: iOrderAddress;
  checkoutDetails?: iOrderCheckoutDetails;
  shippingDetails?: iOrderShippingDetails;
}

export interface iUpdateOrderRequest {
  id: number;
  paymentDetails?: {
    paymentDate?: string;
  };
  paymentMethod?: PaymentMethod;
  isPaid?: boolean;
  status?: OrderStatus;
  creditCardId?: string;
  chequePhotoId?: string;
  companyPaymentOrderId?: string;
  cheque?: {
    chequeNumber?: string;
  };
}

export interface iOrderStatusUpdate {
  id: number;
  status: OrderStatus;
  updatedBy: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface iOrderSearchParams {
  isQuote: boolean;
  search?: string;
  pageSize: number;
  pageIndex: number;
  orderStatus?: OrderStatus[];
  quoteStatus?: string[];
  website: WebsiteType;
}