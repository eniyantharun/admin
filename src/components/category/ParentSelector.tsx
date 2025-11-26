'use client';

import { useState, useEffect } from 'react';
import { CategoryListService } from '@/lib/services/category';
import type { CategoryTreeNode } from '@/types/api/category';
import { ChevronRight, ChevronDown, X } from 'lucide-react';

interface ParentSelectorProps {
  currentCategoryId?: number;
  selectedParentId: number | null;
  onParentChange: (parentId: number | null, parentName: string | null) => void;
}

export function ParentSelector({
  currentCategoryId,
  selectedParentId,
  onParentChange,
}: ParentSelectorProps) {
  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedParentName, setSelectedParentName] = useState<string | null>(null);

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    try {
      setLoading(true);
      const result = await CategoryListService.getCategoryTree({});
      setTree(result.categories);
    } catch (error) {
      console.error('Failed to load category tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildren = async (node: CategoryTreeNode) => {
    if (node.childrenLoaded || !node.hasChildren) return;

    try {
      const result = await CategoryListService.loadChildren(node.id);
      updateNodeChildren(tree, node.id, result.categories);
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  };

  const updateNodeChildren = (
    nodes: CategoryTreeNode[],
    nodeId: number,
    children: CategoryTreeNode[]
  ): void => {
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, children, childrenLoaded: true };
      }
      if (node.children.length > 0) {
        return { ...node, children: updateNodeChildrenRecursive(node.children, nodeId, children) };
      }
      return node;
    });
    setTree(updatedNodes);
  };

  const updateNodeChildrenRecursive = (
    nodes: CategoryTreeNode[],
    nodeId: number,
    children: CategoryTreeNode[]
  ): CategoryTreeNode[] => {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, children, childrenLoaded: true };
      }
      if (node.children.length > 0) {
        return { ...node, children: updateNodeChildrenRecursive(node.children, nodeId, children) };
      }
      return node;
    });
  };

  const toggleNode = async (node: CategoryTreeNode) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(node.id)) {
      newExpanded.delete(node.id);
    } else {
      newExpanded.add(node.id);
      await loadChildren(node);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSelect = (node: CategoryTreeNode) => {
    if (node.id === currentCategoryId) return; // Can't select self as parent
    setSelectedParentName(node.name);
    onParentChange(node.id, node.name);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSelectedParentName(null);
    onParentChange(null, null);
  };

  const isDescendant = (node: CategoryTreeNode, targetId: number): boolean => {
    if (node.id === targetId) return true;
    return node.children.some(child => isDescendant(child, targetId));
  };

  const renderNode = (node: CategoryTreeNode, level: number = 0): JSX.Element | null => {
    // Don't show current category or its descendants
    if (currentCategoryId && (node.id === currentCategoryId || isDescendant(node, currentCategoryId))) {
      return null;
    }

    const expanded = expandedNodes.has(node.id);
    const hasChildren = node.hasChildren || node.children.length > 0;
    const paddingLeft = level * 20;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 cursor-pointer ${
            selectedParentId === node.id ? 'bg-blue-50' : ''
          }`}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleNode(node);
            }}
            className={`p-0.5 ${!hasChildren ? 'invisible' : ''}`}
          >
            {expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
          <div
            onClick={() => handleSelect(node)}
            className="flex-1 text-sm"
          >
            {node.name}
          </div>
        </div>
        {expanded && node.children.length > 0 && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Parent Category
      </label>

      <div className="relative">
        <div
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white flex items-center justify-between"
        >
          <span className={selectedParentName ? 'text-gray-900' : 'text-gray-400'}>
            {selectedParentName || 'Select parent category...'}
          </span>
          {selectedParentName && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : tree.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No categories found</div>
            ) : (
              <div className="py-1">
                <div
                  onClick={handleClear}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-500 italic"
                >
                  No parent category
                </div>
                {tree.map(node => renderNode(node))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedParentName && (
        <p className="text-xs text-gray-600 mt-1">
          Selected parent: <span className="font-medium">{selectedParentName}</span>
        </p>
      )}

      {currentCategoryId && selectedParentId && selectedParentId !== currentCategoryId && (
        <p className="text-xs text-orange-600 mt-1">
          ⚠️ Changing the parent requires full reindex of products
        </p>
      )}
    </div>
  );
}
