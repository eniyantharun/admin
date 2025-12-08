import { useState, useCallback } from 'react';
import { ThemeCRUDService } from '@/lib/services/theme';
import toast from 'react-hot-toast';
import type { UpdateThemeRequest, DeleteThemeRequest } from '@/types/api/theme';

interface UseThemeMutationsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

export function useThemeMutations(options: UseThemeMutationsOptions = {}) {
  const [loading, setLoading] = useState(false);
  const showToast = options.showToast ?? true;

  const updateTheme = useCallback(async (
    themeId: number,
    data: Partial<UpdateThemeRequest>
  ) => {
    setLoading(true);
    try {
      await ThemeCRUDService.updateTheme(themeId, data);
      if (showToast) toast.success('Theme updated successfully');
      options.onSuccess?.();
    } catch (error) {
      if (showToast) toast.error('Failed to update theme');
      options.onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options, showToast]);

  const deleteTheme = useCallback(async (request: DeleteThemeRequest) => {
    setLoading(true);
    try {
      await ThemeCRUDService.deleteTheme(request);
      if (showToast) toast.success('Theme deleted successfully');
      options.onSuccess?.();
    } catch (error) {
      if (showToast) toast.error('Failed to delete theme');
      options.onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options, showToast]);

  const toggleEnabled = useCallback(async (themeId: number, enabled: boolean) => {
    setLoading(true);
    try {
      await ThemeCRUDService.setThemeEnabled(themeId, enabled);
      if (showToast) toast.success(`Theme ${enabled ? 'enabled' : 'disabled'}`);
      options.onSuccess?.();
    } catch (error) {
      if (showToast) toast.error('Failed to update theme status');
      options.onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options, showToast]);

  const updateSlug = useCallback(async (themeId: number, slug: string) => {
    setLoading(true);
    try {
      await ThemeCRUDService.updateThemeSlug(themeId, slug);
      if (showToast) toast.success('Slug updated (Google reindex triggered)');
      options.onSuccess?.();
    } catch (error) {
      if (showToast) toast.error('Failed to update slug');
      options.onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options, showToast]);

  const updateParent = useCallback(async (themeId: number, parentId: number | null) => {
    setLoading(true);
    try {
      await ThemeCRUDService.updateThemeParent(themeId, parentId);
      if (showToast) toast.success('Parent updated (product reindex triggered)');
      options.onSuccess?.();
    } catch (error) {
      if (showToast) toast.error('Failed to update parent');
      options.onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options, showToast]);

  return {
    loading,
    updateTheme,
    deleteTheme,
    toggleEnabled,
    updateSlug,
    updateParent,
  };
}
