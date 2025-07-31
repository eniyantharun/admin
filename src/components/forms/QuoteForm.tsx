import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Calendar, Send, CheckCircle, User, MapPin, MessageSquare, ChevronRight, ChevronDown, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { CustomerSearch } from '@/components/helpers/CustomerSearch';
import { AddressForm } from '@/components/forms/AddressForm';
import { iCustomer, iCustomerAddress, iCustomerAddressFormData } from '@/types/customer';

interface Quote {
  id: number;
  quoteNumber: string;
  customer: string;
  customerEmail: string;
  status: 'new-quote' | 'quote-sent-to-customer' | 'quote-converted-to-order';
  dateTime: string;
  inHandDate: string | null;
  customerTotal: number;
}

interface QuoteFormData {
  customer: string;
  customerEmail: string;
  status: string;
  customerTotal: string;
  inHandDate: string;
  notes: string;
  billingAddress: iCustomerAddressFormData;
  shippingAddress: iCustomerAddressFormData;
  sameAsShipping: boolean;
}

interface QuoteFormProps {
  quote?: Quote | null;
  isEditing: boolean;
  onSubmit: (data: QuoteFormData) => Promise<void>;
  loading?: boolean;
}

type FormStep = 'customer' | 'address' | 'quote' | 'notes';

export const QuoteForm: React.FC<QuoteFormProps> = ({
  quote,
  isEditing,
  onSubmit,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('customer');
  const [selectedCustomer, setSelectedCustomer] = useState<iCustomer | null>(null);
  const [customerAddresses, setCustomerAddresses] = useState<iCustomerAddress[]>([]);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [showBillingAddressForm, setShowBillingAddressForm] = useState(false);
  const [showShippingAddressForm, setShowShippingAddressForm] = useState(false);
  
  const [formData, setFormData] = useState<QuoteFormData>({
    customer: '',
    customerEmail: '',
    status: 'new-quote',
    customerTotal: '0',
    inHandDate: '',
    notes: '',
    billingAddress: {
      type: 'billing',
      label: 'Billing',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      isPrimary: false,
    },
    shippingAddress: {
      type: 'shipping',
      label: 'Shipping',
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
  
  const [formErrors, setFormErrors] = useState<Partial<QuoteFormData>>({});

  useEffect(() => {
    if (quote) {
      setFormData(prev => ({
        ...prev,
        customer: quote.customer,
        customerEmail: quote.customerEmail,
        status: quote.status,
        customerTotal: quote.customerTotal.toString(),
        inHandDate: quote.inHandDate || ''
      }));
      setCurrentStep('quote');
    }
  }, [quote]);

  const validateCurrentStep = (): boolean => {
    const errors: Partial<QuoteFormData> = {};
    
    switch (currentStep) {
      case 'customer':
        if (!selectedCustomer) {
          return false;
        }
        break;
      case 'address':
        if (!formData.billingAddress.street || !formData.shippingAddress.street) {
          return false;
        }
        break;
      case 'quote':
        if (!formData.customerTotal || parseFloat(formData.customerTotal) <= 0) {
          errors.customerTotal = 'Customer total must be greater than 0';
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      const steps: FormStep[] = ['customer', 'address', 'quote', 'notes'];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const handlePrevStep = () => {
    const steps: FormStep[] = ['customer', 'address', 'quote', 'notes'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) {
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
    
    if (formErrors[name as keyof QuoteFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCustomerSelect = (customer: iCustomer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customer: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      billingAddress: {
        ...prev.billingAddress,
        name: `${customer.firstName} ${customer.lastName}`,
      },
      shippingAddress: {
        ...prev.shippingAddress,
        name: `${customer.firstName} ${customer.lastName}`,
      }
    }));
  };

  const handleBillingAddressSubmit = (addressData: iCustomerAddressFormData) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: addressData
    }));
    setShowBillingAddressForm(false);
  };

  const handleShippingAddressSubmit = (addressData: iCustomerAddressFormData) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: addressData
    }));
    setShowShippingAddressForm(false);
  };

  const getStepIcon = (step: FormStep) => {
    switch (step) {
      case 'customer': return User;
      case 'address': return MapPin;
      case 'quote': return FileText;
      case 'notes': return MessageSquare;
      default: return FileText;
    }
  };

  const getStepTitle = (step: FormStep) => {
    switch (step) {
      case 'customer': return 'Select Customer';
      case 'address': return 'Billing & Shipping';
      case 'quote': return 'Quote Details';
      case 'notes': return 'Additional Notes';
      default: return 'Quote';
    }
  };

  const isStepCompleted = (step: FormStep) => {
    switch (step) {
      case 'customer': return !!selectedCustomer;
      case 'address': return !!(formData.billingAddress.street && formData.shippingAddress.street);
      case 'quote': return !!(formData.customerTotal && parseFloat(formData.customerTotal) > 0);
      case 'notes': return true;
      default: return false;
    }
  };

  const renderStepIndicator = () => {
    const steps: FormStep[] = ['customer', 'address', 'quote', 'notes'];
    
    return (
      <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
        <Button
          type="button"
          onClick={handlePrevStep}
          variant="secondary"
          size="sm"
          icon={ChevronLeft}
          iconOnly
          disabled={currentStep === 'customer'}
          className="w-8 h-8"
        />
        
        <div className="flex items-center space-x-1 flex-1 justify-center">
          {steps.map((step, index) => {
            const isActive = step === currentStep;
            const isCompleted = isStepCompleted(step);
            
            return (
              <React.Fragment key={step}>
                <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {getStepTitle(step)}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-6 h-0.5 ${
                    isStepCompleted(steps[index]) ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {currentStep === 'notes' ? (
          <Button
            type="submit"
            loading={loading}
            size="sm"
            icon={CheckCircle}
            iconOnly
            className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            disabled={!canProceed()}
            title={isEditing ? "Update Quote" : "Create Quote"}
          />
        ) : (
          <Button
            type="button"
            onClick={handleNextStep}
            variant="primary"
            size="sm"
            icon={ChevronRight}
            iconOnly
            disabled={!canProceed()}
            className="w-8 h-8"
          />
        )}
      </div>
    );
  };

  const renderCustomerStep = () => (
    <div className="space-y-3">
      <CustomerSearch 
        onCustomerSelect={handleCustomerSelect}
        selectedCustomer={selectedCustomer}
        onNewCustomer={() => setShowNewCustomerForm(true)}
      />
      
      {selectedCustomer && (
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-800 text-sm">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </p>
              <p className="text-xs text-green-600">{selectedCustomer.email}</p>
              {selectedCustomer.companyName && (
                <p className="text-xs text-green-600">{selectedCustomer.companyName}</p>
              )}
            </div>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        </Card>
      )}
    </div>
  );

  const renderAddressStep = () => (
    <div className="space-y-4">
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm">Billing Address</h4>
          <Button
            onClick={() => setShowBillingAddressForm(!showBillingAddressForm)}
            variant="secondary"
            size="sm"
            icon={showBillingAddressForm ? ChevronDown : ChevronRight}
            className="h-7"
          >
            {formData.billingAddress.street ? 'Edit' : 'Add'}
          </Button>
        </div>
        
        {formData.billingAddress.street && (
          <div className="text-xs text-gray-600 mb-2">
            <p className="font-medium">{formData.billingAddress.name}</p>
            <p>{formData.billingAddress.street}</p>
            <p>{formData.billingAddress.city}, {formData.billingAddress.state} {formData.billingAddress.zipCode}</p>
          </div>
        )}
        
        {showBillingAddressForm && (
          <div className="border-t pt-3 mt-2">
            <AddressForm
              address={formData.billingAddress}
              onSubmit={handleBillingAddressSubmit}
              onCancel={() => setShowBillingAddressForm(false)}
            />
          </div>
        )}
      </Card>

      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm">Shipping Address</h4>
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={formData.sameAsShipping}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    sameAsShipping: e.target.checked,
                    shippingAddress: e.target.checked ? prev.billingAddress : prev.shippingAddress
                  }));
                }}
                className="mr-1 w-3 h-3"
              />
              Same as billing
            </label>
            <Button
              onClick={() => setShowShippingAddressForm(!showShippingAddressForm)}
              variant="secondary"
              size="sm"
              icon={showShippingAddressForm ? ChevronDown : ChevronRight}
              disabled={formData.sameAsShipping}
              className="h-7"
            >
              {formData.shippingAddress.street ? 'Edit' : 'Add'}
            </Button>
          </div>
        </div>
        
        {formData.shippingAddress.street && (
          <div className="text-xs text-gray-600 mb-2">
            <p className="font-medium">{formData.shippingAddress.name}</p>
            <p>{formData.shippingAddress.street}</p>
            <p>{formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.zipCode}</p>
          </div>
        )}
        
        {showShippingAddressForm && !formData.sameAsShipping && (
          <div className="border-t pt-3 mt-2">
            <AddressForm
              address={formData.shippingAddress}
              onSubmit={handleShippingAddressSubmit}
              onCancel={() => setShowShippingAddressForm(false)}
            />
          </div>
        )}
      </Card>
    </div>
  );

  const renderQuoteStep = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <option value="new-quote">New Quote</option>
            <option value="quote-sent-to-customer">Quote Sent to Customer</option>
            <option value="quote-converted-to-order">Quote Converted to Order</option>
          </select>
        </div>

        <FormInput
          label="Quote Total"
          name="customerTotal"
          type="number"
          value={formData.customerTotal}
          onChange={handleInputChange}
          error={formErrors.customerTotal}
          required
          placeholder="0.00"
        />
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
  );

  const renderNotesStep = () => (
    <div className="space-y-1">
      <div className="form-input-group">
        <label className="form-label block text-sm font-medium text-gray-700 mb-1">
          Quote Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
          placeholder="Add any special instructions, requirements, or notes for this quote..."
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">These notes will be visible to the customer on the quote</p>
      </div>

      <Card className="p-3 bg-blue-50 border-blue-200">
        <h5 className="font-medium text-blue-800 mb-2 text-sm">Quote Summary</h5>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-blue-700">Customer:</span>
            <span className="font-medium text-blue-800">{formData.customer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Email:</span>
            <span className="font-medium text-blue-800">{formData.customerEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Total Amount:</span>
            <span className="font-bold text-green-600 text-sm">${parseFloat(formData.customerTotal || '0').toFixed(2)}</span>
          </div>
          {formData.inHandDate && (
            <div className="flex justify-between">
              <span className="text-blue-700">In-Hand Date:</span>
              <span className="font-medium text-blue-800">{formData.inHandDate}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'customer': return renderCustomerStep();
      case 'address': return renderAddressStep();
      case 'quote': return renderQuoteStep();
      case 'notes': return renderNotesStep();
      default: return renderCustomerStep();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'customer': return !!selectedCustomer;
      case 'address': return !!(formData.billingAddress.street && formData.shippingAddress.street);
      case 'quote': return !!(formData.customerTotal && parseFloat(formData.customerTotal) > 0);
      case 'notes': return true;
      default: return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 border-b border-gray-200">
        {renderStepIndicator()}
      </div>

      <form onSubmit={handleSubmit} className="p-6 ">
        {renderCurrentStep()}

        
      </form>

      {isEditing && quote && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Quote Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Quote Number:</span>
              <span className="font-medium">{quote.quoteNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Created:</span>
              <span className="font-medium">{quote.dateTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Total:</span>
              <span className="font-medium text-green-600">${quote.customerTotal.toFixed(2)}</span>
            </div>
            {quote.inHandDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">In-Hand Date:</span>
                <span className="font-medium">{quote.inHandDate}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};