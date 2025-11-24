/**
 * Product Images Service
 * Image upload and management operations
 */

import api from '@/lib/api';
import type {
  ProductPicture,
  UploadImageRequest,
  UploadImageResponse,
  AddPictureByAssetRequest,
  RemovePicturesRequest,
  ReorderPicturesRequest,
  ColorPictureAssociation,
  VariantPictureAssociation,
  AddColorPictureAssociationRequest,
  AddVariantPictureAssociationRequest,
  RemoveColorPictureAssociationRequest,
  RemoveVariantPictureAssociationRequest,
} from '@/types/api/product';

/**
 * Product Images Service
 * Handles image upload, management, and associations
 */
export class ProductImagesService {
  /**
   * Get product pictures list
   * GET /Admin/ProductEditor/GetProductPicturesList
   */
  static async getProductPictures(productId: number): Promise<ProductPicture[]> {
    return api.get<ProductPicture[]>('/Admin/ProductEditor/GetProductPicturesList', {
      params: { productId },
    });
  }

  /**
   * Upload image file
   * POST /Admin/Assets/Upload
   */
  static async uploadImage(data: UploadImageRequest): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', data.file);

    const response = await api.post<UploadImageResponse>('/Admin/Assets/Upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (data.onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          data.onProgress(percentCompleted);
        }
      },
    });

    return response;
  }

  /**
   * Add picture by asset ID
   * POST /Admin/ProductEditor/AddPictureByAsset
   */
  static async addPictureByAsset(data: AddPictureByAssetRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/AddPictureByAsset', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductPicturesList`);
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Remove pictures
   * POST /Admin/ProductEditor/RemovePictures
   */
  static async removePictures(pictureIds: number[]): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/RemovePictures', {
      pictureIds,
    });

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductPicturesList`);
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductDetail`);

    return response;
  }

  /**
   * Reorder pictures
   * POST /Admin/ProductEditor/ReorderPictures
   */
  static async reorderPictures(data: ReorderPicturesRequest): Promise<any> {
    const response = await api.post('/Admin/ProductEditor/ReorderPictures', data);

    // Invalidate caches
    api.clearCacheByPattern(`/Admin/ProductEditor/GetProductPicturesList`);

    return response;
  }

  /**
   * Add asset from product picture
   * POST /Admin/ProductEditor/AddAssetFromProductPicture
   */
  static async addAssetFromPicture(pictureId: number): Promise<any> {
    return api.post('/Admin/ProductEditor/AddAssetFromProductPicture', {
      pictureId,
    });
  }

  /**
   * Copy pending picture
   * POST /Admin/ProductEditor/CopyPendingPicture
   */
  static async copyPendingPicture(pictureId: number): Promise<any> {
    return api.post('/Admin/ProductEditor/CopyPendingPicture', {
      pictureId,
    });
  }

  /**
   * Download pending picture
   * POST /Admin/ProductEditor/DownloadPendingPicture
   */
  static async downloadPendingPicture(pictureId: number): Promise<Blob> {
    return api.post('/Admin/ProductEditor/DownloadPendingPicture', {
      pictureId,
    }, {
      responseType: 'blob',
    });
  }

  // ============================================
  // IMAGE ASSOCIATIONS
  // ============================================

  /**
   * Get color-picture associations
   * GET /Admin/ProductEditor/GetColorPictureAssociationsList
   */
  static async getColorPictureAssociations(productId: number): Promise<ColorPictureAssociation[]> {
    return api.get<ColorPictureAssociation[]>('/Admin/ProductEditor/GetColorPictureAssociationsList', {
      params: { productId },
    });
  }

  /**
   * Get variant-picture associations
   * GET /Admin/ProductEditor/GetVariantPictureAssociationsList
   */
  static async getVariantPictureAssociations(productId: number): Promise<VariantPictureAssociation[]> {
    return api.get<VariantPictureAssociation[]>('/Admin/ProductEditor/GetVariantPictureAssociationsList', {
      params: { productId },
    });
  }

  /**
   * Add color-picture association
   * POST /Admin/ProductEditor/AddColorPictureAssociation
   */
  static async addColorPictureAssociation(data: AddColorPictureAssociationRequest): Promise<any> {
    return api.post('/Admin/ProductEditor/AddColorPictureAssociation', data);
  }

  /**
   * Add variant-picture association
   * POST /Admin/ProductEditor/AddVariantPictureAssociation
   */
  static async addVariantPictureAssociation(data: AddVariantPictureAssociationRequest): Promise<any> {
    return api.post('/Admin/ProductEditor/AddVariantPictureAssociation', data);
  }

  /**
   * Remove color-picture association
   * POST /Admin/ProductEditor/RemoveColorPictureAssociation
   */
  static async removeColorPictureAssociation(data: RemoveColorPictureAssociationRequest): Promise<any> {
    return api.post('/Admin/ProductEditor/RemoveColorPictureAssociation', data);
  }

  /**
   * Remove variant-picture association
   * POST /Admin/ProductEditor/RemoveVariantPictureAssociation
   */
  static async removeVariantPictureAssociation(data: RemoveVariantPictureAssociationRequest): Promise<any> {
    return api.post('/Admin/ProductEditor/RemoveVariantPictureAssociation', data);
  }

  /**
   * Upload and add image in one operation
   * Helper method combining upload + add
   */
  static async uploadAndAddImage(
    productId: number,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    // Step 1: Upload file
    const uploadResponse = await this.uploadImage({ file, onProgress });

    // Step 2: Add picture by asset ID
    return this.addPictureByAsset({
      productId,
      assetId: uploadResponse.assetId,
    });
  }

  /**
   * Batch upload images
   * Helper method for uploading multiple images
   */
  static async batchUploadImages(
    productId: number,
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<any[]> {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadAndAddImage(
        productId,
        files[i],
        onProgress ? (progress) => onProgress(i, progress) : undefined
      );
      results.push(result);
    }

    return results;
  }
}
