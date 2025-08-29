import React from 'react';
import { FileText, Calendar, DollarSign, ImageIcon, Package, MessageSquare } from 'lucide-react';
import { iQuote, LineItemData, QuoteDetailsResponse, iQuoteFormData } from '@/types/quotes';
import { QuoteStatus } from '@/lib/enums';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';

interface QuoteInformationProps {
  quote: iQuote;
  quoteDetails: QuoteDetailsResponse;
  lineItems: LineItemData[];
  currentSaleId: string;
  formData: iQuoteFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const QuoteInformation: React.FC<QuoteInformationProps> = ({
  quote,
  quoteDetails,
  lineItems,
  currentSaleId,
  formData,
  handleInputChange
}) => {
  const { post } = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  // Map frontend status values to API status values
  const mapStatusToApi = (status: string): string => {
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
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    
    handleInputChange(e);
    
    if (quote?.id) {
      try {
        showToast.loading('Updating quote status...');
        
        await post('/Admin/SaleEditor/SetQuoteDetail', {
          id: quote.id,
          status: mapStatusToApi(newStatus) 
        });
        
        showToast.dismiss();
        showToast.success('Quote status updated successfully');
      } catch (error) {
        showToast.dismiss();
        showToast.error('Failed to update quote status');
        console.error('Error updating quote status:', error);
        
        // Revert status on error
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

  return (
    <div className="border-t border-gray-200 p-2 bg-gray-50">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-xs text-gray-700">Quote Information</h4>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Status:</span>
            <select
              name="status"
              value={formData.status}
              onChange={handleStatusChange}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-500 focus:border-transparent bg-white min-w-[140px]"
            >
              <option value={QuoteStatus.NEW_QUOTE}>New Quote</option>
              <option value={QuoteStatus.WAITING_FOR_SUPPLIER}>Waiting for Supplier</option>
              <option value={QuoteStatus.QUOTE_SENT_TO_CUSTOMER}>Quote Sent to Customer</option>
              <option value={QuoteStatus.ON_HOLD}>On Hold</option>
              <option value={QuoteStatus.QUOTE_CONVERTED_TO_ORDER}>Quote Converted to Order</option>
              <option value={QuoteStatus.CONVERTED_TO_ORDER_BY_CUSTOMER}>Converted to Order by Customer</option>
              <option value={QuoteStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Rest of quote information in grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Quote Number:</span>
          <span className="text-xs">{quote.quoteNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Created:</span>
          <span className="text-xs">{quote.dateTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Amount:</span>
          <span className="text-xs text-green-600">
            ${quote.customerTotal.toFixed(2)}
          </span>
        </div>
        {quote.inHandDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">In-Hand Date:</span>
            <span className="text-xs">{quote.inHandDate}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Images:</span>
          <span className="text-xs">
            {lineItems.reduce((sum, item) => sum + (item.images?.length || 0), 0)} total
          </span>
        </div>
      </div>

      {quoteDetails.quote.sale.comments.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="text-blue-800 mb-2 text-xs">Recent Comments</h5>
          <div className="space-y-2">
            {quoteDetails.quote.sale.comments.map((comment) => (
              <div key={comment.id} className="text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-blue-700 ml-5">{comment.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};