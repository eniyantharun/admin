import api from '@/lib/api';
import type {
  CreateThemeRequest,
  ThemeDetail,
  UpdateThemeRequest,
  DeleteThemeRequest,
} from '@/types/api/theme';

export class ThemeCRUDService {
  /**
   * Create new theme
   * POST /Admin/CategoryList/AddEmptyCategory
   */
  static async createTheme(data: CreateThemeRequest) {
    const response = await api.post('/Admin/CategoryList/AddEmptyCategory', {
      name: data.name,
      website: data.website,
      type: 'Theme',
    });

    api.clearCacheByPattern('/Admin/Category');
    return response;
  }

  /**
   * Get theme detail
   * GET /Admin/CategoryEditor/GetCategoryDetail
   */
  static async getThemeDetail(themeId: number): Promise<ThemeDetail> {
    const response = await api.get('/Admin/CategoryEditor/GetCategoryDetail', {
      params: { categoryId: themeId },
    });
    return response.category;
  }

  /**
   * Update theme
   * POST /Admin/CategoryEditor/SetCategoryDetail
   */
  static async updateTheme(
    themeId: number,
    data: Partial<UpdateThemeRequest>
  ) {
    const response = await api.post('/Admin/CategoryEditor/SetCategoryDetail', {
      id: themeId,
      ...data,
    });

    // Invalidate caches
    api.clearCacheByPattern('https://api.promowe.com/Admin/CategoryEditor/GetCategoryDetail');
    api.clearCacheByPattern('https://api.promowe.com/Admin/Category/Tree');

    return response;
  }

  /**
   * Delete theme
   * POST /Admin/CategoryEditor/DeleteCategory
   */
  static async deleteTheme(request: DeleteThemeRequest) {
    const response = await api.post('/Admin/CategoryEditor/DeleteCategory', request);
    api.clearCacheByPattern('/Admin/Category');
    return response;
  }

  /**
   * Toggle visibility
   * POST /Admin/CategoryEditor/SetCategoryEnabled
   */
  static async setThemeEnabled(themeId: number, enabled: boolean) {
    const response = await api.post('/Admin/CategoryEditor/SetCategoryEnabled', {
      categoryId: themeId,
      enabled,
    });

    api.clearCacheByPattern('https://api.promowe.com/Admin/Category/Tree');
    return response;
  }

  /**
   * Update slug
   * POST /Admin/CategoryEditor/UpdateCategorySlug
   */
  static async updateThemeSlug(themeId: number, slug: string) {
    const response = await api.post('/Admin/CategoryEditor/UpdateCategorySlug', {
      categoryId: themeId,
      slug,
    });

    // Triggers Google reindex
    return response;
  }

  /**
   * Update parent
   * POST /Admin/CategoryEditor/UpdateCategoryParent
   */
  static async updateThemeParent(themeId: number, parentId: number | null) {
    const response = await api.post('/Admin/CategoryEditor/UpdateCategoryParent', {
      id: themeId,
      parentId,
    });

    // Triggers full product reindex
    api.clearCacheByPattern('https://api.promowe.com/Admin/Category/Tree');
    return response;
  }

  /**
   * Rename theme
   * POST /Admin/CategoryEditor/RenameCategory
   */
  static async renameTheme(themeId: number, name: string) {
    const response = await api.post('/Admin/CategoryEditor/RenameCategory', {
      id: themeId,
      name,
    });

    // Triggers product reindex
    return response;
  }
}
