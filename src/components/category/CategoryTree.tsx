'use client';

import { useMemo, useState } from 'react';
import { useCategoryTree } from '@/hooks/api/useCategoryTree';
import { useCategoryStats } from '@/hooks/api/useCategoryStats';
import { useCategoryMutations } from '@/hooks/api/useCategoryMutations';
import { CategoryTreeNode } from './CategoryTreeNode';
import { AddCategoryModal } from './AddCategoryModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Search } from 'lucide-react';

interface CategoryTreeProps {
  onCategorySelect?: (categoryId: number) => void;
  selectedCategoryId?: number | null;
}

export function CategoryTree({ onCategorySelect, selectedCategoryId }: CategoryTreeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [websiteFilter, setWebsiteFilter] = useState<string | undefined>();
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch tree with lazy loading
  const {
    tree,
    loading,
    error,
    refetch,
    loadChildren,
    expandedNodes,
    toggleNode,
  } = useCategoryTree({
    search: searchTerm || undefined,
    website: websiteFilter,
  });

  // Collect visible category IDs for stats loading
  const visibleCategoryIds = useMemo(() => {
    const collectVisible = (nodes: any[], expanded: Set<number>): number[] => {
      const ids: number[] = [];
      nodes.forEach(node => {
        ids.push(node.id);
        if (expanded.has(node.id) && node.children.length > 0) {
          ids.push(...collectVisible(node.children, expanded));
        }
      });
      return ids;
    };
    return collectVisible(tree, expandedNodes);
  }, [tree, expandedNodes]);

  // Load stats only for visible nodes
  const { stats } = useCategoryStats(visibleCategoryIds, {
    enabled: visibleCategoryIds.length > 0,
  });

  // Mutations
  const { toggleEnabled } = useCategoryMutations({
    onSuccess: () => refetch(),
    showToast: true,
  });

  const handleToggleNode = async (categoryId: number, node: any) => {
    // Load children if not loaded
    if (!expandedNodes.has(categoryId) && node.hasChildren && !node.childrenLoaded) {
      await loadChildren(categoryId);
    } else {
      toggleNode(categoryId);
    }
  };

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Failed to load categories: {error.message}</p>
        <Button onClick={refetch} className="mt-4">Retry</Button>
      </Card>
    );
  }

  return (
    <>
      <Card padding="none">
        {/* Header with search and add button */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              icon={Plus}
              variant="primary"
            >
              Add Category
            </Button>
          </div>
        </div>

        {/* Table header */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600">
            <div className="col-span-4">Name</div>
            <div className="col-span-2 text-center">Product Count<br/>E / D / B</div>
            <div className="col-span-2 text-center">Exclusive (Enabled)<br/>Yes / No</div>
            <div className="col-span-2 text-center">Subcategory<br/>Enabled / Disabled</div>
            <div className="col-span-2 text-center">Enabled</div>
          </div>
        </div>

        {/* Tree view */}
        <div className="p-4">
          {loading && tree.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Loading categories...</div>
          ) : tree.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No categories found</div>
          ) : (
            <div>
              {tree.map(node => (
                <CategoryTreeNode
                  key={node.id}
                  node={node}
                  statsMap={stats}
                  expandedNodes={expandedNodes}
                  selectedCategoryId={selectedCategoryId}
                  onToggle={handleToggleNode}
                  onSelect={(categoryId) => onCategorySelect?.(categoryId)}
                  onToggleEnabled={toggleEnabled}
                  level={0}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Add category modal */}
      {showAddModal && (
        <AddCategoryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}
    </>
  );
}
