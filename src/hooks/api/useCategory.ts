import { useState, useEffect, useCallback } from 'react';
import { CategoryCRUDService } from '@/lib/services/category';
import type { CategoryDetail } from '@/types/api/category';

export function useCategory(categoryId: number | null, options = { enabled: true }) {
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategory = useCallback(async () => {
    if (!categoryId || !options.enabled) return;

    setLoading(true);
    setError(null);

    try {
      const data = await CategoryCRUDService.getCategoryDetail(categoryId);
      setCategory(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch category:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, options.enabled]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return {
    category,
    loading,
    error,
    refetch: fetchCategory,
  };
}
