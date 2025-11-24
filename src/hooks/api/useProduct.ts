/**
 * useProduct Hook
 * Fetch and manage single product data
 */

import { useState, useEffect, useCallback } from 'react';
import { ProductCRUDService } from '@/lib/services/product';

export interface UseProductOptions {
  productId: number | string | null;
  enabled?: boolean;
  refetchOnMount?: boolean;
}

export interface UseProductReturn {
  product: any | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  update: (updates: any) => Promise<void>;
}

/**
 * Hook for fetching and managing a single product
 *
 * @example
 * ```tsx
 * const { product, loading, error, refetch, update } = useProduct({
 *   productId: 123,
 *   enabled: true,
 * });
 * ```
 */
export function useProduct({
  productId,
  enabled = true,
  refetchOnMount = true,
}: UseProductOptions): UseProductReturn {
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch product
  const fetchProduct = useCallback(async () => {
    if (!productId || !enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ProductCRUDService.getProductDetail(productId);
      setProduct(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, enabled]);

  // Auto-fetch on mount and when productId changes
  useEffect(() => {
    if (refetchOnMount) {
      fetchProduct();
    }
  }, [fetchProduct, refetchOnMount]);

  // Update product
  const update = useCallback(async (updates: any) => {
    if (!productId) {
      throw new Error('No product ID');
    }

    setLoading(true);
    setError(null);

    try {
      await ProductCRUDService.updateProduct(Number(productId), updates);

      // Optimistic update
      setProduct((prev: any) => ({
        ...prev,
        ...updates,
      }));

      // Refetch to get latest data
      await fetchProduct();
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to update product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [productId, fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
    update,
  };
}
