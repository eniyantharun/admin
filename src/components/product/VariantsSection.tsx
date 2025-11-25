'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, X, Star, Loader2 } from 'lucide-react';
import { VariantTab } from './VariantTab';
import { useApi } from '@/hooks/useApi';

interface Variant {
  id: number;
  name: string;
}

interface VariantsSectionProps {
  variants: Variant[];
  productId: number;
  primaryPriceTableId: string | null;
  onVariantsChange: (variants: Variant[]) => void;
  onPrimaryChange: (tableId: string) => void;
}

export function VariantsSection({
  variants,
  productId,
  primaryPriceTableId,
  onVariantsChange,
  onPrimaryChange,
}: VariantsSectionProps) {
  const { post, get } = useApi();
  const [activeVariantId, setActiveVariantId] = useState(variants[0]?.id || null);
  const [removing, setRemoving] = useState<{ [key: number]: boolean }>({});
  const [showRemoveModal, setShowRemoveModal] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = variants.findIndex((v) => v.id.toString() === active.id);
      const newIndex = variants.findIndex((v) => v.id.toString() === over.id);

      const reorderedVariants = arrayMove(variants, oldIndex, newIndex);
      onVariantsChange(reorderedVariants);

      // Save order to server
      try {
        await post('/Admin/ProductEditor/ReorderProductVariants', {
          productId,
          variantIds: reorderedVariants.map((v) => v.id),
        });
      } catch (error) {
        console.error('Failed to reorder variants:', error);
        // Revert on error
        onVariantsChange(variants);
      }
    }
  };

  const handleAddVariant = async () => {
    try {
      const response = await post<{ variantId: number }>('/Admin/ProductEditor/AddProductVariant', {
        productId,
      });

      if (!response) return;

      // Fetch updated product to get the new variant
      const productDetails = await get<any>(`/Admin/ProductEditor/GetProductDetail?id=${productId}`);

      if (!productDetails) return;

      const newVariant = productDetails.variants.find((v: any) => v.id === response.variantId);

      if (newVariant) {
        const updatedVariants = [...variants, newVariant];
        onVariantsChange(updatedVariants);
        setActiveVariantId(response.variantId);
      }
    } catch (error) {
      console.error('Failed to add variant:', error);
    }
  };

  const handleRemoveVariant = (variantId: number) => {
    // Prevent removing if it's the only variant
    if (variants.length === 1) {
      return;
    }

    // Prevent removing primary variant (would need to check if this variant has the primary method)
    setShowRemoveModal(variantId);
  };

  const confirmRemove = async () => {
    if (showRemoveModal === null) return;

    setRemoving({ ...removing, [showRemoveModal]: true });

    try {
      await post('/Admin/ProductEditor/RemoveProductVariant', {
        variantId: showRemoveModal,
      });

      const updatedVariants = variants.filter((v) => v.id !== showRemoveModal);
      onVariantsChange(updatedVariants);

      // Switch to first variant if we removed the active one
      if (activeVariantId === showRemoveModal && updatedVariants.length > 0) {
        setActiveVariantId(updatedVariants[0].id);
      }
    } catch (error) {
      console.error('Failed to remove variant:', error);
    } finally {
      setRemoving({ ...removing, [showRemoveModal]: false });
      setShowRemoveModal(null);
    }
  };

  const handleVariantChange = (variantId: number, data: any) => {
    const updatedVariants = variants.map((v) =>
      v.id === variantId ? { ...v, name: data.name || v.name } : v
    );
    onVariantsChange(updatedVariants);
  };

  // Get all SKUs for autocomplete
  const allVariantSkus: string[] = []; // This would need to be fetched or passed as prop

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Prices & Variants</h3>
      </div>

      <div className="p-6">
        {/* Variant Tabs with Drag & Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={variants.map((v) => v.id.toString())}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-t-lg border border-gray-300 border-b-0">
              {variants.map((variant) => (
                <DraggableVariantTab
                  key={variant.id}
                  variant={variant}
                  isActive={activeVariantId === variant.id}
                  isRemoving={removing[variant.id]}
                  canRemove={variants.length > 1}
                  onClick={() => setActiveVariantId(variant.id)}
                  onRemove={() => handleRemoveVariant(variant.id)}
                />
              ))}

              <button
                onClick={handleAddVariant}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Variant</span>
              </button>
            </div>
          </SortableContext>
        </DndContext>

        {/* Active Variant Content */}
        {activeVariantId && (
          <VariantTab
            variantId={activeVariantId}
            productId={productId}
            primaryPriceTableId={primaryPriceTableId}
            allVariantSkus={allVariantSkus}
            onVariantChange={handleVariantChange}
            onPrimaryChange={onPrimaryChange}
          />
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Remove Variant</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this variant? This will also remove all associated
              decoration methods and pricing. This action cannot be undone.
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

// Draggable Variant Tab Component
interface DraggableVariantTabProps {
  variant: Variant;
  isActive: boolean;
  isRemoving: boolean;
  canRemove: boolean;
  onClick: () => void;
  onRemove: () => void;
}

function DraggableVariantTab({
  variant,
  isActive,
  isRemoving,
  canRemove,
  onClick,
  onRemove,
}: DraggableVariantTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: variant.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex items-center gap-2 px-4 py-2 cursor-move select-none rounded-t-md border border-gray-300 ${
        isActive
          ? 'bg-white border-b-white -mb-px z-10'
          : 'bg-gray-50 hover:bg-gray-100 border-b-gray-300'
      }`}
      onClick={onClick}
    >
      <span className={variant.name ? '' : 'italic text-gray-400'}>
        {variant.name || 'No name'}
      </span>
      {isRemoving && <Loader2 className="w-4 h-4 animate-spin" />}
      {canRemove && !isRemoving && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
