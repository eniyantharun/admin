import api from '@/lib/api';

export class CategoryReindexService {
  /**
   * Trigger category reindex
   * POST /Admin/CategoryEditor/ReindexCategory
   */
  static async reindexCategory(categoryId: number) {
    // Fire-and-forget - let background process handle it
    return api.post('/Admin/CategoryEditor/ReindexCategory', {
      categoryId,
    });
  }

  /**
   * Get reindex status
   * GET /Admin/CategoryEditor/GetReindexStatus
   */
  static async getReindexStatus(categoryId: number) {
    return api.get('/Admin/CategoryEditor/GetReindexStatus', {
      params: { categoryId },
    });
  }
}
