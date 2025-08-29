import React from 'react';
import { FileText, Calendar, DollarSign, ImageIcon, Package, MessageSquare } from 'lucide-react';
import { iQuote, LineItemData, QuoteDetailsResponse } from '@/types/quotes';

interface QuoteInformationProps {
  quote: iQuote;
  quoteDetails: QuoteDetailsResponse;
  lineItems: LineItemData[];
  currentSaleId: string;
}

export const QuoteInformation: React.FC<QuoteInformationProps> = ({
  quote,
  quoteDetails,
  lineItems,
  currentSaleId
}) => {
  return (
    <div className="border-t border-gray-200 p-2 bg-gray-50">
      <h4 className="text-xs  text-gray-700 mb-2">Quote Information</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Quote Number:</span>
          <span className="text-xs ">{quote.quoteNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Created:</span>
          <span className="text-xs ">{quote.dateTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Amount:</span>
          <span className="text-xs  text-green-600">
            ${quote.customerTotal.toFixed(2)}
          </span>
        </div>
        {quote.inHandDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">In-Hand Date:</span>
            <span className="text-xs ">{quote.inHandDate}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Images:</span>
          <span className="text-xs ">
            {lineItems.reduce((sum, item) => sum + (item.images?.length || 0), 0)} total
          </span>
        </div>
        
      </div>

      {quoteDetails.quote.sale.comments.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className=" text-blue-800 mb-2 text-xs">Recent Comments</h5>
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
