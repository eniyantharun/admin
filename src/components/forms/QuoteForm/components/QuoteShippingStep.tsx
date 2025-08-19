import React, { useState, useEffect } from 'react';
import { Truck, DollarSign, Calendar, Hash } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';
import { iQuoteFormData, SaleSummary } from '@/types/quotes';

interface ShippingCompany {
  name: string;
}

interface ShippingType {
  name: string;
}

interface QuoteShippingStepProps {
  formData: iQuoteFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  saleSummary: SaleSummary | null;
}

export const QuoteShippingStep: React.FC<QuoteShippingStepProps> = ({
  formData,
  handleInputChange,
  saleSummary
}) => {
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([]);
  const [shippingTypes, setShippingTypes] = useState<ShippingType[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const { get } = useApi({
    cancelOnUnmount: true,
    dedupe: true,
    cacheDuration: 300000, // 5 minutes cache
  });

  // Fetch shipping companies
  useEffect(() => {
    const fetchShippingCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await get('https://api.promowe.com/Admin/SaleEditor/GetShippingCompanies');
        if (response?.companies) {
          const companies = response.companies.map((name: string) => ({ name }));
          setShippingCompanies(companies);
        }
      } catch (error: any) {
        if (error?.name !== 'CanceledError') {
          showToast.error('Failed to load shipping companies');
        }
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchShippingCompanies();
  }, [get]);

  // Fetch shipping types when company changes
  useEffect(() => {
    const fetchShippingTypes = async () => {
      if (!formData.shippingDetails?.company) {
        setShippingTypes([]);
        return;
      }

      setLoadingTypes(true);
      try {
        const response = await get(`https://api.promowe.com/Admin/SaleEditor/GetShippingTypes?prefix=${formData.shippingDetails.company}&count=20`);
        if (response?.types) {
          const types = response.types.map((name: string) => ({ name }));
          setShippingTypes(types);
        }
      } catch (error: any) {
        if (error?.name !== 'CanceledError') {
          showToast.error('Failed to load shipping types');
        }
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchShippingTypes();
  }, [formData.shippingDetails?.company, get]);

  const handleShippingChange = (field: string, value: string) => {
    const updatedShippingDetails = {
      ...formData.shippingDetails,
      [field]: value
    };
    
    handleInputChange({
      target: { 
        name: 'shippingDetails', 
        value: updatedShippingDetails 
      }
    } as any);
  };

  const handleCheckoutChange = (field: string, value: string) => {
    const updatedCheckoutDetails = {
      ...formData.checkoutDetails,
      [field]: value
    };
    
    handleInputChange({
      target: { 
        name: 'checkoutDetails', 
        value: updatedCheckoutDetails 
      }
    } as any);
  };

  return (
    <div className="space-y-6">
      {/* Checkout Details */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 text-sm mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          Checkout Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Date Order Needed By"
            name="dateOrderNeededBy"
            type="date"
            value={formData.checkoutDetails?.inHandDate || formData.inHandDate || ''}
            onChange={(e) => handleCheckoutChange('inHandDate', e.target.value)}
            helpText="When does the customer need this order?"
          />
          
          <div className="form-input-group">
            <label className="form-label block text-xs font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={formData.checkoutDetails?.paymentMethod || 'Credit Card'}
              onChange={(e) => handleCheckoutChange('paymentMethod', e.target.value)}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Cheque">Cheque</option>
              <option value="Company Payment Order">Company Payment Order</option>
              <option value="Wire Transfer">Wire Transfer</option>
              <option value="Net Terms">Net Terms</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="form-input-group">
            <label className="form-label block text-xs font-medium text-gray-700 mb-1">
              Additional Instructions
            </label>
            <textarea
              value={formData.checkoutDetails?.additionalInstructions || ''}
              onChange={(e) => handleCheckoutChange('additionalInstructions', e.target.value)}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Any special instructions for processing this order..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Shipping Details */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 text-sm mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-purple-500" />
          Shipping Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-input-group">
            <label className="form-label block text-xs font-medium text-gray-700 mb-1">
              Shipping Company
            </label>
            <select
              value={formData.shippingDetails?.company || ''}
              onChange={(e) => handleShippingChange('company', e.target.value)}
              disabled={loadingCompanies}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
            >
              <option value="">Select shipping company</option>
              {shippingCompanies.map((company) => (
                <option key={company.name} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
            {loadingCompanies && (
              <p className="text-xs text-gray-500 mt-1">Loading companies...</p>
            )}
          </div>

          <div className="form-input-group">
            <label className="form-label block text-xs font-medium text-gray-700 mb-1">
              Shipping Type
            </label>
            <select
              value={formData.shippingDetails?.type || ''}
              onChange={(e) => handleShippingChange('type', e.target.value)}
              disabled={loadingTypes || !formData.shippingDetails?.company}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
            >
              <option value="">Select shipping type</option>
              {shippingTypes.map((type) => (
                <option key={type.name} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
            {loadingTypes && (
              <p className="text-xs text-gray-500 mt-1">Loading types...</p>
            )}
            {!formData.shippingDetails?.company && (
              <p className="text-xs text-gray-500 mt-1">Select a company first</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <FormInput
            label="Shipping Cost"
            name="shippingCost"
            type="number"
            value={formData.shippingDetails?.cost?.toString() || '0'}
            onChange={(e) => handleShippingChange('cost', e.target.value)}
            placeholder="0.00"
            helpText="Estimated shipping cost"
          />

          <FormInput
            label="Shipping Date"
            name="shippingDate"
            type="date"
            value={formData.shippingDetails?.date || ''}
            onChange={(e) => handleShippingChange('date', e.target.value)}
            helpText="Expected ship date"
          />

          <FormInput
            label="Tracking Number"
            name="trackingNumber"
            value={formData.shippingDetails?.trackingNumber || ''}
            onChange={(e) => handleShippingChange('trackingNumber', e.target.value)}
            placeholder="1Z999AA1234567890"
            helpText="Leave blank if not shipped yet"
          />
        </div>
      </Card>

      {/* Quote Summary */}
      {saleSummary && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h5 className="font-medium text-blue-800 mb-3 text-sm">Final Quote Summary</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Items Total:</span>
              <span className="font-medium text-blue-800">${saleSummary.customerSummary.itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Setup Charges:</span>
              <span className="font-medium text-blue-800">${saleSummary.customerSummary.setupCharge.toFixed(2)}</span>
            </div>
            {formData.shippingDetails?.cost && parseFloat(formData.shippingDetails.cost.toString()) > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-700">Shipping:</span>
                <span className="font-medium text-blue-800">${parseFloat(formData.shippingDetails.cost.toString()).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="text-blue-700 font-medium">Quote Total:</span>
              <span className="font-bold text-green-600 text-lg">
                ${(
                  saleSummary.customerSummary.total + 
                  (formData.shippingDetails?.cost ? parseFloat(formData.shippingDetails.cost.toString()) : 0)
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Estimated Profit:</span>
              <span className="font-bold text-orange-600">${saleSummary.profit.toFixed(2)}</span>
            </div>
          </div>

          {formData.shippingDetails?.company && formData.shippingDetails?.type && (
            <div className="mt-4 pt-3 border-t border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 text-sm">
                <Truck className="w-4 h-4" />
                <span>
                  Shipping via {formData.shippingDetails.company} - {formData.shippingDetails.type}
                  {formData.shippingDetails.date && ` on ${formData.shippingDetails.date}`}
                </span>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};