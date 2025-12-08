import api from '@/lib/api';
import type { CategoryStats, CategoryDetailedStats } from '@/types/api/category';

export class CategoryStatsService {
  /**
   * Get stats for multiple categories
   * GET /Admin/Categories/GetCategoriesStats
   */
  static async getCategoriesStats(
    categoryIds: number[]
  ): Promise<Record<number, CategoryStats>> {
    const response = await api.get('https://api.promowe.com/Admin/Categories/GetCategoriesStats', {
      params: { ids: categoryIds },
    });

    // Transform response into map
    const statsMap: Record<number, CategoryStats> = {};

    Object.entries(response.products || {}).forEach(([id, counts]: [string, any]) => {
      const categoryId = parseInt(id);
      statsMap[categoryId] = {
        categoryId,
        disabledProducts: counts[0] || 0,
        enabledProducts: counts[1] || 0,
        blacklistedProducts: counts[2] || 0,
        totalProducts: (counts[0] || 0) + (counts[1] || 0) + (counts[2] || 0),
        totalSubcategories: 0,
        enabledSubcategories: 0,
        disabledSubcategories: 0,
      };
    });

    Object.entries(response.subcategories || {}).forEach(([id, counts]: [string, any]) => {
      const categoryId = parseInt(id);
      if (statsMap[categoryId]) {
        statsMap[categoryId].disabledSubcategories = counts[0] || 0;
        statsMap[categoryId].enabledSubcategories = counts[1] || 0;
        statsMap[categoryId].totalSubcategories = (counts[0] || 0) + (counts[1] || 0);
      }
    });

    return statsMap;
  }

  /**
   * Get stats for single category
   * GET /Admin/CategoryEditor/GetCategoryStats
   */
  static async getCategoryStats(categoryId: number): Promise<CategoryStats> {
    const response = await api.get('https://api.promowe.com/Admin/CategoryEditor/GetCategoryStats', {
      params: { categoryId },
    });

    return {
      categoryId,
      totalProducts: response.categoryCount || 0,
      enabledProducts: response.directStats?.Enabled || 0,
      disabledProducts: response.directStats?.Disabled || 0,
      blacklistedProducts: response.directStats?.Blacklisted || 0,
      totalSubcategories: response.subcategoryCount || 0,
      enabledSubcategories: 0, // Not provided in this endpoint
      disabledSubcategories: 0,
    };
  }

  /**
   * Get detailed stats for category editor
   * GET /Admin/CategoryEditor/GetCategoryStats
   */
  static async getCategoryDetailedStats(categoryId: number): Promise<CategoryDetailedStats> {
    const response = await api.get('https://api.promowe.com/Admin/CategoryEditor/GetCategoryStats', {
      params: { categoryId },
    });

    return {
      categoryCount: response.categoryCount || 0,
      subcategoryCount: response.subcategoryCount || 0,
      directStats: {
        Enabled: response.directStats?.Enabled || 0,
        Disabled: response.directStats?.Disabled || 0,
        Blacklisted: response.directStats?.Blacklisted || 0,
      },
      indirectStats: {
        Enabled: response.indirectStats?.Enabled || 0,
        Disabled: response.indirectStats?.Disabled || 0,
        Blacklisted: response.indirectStats?.Blacklisted || 0,
      },
      exclusiveSubcategoryProductCount: response.exclusiveSubcategoryProductCount || 0,
      nonExclusiveSubcategoryProductCount: response.nonExclusiveSubcategoryProductCount || 0,
    };
  }
}
