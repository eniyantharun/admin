/**
 * Product Merchant Center Service
 * Google Merchant Center sync operations
 */

import api from '@/lib/api';
import { pollBatchOperation } from '@/utils/polling';
import type {
  AddMCBatchRequest,
  AddMCBatchResponse,
  UpdateMCBatchRequest,
  UpdateMCBatchResponse,
  SetMerchantCenterEnabledRequest,
  PullMCOffersRequest,
  RemoveMCOrphansRequest,
} from '@/types/api/product';
import type { BatchProgress } from '@/types/api/common';

/**
 * Product Merchant Center Service
 * Handles Google Merchant Center synchronization
 */
export class ProductMerchantCenterService {
  /**
   * Add products to Merchant Center batch (initiate sync)
   * POST /Admin/MerchantCenter/AddBatch
   */
  static async addMCBatch(productIds: number[]): Promise<AddMCBatchResponse> {
    return api.post<AddMCBatchResponse>('/Admin/MerchantCenter/AddBatch', {
      productIds,
    });
  }

  /**
   * Update Merchant Center batch (poll for progress)
   * POST /Admin/MerchantCenter/UpdateBatch
   */
  static async updateMCBatch(batchId: string): Promise<UpdateMCBatchResponse> {
    return api.post<UpdateMCBatchResponse>('/Admin/MerchantCenter/UpdateBatch', {
      batchId,
    });
  }

  /**
   * Set Merchant Center enabled status for a product
   * POST /Admin/ProductEditor/SetMerchantCenterEnabled
   */
  static async setMerchantCenterEnabled(data: SetMerchantCenterEnabledRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/SetMerchantCenterEnabled', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Pull offers from Merchant Center
   * POST /Admin/MerchantCenter/PullOffers
   */
  static async pullOffers(force: boolean = false): Promise<any> {
    return api.post('/Admin/MerchantCenter/PullOffers', {
      force,
    });
  }

  /**
   * Remove orphaned Merchant Center offers
   * POST /Admin/MerchantCenter/RemoveOrphanOffers
   */
  static async removeOrphanOffers(dryRun: boolean = false): Promise<any> {
    return api.post('/Admin/MerchantCenter/RemoveOrphanOffers', {
      dryRun,
    });
  }

  /**
   * Sync products to Merchant Center with polling (wait until complete)
   * Helper method that handles the entire MC sync workflow
   */
  static async syncProductsWithPolling(
    productIds: number[],
    onProgress?: (progress: BatchProgress) => void
  ): Promise<BatchProgress> {
    // Step 1: Initiate batch
    const batchResponse = await this.addMCBatch(productIds);

    // Step 2: Poll until complete
    const finalProgress = await pollBatchOperation(
      (batchId) => this.updateMCBatch(batchId),
      batchResponse.batchId,
      {
        interval: 1000, // Poll every 1 second
        maxAttempts: 300, // 5 minutes max
        onProgress,
      }
    );

    return finalProgress;
  }

  /**
   * Sync single product to Merchant Center in background
   * Helper method with debouncing support
   */
  static async syncProductBackground(productId: number): Promise<void> {
    try {
      await this.addMCBatch([productId]);
      // Note: Not waiting for completion - background task
    } catch (error) {
      console.error('Background MC sync failed:', error);
      // Don't throw - background task
    }
  }

  /**
   * Sync products in parallel with reindexing
   * Helper method for combined operations
   */
  static async syncProductsParallel(
    productIds: number[],
    onProgress?: (progress: BatchProgress) => void
  ): Promise<BatchProgress> {
    // Run in background, don't wait
    this.syncProductsWithPolling(productIds, onProgress);

    // Return immediately
    return {
      batchId: '',
      total: productIds.length,
      processed: 0,
      remaining: productIds.length,
      percentage: 0,
      status: 'processing',
    };
  }
}
