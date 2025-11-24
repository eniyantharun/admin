/**
 * Product Variants Service
 * Variant management operations
 */

import api from '@/lib/api';
import type {
  ProductVariant,
  CreateVariantRequest,
  UpdateVariantRequest,
  DeleteVariantRequest,
  ReorderVariantsRequest,
  VariantDetailsResponse,
} from '@/types/api/product';

/**
 * Product Variants Service
 * Handles product variant CRUD operations
 */
export class ProductVariantsService {
  /**
   * Get variants list for a product
   * GET /Admin/ProductEditor/GetVariantsList
   */
  static async getVariantsList(productId: number): Promise<ProductVariant[]> {
    return api.get<ProductVariant[]>('https://api.promowe.com/Admin/ProductEditor/GetVariantsList', {
      params: { productId },
    });
  }

  /**
   * Get variant details with pricing
   * GET /Admin/ProductEditor/GetProductVariantDetails
   */
  static async getVariantDetails(variantId: number): Promise<VariantDetailsResponse> {
    return api.get<VariantDetailsResponse>('/Admin/ProductEditor/GetProductVariantDetails', {
      params: { variantId },
    });
  }

  /**
   * Create a new variant
   * POST /Admin/ProductEditor/AddProductVariant
   */
  static async createVariant(data: CreateVariantRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/AddProductVariant', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetVariantsList`);
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Update variant details
   * POST /Admin/ProductEditor/SetProductVariantDetails
   */
  static async updateVariant(variantId: number, data: Partial<UpdateVariantRequest>): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/SetProductVariantDetails', {
      variantId,
      ...data,
    });

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetVariantsList`);
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductVariantDetails`);
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Delete a variant
   * POST /Admin/ProductEditor/RemoveProductVariant
   */
  static async deleteVariant(variantId: number): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/RemoveProductVariant', {
      variantId,
    });

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetVariantsList`);
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Reorder variants
   * POST /Admin/ProductEditor/ReorderProductVariants
   */
  static async reorderVariants(data: ReorderVariantsRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/ReorderProductVariants', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetVariantsList`);

    return response;
  }

  /**
   * Batch create variants
   * Helper method for creating multiple variants
   */
  static async batchCreateVariants(
    productId: number,
    variants: Array<Omit<CreateVariantRequest, 'productId'>>
  ): Promise<any[]> {
    const promises = variants.map((variant) =>
      this.createVariant({ productId, ...variant })
    );
    return Promise.all(promises);
  }

  /**
   * Batch delete variants
   * Helper method for deleting multiple variants
   */
  static async batchDeleteVariants(variantIds: number[]): Promise<any[]> {
    const promises = variantIds.map((id) => this.deleteVariant(id));
    return Promise.all(promises);
  }
}
