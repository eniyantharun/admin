import React from 'react';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LineItemCard } from '@/components/ui/LineItemCard';
import { LineItemData, SaleSummary } from '@/types/quotes';

interface QuoteItemsStepProps {
  lineItems: LineItemData[];
  isLoadingLineItems: boolean;
  saleSummary: SaleSummary | null;
  onAddEmptyLineItem: () => Promise<void>;
  onUpdateLineItem: (itemId: string, updatedItem: LineItemData) => Promise<void>;
  onRemoveLineItem: (itemId: string) => Promise<void>;
  onRefreshSummary: () => Promise<void>;
  currentSaleId: string;
}

export const QuoteItemsStep: React.FC<QuoteItemsStepProps> = ({
  lineItems,
  isLoadingLineItems,
  saleSummary,
  onAddEmptyLineItem,
  onUpdateLineItem,
  onRemoveLineItem,
  onRefreshSummary,
  currentSaleId
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
          <Package className="w-5 h-5 text-purple-500" />
          Quote Items
        </h3>
        <Button
          onClick={onAddEmptyLineItem}
          variant="secondary"
          size="sm"
          icon={Plus}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none"
          disabled={isLoadingLineItems}
        >
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {isLoadingLineItems ? (
          <Card className="p-6 text-center">
            <div className="w-6 h-6 mx-auto mb-2 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
            <p className="text-sm text-gray-500">Loading items...</p>
          </Card>
        ) : lineItems.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 border-gray-300">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-4">No items added to this quote yet</p>
            <Button
              onClick={onAddEmptyLineItem}
              variant="primary"
              size="sm"
              icon={Plus}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Add First Item
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <LineItemCard
                key={item.id}
                item={item}
                index={index}
                saleId={currentSaleId}
                onRemove={onRemoveLineItem}
                onUpdate={onUpdateLineItem}
                onRefreshSummary={onRefreshSummary}
                isNew={false}
              />
            ))}
          </div>
        )}

        {saleSummary && !isLoadingLineItems && lineItems.length > 0 && (
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-blue-800">Quote Summary</span>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">
                  ${saleSummary.customerSummary.total.toFixed(2)}
                </div>
                <div className="text-xs text-blue-600">
                  {lineItems.length} item{lineItems.length !== 1 ? 's' : ''} • Profit: ${saleSummary.profit.toFixed(2)}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
};