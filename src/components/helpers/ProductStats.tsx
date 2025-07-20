import React from 'react';
import { Package, BarChart3 } from 'lucide-react';

interface ProductStatsProps {
  totalProducts: number;
  enabledProducts: number;
  label?: string;
  showPercentage?: boolean;
}

export const ProductStats: React.FC<ProductStatsProps> = ({ 
  totalProducts, 
  enabledProducts, 
  label = 'products',
  showPercentage = true
}) => {
  const enabledPercentage = totalProducts > 0 ? Math.round((enabledProducts / totalProducts) * 100) : 0;

  return (
    <div className="product-stats text-xs text-gray-600">
      <div className="flex items-center gap-2 mb-1">
        <Package className="w-3 h-3 text-gray-400" />
        <span>{totalProducts} {label}</span>
      </div>
      <div className="flex items-center gap-2">
        <BarChart3 className="w-3 h-3 text-green-400" />
        <span>
          {enabledProducts} enabled
          {showPercentage && ` (${enabledPercentage}%)`}
        </span>
      </div>
    </div>
  );
};