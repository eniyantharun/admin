import React, { useState, useCallback } from 'react';
import { Truck, DollarSign, Calendar, Hash, Search, X } from 'lucide-react';
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
  currentSaleId?: string; 
  onRefreshSummary?: () => void; 
}

export const QuoteShippingStep: React.FC<QuoteShippingStepProps> = ({
  formData,
  handleInputChange,
  saleSummary,
  currentSaleId,
  onRefreshSummary
}) => {
  const [shippingCompanies, setShippingCompanies] = useState<ShippingCompany[]>([]);
  const [shippingTypes, setShippingTypes] = useState<ShippingType[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [companiesLoaded, setCompaniesLoaded] = useState(false);
  const [typesLoaded, setTypesLoaded] = useState(false);
  const [showTypeSearch, setShowTypeSearch] = useState(false);
  const [typeSearchTerm, setTypeSearchTerm] = useState('');

  const { get, post } = useApi({
    cancelOnUnmount: true,
    dedupe: false, 
    cacheDuration: 0, 
  });

  const handleCompaniesDropdownClick = useCallback(async () => {
    if (companiesLoaded || loadingCompanies) return; 
    
    setLoadingCompanies(true);
    try {
      const response = await get('https://api.promowe.com/Admin/SaleEditor/GetShippingCompanies');
      console.log('Shipping companies response:', response);
      if (response?.companies) {
        const companies = response.companies.map((name: string) => ({ name }));
        setShippingCompanies(companies);
        setCompaniesLoaded(true);
      }
    } catch (error: any) {
      console.error('Error fetching shipping companies:', error);
      if (error?.name !== 'CanceledError') {
        showToast.error('Failed to load shipping companies');
      }
    } finally {
      setLoadingCompanies(false);
    }
  }, [get, companiesLoaded, loadingCompanies]);

  const fetchShippingTypes = useCallback(async (prefix: string = '') => {
    setLoadingTypes(true);
    try {
      const response = await get(`https://api.promowe.com/Admin/SaleEditor/GetShippingTypes?prefix=${encodeURIComponent(prefix)}&count=50`);
      console.log('Shipping types response with prefix:', prefix, response);
      if (response?.types) {
        const types = response.types.map((name: string) => ({ name }));
        setShippingTypes(types);
        if (!prefix) {
          setTypesLoaded(true); 
        }
      }
    } catch (error: any) {
      console.error('Error fetching shipping types:', error);
      if (error?.name !== 'CanceledError') {
        showToast.error('Failed to load shipping types');
      }
    } finally {
      setLoadingTypes(false);
    }
  }, [get]);

  const handleTypesDropdownClick = useCallback(async () => {
    if (typesLoaded || loadingTypes) return;
    await fetchShippingTypes(''); 
  }, [fetchShippingTypes, typesLoaded, loadingTypes]);

  const handleTypeSearch = useCallback((searchTerm: string) => {
    setTypeSearchTerm(searchTerm);
    const timeoutId = setTimeout(() => {
      fetchShippingTypes(searchTerm);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [fetchShippingTypes]);

  const updateSaleDetail = useCallback(async (shippingDetails: any, checkoutDetails: any) => {
    if (!currentSaleId) {
      console.warn('No saleId available for updating sale details');
      return;
    }

    try {
      console.log('Updating sale detail with:', { saleId: currentSaleId, shippingDetails, checkoutDetails });
      
      const payload = {
        saleId: currentSaleId,
        shippingDetails: {
          shippingCompany: shippingDetails?.company || '',
          shippingType: shippingDetails?.type || '',
          shippingCost: parseFloat(shippingDetails?.cost?.toString() || '0'),
          shippingDate: shippingDetails?.date || null,
          shippingTrackingNumber: shippingDetails?.trackingNumber || null
        },
        checkoutDetails: {
          dateOrderNeededBy: checkoutDetails?.inHandDate || '',
          additionalInstructions: checkoutDetails?.additionalInstructions || null
        }
      };

      const setSaleResponse = await post('/Admin/SaleEditor/SetSaleDetail', payload);
      console.log('SetSaleDetail response:', setSaleResponse);

      const summaryResponse = await get(`/Admin/SaleEditor/GetSaleSummary?saleId=${currentSaleId}`);
      console.log('GetSaleSummary response:', summaryResponse);

      if (onRefreshSummary) {
        onRefreshSummary();
      }

      showToast.success('Shipping details updated successfully');
    } catch (error: any) {
      console.error('Error updating sale details:', error);
      if (error?.name !== 'CanceledError') {
        showToast.error('Failed to update shipping details');
      }
    }
  }, [currentSaleId, post, onRefreshSummary]);
  const handleShippingChange = useCallback(async (field: string, value: string) => {
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

    await updateSaleDetail(updatedShippingDetails, formData.checkoutDetails);
  }, [formData.shippingDetails, formData.checkoutDetails, handleInputChange, updateSaleDetail]);

  const handleCheckoutChange = useCallback(async (field: string, value: string) => {
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

    await updateSaleDetail(formData.shippingDetails, updatedCheckoutDetails);
  }, [formData.checkoutDetails, formData.shippingDetails, handleInputChange, updateSaleDetail]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <Truck className="w-5 h-5 text-purple-500" />
        Shipping Details
      </h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-2">
              Shipping Company
            </label>
            <select
              value={formData.shippingDetails?.company || ''}
              onChange={(e) => handleShippingChange('company', e.target.value)}
              onFocus={handleCompaniesDropdownClick}
              onClick={handleCompaniesDropdownClick}
              disabled={loadingCompanies}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
            >
              <option value="">
                {loadingCompanies ? 'Loading companies...' : 'Select shipping company'}
              </option>
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
            <label className="form-label block text-sm font-medium text-gray-700 mb-2">
              Shipping Type
            </label>
            
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search shipping types (e.g., Ground, Air, Sea, Express)..."
                  value={typeSearchTerm}
                  onChange={(e) => handleTypeSearch(e.target.value)}
                  onFocus={() => {
                    setShowTypeSearch(true);
                    handleTypesDropdownClick();
                  }}
                  className="form-input w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-1">
                  {typeSearchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setTypeSearchTerm('');
                        fetchShippingTypes('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {showTypeSearch && (
                <div className="relative">
                  <select
                    value={formData.shippingDetails?.type || ''}
                    onChange={(e) => {
                      handleShippingChange('type', e.target.value);
                      if (e.target.value) {
                        setShowTypeSearch(false);
                        setTypeSearchTerm(e.target.value);
                      }
                    }}
                    disabled={loadingTypes}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                    size={Math.min(shippingTypes.length + 1, 8)}
                  >
                    <option value="">
                      {loadingTypes ? 'Searching...' : 'Select from results'}
                    </option>
                    {shippingTypes.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => setShowTypeSearch(false)}
                    className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Close results
                  </button>
                </div>
              )}
              
            </div>

            {loadingTypes && (
              <p className="text-xs text-gray-500 mt-1">
                {typeSearchTerm ? `Searching for "${typeSearchTerm}"...` : 'Loading types...'}
              </p>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              Search for specific shipping methods or browse all available options
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
      </div>

      {saleSummary && (
        <Card className="p-4 bg-blue-50 border-blue-200 mt-6">
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
    </Card>
  );
};