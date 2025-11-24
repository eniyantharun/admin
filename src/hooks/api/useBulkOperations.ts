/**
 * useBulkOperations Hook
 * Handle bulk product operations with progress tracking
 */

import { useState, useCallback } from 'react';
import {
  ProductCRUDService,
  ProductCategoriesService,
  ProductReindexService,
} from '@/lib/services/product';
import type { BatchProgress } from '@/types/api/common';
import toast from 'react-hot-toast';

export interface UseBulkOperationsOptions {
  onSuccess?: (operation: string, results: any) => void;
  onError?: (operation: string, error: Error) => void;
  onProgress?: (progress: BatchProgress) => void;
  showToast?: boolean;
}

export interface UseBulkOperationsReturn {
  loading: boolean;
  error: Error | null;
  progress: BatchProgress | null;

  // Selection state
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
  toggleSelection: (id: number) => void;
  selectAll: (ids: number[]) => void;
  clearSelection: () => void;

  // Bulk operations
  bulkDelete: (productIds: number[]) => Promise<any>;
  bulkUpdateVisibility: (productIds: number[], visibility: 'Enabled' | 'Disabled') => Promise<any>;
  bulkAssignCategory: (productIds: number[], categoryId: number) => Promise<any>;
  bulkRemoveCategory: (productIds: number[], categoryId: number) => Promise<any>;
  bulkReindex: (productIds: number[]) => Promise<BatchProgress>;
}

/**
 * Hook for bulk product operations
 *
 * @example
 * ```tsx
 * const {
 *   selectedIds,
 *   toggleSelection,
 *   bulkDelete,
 *   loading
 * } = useBulkOperations({
 *   onSuccess: () => refetch(),
 *   showToast: true,
 * });
 * ```
 */
export function useBulkOperations({
  onSuccess,
  onError,
  onProgress,
  showToast = true,
}: UseBulkOperationsOptions = {}): UseBulkOperationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Generic bulk operation handler
  const handleBulkOperation = useCallback(async <T,>(
    operation: string,
    operationFn: () => Promise<T>,
    successMessage?: string
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    setProgress(null);

    try {
      const result = await operationFn();

      if (onSuccess) {
        onSuccess(operation, result);
      }

      if (showToast && successMessage) {
        toast.success(successMessage);
      }

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);

      if (onError) {
        onError(operation, error);
      }

      if (showToast) {
        toast.error(`${operation} failed: ${error.message}`);
      }

      throw error;
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [onSuccess, onError, showToast]);

  // Selection helpers
  const toggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((ids: number[]) => {
    setSelectedIds(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Bulk delete
  const bulkDelete = useCallback((productIds: number[]) =>
    handleBulkOperation(
      'Bulk delete',
      async () => {
        const results = await ProductCRUDService.batchDeleteProducts(productIds);
        clearSelection();
        return results;
      },
      `${productIds.length} product(s) deleted successfully`
    ),
    [handleBulkOperation, clearSelection]
  );

  // Bulk update visibility
  const bulkUpdateVisibility = useCallback((
    productIds: number[],
    visibility: 'Enabled' | 'Disabled'
  ) =>
    handleBulkOperation(
      'Bulk update visibility',
      async () => {
        const results = await ProductCRUDService.batchToggleVisibility(productIds, visibility);
        clearSelection();
        return results;
      },
      `${productIds.length} product(s) ${visibility === 'Enabled' ? 'enabled' : 'disabled'} successfully`
    ),
    [handleBulkOperation, clearSelection]
  );

  // Bulk assign category
  const bulkAssignCategory = useCallback((productIds: number[], categoryId: number) =>
    handleBulkOperation(
      'Bulk assign category',
      async () => {
        const result = await ProductCategoriesService.addCategoryBulk({
          productIds,
          categoryId,
        });

        // Trigger reindex
        await ProductReindexService.addSearchBatch(productIds);

        clearSelection();
        return result;
      },
      `Category assigned to ${productIds.length} product(s) successfully`
    ),
    [handleBulkOperation, clearSelection]
  );

  // Bulk remove category
  const bulkRemoveCategory = useCallback((productIds: number[], categoryId: number) =>
    handleBulkOperation(
      'Bulk remove category',
      async () => {
        const result = await ProductCategoriesService.removeCategoryBulk({
          productIds,
          categoryId,
        });

        // Trigger reindex
        await ProductReindexService.addSearchBatch(productIds);

        clearSelection();
        return result;
      },
      `Category removed from ${productIds.length} product(s) successfully`
    ),
    [handleBulkOperation, clearSelection]
  );

  // Bulk reindex with polling
  const bulkReindex = useCallback(async (productIds: number[]): Promise<BatchProgress> => {
    setLoading(true);
    setError(null);

    try {
      const handleProgress = (p: BatchProgress) => {
        setProgress(p);
        if (onProgress) {
          onProgress(p);
        }
      };

      const finalProgress = await ProductReindexService.reindexProductsWithPolling(
        productIds,
        handleProgress
      );

      if (onSuccess) {
        onSuccess('Bulk reindex', finalProgress);
      }

      if (showToast) {
        toast.success(`${productIds.length} product(s) reindexed successfully`);
      }

      clearSelection();
      return finalProgress;
    } catch (err) {
      const error = err as Error;
      setError(error);

      if (onError) {
        onError('Bulk reindex', error);
      }

      if (showToast) {
        toast.error(`Bulk reindex failed: ${error.message}`);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError, onProgress, showToast, clearSelection]);

  return {
    loading,
    error,
    progress,
    selectedIds,
    setSelectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkDelete,
    bulkUpdateVisibility,
    bulkAssignCategory,
    bulkRemoveCategory,
    bulkReindex,
  };
}
