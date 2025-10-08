import React from 'react';
import { FileText, Calendar, User, Hash, Activity, Package, MessageSquare } from 'lucide-react';
import { LineItemData } from '@/types/quotes';
import { QuoteStatus, OrderStatus } from '@/lib/enums';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';
import { Card } from '@/components/ui/Card';

interface SaleInformationProps {
  type: 'quote' | 'order';
  sale: any;
  saleDetails: any;
  lineItems: LineItemData[];
  currentSaleId: string;
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const SaleInformation: React.FC<SaleInformationProps> = ({
  type,
  sale,
  saleDetails,
  lineItems,
  currentSaleId,
  formData,
  handleInputChange
}) => {
  const { post } = useApi({ cancelOnUnmount: false, dedupe: false });

  const mapStatusToApi = (status: string): string => {
    if (type === 'quote') {
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
      return status;
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    handleInputChange(e);
    
    if (sale?.id) {
      try {
        showToast.loading(`Updating ${type} status...`);
        
        const endpoint = type === 'quote'
          ? '/Admin/SaleEditor/SetQuoteDetail'
          : '/Admin/SaleEditor/SetOrderDetail';
          
        await post(endpoint, {
          id: sale.id,
          status: mapStatusToApi(newStatus)
        });
        
        showToast.dismiss();
        showToast.success(`${type === 'quote' ? 'Quote' : 'Order'} status updated successfully`);
      } catch (error) {
        showToast.dismiss();
        showToast.error(`Failed to update ${type} status`);
        const revertEvent = {
          target: { name: 'status', value: formData.status }
        } as React.ChangeEvent<HTMLSelectElement>;
        handleInputChange(revertEvent);
      }
    }
  };

  const getStatusColor = (status: string) => {
    if (type === 'quote') {
      switch (status) {
        case 'new-quote': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'quote-sent-to-customer': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'quote-converted-to-order': return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else {
      switch (status) {
        case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'in-production': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const getStatusLabel = (status: string) => {
    if (type === 'quote') {
      switch (status) {
        case 'new-quote': return 'New Quote';
        case 'quote-sent-to-customer': return 'Sent to Customer';
        case 'quote-converted-to-order': return 'Converted to Order';
        case 'cancelled': return 'Cancelled';
        default: return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    } else {
      switch (status) {
        case 'new': return 'New Order';
        case 'in-production': return 'In Production';
        case 'shipped': return 'Shipped';
        case 'delivered': return 'Delivered';
        case 'cancelled': return 'Cancelled';
        default: return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
      
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="p-4 bg-white/70 backdrop-blur-sm">
            <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-500" />
              {type === 'quote' ? 'Quote' : 'Order'} Details
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{type === 'quote' ? 'Quote' : 'Order'} Number:</span>
                <span className="font-medium text-gray-900">#{type === 'quote' ? sale.quoteNumber : sale.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-900">{new Date(sale.dateTime).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer Total:</span>
                <span className="font-bold text-green-600 text-lg">${sale.customerTotal.toFixed(2)}</span>
              </div>
              {sale.inHandDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In-Hand Date:</span>
                  <span className="font-medium text-blue-600">{sale.inHandDate}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-white/70 backdrop-blur-sm">
           
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {type === 'quote' ? 'Quote' : 'Order'} Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
                >
                  {type === 'quote' ? (
                    <>
                      <option value={QuoteStatus.NEW_QUOTE}>New Quote</option>
                      <option value={QuoteStatus.WAITING_FOR_SUPPLIER}>Waiting for Supplier</option>
                      <option value={QuoteStatus.QUOTE_SENT_TO_CUSTOMER}>Quote Sent to Customer</option>
                      <option value={QuoteStatus.ON_HOLD}>On Hold</option>
                      <option value={QuoteStatus.QUOTE_CONVERTED_TO_ORDER}>Quote Converted to Order</option>
                      <option value={QuoteStatus.CANCELLED}>Cancelled</option>
                    </>
                  ) : (
                    <>
                      <option value="new">New Order</option>
                      <option value="in-production">In Production</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </Card>

          
        </div>
      </div>

      {saleDetails?.[type]?.sale?.comments?.length > 0 && (
        <Card className="p-4 bg-white/70 backdrop-blur-sm mt-6">
          <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            Recent Comments
          </h4>
          <div className="space-y-3 max-h-32 overflow-y-auto">
            {saleDetails[type].sale.comments.map((comment: any) => (
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