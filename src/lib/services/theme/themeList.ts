import api from '@/lib/api';
import type { ThemeTreeNode } from '@/types/api/theme';

export class ThemeListService {
  /**
   * Get theme tree
   * GET /Admin/Category/Tree
   */
  static async getThemeTree(params?: {
    website?: string;
    search?: string | null;
    parentId?: number | null;
    enabled?: boolean | null;
  }): Promise<{ categories: ThemeTreeNode[] }> {
    const response = await api.get('https://api.promowe.com/Admin/Category/Tree', {
      params: {
        type: 'Theme',
        ...params,
      },
    });
    return response;
  }

  /**
   * Load children for a specific node
   * GET /Admin/Category/Tree with parentId
   */
  static async loadChildren(parentId: number): Promise<{ categories: ThemeTreeNode[] }> {
    return this.getThemeTree({ parentId });
  }

  /**
   * Search themes
   * GET /Admin/Category/Tree with search
   */
  static async searchThemes(search: string): Promise<{ categories: ThemeTreeNode[] }> {
    return this.getThemeTree({ search });
  }
}
