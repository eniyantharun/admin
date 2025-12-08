import { useState, useEffect, useCallback } from 'react';
import { ThemeCRUDService } from '@/lib/services/theme';
import type { ThemeDetail } from '@/types/api/theme';

export function useTheme(themeId: number | null, options = { enabled: true }) {
  const [theme, setTheme] = useState<ThemeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTheme = useCallback(async () => {
    if (!themeId || !options.enabled) return;

    setLoading(true);
    setError(null);

    try {
      const data = await ThemeCRUDService.getThemeDetail(themeId);
      setTheme(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch theme:', err);
    } finally {
      setLoading(false);
    }
  }, [themeId, options.enabled]);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  return {
    theme,
    loading,
    error,
    refetch: fetchTheme,
  };
}
