/**
 * Product Features Service
 * Feature and feature type management
 */

import api from '@/lib/api';
import type {
  FeatureType,
  ProductFeature,
  CreateFeatureTypeRequest,
  AddProductFeatureRequest,
  AddProductFeaturesRequest,
  RemoveProductFeatureRequest,
  RemoveProductFeaturesRequest,
} from '@/types/api/product';

/**
 * Product Features Service
 * Handles feature and feature type operations
 */
export class ProductFeaturesService {
  /**
   * Get product feature types
   * GET /Admin/Resource/GetProductFeatureTypes
   */
  static async getProductFeatureTypes(): Promise<FeatureType[]> {
    return api.get<FeatureType[]>('/Admin/Resource/GetProductFeatureTypes');
  }

  /**
   * Add product feature type
   * POST /Admin/Resource/AddProductFeatureType
   */
  static async createFeatureType(data: CreateFeatureTypeRequest): Promise<any> {
    const response = await api.post('/Admin/Resource/AddProductFeatureType', data);

    // Invalidate cache
    api.clearCacheByPattern('/Admin/Resource/GetProductFeatureTypes');

    return response;
  }

  /**
   * Add single product feature
   * POST /Admin/ProductEditor/AddProductFeature
   */
  static async addProductFeature(data: AddProductFeatureRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/AddProductFeature', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Add multiple product features
   * POST /Admin/ProductEditor/AddProductFeatures
   */
  static async addProductFeatures(data: AddProductFeaturesRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/AddProductFeatures', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Remove single product feature
   * POST /Admin/ProductEditor/RemoveProductFeature
   */
  static async removeProductFeature(featureId: number): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/RemoveProductFeature', {
      featureId,
    });

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Remove multiple product features
   * POST /Admin/ProductEditor/RemoveProductFeatures
   */
  static async removeProductFeatures(featureIds: number[]): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/RemoveProductFeatures', {
      featureIds,
    });

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Batch add features
   * Helper method using AddProductFeatures
   */
  static async batchAddFeatures(
    productId: number,
    features: Array<{ featureTypeId: number; value: string }>
  ): Promise<any> {
    return this.addProductFeatures({ productId, features });
  }
}
