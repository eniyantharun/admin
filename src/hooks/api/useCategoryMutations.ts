import { useState, useCallback } from 'react';
import { CategoryCRUDService } from '@/lib/services/category';
import toast from 'react-hot-toast';
import type { UpdateCategoryRequest, DeleteCategoryRequest } from '@/types/api/category';

interface UseCategoryMutationsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

export function useCategoryMutations(options: UseCategoryMutationsOptions = {}) {
  const [loading, setLoading] = useState(false);
  const showToast = options.showToast ?? true;

  const updateCategory = useCallback(async (
    categoryId: number,
    data: Partial<UpdateCategoryRequest>
  ) => {
    setLoading(true);
    try {
      await CategoryCRUDService.updateCategory(categoryId, data);
      if (showToast) toast.success('Category updated successfully');
      options.onSuccess?.();
    } catch (error) {
      if (showToast) toast.error('Failed to update category');
      options.onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options, showToast]);

  const deleteCategory = useCallback(async (request: DeleteCategoryRequest) => {
    setLoading(true);
    try {
      await CategoryCRUDService.deleteCategory(request);
      if (showToast) toast.success('Category deleted successfully');
      options.onSuccess?.();
    } catch (error) {
      if (showToast) toast.error('Failed to delete category');
      options.onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options, showToast]);

  const toggleEnabled = useCallback(async (categoryId: number, enabled: boolean) => {
    setLoading(true);
    try {
      await CategoryCRUDService.setCategoryEnabled(categoryId, enabled);
      if (showToast) toast.success(`Category ${enabled ? 'enabled' : 'disabled'}`);
      options.onSuccess?.();
    } catch (error) {
      if (showToast) toast.error('Failed to update category status');
      options.onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options, showToast]);

  const updateSlug = useCallback(async (categoryId: number, slug: string) => {
    setLoading(true);
    try {
      await CategoryCRUDService.updateCategorySlug(categoryId, slug);
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

  const updateParent = useCallback(async (categoryId: number, parentId: number | null) => {
    setLoading(true);
    try {
      await CategoryCRUDService.updateCategoryParent(categoryId, parentId);
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
    updateCategory,
    deleteCategory,
    toggleEnabled,
    updateSlug,
    updateParent,
  };
}
