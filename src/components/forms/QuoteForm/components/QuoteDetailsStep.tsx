import React, { useState, useCallback, useRef, useEffect  } from 'react';
import { FormInput } from '@/components/helpers/FormInput';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, FileText, Clock, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';
import { iQuoteFormData, SaleSummary } from '@/types/quotes';

interface QuoteDetailsStepProps {
  formData: iQuoteFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  saleSummary: SaleSummary | null;
  quoteId?: number;
  isEditing?: boolean;
  currentSaleId?: string;
  onRefreshSummary?: () => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const QuoteDetailsStep: React.FC<QuoteDetailsStepProps> = ({
  formData,
  handleInputChange,
  saleSummary,
  quoteId,
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

      console.log('Sending checkout details payload:', payload);

      await post('/Admin/SaleEditor/SetSaleDetail', payload);
      
      setSaveStatus('saved');
      showToast.success('Checkout details saved successfully');
      
      setTimeout(() => setSaveStatus('idle'), 2000);
      
      if (onRefreshSummary) {
        onRefreshSummary();
      }
    } catch (error: any) {
      console.error('Error updating checkout details:', error);
      setSaveStatus('error');
      
      if (error?.name !== 'CanceledError') {
        showToast.error('Failed to save checkout details');
      }
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [currentSaleId, formData.checkoutDetails, formData.inHandDate, post, onRefreshSummary]);

  const instructionsTimeoutRef = useRef<NodeJS.Timeout>();
  const dateTimeoutRef = useRef<NodeJS.Timeout>();

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

  useEffect(() => {
    return () => {
      if (instructionsTimeoutRef.current) {
        clearTimeout(instructionsTimeoutRef.current);
      }
      if (dateTimeoutRef.current) {
        clearTimeout(dateTimeoutRef.current);
      }
    };
  }, []);

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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-500" />
          Quote Details
        </h3>
        <SaveStatusIndicator />
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-2">
              In-Hand Date
              <span className="text-xs text-gray-500 font-normal ml-1">(When customer needs order)</span>
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
            placeholder="Any special instructions for processing this order..."
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            These instructions will be visible to your team when processing the order
          </p>
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
            Save Checkout Details
          </Button>
        </div>
      </div>

      {saleSummary && (
        <Card className="p-4 bg-gray-50 mt-6">
          <h5 className="font-medium text-gray-800 mb-3 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-600" />
            Financial Summary
          </h5>
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
            
            {currentDateValue && (
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Needed By:</span>
                <span className="font-medium text-blue-600">
                  {new Date(currentDateValue).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}
    </Card>
  );
};