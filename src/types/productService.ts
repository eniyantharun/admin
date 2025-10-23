import { api } from '@/lib/api';

export interface ProductVariant {
  id: number;
  supplierItemNumber: string;
  supplierUrl: string;
}

export interface ProductCategory {
  id: number;
  name: string;
}

export interface ProductFeature {
  id?: number;
  name?: string;
}

export interface ProductSupplier {
  id: number;
  name: string;
  website: string;
}

export interface ProductDecoration {
  id: number;
  name: string;
}

export interface ProductSupplierPageStatus {
  status: string;
  supplierUrl: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  thumbIndex: number;
  categories: ProductCategory[];
  features: ProductFeature[];
  minPrice: number;
  maxPrice: number;
  supplier: ProductSupplier;
  decorations: ProductDecoration[];
  visibility: string;
  merchantCenterEnabled: boolean;
  setupCharge: number;
  minDays: number;
  maxDays: number;
  variants: ProductVariant[];
  pictures: number[];
  exclusive: boolean;
  supplierPageStatus: ProductSupplierPageStatus[];
}

export interface GetProductsListResponse {
  products: Product[];
  count: number;
}

export interface GetProductsListParams {
  pageSize?: number;
  offset?: number;
  search?: string;
  visibility?: string;
  exclusive?: boolean;
}

export class ProductService {
  static async getProductsList(params: GetProductsListParams = {}): Promise<GetProductsListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.pageSize) queryParams.append('PageSize', params.pageSize.toString());
    if (params.offset !== undefined) queryParams.append('Offset', params.offset.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.visibility) queryParams.append('visibility', params.visibility);
    if (params.exclusive !== undefined) queryParams.append('exclusive', params.exclusive.toString());

    const url = `/Admin/ProductList/GetProductsList?${queryParams.toString()}`;
    return api.get<GetProductsListResponse>(url);
  }

  static getProductImageUrl(productId: number, pictureIndex: number): string {
    return `https://static2.promotionalproductinc.com/p2/src/${productId}/${pictureIndex}.webp`;
  }

  static getProductThumbnailUrl(productId: number, thumbIndex: number): string {
    return `https://static2.promotionalproductinc.com/p2/src/${productId}/${thumbIndex}.webp`;
  }
}
