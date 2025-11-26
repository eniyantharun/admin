import api from '@/lib/api';
import type { CategoryTreeNode } from '@/types/api/category';

export class CategoryListService {
  /**
   * Get category tree
   * GET /Admin/Category/Tree
   */
  static async getCategoryTree(params?: {
    website?: string;
    search?: string | null;
    parentId?: number | null;
    enabled?: boolean | null;
  }): Promise<{ categories: CategoryTreeNode[] }> {
    const response = await api.get('/Admin/Category/Tree', {
      params: {
        type: 'Category',
        ...params,
      },
    });
    return response;
  }

  /**
   * Load children for a specific node
   * GET /Admin/Category/Tree with parentId
   */
  static async loadChildren(parentId: number): Promise<{ categories: CategoryTreeNode[] }> {
    return this.getCategoryTree({ parentId });
  }

  /**
   * Search categories
   * GET /Admin/Category/Tree with search
   */
  static async searchCategories(search: string): Promise<{ categories: CategoryTreeNode[] }> {
    return this.getCategoryTree({ search });
  }
}
