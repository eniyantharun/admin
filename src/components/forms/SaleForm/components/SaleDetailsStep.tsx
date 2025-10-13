import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FormInput } from '@/components/helpers/FormInput';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, FileText, Clock, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';
import { SaleSummary } from '@/types/quotes';
import { QuoteStatus } from '@/lib/enums';
import { OrderStatus } from '@/lib/enums';

interface SaleDetailsStepProps {
  type: 'quote' | 'order';
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  saleSummary: SaleSummary | null;
  saleId?: number;
  isEditing?: boolean;
  currentSaleId?: string;
  onRefreshSummary?: () => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const SaleDetailsStep: React.FC<SaleDetailsStepProps> = ({
  type,
  formData,
  handleInputChange,
  saleSummary,
  saleId,
  isEditing = false,
  currentSaleId,
  onRefreshSummary
}) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const { post } = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  const saveCheckoutDetails = useCallback(async () => {
    if (!currentSaleId) {
      console.warn('No saleId available for updating checkout details');
      showToast.error('No sale ID available for saving');
      return;
    }

    setSaveStatus('saving');
    
    try {
      const checkoutDetails: { [key: string]: string } = {};
      
      const dateValue = formData.checkoutDetails?.dateOrderNeededBy || formData.inHandDate || '';
      const instructionsValue = formData.checkoutDetails?.additionalInstructions || '';
      
      if (dateValue.trim()) {
        checkoutDetails.dateOrderNeededBy = dateValue.trim();
      }
      
      if (instructionsValue.trim()) {
        checkoutDetails.additionalInstructions = instructionsValue.trim();
      }

      const payload = {
        saleId: currentSaleId,
        checkoutDetails: checkoutDetails
      };

      await post('/Admin/SaleEditor/SetSaleDetail', payload);
      
      setSaveStatus('saved');
      showToast.success('Details saved successfully');
      
      setTimeout(() => setSaveStatus('idle'), 2000);
      
      if (onRefreshSummary) {
        onRefreshSummary();
      }
    } catch (error: any) {
      console.error('Error updating checkout details:', error);
      setSaveStatus('error');
      
      if (error?.name !== 'CanceledError') {
        showToast.error('Failed to save details');
      }
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [currentSaleId, formData.checkoutDetails, formData.inHandDate, post, onRefreshSummary]);

  const handleInHandDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    handleInputChange({
      target: { name: 'inHandDate', value }
    } as React.ChangeEvent<HTMLInputElement>);
    
    const updatedCheckoutDetails = {
      ...formData.checkoutDetails,
      dateOrderNeededBy: value
    };
    
    handleInputChange({
      target: { 
        name: 'checkoutDetails', 
        value: updatedCheckoutDetails
      }
    } as any);
  };

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    const updatedCheckoutDetails = {
      ...formData.checkoutDetails,
      additionalInstructions: value
    };
    
    handleInputChange({
      target: { 
        name: 'checkoutDetails', 
        value: updatedCheckoutDetails
      }
    } as any);
  };

  const SaveStatusIndicator = () => {
    const getStatusConfig = () => {
      switch (saveStatus) {
        case 'saving':
          return {
            icon: Clock,
            text: 'Saving...',
            className: 'text-blue-600 bg-blue-50 border-blue-200',
          };
        case 'saved':
          return {
            icon: CheckCircle,
            text: 'Saved',
            className: 'text-green-600 bg-green-50 border-green-200',
          };
        case 'error':
          return {
            icon: AlertCircle,
            text: 'Save failed',
            className: 'text-red-600 bg-red-50 border-red-200',
          };
        default:
          return null;
      }
    };

    const config = getStatusConfig();
    if (!config) return null;
    
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${config.className}`}>
        <Icon className="w-3 h-3" />
        <span>{config.text}</span>
      </div>
    );
  };

  const currentDateValue = formData.checkoutDetails?.dateOrderNeededBy || formData.inHandDate || '';

  const getStatusOptions = () => {
    if (type === 'quote') {
      return [
        { value: QuoteStatus.NEW_QUOTE, label: 'New Quote' },
        { value: QuoteStatus.WAITING_FOR_SUPPLIER, label: 'Waiting for Supplier' },
        { value: QuoteStatus.QUOTE_SENT_TO_CUSTOMER, label: 'Quote Sent to Customer' },
        { value: QuoteStatus.ON_HOLD, label: 'On Hold' },
        { value: QuoteStatus.QUOTE_CONVERTED_TO_ORDER, label: 'Quote Converted to Order' },
        { value: QuoteStatus.CONVERTED_TO_ORDER_BY_CUSTOMER, label: 'Converted to Order by Customer' },
        { value: QuoteStatus.CANCELLED, label: 'Cancelled' }
      ];
    } else {
      return [
        { value: 'new', label: 'New Order' },
        { value: 'in-production', label: 'In Production' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ];
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-500" />
          Checkout Details
        </h3>
        <SaveStatusIndicator />
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {isEditing && (
            <div className="form-input-group">
              <label className="form-label block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {getStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-2">
              In-Hand Date
              
            </label>
            <input
              type="date"
              name="inHandDate"
              value={currentDateValue}
              onChange={handleInHandDateChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div className="form-input-group">
          <label className="form-label block text-sm font-medium text-gray-700 mb-2">
            Additional Instructions
          </label>
          <textarea
            name="additionalInstructions"
            value={formData.checkoutDetails?.additionalInstructions || ''}
            onChange={handleInstructionsChange}
            className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Any special instructions..."
            rows={3}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={saveCheckoutDetails}
            loading={saveStatus === 'saving'}
            disabled={saveStatus === 'saving'}
            icon={Save}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Save Details
          </Button>
        </div>
      </div>

      
    </Card>
  );
};