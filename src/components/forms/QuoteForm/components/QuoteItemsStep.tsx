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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 text-sm">Quote Items</h4>
        <Button
          onClick={onAddEmptyLineItem}
          variant="secondary"
          size="sm"
          icon={Plus}
          className="h-7 text-xs px-2"
          disabled={isLoadingLineItems}
        >
          Add Item
        </Button>
      </div>

      {isLoadingLineItems ? (
        <Card className="p-4 text-center">
          <div className="w-6 h-6 mx-auto mb-2 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
          <p className="text-xs text-gray-500">Loading...</p>
        </Card>
      ) : lineItems.length === 0 ? (
        <Card className="p-4 text-center border-dashed">
          <Package className="w-6 h-6 mx-auto text-gray-400 mb-2" />
          <p className="text-xs text-gray-500 mb-2">No items added</p>
          <Button
            onClick={onAddEmptyLineItem}
            variant="secondary"
            size="sm"
            icon={Plus}
            className="text-xs"
          >
            Add First Item
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
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

      {saleSummary && !isLoadingLineItems && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800">Quote Summary</span>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
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
  );
};