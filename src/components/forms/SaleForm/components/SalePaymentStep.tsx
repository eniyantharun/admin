import React from 'react';
import { CreditCard, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { iOrderFormData } from '@/types/order';
import { SaleSummary } from '@/types/quotes';

interface SalePaymentStepProps {
  formData: iOrderFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  saleSummary: SaleSummary | null;
}

export const SalePaymentStep: React.FC<SalePaymentStepProps> = ({
  formData,
  handleInputChange,
  saleSummary
}) => {
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name.startsWith('checkout.')) {
      const field = name.split('.')[1];
      const updatedCheckoutDetails = {
        ...formData.checkoutDetails,
        [field]: type === 'checkbox' ? checked : value
      };
      
      handleInputChange({
        target: { 
          name: 'checkoutDetails', 
          value: updatedCheckoutDetails 
        }
      } as any);
    } else {
      handleInputChange(e);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <CreditCard className="w-5 h-5 text-green-500" />
        Payment Details
      </h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod || 'Credit Card'}
              onChange={handlePaymentChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
              <option value="Company Payment Order">Company Payment Order</option>
              <option value="Net 30">Net 30</option>
            </select>
          </div>

          <FormInput
            label="Payment Date"
            name="checkout.paymentDate"
            type="date"
            value={formData.checkoutDetails?.paymentDate || new Date().toISOString().split('T')[0]}
            onChange={handlePaymentChange}
            helpText="Date payment was received"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              name="checkout.paymentStatus"
              value={formData.checkoutDetails?.paymentStatus || 'Paid'}
              onChange={handlePaymentChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <FormInput
            label="Transaction Reference"
            name="checkout.transactionReference"
            value={formData.checkoutDetails?.transactionReference || ''}
            onChange={handlePaymentChange}
            placeholder="Payment reference number"
            helpText="Transaction ID or reference"
          />
        </div>

        <div className="form-input-group">
          <label className="form-label block text-sm font-medium text-gray-700 mb-2">
            Payment Notes
          </label>
          <textarea
            name="checkout.paymentNotes"
            value={formData.checkoutDetails?.paymentNotes || ''}
            onChange={handlePaymentChange}
            className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Any additional payment information..."
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Internal notes about payment processing
          </p>
        </div>

        {saleSummary && (
          <Card className="p-4 bg-green-50 border-green-200">
            <h5 className="font-medium text-green-800 mb-3 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              Payment Summary
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Subtotal:</span>
                <span className="font-medium text-green-800">${saleSummary.customerSummary.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Setup Charges:</span>
                <span className="font-medium text-green-800">${saleSummary.customerSummary.setupCharge.toFixed(2)}</span>
              </div>
              {formData.shippingDetails?.cost && parseFloat(formData.shippingDetails.cost.toString()) > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-700">Shipping:</span>
                  <span className="font-medium text-green-800">${parseFloat(formData.shippingDetails.cost.toString()).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="text-green-700 font-medium">Total Amount:</span>
                <span className="font-bold text-green-600 text-lg">
                  ${(
                    saleSummary.customerSummary.total + 
                    (formData.shippingDetails?.cost ? parseFloat(formData.shippingDetails.cost.toString()) : 0)
                  ).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-3 pt-2 border-t">
                <span className="text-green-700">Payment Method:</span>
                <span className="font-medium text-green-800">{formData.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-green-700">Payment Status:</span>
                <div className="flex items-center gap-1">
                  {formData.checkoutDetails?.paymentStatus === 'Paid' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : formData.checkoutDetails?.paymentStatus === 'Pending' ? (
                    <Clock className="w-4 h-4 text-orange-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`font-medium text-sm ${
                    formData.checkoutDetails?.paymentStatus === 'Paid' ? 'text-green-700' :
                    formData.checkoutDetails?.paymentStatus === 'Pending' ? 'text-orange-700' :
                    'text-red-700'
                  }`}>
                    {formData.checkoutDetails?.paymentStatus || 'Paid'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
};