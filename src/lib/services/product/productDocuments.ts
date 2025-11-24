/**
 * Product Documents Service
 * Document and carousel management
 */

import api from '@/lib/api';
import type {
  ProductDocument,
  CarouselItem,
  AddProductCarouselRequest,
  SetCarouselProductsRequest,
  SetProductCarouselItemDetailRequest,
} from '@/types/api/product';

/**
 * Product Documents Service
 * Handles product documents and carousel management
 */
export class ProductDocumentsService {
  /**
   * Get document detail
   * GET /Admin/Document/GetDocumentDetail
   */
  static async getDocumentDetail(documentId: number): Promise<ProductDocument> {
    return api.get<ProductDocument>('/Admin/Document/GetDocumentDetail', {
      params: { documentId },
    });
  }

  /**
   * Get product carousel items
   * GET /Admin/Document/GetProductCarouselItems
   */
  static async getProductCarouselItems(productId: number): Promise<CarouselItem[]> {
    return api.get<CarouselItem[]>('/Admin/Document/GetProductCarouselItems', {
      params: { productId },
    });
  }

  /**
   * Add product carousel
   * POST /Admin/Document/AddProductCarousel
   */
  static async addProductCarousel(data: AddProductCarouselRequest): Promise<any> {
    const response = await api.post('/Admin/Document/AddProductCarousel', data);

    // Invalidate cache
    api.clearCacheByPattern(`/Admin/Document/GetProductCarouselItems`);

    return response;
  }

  /**
   * Set carousel products
   * POST /Admin/Document/SetCarouselProducts
   */
  static async setCarouselProducts(data: SetCarouselProductsRequest): Promise<any> {
    const response = await api.post('/Admin/Document/SetCarouselProducts', data);

    // Invalidate cache
    api.clearCacheByPattern(`/Admin/Document/GetProductCarouselItems`);

    return response;
  }

  /**
   * Set product carousel item detail
   * POST /Admin/Document/SetProductCarouselItemDetail
   */
  static async setProductCarouselItemDetail(data: SetProductCarouselItemDetailRequest): Promise<any> {
    const response = await api.post('/Admin/Document/SetProductCarouselItemDetail', data);

    // Invalidate cache
    api.clearCacheByPattern(`/Admin/Document/GetProductCarouselItems`);

    return response;
  }
}
