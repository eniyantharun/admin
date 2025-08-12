import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Calendar, CreditCard, User, MapPin, MessageSquare, ChevronRight, ChevronDown, CheckCircle, Plus, Trash2, ShoppingCart, ChevronLeft, Truck, FileText, Send, Mail, Phone, Building } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { CustomerSearch } from '@/components/helpers/CustomerSearch';
import { AddressForm } from '@/components/forms/AddressForm';
import { EntityAvatar } from '@/components/helpers/EntityAvatar';
import { iCustomer, iCustomerAddressFormData } from '@/types/customer';
import { iOrderFormData, iOrderFormProps, iOrderLineItem, iOrder } from '@/types/order';
import { showToast } from '@/components/ui/toast';
import { WebsiteType, OrderStatus, PaymentMethod } from '@/types/enums';

type FormStep = 'customer' | 'details' | 'notes';

export const OrderForm: React.FC<iOrderFormProps> = ({
  order,
  isEditing,
  onSubmit,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('customer');
  const [selectedCustomer, setSelectedCustomer] = useState<iCustomer | null>(null);
  const [showBillingAddressForm, setShowBillingAddressForm] = useState(false);
  const [showShippingAddressForm, setShowShippingAddressForm] = useState(false);
  
  const [formData, setFormData] = useState<iOrderFormData>({
    customerId: '',
    status: OrderStatus.NEW_ORDER,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    inHandDate: '',
    notes: '',
    shippingAddress: undefined,
    billingAddress: undefined,
    sameAsShipping: false,
    checkoutDetails: undefined,
    shippingDetails: undefined,
  });
  
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (isEditing && order) {
      setSelectedCustomer({
        id: order.customer.id,
        idNum: order.customer.idNum,
        firstName: order.customer.name.split(' ')[0] || '',
        lastName: order.customer.name.split(' ').slice(1).join(' ') || '',
        email: order.customer.email,
        phone: order.customer.phoneNumber || '',
        website: WebsiteType.PROMOTIONAL_PRODUCT_INC,
        companyName: order.customer.companyName || '',
        isBlocked: false,
        isBusinessCustomer: !!order.customer.companyName,
        createdAt: order.createdAt,
      });
      setFormData({
        customerId: order.customer.id,
        status: order.status,
        paymentMethod: order.paymentMethod || PaymentMethod.CREDIT_CARD,
        inHandDate: order.inHandDate || '',
        notes: order.notes || '',
        shippingAddress: order.shippingAddress ? {
          type: 'shipping',
          label: 'Shipping Address',
          name: order.shippingAddress.name,
          street: order.shippingAddress.addressLine,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zipCode: order.shippingAddress.zipCode,
          country: order.shippingAddress.country,
          isPrimary: false,
        } : undefined,
        billingAddress: order.billingAddress ? {
          type: 'billing',
          label: 'Billing Address',
          name: order.billingAddress.name,
          street: order.billingAddress.addressLine,
          city: order.billingAddress.city,
          state: order.billingAddress.state,
          zipCode: order.billingAddress.zipCode,
          country: order.billingAddress.country,
          isPrimary: true,
        } : undefined,
        sameAsShipping: false,
        checkoutDetails: order.checkoutDetails,
        shippingDetails: order.shippingDetails,
      });
      setCurrentStep('customer');
    }
  }, [order, isEditing]);

  const handleNextStep = () => {
    const steps: FormStep[] = ['customer', 'details', 'notes'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const steps: FormStep[] = ['customer', 'details', 'notes'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<string, string>> = {};
    
    if (!selectedCustomer) errors.customerId = 'Customer is required';
    if (!formData.status) errors.status = 'Status is required';
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required';

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
    
    if (formErrors[name as keyof iOrderFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCustomerSelect = (customer: iCustomer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
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

  const getStepTitle = (step: FormStep) => {
    switch (step) {
      case 'customer': return 'Customer Selection';
      case 'details': return 'Order Details';
      case 'notes': return 'Notes & Review';
      default: return 'Order';
    }
  };

  const isStepCompleted = (step: FormStep) => {
    switch (step) {
      case 'customer': return !!selectedCustomer;
      case 'details': return !!(formData.status && formData.paymentMethod);
      case 'notes': return true;
      default: return false;
    }
  };

  const renderStepIndicator = () => {
    const steps: FormStep[] = ['customer', 'details', 'notes'];
    
    return (
      <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
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
        
        <div className="flex items-center space-x-2 flex-1 justify-center">
          {steps.map((step, index) => {
            const isActive = step === currentStep;
            const isCompleted = isStepCompleted(step);
            
            return (
              <React.Fragment key={step}>
                <div className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                onClick={() => setCurrentStep(step)}
                >
                  {getStepTitle(step)}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${
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
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {isEditing ? "Update Order" : "Create Order"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNextStep}
            variant="primary"
            size="sm"
            icon={ChevronRight}
            className="px-4 py-2"
          >
            Next
          </Button>
        )}
      </div>
    );
  };

  const renderCustomerStep = () => {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <User className="w-6 h-6 text-blue-500" />
            Customer Selection
          </h3>
          
          {isEditing && selectedCustomer ? (
            <Card className="p-6 bg-blue-50 border-2 border-blue-200">
              <div className="flex items-center space-x-4">
                <EntityAvatar
                  name={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                  id={selectedCustomer.idNum}
                  type="customer"
                  size="lg"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold text-blue-800">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h3>
                    {selectedCustomer.isBusinessCustomer && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        Business Customer
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3 text-blue-700">
                      <Mail className="w-5 h-5" />
                      <span className="font-medium">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-blue-700">
                      <Phone className="w-5 h-5" />
                      <span className="font-medium">{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.companyName && (
                      <div className="flex items-center gap-3 text-blue-700 sm:col-span-2">
                        <Building className="w-5 h-5" />
                        <span className="font-medium">{selectedCustomer.companyName}</span>
                      </div>
                    )}
                  </div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          ) : (
            <CustomerSearch 
              onCustomerSelect={handleCustomerSelect}
              selectedCustomer={selectedCustomer}
              onNewCustomer={() => {}}
            />
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-green-500" />
            Billing & Shipping Addresses
          </h3>
          
          <div className="space-y-6">
            <Card className="p-4 border-l-4 border-l-purple-500 bg-purple-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 text-lg">Billing Address</h4>
                <Button
                  onClick={() => setShowBillingAddressForm(!showBillingAddressForm)}
                  variant="secondary"
                  size="sm"
                  icon={showBillingAddressForm ? ChevronDown : ChevronRight}
                  className="h-8"
                >
                  {formData.billingAddress?.street ? 'Edit' : 'Add'}
                </Button>
              </div>
              
              {formData.billingAddress?.street && (
                <div className="text-sm text-gray-700 bg-white p-4 rounded-lg mb-4 border border-purple-200">
                  <p className="font-semibold text-gray-900 mb-2">{formData.billingAddress.name}</p>
                  <p className="text-gray-700">{formData.billingAddress.street}</p>
                  <p className="text-gray-700">{formData.billingAddress.city}, {formData.billingAddress.state} {formData.billingAddress.zipCode}</p>
                  <p className="text-gray-700">{formData.billingAddress.country}</p>
                </div>
              )}
              
              {showBillingAddressForm && (
                <div className="border-t border-purple-200 pt-4 mt-4">
                  <AddressForm
                    address={formData.billingAddress}
                    onSubmit={handleBillingAddressSubmit}
                    onCancel={() => setShowBillingAddressForm(false)}
                  />
                </div>
              )}
            </Card>

            <Card className="p-4 border-l-4 border-l-green-500 bg-green-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 text-lg">Shipping Address</h4>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center text-sm">
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
                      className="mr-2 w-4 h-4"
                    />
                    Same as billing
                  </label>
                  <Button
                    onClick={() => setShowShippingAddressForm(!showShippingAddressForm)}
                    variant="secondary"
                    size="sm"
                    icon={showShippingAddressForm ? ChevronDown : ChevronRight}
                    disabled={formData.sameAsShipping}
                    className="h-8"
                  >
                    {formData.shippingAddress?.street ? 'Edit' : 'Add'}
                  </Button>
                </div>
              </div>
              
              {formData.shippingAddress?.street && (
                <div className="text-sm text-gray-700 bg-white p-4 rounded-lg mb-4 border border-green-200">
                  <p className="font-semibold text-gray-900 mb-2">{formData.shippingAddress.name}</p>
                  <p className="text-gray-700">{formData.shippingAddress.street}</p>
                  <p className="text-gray-700">{formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.zipCode}</p>
                  <p className="text-gray-700">{formData.shippingAddress.country}</p>
                </div>
              )}
              
              {showShippingAddressForm && !formData.sameAsShipping && (
                <div className="border-t border-green-200 pt-4 mt-4">
                  <AddressForm
                    address={formData.shippingAddress}
                    onSubmit={handleShippingAddressSubmit}
                    onCancel={() => setShowShippingAddressForm(false)}
                  />
                </div>
              )}
            </Card>
          </div>
        </Card>
      </div>
    );
  };

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-indigo-500" />
          Order Details
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="form-input-group">
            <label className="form-label block text-sm font-semibold text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
            >
              <option value={OrderStatus.NEW_ORDER}>New Order</option>
              <option value={OrderStatus.IN_PRODUCTION}>In Production</option>
              <option value={OrderStatus.SHIPPED}>Shipped</option>
              <option value={OrderStatus.COMPLETED}>Completed</option>
              <option value={OrderStatus.CANCELLED}>Cancelled</option>
            </select>
            {formErrors.status && (
              <p className="text-red-500 text-sm mt-1">{formErrors.status}</p>
            )}
          </div>

          <div className="form-input-group">
            <label className="form-label block text-sm font-semibold text-gray-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
            >
              <option value={PaymentMethod.CREDIT_CARD}>Credit Card</option>
              <option value={PaymentMethod.CHEQUE}>Cheque</option>
              <option value={PaymentMethod.COMPANY_PAYMENT_ORDER}>Company Payment Order</option>
            </select>
            {formErrors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">{formErrors.paymentMethod}</p>
            )}
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
      </Card>
    </div>
  );

  const renderNotesStep = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-purple-500" />
          Notes & Review
        </h3>
        
        <div className="space-y-6">
          <div className="form-input-group">
            <label className="form-label block text-sm font-semibold text-gray-700 mb-2">
              Order Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Add any special instructions, requirements, or notes for this order..."
              rows={6}
            />
            <p className="text-sm text-gray-500 mt-2">These notes will be visible to the customer on the order</p>
          </div>

          <Card className="p-6 bg-blue-50 border-2 border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-4 text-lg">Order Summary</h5>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Customer:</span>
                <span className="font-semibold text-blue-800">
                  {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Email:</span>
                <span className="font-semibold text-blue-800">
                  {selectedCustomer?.email || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Company:</span>
                <span className="font-semibold text-blue-800">
                  {selectedCustomer?.companyName || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Status:</span>
                <span className="font-semibold text-blue-800">
                  {formData.status === OrderStatus.NEW_ORDER ? 'New' : 
                                        formData.status === OrderStatus.IN_PRODUCTION ? 'In Production' : 
                                        formData.status === OrderStatus.SHIPPED ? 'Shipped' :
                     formData.status === OrderStatus.COMPLETED ? 'Completed' : 'Cancelled'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Payment Method:</span>
                <span className="font-semibold text-blue-800">
                  {formData.paymentMethod === PaymentMethod.CREDIT_CARD ? 'Credit Card' : 
                                        formData.paymentMethod === PaymentMethod.CHEQUE ? 'Cheque' : 'Company Payment Order'}
                </span>
              </div>
              {formData.inHandDate && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">In-Hand Date:</span>
                  <span className="font-semibold text-blue-800">{formData.inHandDate}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Billing Address:</span>
                <span className="font-semibold text-blue-800">
                  {formData.billingAddress?.street ? 'Set' : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Shipping Address:</span>
                <span className="font-semibold text-blue-800">
                  {formData.shippingAddress?.street ? 'Set' : 'Not set'}
                </span>
              </div>
            </div>
          </Card>

          {isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => showToast.success('PDF generated successfully')}
                variant="secondary"
                size="lg"
                icon={FileText}
                className="w-full h-12"
              >
                Generate PDF
              </Button>
              <Button
                onClick={() => showToast.success('Order sent successfully to ' + (selectedCustomer?.email || 'customer'))}
                variant="primary"
                size="lg"
                icon={Send}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Send to Customer
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'customer': return renderCustomerStep();
      case 'details': return renderDetailsStep();
      case 'notes': return renderNotesStep();
      default: return renderCustomerStep();
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 border-b border-gray-200">
        {renderStepIndicator()}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {renderCurrentStep()}
      </form>
    </div>
  );
};