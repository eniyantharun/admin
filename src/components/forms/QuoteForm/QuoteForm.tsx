import React, { useState, useEffect } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EntityDrawer } from '@/components/helpers/EntityDrawer';
import { iCustomer } from '@/types/customer';
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

type FormStep = 'customer-address' | 'items' | 'quote' | 'notes';

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
      label: 'Corporate Office',
      name: 'Christina Johnson',
      street: '123 Business Park Drive',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      country: 'US',
      isPrimary: true,
    },
    shippingAddress: {
      type: 'shipping' as const,
      label: 'Warehouse',
      name: 'Christina Johnson',
      street: '456 Industrial Blvd',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30310',
      country: 'US',
      isPrimary: false,
    },
    sameAsShipping: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<iQuoteFormData>>({});

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
    fetchSaleSummary
  } = useQuoteData(quote, isEditing, formData, setFormData);

  const steps: FormStep[] = ['customer-address', 'items', 'quote', 'notes'];

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
            currentSaleId={currentSaleId}
          />
        );
      case 'quote':
        return (
          <QuoteDetailsStep
            formData={formData}
            handleInputChange={handleInputChange}
            saleSummary={saleSummary}
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
    <div className="space-y-6">
      <div className="p-6 border-b border-gray-200">
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

      <form onSubmit={handleSubmit} className="p-2 space-y-2">
        {renderCurrentStep()}
      </form>

      {isEditing && quote && quoteDetails && (
        <QuoteInformation
          quote={quote}
          quoteDetails={quoteDetails}
          lineItems={lineItems}
          currentSaleId={currentSaleId}
        />
      )}
    </div>
  );
};