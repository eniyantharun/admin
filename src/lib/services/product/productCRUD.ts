/**
 * Product CRUD Service
 * Core product create, read, update, delete operations
 */

import api from '@/lib/api';
import type {
  CreateProductRequest,
  CreateProductResponse,
  UpdateProductRequest,
  DeleteProductRequest,
  DuplicateProductRequest,
  DuplicateProductResponse,
  SetProductVisibilityRequest,
  CombineProductsRequest,
} from '@/types/api/product';

/**
 * Product CRUD Service
 * Handles core product management operations
 */
export class ProductCRUDService {
  /**
   * Create a new blank product
   * POST /Admin/ProductEditor/AddEmptyProduct
   */
  static async createProduct(data: CreateProductRequest): Promise<CreateProductResponse> {
    const response = await api.post<CreateProductResponse>(
      '/Admin/ProductEditor/AddEmptyProduct',
      data
    );

    // Invalidate product list cache
    api.clearCacheByPattern('/Admin/ProductList');

    return response;
  }

  /**
   * Get product detail
   * GET /Admin/ProductEditor/GetProductDetail
   */
  static async getProductDetail(productId: number | string): Promise<any> {
    return api.get(`/Admin/ProductEditor/GetProductDetail`, {
      params: { Id: productId },
    });
  }

  /**
   * Update product details
   * POST /Admin/ProductEditor/SetProductDetail
   */
  static async updateProduct(productId: number, data: Partial<UpdateProductRequest>): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/SetProductDetail', {
      id: productId,
      ...data,
    });

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);
    api.clearCacheByPattern('/Admin/ProductList');

    return response;
  }

  /**
   * Soft delete a product
   * POST /Admin/ProductEditor/SoftRemoveProduct
   */
  static async deleteProduct(productId: number): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/SoftRemoveProduct', {
      productId,
    });

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);
    api.clearCacheByPattern('/Admin/ProductList');

    return response;
  }

  /**
   * Duplicate a product
   * POST /Admin/ProductEditor/DuplicateProduct
   */
  static async duplicateProduct(data: DuplicateProductRequest): Promise<DuplicateProductResponse> {
    const response = await api.post<DuplicateProductResponse>(
      '/Admin/ProductEditor/DuplicateProduct',
      data
    );

    // Invalidate product list cache
    api.clearCacheByPattern('/Admin/ProductList');

    return response;
  }

  /**
   * Set product visibility (Enable/Disable)
   * POST /Admin/ProductEditor/SetProductVisibility
   */
  static async setProductVisibility(data: SetProductVisibilityRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/SetProductVisibility', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);
    api.clearCacheByPattern('/Admin/ProductList');

    return response;
  }

  /**
   * Combine multiple products into one
   * POST /Admin/ProductEditor/CombineProducts
   */
  static async combineProducts(data: CombineProductsRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/CombineProducts', data);

    // Invalidate caches
    api.clearCacheByPattern('/Admin/ProductEditor/GetProductDetail');
    api.clearCacheByPattern('/Admin/ProductList');

    return response;
  }

  /**
   * Get supplier product ID
   * GET /Admin/ProductEditor/GetSupplierProductId
   */
  static async getSupplierProductId(productId: number): Promise<string> {
    return api.get('/Admin/ProductEditor/GetSupplierProductId', {
      params: { productId },
    });
  }

  /**
   * Batch update products
   * Helper method for bulk operations
   */
  static async batchUpdateProducts(
    productIds: number[],
    updates: Partial<UpdateProductRequest>
  ): Promise<any[]> {
    const promises = productIds.map((id) => this.updateProduct(id, updates));
    return Promise.all(promises);
  }

  /**
   * Batch delete products
   * Helper method for bulk operations
   */
  static async batchDeleteProducts(productIds: number[]): Promise<any[]> {
    const promises = productIds.map((id) => this.deleteProduct(id));
    return Promise.all(promises);
  }

  /**
   * Batch toggle visibility
   * Helper method for bulk operations
   */
  static async batchToggleVisibility(
    productIds: number[],
    visibility: 'Enabled' | 'Disabled'
  ): Promise<any[]> {
    const promises = productIds.map((id) =>
      this.setProductVisibility({ productId: id, visibility })
    );
    return Promise.all(promises);
  }
}
