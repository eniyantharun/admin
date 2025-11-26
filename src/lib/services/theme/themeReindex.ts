import api from '@/lib/api';

export class ThemeReindexService {
  /**
   * Trigger theme reindex
   * POST /Admin/CategoryEditor/ReindexCategory
   */
  static async reindexTheme(themeId: number) {
    // Fire-and-forget - let background process handle it
    return api.post('/Admin/CategoryEditor/ReindexCategory', {
      categoryId: themeId,
    });
  }

  /**
   * Get reindex status
   * GET /Admin/CategoryEditor/GetReindexStatus
   */
  static async getReindexStatus(themeId: number) {
    return api.get('/Admin/CategoryEditor/GetReindexStatus', {
      params: { categoryId: themeId },
    });
  }
}
