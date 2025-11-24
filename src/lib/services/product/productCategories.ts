/**
 * Product Categories Service
 * Category assignment and management
 */

import api from '@/lib/api';
import type {
  AddProductCategorizationRequest,
  RemoveProductCategorizationRequest,
  AddCategoryBulkRequest,
  RemoveCategoryBulkRequest,
} from '@/types/api/product';

/**
 * Product Categories Service
 * Handles product categorization operations
 */
export class ProductCategoriesService {
  /**
   * Add product categorization (assign category to product)
   * POST /Admin/ProductEditor/AddProductCategorization
   */
  static async addProductCategorization(data: AddProductCategorizationRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/AddProductCategorization', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);
    api.clearCacheByPattern('/Admin/ProductList');

    return response;
  }

  /**
   * Remove product categorization (remove category from product)
   * POST /Admin/ProductEditor/RemoveProductCategorization
   */
  static async removeProductCategorization(data: RemoveProductCategorizationRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/RemoveProductCategorization', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);
    api.clearCacheByPattern('/Admin/ProductList');

    return response;
  }

  /**
   * Add category to multiple products (bulk)
   * POST /Admin/Product/AddCategory
   * Legacy endpoint for bulk operations
   */
  static async addCategoryBulk(data: AddCategoryBulkRequest): Promise<any> {
    const response = await api.post('/Admin/Product/AddCategory', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);
    api.clearCacheByPattern('/Admin/ProductList');

    return response;
  }

  /**
   * Remove category from multiple products (bulk)
   * POST /Admin/Product/RemoveCategory
   * Legacy endpoint for bulk operations
   */
  static async removeCategoryBulk(data: RemoveCategoryBulkRequest): Promise<any> {
    const response = await api.post('/Admin/Product/RemoveCategory', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);
    api.clearCacheByPattern('/Admin/ProductList');

    return response;
  }

  /**
   * Assign multiple categories to a product
   * Helper method for batch categorization
   */
  static async assignCategories(productId: number, categoryIds: number[]): Promise<any[]> {
    const promises = categoryIds.map((categoryId) =>
      this.addProductCategorization({ productId, categoryId })
    );
    return Promise.all(promises);
  }

  /**
   * Remove multiple categories from a product
   * Helper method for batch uncategorization
   */
  static async removeCategories(productId: number, categoryIds: number[]): Promise<any[]> {
    const promises = categoryIds.map((categoryId) =>
      this.removeProductCategorization({ productId, categoryId })
    );
    return Promise.all(promises);
  }
}
