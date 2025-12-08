import api from '@/lib/api';
import type { ThemeStats, ThemeDetailedStats } from '@/types/api/theme';

export class ThemeStatsService {
  /**
   * Get stats for multiple themes
   * GET /Admin/Categories/GetCategoriesStats
   */
  static async getThemesStats(
    themeIds: number[]
  ): Promise<Record<number, ThemeStats>> {
    const response = await api.get('https://api.promowe.com/Admin/Categories/GetCategoriesStats', {
      params: { ids: themeIds },
    });

    // Transform response into map
    const statsMap: Record<number, ThemeStats> = {};

    Object.entries(response.products || {}).forEach(([id, counts]: [string, any]) => {
      const themeId = parseInt(id);
      statsMap[themeId] = {
        categoryId: themeId,
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
      const themeId = parseInt(id);
      if (statsMap[themeId]) {
        statsMap[themeId].disabledSubcategories = counts[0] || 0;
        statsMap[themeId].enabledSubcategories = counts[1] || 0;
        statsMap[themeId].totalSubcategories = (counts[0] || 0) + (counts[1] || 0);
      }
    });

    return statsMap;
  }

  /**
   * Get stats for single theme
   * GET /Admin/CategoryEditor/GetCategoryStats
   */
  static async getThemeStats(themeId: number): Promise<ThemeStats> {
    const response = await api.get('/Admin/CategoryEditor/GetCategoryStats', {
      params: { categoryId: themeId },
    });

    return {
      categoryId: themeId,
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
   * Get detailed stats for theme editor
   * GET /Admin/CategoryEditor/GetCategoryStats
   */
  static async getThemeDetailedStats(themeId: number): Promise<ThemeDetailedStats> {
    const response = await api.get('/Admin/CategoryEditor/GetCategoryStats', {
      params: { categoryId: themeId },
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
