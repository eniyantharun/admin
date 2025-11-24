/**
 * useBackgroundSync Hook
 * Automatically trigger reindexing and Merchant Center sync after product updates
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { ProductReindexService, ProductMerchantCenterService } from '@/lib/services/product';
import { debounce } from '@/utils/debounce';
import type { BatchProgress } from '@/types/api/common';

export interface UseBackgroundSyncOptions {
  productId: number;
  enabled?: boolean;
  triggerOnMount?: boolean;
  debounceMs?: number;
  onReindexProgress?: (progress: BatchProgress) => void;
  onMCProgress?: (progress: BatchProgress) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export type SyncStatus = 'idle' | 'reindexing' | 'syncing' | 'completed' | 'error';

export interface UseBackgroundSyncReturn {
  status: SyncStatus;
  trigger: () => void;
  reindexProgress: BatchProgress | null;
  mcProgress: BatchProgress | null;
  error: Error | null;
}

/**
 * Hook for background reindexing and Merchant Center sync
 *
 * @example
 * ```tsx
 * const { status, trigger } = useBackgroundSync({
 *   productId: 123,
 *   enabled: true,
 *   onComplete: () => console.log('Sync complete'),
 * });
 *
 * // Manually trigger sync
 * trigger();
 * ```
 */
export function useBackgroundSync({
  productId,
  enabled = true,
  triggerOnMount = false,
  debounceMs = 300,
  onReindexProgress,
  onMCProgress,
  onComplete,
  onError,
}: UseBackgroundSyncOptions): UseBackgroundSyncReturn {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [reindexProgress, setReindexProgress] = useState<BatchProgress | null>(null);
  const [mcProgress, setMCProgress] = useState<BatchProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const syncInProgress = useRef(false);

  // Trigger background sync
  const triggerSync = useCallback(async () => {
    if (!enabled || !productId || syncInProgress.current) {
      return;
    }

    syncInProgress.current = true;
    setStatus('reindexing');
    setError(null);

    try {
      // Run reindex and MC sync in parallel
      await Promise.all([
        // Reindex
        (async () => {
          try {
            await ProductReindexService.reindexProductBackground(productId);

            if (onReindexProgress) {
              onReindexProgress({
                batchId: '',
                total: 1,
                processed: 1,
                remaining: 0,
                percentage: 100,
                status: 'completed',
              });
            }
          } catch (err) {
            console.error('Reindex error:', err);
          }
        })(),

        // Merchant Center sync
        (async () => {
          try {
            setStatus('syncing');
            await ProductMerchantCenterService.syncProductBackground(productId);

            if (onMCProgress) {
              onMCProgress({
                batchId: '',
                total: 1,
                processed: 1,
                remaining: 0,
                percentage: 100,
                status: 'completed',
              });
            }
          } catch (err) {
            console.error('MC sync error:', err);
          }
        })(),
      ]);

      setStatus('completed');

      if (onComplete) {
        onComplete();
      }

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        syncInProgress.current = false;
      }, 3000);
    } catch (err) {
      const error = err as Error;
      setStatus('error');
      setError(error);
      syncInProgress.current = false;

      if (onError) {
        onError(error);
      }

      console.error('Background sync error:', error);
    }
  }, [productId, enabled, onReindexProgress, onMCProgress, onComplete, onError]);

  // Create debounced version
  const debouncedTriggerSync = useRef(
    debounce(triggerSync, debounceMs)
  ).current;

  // Trigger on mount if requested
  useEffect(() => {
    if (triggerOnMount && enabled && productId) {
      debouncedTriggerSync();
    }
  }, []); // Only on mount

  return {
    status,
    trigger: debouncedTriggerSync,
    reindexProgress,
    mcProgress,
    error,
  };
}
