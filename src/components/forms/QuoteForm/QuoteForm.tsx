import React, { useState, useEffect } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EntityDrawer } from '@/components/helpers/EntityDrawer';
import { iCustomer, iCustomerAddress } from '@/types/customer';
import { iQuoteFormData, iQuoteFormProps, iQuote, LineItemData, SaleSummary, QuoteDetailsResponse } from '@/types/quotes';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';
import { useQuoteData } from './hooks/useQuoteData';
import { QuoteStepIndicator } from './components/QuoteStepIndicator';
import { QuoteCustomerStep } from './components/QuoteCustomerStep';
import { QuoteItemsStep } from './components/QuoteItemsStep';
import { QuoteDetailsStep } from './components/QuoteDetailsStep';
import { QuoteNotesStep } from './components/QuoteNotesStep';
import { QuoteInformation } from './components/QuoteInformation';

type FormStep = 'customer-address' | 'items' | 'quote' | 'shipping' | 'notes';


export const QuoteForm: React.FC<iQuoteFormProps> = ({
  quote,
  isEditing,
  onSubmit,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('customer-address');
  const [formData, setFormData] = useState<iQuoteFormData>({
    customer: '',
    customerEmail: '',
    status: 'new-quote',
    customerTotal: '0',
    inHandDate: '',
    notes: '',
    billingAddress: {
      type: 'billing' as const,
      label: '',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      isPrimary: false,
    },
    shippingAddress: {
      type: 'shipping' as const,
      label: '',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      isPrimary: false,
    },
    sameAsShipping: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<iQuoteFormData>>({});
  const [customerAddresses, setCustomerAddresses] = useState<iCustomerAddress[]>([]);

  const {
    selectedCustomer,
    setSelectedCustomer,
    lineItems,
    setLineItems,
    saleSummary,
    setSaleSummary,
    isLoadingLineItems,
    quoteDetails,
    currentSaleId,
    handleAddEmptyLineItem,
    handleUpdateLineItem,
    handleRemoveLineItem,
    fetchSaleSummary,
    fetchCustomerAddresses
  } = useQuoteData(quote, isEditing, formData, setFormData, setCustomerAddresses);

  const steps: FormStep[] = ['customer-address', 'items', 'quote', 'notes'];

  const { post } = useApi();


  const handleNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<iQuoteFormData> = {};
    
    if (!selectedCustomer) errors.customer = 'Customer is required';
    if (!formData.customerTotal || parseFloat(formData.customerTotal) <= 0) {
      errors.customerTotal = 'Customer total must be greater than 0';
    }
    if (lineItems.length === 0) {
      showToast.error('At least one item is required');
      return false;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (validateForm()) {
    // If editing and status changed, update quote status via API
    if (isEditing && quote && formData.status !== quote.status) {
      try {
        await post('/Admin/SaleEditor/SetQuoteDetail', {
          id: quote.id,
          status: formData.status
        });
      } catch (error) {
        showToast.error('Failed to update quote status');
        return;
      }
    }
    
    await onSubmit(formData);
  }
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (formErrors[name as keyof iQuoteFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const isStepCompleted = (step: FormStep) => {
    switch (step) {
      case 'customer-address': return !!(selectedCustomer && formData.billingAddress.street && formData.shippingAddress.street);
      case 'items': return lineItems.length > 0;
      case 'quote': return !!(formData.customerTotal && parseFloat(formData.customerTotal) > 0);
      case 'notes': return true;
      default: return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'customer-address':
        return (
          <QuoteCustomerStep
            selectedCustomer={selectedCustomer}
            onCustomerSelect={setSelectedCustomer}
            formData={formData}
            setFormData={setFormData}
            customerAddresses={customerAddresses}
            onFetchCustomerAddresses={fetchCustomerAddresses}
          />
        );
      case 'items':
        return (
          <QuoteItemsStep
            lineItems={lineItems}
            isLoadingLineItems={isLoadingLineItems}
            saleSummary={saleSummary}
            onAddEmptyLineItem={handleAddEmptyLineItem}
            onUpdateLineItem={handleUpdateLineItem}
            onRemoveLineItem={handleRemoveLineItem}
            onRefreshSummary={fetchSaleSummary}
            currentSaleId={currentSaleId}
          />
        );
      case 'quote':
        return (
          <QuoteDetailsStep
            formData={formData}
            handleInputChange={handleInputChange}
            saleSummary={saleSummary}
            quoteId={quote?.id}
            isEditing={isEditing}
          />
        );
      case 'notes':
        return (
          <QuoteNotesStep
            formData={formData}
            handleInputChange={handleInputChange}
            saleSummary={saleSummary}
            lineItems={lineItems}
            isEditing={isEditing}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="p-2 border-b border-gray-200">
        <QuoteStepIndicator
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isStepCompleted={isStepCompleted}
          onPrevStep={handlePrevStep}
          onNextStep={handleNextStep}
          onSubmit={handleSubmit}
          isEditing={isEditing}
          loading={loading}
        />
      </div>

      {isEditing && quote && quoteDetails && (
        <QuoteInformation
          quote={quote}
          quoteDetails={quoteDetails}
          lineItems={lineItems}
          currentSaleId={currentSaleId}
        />
      )}

      <form onSubmit={handleSubmit} className="p-2 space-y-2">
        {renderCurrentStep()}
      </form>
    </div>
  );
};