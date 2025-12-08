/**
 * Product Colors Service
 * Color option management
 */

import api from '@/lib/api';
import type {
  ColorOption,
  CreateColorOptionRequest,
  UpdateColorOptionRequest,
  DeleteColorOptionsRequest,
  ReorderColorOptionsRequest,
} from '@/types/api/product';

/**
 * Product Colors Service
 * Handles color option CRUD operations
 */
export class ProductColorsService {
  /**
   * Get color options list (global palette)
   * GET /Admin/ProductEditor/GetColorOptionsList
   */
  static async getColorOptionsList(): Promise<ColorOption[]> {
    return api.get<ColorOption[]>('/Admin/ProductEditor/GetColorOptionsList');
  }

  /**
   * Get product color options
   * GET /Admin/ProductEditor/GetProductColorOptionsList
   */
  static async getProductColorOptions(productId: number): Promise<ColorOption[]> {
    return api.get<ColorOption[]>('/Admin/ProductEditor/GetProductColorOptionsList', {
      params: { productId },
    });
  }

  /**
   * Add color option
   * POST /Admin/ProductEditor/AddColorOption
   */
  static async createColorOption(data: CreateColorOptionRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/AddColorOption', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductColorOptionsList`);
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Update color option details
   * POST /Admin/ProductEditor/SetColorOptionDetail
   */
  static async updateColorOption(
    colorOptionId: string,
    data: Partial<UpdateColorOptionRequest>
  ): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/SetColorOptionDetail', {
      colorOptionId,
      ...data,
    });

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductColorOptionsList`);
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Remove color options
   * POST /Admin/ProductEditor/RemoveColorOptions
   */
  static async deleteColorOptions(colorIds: number[]): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/RemoveColorOptions', {
      colorIds,
    });

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductColorOptionsList`);
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Reorder color options
   * POST /Admin/ProductEditor/ReorderColorOptions
   */
  static async reorderColorOptions(data: ReorderColorOptionsRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/ReorderColorOptions', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductColorOptionsList`);

    return response;
  }

  /**
   * Batch create color options
   * Helper method for creating multiple colors
   */
  static async batchCreateColorOptions(
    productId: number,
    colors: Array<Omit<CreateColorOptionRequest, 'productId'>>
  ): Promise<any[]> {
    const promises = colors.map((color) =>
      this.createColorOption({ productId, ...color })
    );
    return Promise.all(promises);
  }
}
