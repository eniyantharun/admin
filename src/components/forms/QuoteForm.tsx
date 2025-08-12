import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Calendar, Send, CheckCircle, User, MapPin, MessageSquare, ChevronRight, ChevronDown, ChevronLeft, Plus, Trash2, Package, Mail, Phone, Building, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { CustomerSearch } from '@/components/helpers/CustomerSearch';
import { AddressForm } from '@/components/forms/AddressForm';
import { EntityAvatar } from '@/components/helpers/EntityAvatar';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { iCustomer, iCustomerAddressFormData } from '@/types/customer';
import { iQuoteFormData, iQuoteFormProps, iQuote } from '@/types/quotes';
import { showToast } from '@/components/ui/toast';

type FormStep = 'customer' | 'address' | 'items' | 'quote' | 'notes';

interface QuoteItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: string;
  description?: string;
  images?: string[];
}

const mockCustomer: iCustomer = {
  id: '12345',
  idNum: 67890,
  firstName: 'Christina',
  lastName: 'Johnson',
  email: 'christina.johnson@example.com',
  phone: '(555) 123-4567',
  website: 'promotionalproductinc.com',
  companyName: 'Johnson Marketing LLC',
  isBlocked: false,
  isBusinessCustomer: true,
  createdAt: '2025-01-15T10:00:00Z',
};

const mockAddresses = {
  billing: {
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
  shipping: {
    type: 'shipping' as const,
    label: 'Warehouse',
    name: 'Christina Johnson',
    street: '456 Industrial Blvd',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30310',
    country: 'US',
    isPrimary: false,
  }
};

const mockQuoteItems: QuoteItem[] = [
  {
    id: '1',
    productName: 'Custom Branded Mugs',
    quantity: 100,
    unitPrice: 8.50,
    totalPrice: 850.00,
    customization: 'Company logo on both sides',
    description: 'Ceramic mugs with custom full-color printing',
    images: [
      'https://tiimg.tistatic.com/fp/1/008/403/customized-printed-promotional-mugs-for-corporate-personal-gift-105.jpg?w=400&h=400&fit=crop',
      'https://d2fy0k1bcbbnwr.cloudfront.net/Designs_Inners_and_Outers/Mugs/mug_basic_pat_d539_o.jpg?w=400&h=400&fit=crop',
      'https://crystalimagery.com/cdn/shop/products/Logo_coffee_e6da97d1-4fb9-485b-b848-e0ebc4f5238f_1024x1024.jpg?v=1619803077?w=400&h=400&fit=crop'
    ]
  },
  {
    id: '2', 
    productName: 'Promotional Pens',
    quantity: 500,
    unitPrice: 1.25,
    totalPrice: 625.00,
    customization: 'Company name and contact info',
    description: 'Metal ballpoint pens with laser engraving',
    images: [
      'https://store.jaunpurmart.in/wp-content/uploads/2024/11/02.jpg?w=400&h=400&fit=crop',
      'https://store.jaunpurmart.in/wp-content/uploads/2024/11/03.jpg?w=400&h=400&fit=crop',
      'https://promotionway.com/data/shopproducts/6724/aluminium-ball-pen-coloured-touch-ip131503-52-vm-ea.jpg?w=400&h=400&fit=crop'
    ]
  }
];

export const QuoteForm: React.FC<iQuoteFormProps> = ({
  quote,
  isEditing,
  onSubmit,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('customer');
  const [selectedCustomer, setSelectedCustomer] = useState<iCustomer | null>(null);
  const [showBillingAddressForm, setShowBillingAddressForm] = useState(false);
  const [showShippingAddressForm, setShowShippingAddressForm] = useState(false);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  
  const [formData, setFormData] = useState<iQuoteFormData>({
    customer: '',
    customerEmail: '',
    status: 'new-quote',
    customerTotal: '0',
    inHandDate: '',
    notes: '',
    billingAddress: mockAddresses.billing,
    shippingAddress: mockAddresses.shipping,
    sameAsShipping: false,
  });
  
  const [formErrors, setFormErrors] = useState<Partial<iQuoteFormData>>({});

  useEffect(() => {
    if (isEditing && quote) {
      setSelectedCustomer(mockCustomer);
      setQuoteItems(mockQuoteItems);
      setFormData({
        customer: quote.customer,
        customerEmail: quote.customerEmail,
        status: quote.status,
        customerTotal: quote.customerTotal.toString(),
        inHandDate: quote.inHandDate || '',
        notes: quote.notes || '',
        billingAddress: mockAddresses.billing,
        shippingAddress: mockAddresses.shipping,
        sameAsShipping: false,
      });
      setCurrentStep('customer');
    } else {
      setSelectedCustomer(mockCustomer);
      setQuoteItems(mockQuoteItems);
      setFormData({
        customer: mockCustomer.firstName + ' ' + mockCustomer.lastName,
        customerEmail: mockCustomer.email,
        status: 'new-quote',
        customerTotal: mockQuoteItems.reduce((sum, item) => sum + item.totalPrice, 0).toString(),
        inHandDate: '',
        notes: '',
        billingAddress: mockAddresses.billing,
        shippingAddress: mockAddresses.shipping,
        sameAsShipping: false,
      });
    }
  }, [quote, isEditing]);

  const handleNextStep = () => {
    const steps: FormStep[] = ['customer', 'address', 'items', 'quote', 'notes'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const steps: FormStep[] = ['customer', 'address', 'items', 'quote', 'notes'];
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
    if (quoteItems.length === 0) {
      showToast.error('At least one item is required');
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

  const handleCustomerSelect = (customer: iCustomer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customer: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      billingAddress: {
        ...mockAddresses.billing,
        name: `${customer.firstName} ${customer.lastName}`,
      },
      shippingAddress: {
        ...mockAddresses.shipping,
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

  const addQuoteItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      customization: '',
      description: '',
      images: []
    };
    setQuoteItems(prev => [...prev, newItem]);
  };

  const removeQuoteItem = (itemId: string) => {
    setQuoteItems(prev => prev.filter(item => item.id !== itemId));
    showToast.success('Item removed from quote');
  };

  const updateQuoteItem = (itemId: string, field: keyof QuoteItem, value: any) => {
    setQuoteItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const updateQuoteItemImages = (itemId: string, images: string[]) => {
    updateQuoteItem(itemId, 'images', images);
  };

  useEffect(() => {
    const total = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
    setFormData(prev => ({
      ...prev,
      customerTotal: total.toString()
    }));
  }, [quoteItems]);

  const getStepTitle = (step: FormStep) => {
    switch (step) {
      case 'customer': return 'Customer';
      case 'address': return 'Addresses';
      case 'items': return 'Items';
      case 'quote': return 'Quote Details';
      case 'notes': return 'Notes';
      default: return 'Quote';
    }
  };

  const isStepCompleted = (step: FormStep) => {
    switch (step) {
      case 'customer': return !!selectedCustomer;
      case 'address': return !!(formData.billingAddress.street && formData.shippingAddress.street);
      case 'items': return quoteItems.length > 0;
      case 'quote': return !!(formData.customerTotal && parseFloat(formData.customerTotal) > 0);
      case 'notes': return true;
      default: return false;
    }
  };

  const renderItemsStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 text-sm">Quote Items</h4>
        <Button
          onClick={addQuoteItem}
          variant="secondary"
          size="sm"
          icon={Plus}
          className="h-7"
        >
          Add Item
        </Button>
      </div>

      {quoteItems.length === 0 ? (
        <Card className="p-6 text-center">
          <Package className="w-8 h-8 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 mb-3">No items added yet</p>
          <Button
            onClick={addQuoteItem}
            variant="secondary"
            size="sm"
            icon={Plus}
          >
            Add First Item
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {quoteItems.map((item, index) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">Item #{index + 1}</span>
                <Button
                  onClick={() => removeQuoteItem(item.id)}
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  iconOnly
                  className="w-6 h-6"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <FormInput
                  label="Product Name"
                  name={`product-${item.id}`}
                  value={item.productName}
                  onChange={(e) => updateQuoteItem(item.id, 'productName', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
                <FormInput
                  label="Description"
                  name={`description-${item.id}`}
                  value={item.description || ''}
                  onChange={(e) => updateQuoteItem(item.id, 'description', e.target.value)}
                  placeholder="Product description"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                <FormInput
                  label="Quantity"
                  name={`quantity-${item.id}`}
                  type="number"
                  value={item.quantity.toString()}
                  onChange={(e) => updateQuoteItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  placeholder="1"
                  required
                />
                <FormInput
                  label="Unit Price"
                  name={`unitPrice-${item.id}`}
                  type="number"
                  value={item.unitPrice.toString()}
                  onChange={(e) => updateQuoteItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
                <div className="form-input-group">
                  <label className="form-label block text-sm font-medium text-gray-700 mb-1">
                    Total Price
                  </label>
                  <div className="text-lg font-bold text-green-600 py-2">
                    ${item.totalPrice.toFixed(2)}
                  </div>
                </div>
                <div className="form-input-group">
                  <label className="form-label block text-sm font-medium text-gray-700 mb-1">
                    Margin
                  </label>
                  <div className="text-sm text-gray-600 py-2">
                    {item.unitPrice > 0 ? ((item.unitPrice * 0.15) / item.unitPrice * 100).toFixed(1) : '0.0'}%
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <FormInput
                  label="Customization/Notes"
                  name={`customization-${item.id}`}
                  value={item.customization || ''}
                  onChange={(e) => updateQuoteItem(item.id, 'customization', e.target.value)}
                  placeholder="Special instructions or customization details"
                />
              </div>

              <div className="border-t pt-3">
                <ImageGallery
                  images={item.images || []}
                  onImagesChange={(images) => updateQuoteItemImages(item.id, images)}
                  title={`${item.productName || 'Product'} Images`}
                  maxImages={8}
                  editable={true}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {quoteItems.length > 0 && (
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-800">Quote Summary</span>
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">
                ${quoteItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
              </div>
              <div className="text-xs text-purple-600">
                {quoteItems.length} item{quoteItems.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-purple-600">
                {quoteItems.reduce((sum, item) => sum + (item.images?.length || 0), 0)} images
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderStepIndicator = () => {
    const steps: FormStep[] = ['customer', 'address', 'items', 'quote', 'notes'];
    
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
                <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-purple-500 text-white' 
                    : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
                onClick={() => setCurrentStep(step)}
                >
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
            className="w-8 h-8"
          />
        )}
      </div>
    );
  };

  const renderCustomerStep = () => {
    if (isEditing && selectedCustomer) {
      return (
        <div className="space-y-4">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-4">
              <EntityAvatar
                name={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                id={selectedCustomer.idNum}
                type="customer"
                size="lg"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-blue-800">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h3>
                  {selectedCustomer.isBusinessCustomer && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Business Customer
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Mail className="w-4 h-4" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700">
                    <Phone className="w-4 h-4" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  {selectedCustomer.companyName && (
                    <div className="flex items-center gap-2 text-blue-700 sm:col-span-2">
                      <Building className="w-4 h-4" />
                      <span>{selectedCustomer.companyName}</span>
                    </div>
                  )}
                </div>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </Card>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              This quote is associated with the customer shown above.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentStep('address')}
            >
              Continue to Addresses
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
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
  };

  const renderAddressStep = () => (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
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
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-900">{formData.billingAddress.name}</p>
            <p>{formData.billingAddress.street}</p>
            <p>{formData.billingAddress.city}, {formData.billingAddress.state} {formData.billingAddress.zipCode}</p>
            <p className="text-xs text-blue-600 mt-1">{formData.billingAddress.label}</p>
          </div>
        )}
        
        {showBillingAddressForm && (
          <div className="border-t pt-3 mt-3">
            <AddressForm
              address={formData.billingAddress}
              onSubmit={handleBillingAddressSubmit}
              onCancel={() => setShowBillingAddressForm(false)}
            />
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
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
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-900">{formData.shippingAddress.name}</p>
            <p>{formData.shippingAddress.street}</p>
            <p>{formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.zipCode}</p>
            <p className="text-xs text-blue-600 mt-1">{formData.shippingAddress.label}</p>
          </div>
        )}
        
        {showShippingAddressForm && !formData.sameAsShipping && (
          <div className="border-t pt-3 mt-3">
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          label="In-Hand Date"
          name="inHandDate"
          type="date"
          value={formData.inHandDate}
          onChange={handleInputChange}
          helpText="Expected delivery date (optional)"
        />
      </div>

      <Card className="p-4 bg-gray-50">
        <h5 className="font-medium text-gray-800 mb-3 text-sm">Financial Summary</h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${parseFloat(formData.customerTotal || '0').toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (8.5%):</span>
            <span className="font-medium">${(parseFloat(formData.customerTotal || '0') * 0.085).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600 font-medium">Total Amount:</span>
            <span className="font-bold text-green-600 text-lg">
              ${(parseFloat(formData.customerTotal || '0') * 1.085).toFixed(2)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotesStep = () => (
    <div className="space-y-4">
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

      <Card className="p-4 bg-blue-50 border-blue-200">
        <h5 className="font-medium text-blue-800 mb-3 text-sm">Quote Summary</h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Customer:</span>
            <span className="font-medium text-blue-800">{formData.customer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Email:</span>
            <span className="font-medium text-blue-800">{formData.customerEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Items:</span>
            <span className="font-medium text-blue-800">{quoteItems.length} item{quoteItems.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Images:</span>
            <span className="font-medium text-blue-800">{quoteItems.reduce((sum, item) => sum + (item.images?.length || 0), 0)} total</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Subtotal:</span>
            <span className="font-medium text-blue-800">${parseFloat(formData.customerTotal || '0').toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Total Amount:</span>
            <span className="font-bold text-green-600 text-lg">${(parseFloat(formData.customerTotal || '0') * 1.085).toFixed(2)}</span>
          </div>
          {formData.inHandDate && (
            <div className="flex justify-between">
              <span className="text-blue-700">In-Hand Date:</span>
              <span className="font-medium text-blue-800">{formData.inHandDate}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-blue-700">Status:</span>
            <span className="font-medium text-blue-800">
              {formData.status === 'new-quote' ? 'New Quote' : 
               formData.status === 'quote-sent-to-customer' ? 'Quote Sent' : 
               'Converted to Order'}
            </span>
          </div>
        </div>
      </Card>

      {isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={() => showToast.success('PDF generated successfully')}
            variant="secondary"
            size="sm"
            icon={FileText}
            className="w-full"
          >
            Generate PDF
          </Button>
          <Button
            onClick={() => showToast.success('Quote sent successfully to ' + formData.customerEmail)}
            variant="primary"
            size="sm"
            icon={Send}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Send to Customer
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
      case 'quote': return renderQuoteStep();
      case 'notes': return renderNotesStep();
      default: return renderCustomerStep();
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 border-b border-gray-200">
        {renderStepIndicator()}
      </div>

      <form onSubmit={handleSubmit} className="p-2 space-y-2">
        {renderCurrentStep()}
      </form>

      {isEditing && quote && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Quote Information</h4>
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
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium text-green-600">${quote.customerTotal.toFixed(2)}</span>
            </div>
            {quote.inHandDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">In-Hand Date:</span>
                <span className="font-medium">{quote.inHandDate}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Images:</span>
              <span className="font-medium">{quoteItems.reduce((sum, item) => sum + (item.images?.length || 0), 0)} total</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};