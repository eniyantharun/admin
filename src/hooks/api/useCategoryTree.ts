import { useState, useEffect, useCallback } from 'react';
import { CategoryListService } from '@/lib/services/category';
import type { CategoryTreeNode } from '@/types/api/category';

export function useCategoryTree(params?: {
  website?: string;
  search?: string;
  enabled?: boolean | null;
}) {
  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const fetchTree = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await CategoryListService.getCategoryTree(params);
      setTree(response.categories);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch category tree:', err);
    } finally {
      setLoading(false);
    }
  }, [params?.website, params?.search, params?.enabled]);

  const loadChildren = useCallback(async (categoryId: number) => {
    try {
      const response = await CategoryListService.loadChildren(categoryId);

      // Update tree with loaded children
      setTree(prevTree => {
        const updateNode = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
          return nodes.map(node => {
            if (node.id === categoryId) {
              return {
                ...node,
                children: response.categories,
                childrenLoaded: true,
              };
            }
            if (node.children?.length > 0) {
              return {
                ...node,
                children: updateNode(node.children),
              };
            }
            return node;
          });
        };

        return updateNode(prevTree);
      });

      // Auto-expand the node
      setExpandedNodes(prev => new Set(prev).add(categoryId));
    } catch (err) {
      console.error('Failed to load children:', err);
      throw err;
    }
  }, []);

  const toggleNode = useCallback((categoryId: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const expandAll = useCallback(() => {
    const allIds = new Set<number>();
    const collectIds = (nodes: CategoryTreeNode[]) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        if (node.children?.length > 0) {
          collectIds(node.children);
        }
      });
    };
    collectIds(tree);
    setExpandedNodes(allIds);
  }, [tree]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return {
    tree,
    loading,
    error,
    refetch: fetchTree,
    loadChildren,
    expandedNodes,
    toggleNode,
    collapseAll,
    expandAll,
  };
}
