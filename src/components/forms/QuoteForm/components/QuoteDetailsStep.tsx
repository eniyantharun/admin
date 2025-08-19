import React from 'react';
import { FormInput } from '@/components/helpers/FormInput';
import { Card } from '@/components/ui/Card';
import { iQuoteFormData, SaleSummary } from '@/types/quotes';
import { QuoteStatus } from '@/lib/enums';

interface QuoteDetailsStepProps {
  formData: iQuoteFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  saleSummary: SaleSummary | null;
}

export const QuoteDetailsStep: React.FC<QuoteDetailsStepProps> = ({
  formData,
  handleInputChange,
  saleSummary
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-input-group">
          <label className="form-label block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
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

        <FormInput
          label="In-Hand Date"
          name="inHandDate"
          type="date"
          value={formData.inHandDate}
          onChange={handleInputChange}
          helpText="Expected delivery date (optional)"
        />
      </div>

      {saleSummary && (
        <Card className="p-4 bg-gray-50">
          <h5 className="font-medium text-gray-800 mb-3 text-sm">Financial Summary</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Items Total:</span>
              <span className="font-medium">${saleSummary.customerSummary.itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Setup Charges:</span>
              <span className="font-medium">${saleSummary.customerSummary.setupCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${saleSummary.customerSummary.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600 font-medium">Total Amount:</span>
              <span className="font-bold text-green-600 text-lg">
                ${saleSummary.customerSummary.total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Profit:</span>
              <span className="font-bold text-orange-600">${saleSummary.profit.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};