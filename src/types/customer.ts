export interface ApiCustomer {
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

export interface Customer {
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

export interface CustomerAddress {
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

export interface CustomerOrder {
  id: number | null;
  orderNumber?: string;
  status: string | null;
  total: number;
  orderDate: string;
}

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  website: string;
  companyName: string;
  isBusinessCustomer: boolean;
  addresses: CustomerAddressFormData[];
}

export interface CustomerAddressFormData {
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

export interface CustomerListResponse {
  customers: ApiCustomer[];
  count: number;
}

export interface CustomerDetailResponse {
  customer: Customer & {
    stats: {
      totalOrders: number;
      totalSpent: number;
      averageOrderValue: number;
    };
    recentOrders: CustomerOrder[];
    isBlocked: boolean; 
  };
  addresses: CustomerAddress[];
}

export interface CustomerOrdersResponse {
  orders: CustomerOrder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GoogleMapsAddress {
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

export interface GoogleMapsResponse {
  results: GoogleMapsAddress[];
  status: string;
}

export interface UpdateCustomerRequest {
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

export interface ToggleCustomerStatusRequest {
  id: string;
  isBlocked: boolean;
}

export interface ToggleCustomerStatusResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    isBlocked: boolean;
    updatedAt: string;
  };
}