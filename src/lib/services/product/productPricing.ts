/**
 * Product Pricing Service
 * Pricing and price table management
 */

import api from '@/lib/api';
import type {
  PriceTable,
  PriceInclude,
  CreatePriceTableRequest,
  UpdatePriceTableRequest,
  DeletePriceTableRequest,
  DecorationMethod,
  CartonCalculation,
} from '@/types/api/product';

/**
 * Product Pricing Service
 * Handles pricing and decoration method operations
 */
export class ProductPricingService {
  /**
   * Get price table list for a variant
   * GET /Admin/ProductEditor/GetPriceTableList
   */
  static async getPriceTableList(variantId: number): Promise<PriceTable[]> {
    return api.get<PriceTable[]>('/Admin/ProductEditor/GetPriceTableList', {
      params: { variantId },
    });
  }

  /**
   * Get price includes list (price configuration options)
   * GET /Admin/ProductEditor/GetPriceIncludesList
   */
  static async getPriceIncludesList(productId: number): Promise<PriceInclude[]> {
    return api.get<PriceInclude[]>('/Admin/ProductEditor/GetPriceIncludesList', {
      params: { productId },
    });
  }

  /**
   * Create a new price table
   * POST /Admin/ProductEditor/AddPriceTable
   */
  static async createPriceTable(data: CreatePriceTableRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/AddPriceTable', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetPriceTableList`);
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductVariantDetails`);

    return response;
  }

  /**
   * Update price table details
   * POST /Admin/ProductEditor/SetPriceTableDetail
   */
  static async updatePriceTable(data: UpdatePriceTableRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/SetPriceTableDetail', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetPriceTableList`);
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductVariantDetails`);

    return response;
  }

  /**
   * Delete a price table
   * POST /Admin/ProductEditor/RemovePriceTable
   */
  static async deletePriceTable(data: DeletePriceTableRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/RemovePriceTable', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetPriceTableList`);
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductVariantDetails`);

    return response;
  }

  /**
   * Get decoration methods for a product
   * GET /Admin/ProductEditor/GetDecorationMethods
   */
  static async getDecorationMethods(productId: number): Promise<DecorationMethod[]> {
    return api.get<DecorationMethod[]>('/Admin/ProductEditor/GetDecorationMethods', {
      params: { productId },
    });
  }

  /**
   * Get decoration methods with advanced filtering (POST)
   * POST /Admin/ProductEditor/GetDecorationMethodsPost
   */
  static async getDecorationMethodsPost(productId: number, filters?: any): Promise<DecorationMethod[]> {
    return api.post<DecorationMethod[]>('/Admin/ProductEditor/GetDecorationMethodsPost', {
      productId,
      ...filters,
    });
  }

  /**
   * Get carton calculations
   * GET /Admin/ProductEditor/GetCartonCalculations
   */
  static async getCartonCalculations(productId: number): Promise<CartonCalculation> {
    return api.get<CartonCalculation>('/Admin/ProductEditor/GetCartonCalculations', {
      params: { productId },
    });
  }

  /**
   * Batch create price tables
   * Helper method for creating multiple price tables
   */
  static async batchCreatePriceTables(priceTables: CreatePriceTableRequest[]): Promise<any[]> {
    const promises = priceTables.map((pt) => this.createPriceTable(pt));
    return Promise.all(promises);
  }

  /**
   * Batch update price tables
   * Helper method for updating multiple price tables
   */
  static async batchUpdatePriceTables(
    updates: Array<UpdatePriceTableRequest>
  ): Promise<any[]> {
    const promises = updates.map((data) => this.updatePriceTable(data));
    return Promise.all(promises);
  }

  /**
   * Batch delete price tables
   * Helper method for deleting multiple price tables
   */
  static async batchDeletePriceTables(tableIds: string[]): Promise<any[]> {
    const promises = tableIds.map((tableId) => this.deletePriceTable({ tableId }));
    return Promise.all(promises);
  }
}
