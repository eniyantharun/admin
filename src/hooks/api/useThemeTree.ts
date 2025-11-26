import { useState, useEffect, useCallback } from 'react';
import { ThemeListService } from '@/lib/services/theme';
import type { ThemeTreeNode } from '@/types/api/theme';

export function useThemeTree(params?: {
  website?: string;
  search?: string;
  enabled?: boolean | null;
}) {
  const [tree, setTree] = useState<ThemeTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const fetchTree = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ThemeListService.getThemeTree(params);
      setTree(response.categories);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch theme tree:', err);
    } finally {
      setLoading(false);
    }
  }, [params?.website, params?.search, params?.enabled]);

  const loadChildren = useCallback(async (themeId: number) => {
    try {
      const response = await ThemeListService.loadChildren(themeId);

      // Update tree with loaded children
      setTree(prevTree => {
        const updateNode = (nodes: ThemeTreeNode[]): ThemeTreeNode[] => {
          return nodes.map(node => {
            if (node.id === themeId) {
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
      setExpandedNodes(prev => new Set(prev).add(themeId));
    } catch (err) {
      console.error('Failed to load children:', err);
      throw err;
    }
  }, []);

  const toggleNode = useCallback((themeId: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(themeId)) {
        newSet.delete(themeId);
      } else {
        newSet.add(themeId);
      }
      return newSet;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const expandAll = useCallback(() => {
    const allIds = new Set<number>();
    const collectIds = (nodes: ThemeTreeNode[]) => {
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
