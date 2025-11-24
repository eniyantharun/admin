/**
 * BulkActionsToolbar Component
 * Toolbar for bulk product operations
 */

'use client';

import { useState } from 'react';
import { Trash2, Eye, EyeOff, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkEnable: () => void;
  onBulkDisable: () => void;
  onBulkCategory?: () => void;
  loading?: boolean;
}

/**
 * Displays bulk actions toolbar when products are selected
 *
 * @example
 * ```tsx
 * <BulkActionsToolbar
 *   selectedCount={5}
 *   onClearSelection={clearSelection}
 *   onBulkDelete={bulkDelete}
 *   onBulkEnable={bulkEnable}
 *   onBulkDisable={bulkDisable}
 * />
 * ```
 */
export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkEnable,
  onBulkDisable,
  onBulkCategory,
  loading = false,
}: BulkActionsToolbarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 5000); // Auto-hide after 5s
      return;
    }
    onBulkDelete();
    setShowDeleteConfirm(false);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Selection count */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {selectedCount} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onBulkEnable}
              disabled={loading}
              iconPosition="left"
            >
              <Eye className="w-4 h-4" />
              Enable
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onBulkDisable}
              disabled={loading}
              iconPosition="left"
            >
              <EyeOff className="w-4 h-4" />
              Disable
            </Button>

            {onBulkCategory && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onBulkCategory}
                disabled={loading}
                iconPosition="left"
              >
                <Tag className="w-4 h-4" />
                Category
              </Button>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              iconPosition="left"
            >
              <Trash2 className="w-4 h-4" />
              {showDeleteConfirm ? 'Confirm Delete?' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
