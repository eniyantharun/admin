import React, { useState, useCallback } from 'react';
import { Truck, DollarSign, Calendar, Hash, Search, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';
import { iQuoteFormData, SaleSummary } from '@/types/quotes';
import { iOrderFormData } from '@/types/order';

interface ShippingCompany {
  name: string;
}

interface ShippingType {
  name: string;
}

interface SaleShippingStepProps {
  formData: iQuoteFormData | iOrderFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  saleSummary: SaleSummary | null;
  saleType: 'quote' | 'order';
  currentSaleId?: string; 
  onRefreshSummary?: () => void; 
}

export const SaleShippingStep: React.FC<SaleShippingStepProps> = ({
  formData,
  handleInputChange,
  saleSummary,
  saleType,
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

    if (currentSaleId) {
      await updateSaleDetail(updatedShippingDetails, formData.checkoutDetails);
    }
  }, [formData.shippingDetails, formData.checkoutDetails, handleInputChange, updateSaleDetail, currentSaleId]);

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

    if (currentSaleId) {
      await updateSaleDetail(formData.shippingDetails, updatedCheckoutDetails);
    }
  }, [formData.checkoutDetails, formData.shippingDetails, handleInputChange, updateSaleDetail, currentSaleId]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <Truck className="w-5 h-5 text-purple-500" />
        Shipping Details
      </h3>
      
      <div className="space-y-6">
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

          {saleType === 'order' && (
            <FormInput
              label="Tracking Number"
              name="trackingNumber"
              value={formData.shippingDetails?.trackingNumber || ''}
              onChange={(e) => handleShippingChange('trackingNumber', e.target.value)}
              placeholder="Enter tracking number"
              helpText="Package tracking ID"
            />
          )}
        </div>
      </div>

      {saleSummary && (
        <Card className="p-4 bg-blue-50 border-blue-200 mt-6">
          <h5 className="font-medium text-blue-800 mb-3 text-sm">Final {saleType === 'quote' ? 'Quote' : 'Order'} Summary</h5>
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
              <span className="text-blue-700 font-medium">{saleType === 'quote' ? 'Quote' : 'Order'} Total:</span>
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
              {saleType === 'order' && formData.shippingDetails?.trackingNumber && (
                <div className="flex items-center gap-2 text-blue-700 text-sm mt-1">
                  <Hash className="w-4 h-4" />
                  <span>Tracking: {formData.shippingDetails.trackingNumber}</span>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </Card>
  );
}; 