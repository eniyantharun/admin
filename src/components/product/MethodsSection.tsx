'use client';

import React, { useState } from 'react';
import { Plus, X, Star, Loader2 } from 'lucide-react';
import { DecorationMethodForm } from './DecorationMethodForm';
import { useApi } from '@/hooks/useApi';

interface DecorationMethod {
  id: number;
  name: string;
}

interface PriceTable {
  id: string;
  variantId: number;
  method: DecorationMethod;
  general: any;
  tierPrices: any;
  status: string;
}

interface MethodsSectionProps {
  tables: PriceTable[];
  productId: number;
  variantId: number;
  primaryPriceTableId: string | null;
  onTablesChange: (tables: PriceTable[]) => void;
  onPrimaryChange: (tableId: string) => void;
}

export function MethodsSection({
  tables,
  productId,
  variantId,
  primaryPriceTableId,
  onTablesChange,
  onPrimaryChange,
}: MethodsSectionProps) {
  const { post, get } = useApi();
  const [activeTableId, setActiveTableId] = useState(tables[0]?.id || null);
  const [removing, setRemoving] = useState<{ [key: string]: boolean }>({});
  const [showRemoveModal, setShowRemoveModal] = useState<string | null>(null);

  const activeTable = tables.find((t) => t.id === activeTableId);

  const handleAddMethod = async () => {
    try {
      const response = await post<{ tableId: string }>('/Admin/ProductEditor/AddPriceTable', {
        variantId,
      });

      if (!response) return;

      // Fetch the new table details
      const variantDetails = await get<any>(
        `/Admin/ProductEditor/GetProductVariantDetails?variantId=${variantId}`
      );

      if (!variantDetails) return;

      const newTable = variantDetails.tables.find((t: any) => t.id === response.tableId);
      if (newTable) {
        const updatedTables = [...tables, newTable];
        onTablesChange(updatedTables);
        setActiveTableId(response.tableId);
      }
    } catch (error) {
      console.error('Failed to add method:', error);
    }
  };

  const handleRemoveMethod = async (tableId: string) => {
    setShowRemoveModal(tableId);
  };

  const confirmRemove = async () => {
    if (!showRemoveModal) return;

    setRemoving({ ...removing, [showRemoveModal]: true });

    try {
      await post('/Admin/ProductEditor/RemovePriceTable', {
        tableId: showRemoveModal,
      });

      const updatedTables = tables.filter((t) => t.id !== showRemoveModal);
      onTablesChange(updatedTables);

      // Switch to first tab if we removed the active tab
      if (activeTableId === showRemoveModal && updatedTables.length > 0) {
        setActiveTableId(updatedTables[0].id);
      }
    } catch (error) {
      console.error('Failed to remove method:', error);
    } finally {
      setRemoving({ ...removing, [showRemoveModal]: false });
      setShowRemoveModal(null);
    }
  };

  return (
    <div className="mt-4">
      {/* Method Tabs */}
      <div className="flex items-center gap-2 bg-white border-b border-gray-300">
        {tables.map((table) => {
          const isActive = activeTableId === table.id;
          const isPrimary = primaryPriceTableId === table.id;
          const isRemoving = removing[table.id];

          return (
            <div
              key={table.id}
              className={`relative flex items-center gap-2 px-4 py-2 cursor-pointer border-t border-l border-r select-none ${
                isActive
                  ? 'bg-gray-100 border-gray-300 -mb-px'
                  : 'bg-white border-transparent hover:bg-gray-50'
              }`}
              onClick={() => setActiveTableId(table.id)}
            >
              <span className={table.method.name ? '' : 'italic text-gray-400'}>
                {table.method.name || 'No name'}
              </span>
              {isRemoving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPrimary && !isRemoving && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              )}
              {tables.length > 1 && !isPrimary && !isRemoving && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMethod(table.id);
                  }}
                  className="hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={handleAddMethod}
          className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Method</span>
        </button>
      </div>

      {/* Active Method Content */}
      {activeTable && (
        <DecorationMethodForm
          table={activeTable}
          productId={productId}
          isPrimary={primaryPriceTableId === activeTable.id}
          onPrimaryChange={() => onPrimaryChange(activeTable.id)}
          onMethodChange={(method) => {
            // Update the method name in the table
            const updatedTables = tables.map((t) =>
              t.id === activeTable.id ? { ...t, method } : t
            );
            onTablesChange(updatedTables);
          }}
        />
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Remove Decoration Method</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this decoration method? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRemoveModal(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
