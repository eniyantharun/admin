export interface iApiCustomer {
  form: {
    companyName: string | null;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  website: string;
  id: string;
  idNum: number;
  name: string;
  createdAt: string;
}

export interface iCustomerFormProps {
  customer?: iCustomer | null;
  isEditing: boolean;
  onSubmit: (data: iCustomerFormData) => Promise<void>;
  onSendResetPassword?: (email: string) => Promise<void>;
  onSendNewAccount?: (email: string) => Promise<void>;
  onCustomerUpdated?: () => void;
  loading?: boolean;
}
export interface iCustomer {
  id: string;
  idNum: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  website: string;
  companyName: string;
  isBlocked: boolean;
  isBusinessCustomer: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface iCustomerAddress {
  id: string;
  type: 'billing' | 'shipping';
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
  isVerified: boolean;
  createdAt?: string;
}

export interface iCustomerOrder {
  id: number | null;
  orderNumber?: string;
  status: string | null;
  total: number;
  orderDate: string;
}

export interface iCustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  website: string;
  companyName: string;
  isBusinessCustomer: boolean;
  addresses: iCustomerAddressFormData[];
}

export interface iCustomerAddressFormData {
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

export interface iCustomerActionsProps {
  customer: iCustomer;
  onCustomerUpdated: () => void;
}

export interface iAddressFormProps {
  address?: iCustomerAddressFormData;
  onSubmit: (address: iCustomerAddressFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface iCustomerListResponse {
  customers: iApiCustomer[];
  count: number;
}

export interface iCustomerDetailResponse {
  customer: iCustomer & {
    stats: {
      totalOrders: number;
      totalSpent: number;
      averageOrderValue: number;
    };
    recentOrders: iCustomerOrder[];
    isBlocked: boolean; 
  };
  addresses: iCustomerAddress[];
}

export interface iCustomerOrdersResponse {
  orders: iCustomerOrder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface iGoogleMapsAddress {
  formatted_address: string;
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface iGoogleMapsResponse {
  results: iGoogleMapsAddress[];
  status: string;
}

export interface iUpdateCustomerRequest {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  isBusinessCustomer: boolean;
  isBlocked: boolean;
  website: string;
}

export interface iToggleCustomerStatusRequest {
  id: string;
  isBlocked: boolean;
}

export interface iToggleCustomerStatusResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    isBlocked: boolean;
    updatedAt: string;
  };
}