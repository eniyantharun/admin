import { useState, useEffect, useCallback } from 'react';
import { CategoryStatsService } from '@/lib/services/category';
import type { CategoryStats } from '@/types/api/category';

export function useCategoryStats(
  categoryIds: number[],
  options = { enabled: true }
) {
  const [stats, setStats] = useState<Record<number, CategoryStats>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!options.enabled || categoryIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const data = await CategoryStatsService.getCategoriesStats(categoryIds);
      setStats(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch category stats:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryIds, options.enabled]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
