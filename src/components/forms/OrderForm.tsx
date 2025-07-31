import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Calendar, CreditCard, User, MapPin, MessageSquare, ChevronRight, ChevronDown, CheckCircle, Plus, Trash2, ShoppingCart, ChevronLeft, Truck, FileText, Send, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { CustomerSearch } from '@/components/helpers/CustomerSearch';
import { AddressForm } from '@/components/forms/AddressForm';
import { iCustomer, iCustomerAddressFormData } from '@/types/customer';
import { iOrderFormData, iOrderFormProps, iOrderItem } from '@/types/order';
import { showToast } from '@/components/ui/toast';

type FormStep = 'customer' | 'address' | 'items' | 'details' | 'checkout' | 'notes';

const mockCustomerAddresses = [
  {
    id: '1',
    type: 'billing' as const,
    label: 'Home',
    name: 'Matt Herrick',
    street: '1216 Hillside Avenue',
    city: 'Chesapeake',
    state: 'Virginia',
    zipCode: '23322',
    country: 'US',
    isPrimary: true,
    isVerified: true,
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    type: 'shipping' as const,
    label: 'Office',
    name: 'Matt Herrick',
    street: '1216 Hillside Avenue',
    city: 'Chesapeake',
    state: 'Virginia',
    zipCode: '23322',
    country: 'US',
    isPrimary: false,
    isVerified: true,
    createdAt: '2025-01-15T10:00:00Z'
  }
];

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
    customer: '',
    customerEmail: '',
    status: 'new',
    paymentMethod: 'Credit Card',
    customerTotal: '0',
    supplierTotal: '0',
    inHandDate: '',
    notes: '',
    billingAddress: {
      type: 'billing',
      label: 'Home',
      name: 'Matt Herrick',
      street: '1216 Hillside Avenue',
      city: 'Chesapeake',
      state: 'Virginia',
      zipCode: '23322',
      country: 'US',
      isPrimary: true,
    },
    shippingAddress: {
      type: 'shipping',
      label: 'Office',
      name: 'Matt Herrick',
      street: '1216 Hillside Avenue',
      city: 'Chesapeake',
      state: 'Virginia',
      zipCode: '23322',
      country: 'US',
      isPrimary: false,
    },
    sameAsShipping: false,
    items: [],
    checkoutDetails: {
      inHandDate: '',
      additionalInstructions: '',
      paymentMethod: 'Credit Card',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'Paid'
    },
    shippingDetails: {
      type: 'Ground',
      company: 'UPS',
      cost: 0,
      date: '',
      trackingNumber: ''
    }
  });
  
  const [formErrors, setFormErrors] = useState<Partial<iOrderFormData>>({});

  useEffect(() => {
    if (order) {
      setFormData(prev => ({
        ...prev,
        customer: order.customer,
        customerEmail: order.customerEmail,
        status: order.status,
        paymentMethod: order.paymentMethod,
        customerTotal: order.customerTotal.toString(),
        supplierTotal: order.supplierTotal.toString(),
        inHandDate: order.inHandDate || ''
      }));
      setCurrentStep('details');
    }
  }, [order]);

  const validateCurrentStep = (): boolean => {
    const errors: Partial<iOrderFormData> = {};
    
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
      case 'items':
        if (formData.items.length === 0) {
          return false;
        }
        break;
      case 'details':
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
      const steps: FormStep[] = ['customer', 'address', 'items', 'details', 'checkout', 'notes'];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const handlePrevStep = () => {
    const steps: FormStep[] = ['customer', 'address', 'items', 'details', 'checkout', 'notes'];
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
    
    if (name.startsWith('checkout.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        checkoutDetails: {
          ...prev.checkoutDetails,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('shipping.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingDetails: {
          ...prev.shippingDetails,
          [field]: type === 'checkbox' ? checked : (field === 'cost' ? parseFloat(value) || 0 : value)
        }
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
    
    if (formErrors[name as keyof iOrderFormData]) {
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
        ...mockCustomerAddresses[0],
        name: `${customer.firstName} ${customer.lastName}`,
      },
      shippingAddress: {
        ...mockCustomerAddresses[1],
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

  const addOrderItem = () => {
    const newItem: iOrderItem = {
      id: Date.now().toString(),
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      supplierPrice: 0,
      customization: ''
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeOrderItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateOrderItem = (itemId: string, field: keyof iOrderItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const getStepTitle = (step: FormStep) => {
    switch (step) {
      case 'customer': return 'Customer';
      case 'address': return 'Addresses';
      case 'items': return 'Items';
      case 'details': return 'Details';
      case 'checkout': return 'Checkout';
      case 'notes': return 'Notes';
      default: return 'Order';
    }
  };

  const isStepCompleted = (step: FormStep) => {
    switch (step) {
      case 'customer': return !!selectedCustomer;
      case 'address': return !!(formData.billingAddress.street && formData.shippingAddress.street);
      case 'items': return formData.items.length > 0;
      case 'details': return !!(formData.customerTotal && parseFloat(formData.customerTotal) > 0);
      case 'checkout': return true;
      case 'notes': return true;
      default: return false;
    }
  };

  const handleSendInvoice = () => {
    showToast.success('Invoice sent successfully to ' + formData.customerEmail);
  };

  const handleGenerateInvoice = () => {
    showToast.success('Invoice generated successfully');
  };

  const renderStepIndicator = () => {
    const steps: FormStep[] = ['customer', 'address', 'items', 'details', 'checkout', 'notes'];
    
    return (
      <div className="flex items-center justify-between mb-3 bg-gray-50 p-2 rounded-lg">
        <Button
          type="button"
          onClick={handlePrevStep}
          variant="secondary"
          size="sm"
          icon={ChevronLeft}
          iconOnly
          disabled={currentStep === 'customer'}
          className="w-7 h-7"
        />
        
        <div className="flex items-center space-x-1 flex-1 justify-center">
          {steps.map((step, index) => {
            const isActive = step === currentStep;
            const isCompleted = isStepCompleted(step);
            
            return (
              <React.Fragment key={step}>
                <div className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {getStepTitle(step)}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-4 h-0.5 ${
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
            className="w-7 h-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={!canProceed()}
            title={isEditing ? "Update Order" : "Create Order"}
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
            className="w-7 h-7"
          />
        )}
      </div>
    );
  };

  const renderCustomerStep = () => (
    <div className="space-y-2">
      <CustomerSearch 
        onCustomerSelect={handleCustomerSelect}
        selectedCustomer={selectedCustomer}
        onNewCustomer={() => {}}
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
    <div className="space-y-3">
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm">Billing Address</h4>
          <Button
            onClick={() => setShowBillingAddressForm(!showBillingAddressForm)}
            variant="secondary"
            size="sm"
            icon={showBillingAddressForm ? ChevronDown : ChevronRight}
            className="h-6"
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
          <div className="border-t pt-2 mt-2">
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
              className="h-6"
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
          <div className="border-t pt-2 mt-2">
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

  const renderItemsStep = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 text-sm">Order Items</h4>
        <Button
          onClick={addOrderItem}
          variant="secondary"
          size="sm"
          icon={Plus}
          className="h-6"
        >
          Add Item
        </Button>
      </div>

      {formData.items.length === 0 ? (
        <Card className="p-3 text-center">
          <ShoppingCart className="w-6 h-6 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-2">No items added yet</p>
          <Button
            onClick={addOrderItem}
            variant="secondary"
            size="sm"
            icon={Plus}
          >
            Add First Item
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {formData.items.map((item, index) => (
            <Card key={item.id} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Item #{index + 1}</span>
                <Button
                  onClick={() => removeOrderItem(item.id)}
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  iconOnly
                  className="w-5 h-5"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <FormInput
                  label="Product Name"
                  name={`product-${item.id}`}
                  value={item.productName}
                  onChange={(e) => updateOrderItem(item.id, 'productName', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
                <FormInput
                  label="Quantity"
                  name={`quantity-${item.id}`}
                  type="number"
                  value={item.quantity.toString()}
                  onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  placeholder="1"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <FormInput
                  label="Unit Price"
                  name={`unitPrice-${item.id}`}
                  type="number"
                  value={item.unitPrice.toString()}
                  onChange={(e) => updateOrderItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
                <FormInput
                  label="Supplier Price"
                  name={`supplierPrice-${item.id}`}
                  type="number"
                  value={item.supplierPrice.toString()}
                  onChange={(e) => updateOrderItem(item.id, 'supplierPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                <div className="form-input-group">
                  <label className="form-label block text-sm font-medium text-gray-700 mb-1">
                    Total Price
                  </label>
                  <div className="text-lg font-bold text-green-600 py-2">
                    ${item.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              <FormInput
                label="Customization/Notes"
                name={`customization-${item.id}`}
                value={item.customization || ''}
                onChange={(e) => updateOrderItem(item.id, 'customization', e.target.value)}
                placeholder="Special instructions or customization details"
              />
            </Card>
          ))}
        </div>
      )}

      {formData.items.length > 0 && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800">Order Summary</span>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                ${formData.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
              </div>
              <div className="text-xs text-blue-600">
                {formData.items.length} item{formData.items.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  useEffect(() => {
    const customerTotal = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const supplierTotal = formData.items.reduce((sum, item) => sum + (item.supplierPrice * item.quantity), 0);
    
    setFormData(prev => ({
      ...prev,
      customerTotal: customerTotal.toString(),
      supplierTotal: supplierTotal.toString()
    }));
  }, [formData.items]);

  const renderDetailsStep = () => {
    const customerTotal = parseFloat(formData.customerTotal) || 0;
    const supplierTotal = parseFloat(formData.supplierTotal) || 0;
    const profit = customerTotal - supplierTotal;

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="new">New Order</option>
              <option value="in-production">In Production</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <FormInput
            label="In-Hand Date"
            name="inHandDate"
            type="date"
            value={formData.inHandDate}
            onChange={handleInputChange}
            helpText="Expected delivery date"
          />
        </div>

        <Card className="p-3 bg-gray-50">
          <h5 className="font-medium text-gray-800 mb-2 text-sm">Financial Summary</h5>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Customer Total:</span>
              <span className="font-bold text-green-600">${customerTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Supplier Total:</span>
              <span className="font-medium text-gray-800">${supplierTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="text-gray-600">Profit:</span>
              <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${profit.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderCheckoutStep = () => (
    <div className="space-y-3">
      <Card className="p-3">
        <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          Checkout Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            label="In-Hand Date"
            name="checkout.inHandDate"
            type="date"
            value={formData.checkoutDetails?.inHandDate || ''}
            onChange={handleInputChange}
            placeholder="dd-mm-yyyy"
          />
          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-1">
              Additional Instructions
            </label>
            <textarea
              name="checkout.additionalInstructions"
              value={formData.checkoutDetails?.additionalInstructions || ''}
              onChange={handleInputChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Special delivery instructions..."
              rows={2}
            />
          </div>
        </div>
      </Card>

      <Card className="p-3">
        <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-orange-500" />
          Shipping Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="shipping.type"
              value={formData.shippingDetails?.type || 'Ground'}
              onChange={handleInputChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="Ground">Ground</option>
              <option value="Express">Express</option>
              <option value="Overnight">Overnight</option>
            </select>
          </div>
          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <select
              name="shipping.company"
              value={formData.shippingDetails?.company || 'UPS'}
              onChange={handleInputChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="UPS">UPS</option>
              <option value="FedEx">FedEx</option>
              <option value="USPS">USPS</option>
              <option value="DHL">DHL</option>
            </select>
          </div>
          <FormInput
            label="Cost"
            name="shipping.cost"
            type="number"
            value={formData.shippingDetails?.cost?.toString() || '0'}
            onChange={handleInputChange}
            placeholder="0.00"
          />
          <FormInput
            label="Date"
            name="shipping.date"
            type="date"
            value={formData.shippingDetails?.date || ''}
            onChange={handleInputChange}
            placeholder="dd-mm-yyyy"
          />
        </div>
        <FormInput
          label="Tracking Number"
          name="shipping.trackingNumber"
          value={formData.shippingDetails?.trackingNumber || ''}
          onChange={handleInputChange}
          placeholder="Enter tracking number"
        />
      </Card>

      <Card className="p-3">
        <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-green-500" />
          Payment Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              name="checkout.paymentMethod"
              value={formData.checkoutDetails?.paymentMethod || 'Credit Card'}
              onChange={handleInputChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
            </select>
          </div>
          <FormInput
            label="Payment Date"
            name="checkout.paymentDate"
            type="date"
            value={formData.checkoutDetails?.paymentDate || ''}
            onChange={handleInputChange}
            placeholder="dd-mm-yyyy"
          />
          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              name="checkout.paymentStatus"
              value={formData.checkoutDetails?.paymentStatus || 'Paid'}
              onChange={handleInputChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotesStep = () => (
    <div className="space-y-2">
      <div className="form-input-group">
        <label className="form-label block text-sm font-medium text-gray-700 mb-1">
          Order Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          placeholder="Add any special instructions, requirements, or notes for this order..."
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">Internal notes for order processing</p>
      </div>

      <Card className="p-3 bg-blue-50 border-blue-200">
        <h5 className="font-medium text-blue-800 mb-2 text-sm">Order Summary</h5>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-blue-700">Customer:</span>
            <span className="font-medium text-blue-800">{formData.customer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Items:</span>
            <span className="font-medium text-blue-800">{formData.items.length} item{formData.items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Total Amount:</span>
            <span className="font-bold text-green-600 text-sm">${parseFloat(formData.customerTotal || '0').toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Payment:</span>
            <span className="font-medium text-blue-800">{formData.checkoutDetails?.paymentMethod || formData.paymentMethod}</span>
          </div>
          {formData.inHandDate && (
            <div className="flex justify-between">
              <span className="text-blue-700">In-Hand Date:</span>
              <span className="font-medium text-blue-800">{formData.inHandDate}</span>
            </div>
          )}
        </div>
      </Card>

      {isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            onClick={handleGenerateInvoice}
            variant="secondary"
            size="sm"
            icon={FileText}
            className="w-full"
          >
            Generate Invoice
          </Button>
          <Button
            onClick={handleSendInvoice}
            variant="primary"
            size="sm"
            icon={Send}
            className="w-full"
          >
            Send Invoice Email
          </Button>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'customer': return renderCustomerStep();
      case 'address': return renderAddressStep();
      case 'items': return renderItemsStep();
      case 'details': return renderDetailsStep();
      case 'checkout': return renderCheckoutStep();
      case 'notes': return renderNotesStep();
      default: return renderCustomerStep();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'customer': return !!selectedCustomer;
      case 'address': return !!(formData.billingAddress.street && formData.shippingAddress.street);
      case 'items': return formData.items.length > 0;
      case 'details': return !!(formData.customerTotal && parseFloat(formData.customerTotal) > 0);
      case 'checkout': return true;
      case 'notes': return true;
      default: return false;
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-3 border-b border-gray-200">
        {renderStepIndicator()}
      </div>

      <form onSubmit={handleSubmit} className="p-3 space-y-3">
        {renderCurrentStep()}
      </form>

      {isEditing && order && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Order Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Package className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500">Order Number:</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500">Created:</span>
              <span className="font-medium">{order.dateTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500">Total:</span>
              <span className="font-medium text-green-600">${order.customerTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500">Items:</span>
              <span className="font-medium">{order.itemCount || 0} items</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};