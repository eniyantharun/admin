import React from 'react';
import { FileText, Calendar, DollarSign, ImageIcon, Package, MessageSquare, User, Hash, Activity } from 'lucide-react';
import { iQuote, LineItemData, QuoteDetailsResponse, iQuoteFormData } from '@/types/quotes';
import { iOrder, iOrderFormData } from '@/types/order';
import { QuoteStatus } from '@/lib/enums';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';
import { Card } from '@/components/ui/Card';

type SaleType = 'quote' | 'order';
type SaleData = iQuote | iOrder;
type FormData = iQuoteFormData | iOrderFormData;

interface SaleInformationProps {
  saleType: SaleType;
  sale: SaleData;
  saleDetails: QuoteDetailsResponse;
  lineItems: LineItemData[];
  currentSaleId: string;
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const SaleInformation: React.FC<SaleInformationProps> = ({
  saleType,
  sale,
  saleDetails,
  lineItems,
  currentSaleId,
  formData,
  handleInputChange
}) => {
  const { post } = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  const mapStatusToApi = (status: string): string => {
    if (saleType === 'quote') {
      const statusMap: { [key: string]: string } = {
        [QuoteStatus.NEW_QUOTE]: 'new_quote',
        [QuoteStatus.WAITING_FOR_SUPPLIER]: 'waiting_for_supplier', 
        [QuoteStatus.QUOTE_SENT_TO_CUSTOMER]: 'quote_sent_to_customer',
        [QuoteStatus.ON_HOLD]: 'on_hold',
        [QuoteStatus.QUOTE_CONVERTED_TO_ORDER]: 'quote_converted_to_order',
        [QuoteStatus.CONVERTED_TO_ORDER_BY_CUSTOMER]: 'converted_to_order_by_customer',
        [QuoteStatus.CANCELLED]: 'cancelled'
      };
      return statusMap[status] || status;
    } else {
      const statusMap: { [key: string]: string } = {
        'new': 'new_order',
        'in-production': 'in_production',
        'shipped': 'shipped',
        'delivered': 'delivered',
        'cancelled': 'cancelled'
      };
      return statusMap[status] || status;
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    
    handleInputChange(e);
    
    if (sale?.id) {
      try {
        showToast.loading(`Updating ${saleType} status...`);
        
        const endpoint = saleType === 'quote' ? 
          '/Admin/SaleEditor/SetQuoteDetail' :
          '/Admin/SaleEditor/SetOrderDetail';
        
        await post(endpoint, {
          id: sale.id,
          status: mapStatusToApi(newStatus) 
        });
        
        showToast.dismiss();
        showToast.success(`${saleType === 'quote' ? 'Quote' : 'Order'} status updated successfully`);
      } catch (error) {
        showToast.dismiss();
        showToast.error(`Failed to update ${saleType} status`);
        console.error(`Error updating ${saleType} status:`, error);
        
        const revertEvent = {
          target: {
            name: 'status',
            value: formData.status 
          }
        } as React.ChangeEvent<HTMLSelectElement>;
        handleInputChange(revertEvent);
      }
    }
  };

  const getStatusColor = (status: string) => {
    if (saleType === 'quote') {
      switch (status) {
        case 'new-quote':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'quote-sent-to-customer':
          return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'quote-converted-to-order':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else {
      switch (status) {
        case 'new':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'in-production':
          return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'shipped':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'delivered':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const getStatusLabel = (status: string) => {
    if (saleType === 'quote') {
      switch (status) {
        case 'new-quote':
          return 'New Quote';
        case 'quote-sent-to-customer':
          return 'Sent to Customer';
        case 'quote-converted-to-order':
          return 'Converted to Order';
        case 'cancelled':
          return 'Cancelled';
        default:
          return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    } else {
      switch (status) {
        case 'new':
          return 'New Order';
        case 'in-production':
          return 'In Production';
        case 'shipped':
          return 'Shipped';
        case 'delivered':
          return 'Delivered';
        case 'cancelled':
          return 'Cancelled';
        default:
          return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }
  };

  const getStatusOptions = () => {
    if (saleType === 'quote') {
      return [
        { value: QuoteStatus.NEW_QUOTE, label: "New Quote" },
        { value: QuoteStatus.WAITING_FOR_SUPPLIER, label: "Waiting for Supplier" },
        { value: QuoteStatus.QUOTE_SENT_TO_CUSTOMER, label: "Quote Sent to Customer" },
        { value: QuoteStatus.ON_HOLD, label: "On Hold" },
        { value: QuoteStatus.QUOTE_CONVERTED_TO_ORDER, label: "Quote Converted to Order" },
        { value: QuoteStatus.CONVERTED_TO_ORDER_BY_CUSTOMER, label: "Converted to Order by Customer" },
        { value: QuoteStatus.CANCELLED, label: "Cancelled" }
      ];
    } else {
      return [
        { value: "new", label: "New Order" },
        { value: "in-production", label: "In Production" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" }
      ];
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-500" />
          {saleType === 'quote' ? 'Quote' : 'Order'} Information
        </h3>
        
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(formData.status)}`}>
            <Activity className="w-4 h-4 mr-2" />
            {getStatusLabel(formData.status)}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="p-4 bg-white/70 backdrop-blur-sm">
            <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-500" />
              {saleType === 'quote' ? 'Quote' : 'Order'} Details
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{saleType === 'quote' ? 'Quote' : 'Order'} Number:</span>
                <span className="font-medium text-gray-900">#{saleType === 'quote' ? (sale as iQuote).quoteNumber : (sale as iOrder).orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-900">{new Date(sale.dateTime).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer Total:</span>
                <span className="font-bold text-green-600 text-lg">
                  ${sale.customerTotal.toFixed(2)}
                </span>
              </div>
              {saleType === 'order' && 'supplierTotal' in sale && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Supplier Total:</span>
                  <span className="font-medium text-gray-900">
                    ${(sale as iOrder).supplierTotal.toFixed(2)}
                  </span>
                </div>
              )}
              {sale.inHandDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In-Hand Date:</span>
                  <span className="font-medium text-blue-600">{sale.inHandDate}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4 bg-white/70 backdrop-blur-sm">
            <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-green-500" />
              Customer Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{sale.customer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{sale.customerEmail}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-white/70 backdrop-blur-sm">
            <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              Status Management
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {saleType === 'quote' ? 'Quote' : 'Order'} Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                >
                  {getStatusOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/70 backdrop-blur-sm">
            <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              {saleType === 'quote' ? 'Quote' : 'Order'} Statistics
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{lineItems.length}</div>
                <div className="text-gray-600 text-xs">Line Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {lineItems.reduce((sum, item) => sum + (item.images?.length || 0), 0)}
                </div>
                <div className="text-gray-600 text-xs">Total Images</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {saleDetails.quote.sale.comments.length > 0 && (
        <Card className="p-4 bg-white/70 backdrop-blur-sm mt-6">
          <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            Recent Comments
          </h4>
          <div className="space-y-3 max-h-32 overflow-y-auto">
            {saleDetails.quote.sale.comments.map((comment) => (
              <div key={comment.id} className="border-l-2 border-blue-300 pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-blue-600 font-medium">
                    {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </Card>
  );
};