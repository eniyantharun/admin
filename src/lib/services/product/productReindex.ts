/**
 * Product Reindex Service
 * Search indexing and reindexing operations
 */

import api from '@/lib/api';
import { pollBatchOperation } from '@/utils/polling';
import type {
  ReindexProductRequest,
  ReindexProductResponse,
  AddSearchBatchRequest,
  AddSearchBatchResponse,
  UpdateSearchBatchRequest,
  UpdateSearchBatchResponse,
  ReindexInvalidProductsRequest,
  RemoveSearchOrphansRequest,
} from '@/types/api/product';
import type { BatchProgress } from '@/types/api/common';

/**
 * Product Reindex Service
 * Handles product search indexing operations
 */
export class ProductReindexService {
  /**
   * Reindex a single product
   * POST /Admin/ProductEditor/ReindexProduct
   */
  static async reindexProduct(productId: number): Promise<ReindexProductResponse> {
    return api.post<ReindexProductResponse>('/Admin/ProductEditor/ReindexProduct', {
      productId,
    });
  }

  /**
   * Add products to search batch (initiate batch reindex)
   * POST /Admin/ProductSearch/AddBatch
   */
  static async addSearchBatch(productIds: number[]): Promise<AddSearchBatchResponse> {
    return api.post<AddSearchBatchResponse>('/Admin/ProductSearch/AddBatch', {
      productIds,
    });
  }

  /**
   * Update search batch (poll for progress)
   * POST /Admin/ProductSearch/UpdateBatch
   */
  static async updateSearchBatch(batchId: string): Promise<UpdateSearchBatchResponse> {
    return api.post<UpdateSearchBatchResponse>('/Admin/ProductSearch/UpdateBatch', {
      batchId,
    });
  }

  /**
   * Reindex invalid products
   * POST /Admin/ProductSearch/ReindexInvalidProducts
   */
  static async reindexInvalidProducts(limit?: number): Promise<any> {
    return api.post('/Admin/ProductSearch/ReindexInvalidProducts', {
      limit,
    });
  }

  /**
   * Remove orphaned search entries
   * POST /Admin/ProductSearch/RemoveOrphans
   */
  static async removeSearchOrphans(dryRun: boolean = false): Promise<any> {
    return api.post('/Admin/ProductSearch/RemoveOrphans', {
      dryRun,
    });
  }

  /**
   * Reindex products with polling (wait until complete)
   * Helper method that handles the entire batch reindex workflow
   */
  static async reindexProductsWithPolling(
    productIds: number[],
    onProgress?: (progress: BatchProgress) => void
  ): Promise<BatchProgress> {
    // Step 1: Initiate batch
    const batchResponse = await this.addSearchBatch(productIds);

    // Step 2: Poll until complete
    const finalProgress = await pollBatchOperation(
      (batchId) => this.updateSearchBatch(batchId),
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
   * Reindex single product in background
   * Helper method with debouncing support
   */
  static async reindexProductBackground(productId: number): Promise<void> {
    try {
      await this.reindexProduct(productId);
    } catch (error) {
      console.error('Background reindex failed:', error);
      // Don't throw - background task
    }
  }
}
