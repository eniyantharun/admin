/**
 * useProductMutations Hook
 * Handle product CRUD operations with optimistic updates
 */

import { useState, useCallback } from 'react';
import {
  ProductCRUDService,
  ProductVariantsService,
  ProductImagesService,
  ProductColorsService,
  ProductFeaturesService,
} from '@/lib/services/product';
import toast from 'react-hot-toast';

export interface UseProductMutationsOptions {
  onSuccess?: (operation: string, data: any) => void;
  onError?: (operation: string, error: Error) => void;
  showToast?: boolean;
}

export interface UseProductMutationsReturn {
  loading: boolean;
  error: Error | null;

  // Product operations
  createProduct: (data: any) => Promise<any>;
  updateProduct: (productId: number, data: any) => Promise<any>;
  deleteProduct: (productId: number) => Promise<any>;
  duplicateProduct: (productId: number, newName?: string) => Promise<any>;

  // Variant operations
  createVariant: (productId: number, data: any) => Promise<any>;
  updateVariant: (variantId: number, data: any) => Promise<any>;
  deleteVariant: (variantId: number) => Promise<any>;

  // Image operations
  uploadImage: (productId: number, file: File, onProgress?: (progress: number) => void) => Promise<any>;
  deleteImage: (pictureIds: number[]) => Promise<any>;

  // Color operations
  createColor: (productId: number, data: any) => Promise<any>;
  updateColor: (colorId: string, data: any) => Promise<any>;  // Changed to string
  deleteColor: (colorIds: number[]) => Promise<any>;

  // Feature operations
  addFeature: (productId: number, data: any) => Promise<any>;
  removeFeature: (featureId: number) => Promise<any>;
}

/**
 * Hook for product CRUD mutations
 *
 * @example
 * ```tsx
 * const { createProduct, updateProduct, loading } = useProductMutations({
 *   onSuccess: () => refetch(),
 *   showToast: true,
 * });
 * ```
 */
export function useProductMutations({
  onSuccess,
  onError,
  showToast = true,
}: UseProductMutationsOptions = {}): UseProductMutationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Generic mutation handler
  const handleMutation = useCallback(async <T,>(
    operation: string,
    mutationFn: () => Promise<T>,
    successMessage?: string
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn();

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
    }
  }, [onSuccess, onError, showToast]);

  // Product operations
  const createProduct = useCallback((data: any) =>
    handleMutation(
      'Create product',
      () => ProductCRUDService.createProduct(data),
      'Product created successfully'
    ),
    [handleMutation]
  );

  const updateProduct = useCallback((productId: number, data: any) =>
    handleMutation(
      'Update product',
      () => ProductCRUDService.updateProduct(productId, data),
      'Product updated successfully'
    ),
    [handleMutation]
  );

  const deleteProduct = useCallback((productId: number) =>
    handleMutation(
      'Delete product',
      () => ProductCRUDService.deleteProduct(productId),
      'Product deleted successfully'
    ),
    [handleMutation]
  );

  const duplicateProduct = useCallback((productId: number, newName?: string) =>
    handleMutation(
      'Duplicate product',
      () => ProductCRUDService.duplicateProduct({ productId, newName }),
      'Product duplicated successfully'
    ),
    [handleMutation]
  );

  // Variant operations
  const createVariant = useCallback((productId: number, data: any) =>
    handleMutation(
      'Create variant',
      () => ProductVariantsService.createVariant({ productId, ...data }),
      'Variant created successfully'
    ),
    [handleMutation]
  );

  const updateVariant = useCallback((variantId: number, data: any) =>
    handleMutation(
      'Update variant',
      () => ProductVariantsService.updateVariant(variantId, data),
      'Variant updated successfully'
    ),
    [handleMutation]
  );

  const deleteVariant = useCallback((variantId: number) =>
    handleMutation(
      'Delete variant',
      () => ProductVariantsService.deleteVariant(variantId),
      'Variant deleted successfully'
    ),
    [handleMutation]
  );

  // Image operations
  const uploadImage = useCallback((
    productId: number,
    file: File,
    onProgress?: (progress: number) => void
  ) =>
    handleMutation(
      'Upload image',
      () => ProductImagesService.uploadAndAddImage(productId, file, onProgress),
      'Image uploaded successfully'
    ),
    [handleMutation]
  );

  const deleteImage = useCallback((pictureIds: number[]) =>
    handleMutation(
      'Delete image',
      () => ProductImagesService.removePictures(pictureIds),
      'Image deleted successfully'
    ),
    [handleMutation]
  );

  // Color operations
  const createColor = useCallback((productId: number, data: any) =>
    handleMutation(
      'Create color',
      () => ProductColorsService.createColorOption({ productId, ...data }),
      'Color created successfully'
    ),
    [handleMutation]
  );

  const updateColor = useCallback((colorId: string, data: any) =>
    handleMutation(
      'Update color',
      () => ProductColorsService.updateColorOption(colorId, data),
      'Color updated successfully'
    ),
    [handleMutation]
  );

  const deleteColor = useCallback((colorIds: number[]) =>
    handleMutation(
      'Delete color',
      () => ProductColorsService.deleteColorOptions(colorIds),
      'Color deleted successfully'
    ),
    [handleMutation]
  );

  // Feature operations
  const addFeature = useCallback((productId: number, data: any) =>
    handleMutation(
      'Add feature',
      () => ProductFeaturesService.addProductFeature({ productId, ...data }),
      'Feature added successfully'
    ),
    [handleMutation]
  );

  const removeFeature = useCallback((featureId: number) =>
    handleMutation(
      'Remove feature',
      () => ProductFeaturesService.removeProductFeature(featureId),
      'Feature removed successfully'
    ),
    [handleMutation]
  );

  return {
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    createVariant,
    updateVariant,
    deleteVariant,
    uploadImage,
    deleteImage,
    createColor,
    updateColor,
    deleteColor,
    addFeature,
    removeFeature,
  };
}
