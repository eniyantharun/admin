import { iCustomerAddressFormData } from './customer';
import { QuoteStatus } from '@/lib/enums';

export interface iQuote {
  id: number;
  quoteNumber: string;
  customer: string;
  customerEmail: string;
  status: QuoteStatus;
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

export interface ProductPicture {
  productId: number;
  pictureId: number;
  slug: string;
  index: number;
  defaultKey: string;
  sourceKey: string;
  sourceUri: string;
  fullKey: string;
  thumbnail226X240: string;
  sourceKey800X800: string;
  slugKey800X800: string;
  urlSlugKey800X800: string;
  slugKey400X400: string;
  key100X100: string;
  slugKey100X100: string;
  isDev: boolean;
  path: string;
  url: string;
  itemNumber: number;
}

export interface LineItemData {
  id: string;
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
  customization?: string;
  description?: string;
  images?: string[];
  selectedProduct?: any;
  variantId?: number;
  methodId?: number;
  colorId?: string;
  sourceUri?: string;
  customPicture?: ProductPicture;
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
  checkoutDetails?: {
    dateOrderNeededBy?: string;
    additionalInstructions?: string;
  };
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

export interface SaleSummary {
  customerSummary: {
    itemsTotal: number;
    setupCharge: number;
    subTotal: number;
    total: number;
  };
  totalSupplierSummary: {
    itemsTotal: number;
    setupCharge: number;
    subTotal: number;
    total: number;
  };
  profit: number;
}

export interface QuoteDetailsResponse {
  quote: {
    id: number;
    status: string;
    followups: any[];
    saleId: string;
    sale: {
      saleId: string;
      customer: {
        id: string;
        idNum: number;
        form: {
          companyName: string | null;
          firstName: string;
          lastName: string;
          phoneNumber: string;
          email: string;
        };
        createdAt: string;
        createdBy: string | null;
        website: string;
      };
      dates: {
        convertedFromQuoteId: number | null;
        convertedIntoOrderId: number | null;
        inHandDate: string;
        paidAt: string | null;
        createdAt: string;
        updatedAt: string;
        createdBy: string | null;
        updatedBy: string | null;
      };
      summary: {
        shippingCost: number;
        discount: number;
      };
      shippingDetails: {
        shippingCompany: string;
        shippingType: string;
        shippingCost: number;
        shippingDate: string | null;
        shippingTrackingNumber: string | null;
      };
      checkoutDetails: {
        dateOrderNeededBy: string;
        additionalInstructions: string | null;
      };
      shippingAddress: {
        name: string;
        addressLine: string;
        addressLine2: string;
        country: string;
        state: string;
        city: string;
        zipCode: string;
      };
      billingAddress: {
        name: string;
        addressLine: string;
        addressLine2: string;
        country: string;
        state: string;
        city: string;
        zipCode: string;
      };
      lineItems: Array<{
        id: string;
        form: {
          productName: string;
          variantName: string;
          methodName: string;
          color: string | null;
          quantity: number;
          productItemNumber: string;
          supplierItemNumber: string;
          customerPricePerQuantity: number;
          customerSetupCharge: number;
          supplierPricePerQuantity: number;
          supplierSetupCharge: number;
          artworkText: string | null;
          artworkSpecialInstructions: string | null;
          variantId?: number;
          methodId?: number;
          colorId?: string;
        };
        customThumbnail: string | null;
        customPicture: ProductPicture | null;
        sourceUri?: string;
        product: any;
        supplier: any;
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
        artworkType: string | null;
        artworkImage: string | null;
        supplierPage: any;
      }>;
      notesId?: string | null;
      comments: Array<{
        id: string;
        createdAt: string;
        comment: string;
        assets: any[];
      }>;
    };
  };
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