import { useState, useEffect, useCallback } from 'react';
import { ThemeStatsService } from '@/lib/services/theme';
import type { ThemeStats } from '@/types/api/theme';

export function useThemeStats(
  themeIds: number[],
  options = { enabled: true }
) {
  const [stats, setStats] = useState<Record<number, ThemeStats>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!options.enabled || themeIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const data = await ThemeStatsService.getThemesStats(themeIds);
      setStats(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch theme stats:', err);
    } finally {
      setLoading(false);
    }
  }, [themeIds, options.enabled]);

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
