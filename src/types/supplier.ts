interface IApiAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isVerified?: boolean;
}

interface IApiSupplier {
  id: number;
  companyName: string;
  contactFirstName: string | null;
  contactLastName: string | null;
  email: string | null;
  phone: string | null;
  website: string;
  isActive: boolean;
  categories: any[] | null;
  totalOrders: number;
  lastOrderId: number | null;
  createdAt: string;
  rating: string;
  address: IApiAddress;
}

interface IApiResponse {
  success: boolean;
  data: {
    suppliers: IApiSupplier[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

interface ISupplier {
  id: number;
  companyName: string;
  webUrl: string;
  emailAddress: string | null;
  telephoneNumber: string | null;
  exclusive: boolean;
  updatedAt: string;
  importedAt: string | null;
  productCount: number;
  importStatus: {
    [key: string]: number;
  };
  visibilityStats: {
    [key: string]: number;
  };
  website: string;
  contactFirstName: string | null;
  contactLastName: string | null;
  totalOrders: number;
  lastOrderId: number | null;
  rating: string;
  isActive: boolean;
  address?: IApiAddress;
}

interface ISupplierFormData {
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  website: string;
  isActive: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}
interface IAddress {
  id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isVerified?: boolean;
}

interface IFSupplier {
  id: number;
  companyName: string;
  contactFirstName: string | null;
  contactLastName: string | null;
  email: string | null;
  phone: string | null;
  website: string;
  isActive: boolean;
  rating?: string;
  address?: IAddress; // Ensure address is optional in Supplier for form initialization
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  webUrl?: string;
  emailAddress?: string | null;
  telephoneNumber?: string | null;
  enabled?: boolean;
  exclusive?: boolean;
  productCount?: number;
  importStatus?: {
    [key: string]: number;
  };
  visibilityStats?: {
    [key: string]: number;
  };
  importedAt?: string | null;
  totalOrders?: number;
  lastOrderDate?: number | null;
}

interface ISupplierFormData {
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  website: string;
  isActive: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}