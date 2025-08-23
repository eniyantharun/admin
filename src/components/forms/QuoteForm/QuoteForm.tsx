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
import { QuoteShippingStep } from './components/QuoteShippingStep';

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
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);

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
    fetchCustomerAddresses,
    createNewQuote,
    setSaleDetail
  } = useQuoteData(quote, isEditing, formData, setFormData, setCustomerAddresses);

  const steps: FormStep[] = ['customer-address', 'items', 'quote', 'shipping', 'notes'];

  const { post } = useApi();

  // Handle customer selection for new quotes
  const handleCustomerSelect = async (customer: iCustomer) => {
    setSelectedCustomer(customer);
    
    if (!isEditing && !currentSaleId && customer.id) {
      // Create new quote when customer is selected
      setIsCreatingQuote(true);
      try {
        const saleId = await createNewQuote(customer.id);
        if (saleId) {
          showToast.success('New quote created successfully');
          console.log('New quote created with saleId:', saleId);
        }
      } catch (error) {
        console.error('Error creating new quote:', error);
      } finally {
        setIsCreatingQuote(false);
      }
    }
  };

  // Handle step navigation with quote creation
  const handleNextStep = async () => {
    if (currentStep === 'customer-address' && !isEditing) {
      // Ensure we have a quote created before moving to items
      if (!currentSaleId && selectedCustomer) {
        if (isCreatingQuote) {
          showToast.info('Creating quote, please wait...');
          return;
        }
        
        setIsCreatingQuote(true);
        try {
          const saleId = await createNewQuote(selectedCustomer.id);
          if (!saleId) {
            showToast.error('Failed to create quote. Please try again.');
            setIsCreatingQuote(false);
            return;
          }
          
          // Set addresses if provided (optional)
          const billing = formData.billingAddress.street ? formData.billingAddress : null;
          const shipping = formData.shippingAddress.street ? formData.shippingAddress : null;
          
          if (billing || shipping) {
            await setSaleDetail(saleId, billing, shipping);
          }
          
        } catch (error) {
          console.error('Error in quote creation process:', error);
          setIsCreatingQuote(false);
          return;
        } finally {
          setIsCreatingQuote(false);
        }
      }
    }
    
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
    
    if (!selectedCustomer) {
      errors.customer = 'Customer is required';
      showToast.error('Please select a customer');
      return false;
    }

    if (!currentSaleId) {
      showToast.error('Quote not properly created. Please try again.');
      return false;
    }

    // For new quotes, we don't require line items or customer total initially
    // The user can save a quote with just a customer
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // If editing and status changed, update quote status via API
      if (isEditing && quote && formData.status !== quote.status) {
        await post('/Admin/SaleEditor/SetQuoteDetail', {
          id: quote.id,
          status: formData.status
        });
      }
      
      // Update addresses if they've been modified
      if (currentSaleId) {
        const billing = formData.billingAddress.street ? formData.billingAddress : null;
        const shipping = formData.shippingAddress.street ? formData.shippingAddress : null;
        
        if (billing || shipping) {
          await setSaleDetail(currentSaleId, billing, shipping);
        }
      }
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting quote:', error);
      showToast.error('Failed to save quote');
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
      case 'customer-address': 
        return !!(selectedCustomer && (currentSaleId || isEditing));
      case 'items': 
        return true; // Items are optional for initial quote creation
      case 'quote': 
        return true; // Quote details are optional initially
      case 'notes': 
        return true;
      case 'shipping': 
        return true;
      default: 
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'customer-address':
        return (
          <QuoteCustomerStep
            selectedCustomer={selectedCustomer}
            onCustomerSelect={handleCustomerSelect}
            formData={formData}
            setFormData={setFormData}
            customerAddresses={customerAddresses}
            onFetchCustomerAddresses={fetchCustomerAddresses}
          />
        );
      case 'items':
        // Show message if no sale ID yet
        if (!currentSaleId && !isEditing) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Select a customer first to add items to your quote.</p>
              <Button 
                onClick={handlePrevStep}
                variant="secondary"
              >
                Go Back to Customer Selection
              </Button>
            </div>
          );
        }
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
      case 'shipping':
        return (
          <QuoteShippingStep
            formData={formData}
            handleInputChange={handleInputChange}
            saleSummary={saleSummary}
          />
        );
      case 'notes':
        // Based on the API response, the correct path is:
        const notesId = quoteDetails?.quote?.sale?.notesId;
        
        return (
          <QuoteNotesStep
            formData={formData}
            handleInputChange={handleInputChange}
            saleSummary={saleSummary}
            lineItems={lineItems}
            isEditing={isEditing}
            currentSaleId={currentSaleId}
            documentId={notesId}
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
          loading={loading || isCreatingQuote}
        />
      </div>

      {/* Show creation status */}
      {isCreatingQuote && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-blue-700 text-sm">Creating new quote...</span>
          </div>
        </div>
      )}

      {/* Show current sale ID for debugging */}
      {currentSaleId && process.env.NODE_ENV === 'development' && (
        <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
          Sale ID: {currentSaleId}
        </div>
      )}

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