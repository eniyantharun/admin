import React from 'react';
import { FileText, Package, DollarSign, Truck, Building } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface PurchaseOrderSectionProps {
  orderDetails: any;
}

export const PurchaseOrderSection: React.FC<PurchaseOrderSectionProps> = ({ orderDetails }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <FileText className="w-5 h-5 text-purple-500" />
        Purchase Order Information
      </h3>

      <div className="space-y-4">
        {orderDetails.purchaseOrders && orderDetails.purchaseOrders.length > 0 ? (
          orderDetails.purchaseOrders.map((po: any) => (
            <Card key={po.id} className="p-4 bg-gray-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-gray-900">
                      {po.supplier?.companyName}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">PO #{po.id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Line Items</span>
                    <span className="text-sm font-medium text-gray-900">
                      {po.lineItemsCount || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Products</span>
                    <span className="text-sm font-medium text-gray-900">
                      {po.productCount || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Custom Items</span>
                    <span className="text-sm font-medium text-gray-900">
                      {po.customCount || 0}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <div>
                      <span className="text-xs text-gray-600">Shipping Cost</span>
                      <p className="text-sm font-medium text-gray-900">
                        ${po.form?.shippingCost?.toFixed(2) || '0.00'}
                        {!po.isDefaultShippingCost && (
                          <span className="text-xs text-gray-500 ml-1">(Custom)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {po.defaultShippingCost && (
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="text-xs text-gray-600">Default Rate</span>
                        <p className="text-sm font-medium text-gray-900">
                          ${po.defaultShippingCost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {po.supplier && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 space-y-1">
                      {po.supplier.emailAddress && (
                        <p>Email: {po.supplier.emailAddress}</p>
                      )}
                      {po.supplier.telephoneNumber && (
                        <p>Phone: {po.supplier.telephoneNumber}</p>
                      )}
                      {po.supplier.webUrl && (
                        <p>Website: {po.supplier.webUrl}</p>
                      )}
                    </div>
                  </div>
                )}

                {po.notes?.documentId && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <FileText className="w-3 h-3" />
                      <span>Notes available (Last edited: {new Date(po.notes.lastEditedAt).toLocaleDateString()})</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No purchase orders available</p>
          </div>
        )}
      </div>
    </Card>
  );
};