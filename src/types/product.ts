export interface iProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand: string;
  supplier: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  setupCharge: number;
  minQuantity: number;
  maxQuantity: number;
  productionTime: string;
  enabled: boolean;
  featured: boolean;
  exclusive: boolean;
  images?: string[];
  variants: number;
  colors: number;
  imprintMethods: string[];
  createdAt: string;
  updatedAt: string;
}

export interface iProductFormData {
  name: string;
  slug: string;
  description: string;
  brand: string;
  supplier: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  setupCharge: number;
  minQuantity: number;
  maxQuantity: number;
  productionTime: string;
  enabled: boolean;
  featured: boolean;
  exclusive: boolean;
  images: string[];
  imprintMethods: string[];
}

export interface iProductFormProps {
  product?: iProduct | null;
  isEditing: boolean;
  onSubmit: (data: iProductFormData) => Promise<void>;
  loading?: boolean;
}

export interface iProductListResponse {
  products: iProduct[];
  count: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface iCreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  brand: string;
  supplier: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  setupCharge: number;
  minQuantity: number;
  maxQuantity: number;
  productionTime: string;
  enabled: boolean;
  featured: boolean;
  exclusive: boolean;
  images?: string[];
  imprintMethods: string[];
}

export interface iUpdateProductRequest extends Partial<iCreateProductRequest> {
  id: string;
}

export interface iProductStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  exclusiveProducts: number;
  averagePrice: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  topSuppliers: Array<{
    supplier: string;
    count: number;
  }>;
}

export interface iProductSearchFilters {
  search?: string;
  category?: string;
  brand?: string;
  supplier?: string;
  minPrice?: number;
  maxPrice?: number;
  enabled?: boolean;
  featured?: boolean;
  exclusive?: boolean;
}

export interface iProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  minQuantity: number;
  maxQuantity: number;
  enabled: boolean;
}

export interface iProductColor {
  id: string;
  productId: string;
  name: string;
  hexCode?: string;
  pantoneCode?: string;
  enabled: boolean;
}

export interface iProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface iImprintMethod {
  id: string;
  name: string;
  description?: string;
  setupCharge?: number;
  minQuantity?: number;
  enabled: boolean;
}