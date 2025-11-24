/**
 * useProducts Hook
 * Fetch and manage product list with pagination and filters
 */

import { useState, useEffect, useCallback } from 'react';
import { ProductListService } from '@/lib/services/product';
import type { GetProductsListRequest } from '@/types/api/product';

export interface UseProductsOptions {
  initialParams?: Partial<GetProductsListRequest>;
  enabled?: boolean;
  autoFetch?: boolean;
}

export interface UseProductsReturn {
  products: any[];
  totalCount: number;
  loading: boolean;
  error: Error | null;
  params: GetProductsListRequest;
  setParams: (params: Partial<GetProductsListRequest>) => void;
  refetch: () => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<GetProductsListRequest>) => void;
}

/**
 * Hook for fetching and managing product list
 *
 * @example
 * ```tsx
 * const { products, loading, setSearch, nextPage } = useProducts({
 *   initialParams: { pageSize: 20 },
 *   enabled: true,
 * });
 * ```
 */
export function useProducts({
  initialParams = {},
  enabled = true,
  autoFetch = true,
}: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<GetProductsListRequest>({
    pageSize: 20,
    offset: 0,
    ...initialParams,
  });

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ProductListService.getProductsList(params);
      setProducts(response.products);
      setTotalCount(response.count);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [params, enabled]);

  // Auto-fetch when params change
  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [fetchProducts, autoFetch]);

  // Update params
  const updateParams = useCallback((newParams: Partial<GetProductsListRequest>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  }, []);

  // Pagination helpers
  const nextPage = useCallback(() => {
    setParams((prev) => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.pageSize || 20),
    }));
  }, []);

  const prevPage = useCallback(() => {
    setParams((prev) => ({
      ...prev,
      offset: Math.max(0, (prev.offset || 0) - (prev.pageSize || 20)),
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({
      ...prev,
      offset: page * (prev.pageSize || 20),
    }));
  }, []);

  // Search helper
  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({
      ...prev,
      search,
      offset: 0, // Reset to first page
    }));
  }, []);

  // Filters helper
  const setFilters = useCallback((filters: Partial<GetProductsListRequest>) => {
    setParams((prev) => ({
      ...prev,
      ...filters,
      offset: 0, // Reset to first page
    }));
  }, []);

  return {
    products,
    totalCount,
    loading,
    error,
    params,
    setParams: updateParams,
    refetch: fetchProducts,
    nextPage,
    prevPage,
    setPage,
    setSearch,
    setFilters,
  };
}
