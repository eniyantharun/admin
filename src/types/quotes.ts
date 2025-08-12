import { QuoteStatus, WebsiteType, OrderStatus } from './enums';

export interface iQuote {
  id: number;
  saleId: string;
  status: QuoteStatus;
  customer: {
    id: string;
    name: string;
    email: string;
    companyName?: string;
    phoneNumber?: string;
  };
  createdAt: string;
  inHandDate?: string;
  customerEstimates: {
    items: iQuoteLineItem[];
    itemsSubTotal: number;
    itemsTotal: number;
    setupCharge: number;
    shipping: number;
    discount: number;
    subTotal: number;
    total: number;
  };
  supplierEstimates: {
    items: iQuoteLineItem[];
    itemsSubTotal: number;
    itemsTotal: number;
    setupCharge: number;
    shipping: number;
    subTotal: number;
    total: number;
  };
  profit: number;
  lineItems: iQuoteLineItem[];
  shippingAddress?: iQuoteAddress;
  billingAddress?: iQuoteAddress;
  checkoutDetails?: iQuoteCheckoutDetails;
  shippingDetails?: iQuoteShippingDetails;
  notes?: string;
  comments?: iQuoteComment[];
  followups?: iQuoteFollowup[];
}

export interface iQuoteLineItem {
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

export interface iQuoteAddress {
  name: string;
  addressLine: string;
  addressLine2?: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
}

export interface iQuoteCheckoutDetails {
  dateOrderNeededBy?: string;
  additionalInstructions?: string;
}

export interface iQuoteShippingDetails {
  shippingType?: string;
  shippingCost?: number;
  shippingCompany?: string;
  shippingDate?: string;
  shippingTrackingNumber?: string;
}

export interface iQuoteComment {
  id: string;
  createdAt: string;
  comment: string;
  assets?: iAsset[];
}

export interface iQuoteFollowup {
  sendAt: string;
  sentAt?: string;
}

export interface iQuoteFormData {
  customerId: string;
  status: QuoteStatus;
  inHandDate?: string;
  notes?: string;
  shippingAddress?: iQuoteAddress;
  billingAddress?: iQuoteAddress;
  checkoutDetails?: iQuoteCheckoutDetails;
  shippingDetails?: iQuoteShippingDetails;
}

export interface iQuoteFormProps {
  quote?: iQuote | null;
  isEditing: boolean;
  onSubmit: (data: iQuoteFormData) => Promise<void>;
  loading?: boolean;
}

export interface iQuoteListResponse {
  count: number;
  sales: iQuote[];
}

export interface iCreateQuoteRequest {
  customerId: string;
}

export interface iUpdateQuoteRequest {
  id: number;
  status?: QuoteStatus;
}

export interface iQuoteStatusUpdate {
  id: number;
  status: QuoteStatus;
  updatedBy: string;
  updatedAt: string;
}

export interface iQuoteSearchParams {
  isQuote: boolean;
  search?: string;
  pageSize: number;
  pageIndex: number;
  orderStatus?: OrderStatus[];
  quoteStatus?: QuoteStatus[];
  website: WebsiteType;
}