'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Loader2, Check, X } from 'lucide-react';
import type { CategoryTreeNode as CategoryTreeNodeType, CategoryStats } from '@/types/api/category';

interface CategoryTreeNodeProps {
  node: CategoryTreeNodeType;
  statsMap: Record<number, CategoryStats>;
  expandedNodes: Set<number>;
  selectedCategoryId?: number | null;
  onToggle: (categoryId: number, node: CategoryTreeNodeType) => void;
  onSelect: (categoryId: number) => void;
  onToggleEnabled: (categoryId: number, enabled: boolean) => void;
  level: number;
}

export function CategoryTreeNode({
  node,
  statsMap,
  expandedNodes,
  selectedCategoryId,
  onToggle,
  onSelect,
  onToggleEnabled,
  level,
}: CategoryTreeNodeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const hasChildren = node.hasChildren || node.children?.length > 0;
  const paddingLeft = level * 24;
  const stats = statsMap[node.id];
  const expanded = expandedNodes.has(node.id);
  const selected = selectedCategoryId === node.id;

  const handleToggle = async () => {
    setIsLoading(true);
    await onToggle(node.id, node);
    setIsLoading(false);
  };

  return (
    <div className="border-b border-gray-100">
      {/* Node row */}
      <div
        className={`grid grid-cols-12 gap-4 items-center py-2 px-3 hover:bg-gray-50 transition-colors ${
          selected ? 'bg-blue-50' : ''
        }`}
      >
        {/* Name column with expand button */}
        <div className="col-span-4 flex items-center gap-1" style={{ paddingLeft: `${paddingLeft}px` }}>
          <button
            onClick={handleToggle}
            className={`p-0.5 hover:bg-gray-200 rounded ${!hasChildren ? 'invisible' : ''}`}
            type="button"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            ) : expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
          <span
            onClick={() => onSelect(node.id)}
            className="text-sm text-gray-900 cursor-pointer hover:text-blue-600"
          >
            {node.name}
          </span>
        </div>

        {/* Product Count (E/D/B) */}
        <div className="col-span-2 text-center text-sm">
          {stats ? (
            <span className="text-gray-700">
              {stats.enabledProducts} / {stats.disabledProducts} / {stats.blacklistedProducts}
            </span>
          ) : (
            <Loader2 className="w-3 h-3 animate-spin text-gray-400 mx-auto" />
          )}
        </div>

        {/* Exclusive (Yes/No) */}
        <div className="col-span-2 text-center text-sm text-gray-700">
          {stats ? `${stats.enabledProducts || 0} / ${stats.totalProducts - stats.enabledProducts || 0}` : '-'}
        </div>

        {/* Subcategory (Enabled/Disabled) */}
        <div className="col-span-2 text-center text-sm text-gray-700">
          {stats ? `${stats.enabledSubcategories || 0} / ${stats.disabledSubcategories || 0}` : '-'}
        </div>

        {/* Enabled checkbox with tick/cross */}
        <div className="col-span-2 flex items-center justify-center gap-2">
          <button
            onClick={() => onToggleEnabled(node.id, !node.enabled)}
            className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
              node.enabled
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white border-gray-300 text-gray-400'
            }`}
            type="button"
          >
            {node.enabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Children (recursive) */}
      {expanded && node.children.length > 0 && (
        <div>
          {node.children.map(child => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              statsMap={statsMap}
              expandedNodes={expandedNodes}
              selectedCategoryId={selectedCategoryId}
              onToggle={onToggle}
              onSelect={onSelect}
              onToggleEnabled={onToggleEnabled}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
