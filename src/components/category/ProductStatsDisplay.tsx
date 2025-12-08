'use client';

import { useEffect, useState } from 'react';
import { CategoryStatsService } from '@/lib/services/category';
import type { CategoryDetailedStats } from '@/types/api/category';

interface ProductStatsDisplayProps {
  categoryId: number;
}

export function ProductStatsDisplay({ categoryId }: ProductStatsDisplayProps) {
  const [stats, setStats] = useState<CategoryDetailedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await CategoryStatsService.getCategoryDetailedStats(categoryId);
        setStats(data);
      } catch (error) {
        console.error('Failed to load category stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading product count...
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-3 text-sm">
      {/* Subcategories Count */}
      <div className="border-b border-gray-200 pb-3">
        <p className="text-gray-700">
          <span className="font-medium">Subcategories Count:</span>{' '}
          <span className="text-gray-900">{stats.categoryCount} direct</span>
          {' / '}
          <span className="text-gray-900">{stats.subcategoryCount} indirect</span>
        </p>
      </div>

      {/* Direct Product Count */}
      <div className="border-b border-gray-200 pb-3">
        <p className="text-gray-700 mb-1">
          <span className="font-medium">Direct Product Count</span>
        </p>
        <p className="text-gray-600 ml-4">
          E / D / B:{' '}
          <span className="font-semibold text-green-600">{stats.directStats.Enabled}</span>
          {' / '}
          <span className="font-semibold text-gray-500">{stats.directStats.Disabled}</span>
          {' / '}
          <span className="font-semibold text-red-600">{stats.directStats.Blacklisted}</span>
        </p>
      </div>

      {/* Products in category and subcategories */}
      <div className="border-b border-gray-200 pb-3">
        <p className="text-gray-700 mb-1">
          <span className="font-medium">Products in category and subcategories</span>
        </p>
        <p className="text-gray-600 ml-4">
          E / D / B:{' '}
          <span className="font-semibold text-green-600">{stats.indirectStats.Enabled}</span>
          {' / '}
          <span className="font-semibold text-gray-500">{stats.indirectStats.Disabled}</span>
          {' / '}
          <span className="font-semibold text-red-600">{stats.indirectStats.Blacklisted}</span>
        </p>
      </div>

      {/* Exclusive / Non-Exclusive */}
      <div className="border-b border-gray-200 pb-3">
        <p className="text-gray-700 mb-1">
          <span className="font-medium">Exclusive (Enabled)</span>
        </p>
        <p className="text-gray-600 ml-4">
          Yes / No:{' '}
          <span className="font-semibold text-blue-600">{stats.exclusiveSubcategoryProductCount}</span>
          {' / '}
          <span className="font-semibold text-gray-600">{stats.nonExclusiveSubcategoryProductCount}</span>
        </p>
      </div>

      {/* Subcategory Status */}
      <div>
        <p className="text-gray-700 mb-1">
          <span className="font-medium">Subcategory</span>
        </p>
        <p className="text-gray-600 ml-4">
          Enabled / Disabled:{' '}
          <span className="font-semibold text-green-600">{stats.categoryCount}</span>
          {' / '}
          <span className="font-semibold text-gray-500">
            {stats.subcategoryCount - stats.categoryCount}
          </span>
        </p>
      </div>
    </div>
  );
}
