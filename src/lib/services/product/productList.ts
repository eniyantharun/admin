/**
 * Product List & Search Service
 * Product listing, searching, and filtering operations
 */

import api from '@/lib/api';
import type {
  GetProductsListRequest,
  GetProductsListResponse,
  GetSupplierProductsListRequest,
  GetProductsBySlugRequest,
  ImportProductByUrlRequest,
  ImportProductByUrlResponse,
} from '@/types/api/product';

/**
 * Product List Service
 * Handles product listing and search operations
 */
export class ProductListService {
  /**
   * Get products list with pagination and filters (GET)
   * GET /Admin/ProductList/GetProductsList
   */
  static async getProductsList(params: GetProductsListRequest): Promise<GetProductsListResponse> {
    const queryParams: any = {
      PageSize: params.pageSize || 20,
      Offset: params.offset || 0,
    };

    if (params.search) queryParams.search = params.search;
    if (params.visibility) queryParams.visibility = params.visibility;
    if (params.exclusive !== undefined) queryParams.exclusive = params.exclusive;
    if (params.supplierId) queryParams.supplierId = params.supplierId;
    if (params.categoryId) queryParams.categoryId = params.categoryId;
    if (params.brandId) queryParams.brandId = params.brandId;

    return api.get<GetProductsListResponse>('/Admin/ProductList/GetProductsList', {
      params: queryParams,
    });
  }

  /**
   * Get products list with advanced filtering (POST)
   * POST /Admin/ProductList/GetProductsListPost
   */
  static async getProductsListPost(params: GetProductsListRequest): Promise<GetProductsListResponse> {
    return api.post<GetProductsListResponse>('/Admin/ProductList/GetProductsListPost', params);
  }

  /**
   * Get supplier products list
   * GET /Admin/ProductList/GetSupplierProductsList
   */
  static async getSupplierProductsList(
    params: GetSupplierProductsListRequest
  ): Promise<GetProductsListResponse> {
    return api.get<GetProductsListResponse>('/Admin/ProductList/GetSupplierProductsList', {
      params: {
        supplierId: params.supplierId,
        PageSize: params.pageSize || 20,
        Offset: params.offset || 0,
      },
    });
  }

  /**
   * Get products by slug list
   * GET /Admin/ProductEditor/GetProductsBySlugList
   */
  static async getProductsBySlug(slugs: string[]): Promise<any[]> {
    return api.get('/Admin/ProductEditor/GetProductsBySlugList', {
      params: { slugs: slugs.join(',') },
    });
  }

  /**
   * Import product by URL
   * POST /Admin/ProductList/ImportProductByUrl
   */
  static async importProductByUrl(data: ImportProductByUrlRequest): Promise<ImportProductByUrlResponse> {
    const response = await api.post<ImportProductByUrlResponse>(
      '/Admin/ProductList/ImportProductByUrl',
      data
    );

    // Invalidate product list cache
    api.clearCacheByPattern('/Admin/ProductList');

    return response;
  }

  /**
   * Get legacy feature ID
   * GET /Admin/ProductList/GetLegacyFeatureId
   */
  static async getLegacyFeatureId(featureId: number): Promise<number> {
    return api.get('/Admin/ProductList/GetLegacyFeatureId', {
      params: { featureId },
    });
  }
}
