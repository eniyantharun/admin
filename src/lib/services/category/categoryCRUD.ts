import api from '@/lib/api';
import type {
  CreateCategoryRequest,
  CategoryDetail,
  UpdateCategoryRequest,
  DeleteCategoryRequest,
} from '@/types/api/category';

export class CategoryCRUDService {
  /**
   * Create new category
   * POST /Admin/CategoryList/AddEmptyCategory
   */
  static async createCategory(data: CreateCategoryRequest) {
    const response = await api.post('/Admin/CategoryList/AddEmptyCategory', {
      name: data.name,
      website: data.website,
      type: data.type,
    });

    api.clearCacheByPattern('/Admin/Category');
    return response;
  }

  /**
   * Get category detail
   * GET /Admin/CategoryEditor/GetCategoryDetail
   */
  static async getCategoryDetail(categoryId: number): Promise<CategoryDetail> {
    const response = await api.get('/Admin/CategoryEditor/GetCategoryDetail', {
      params: { categoryId },
    });
    return response.category;
  }

  /**
   * Update category
   * POST /Admin/CategoryEditor/SetCategoryDetail
   */
  static async updateCategory(
    categoryId: number,
    data: Partial<UpdateCategoryRequest>
  ) {
    const response = await api.post('/Admin/CategoryEditor/SetCategoryDetail', {
      id: categoryId,
      ...data,
    });

    // Invalidate caches
    api.clearCacheByPattern('https://api.promowe.com/Admin/CategoryEditor/GetCategoryDetail');
    api.clearCacheByPattern('https://api.promowe.com/Admin/Category/Tree');

    return response;
  }

  /**
   * Delete category
   * POST /Admin/CategoryEditor/DeleteCategory
   */
  static async deleteCategory(request: DeleteCategoryRequest) {
    const response = await api.post('/Admin/CategoryEditor/DeleteCategory', request);
    api.clearCacheByPattern('/Admin/Category');
    return response;
  }

  /**
   * Toggle visibility
   * POST /Admin/CategoryEditor/SetCategoryEnabled
   */
  static async setCategoryEnabled(categoryId: number, enabled: boolean) {
    const response = await api.post('/Admin/CategoryEditor/SetCategoryEnabled', {
      categoryId,
      enabled,
    });

    api.clearCacheByPattern('https://api.promowe.com/Admin/Category/Tree');
    return response;
  }

  /**
   * Update slug
   * POST /Admin/CategoryEditor/UpdateCategorySlug
   */
  static async updateCategorySlug(categoryId: number, slug: string) {
    const response = await api.post('/Admin/CategoryEditor/UpdateCategorySlug', {
      categoryId,
      slug,
    });

    // Triggers Google reindex
    return response;
  }

  /**
   * Update parent
   * POST /Admin/CategoryEditor/UpdateCategoryParent
   */
  static async updateCategoryParent(categoryId: number, parentId: number | null) {
    const response = await api.post('/Admin/CategoryEditor/UpdateCategoryParent', {
      id: categoryId,
      parentId,
    });

    // Triggers full product reindex
    api.clearCacheByPattern('https://api.promowe.com/Admin/Category/Tree');
    return response;
  }

  /**
   * Rename category
   * POST /Admin/CategoryEditor/RenameCategory
   */
  static async renameCategory(categoryId: number, name: string) {
    const response = await api.post('/Admin/CategoryEditor/RenameCategory', {
      id: categoryId,
      name,
    });

    // Triggers product reindex
    return response;
  }
}
