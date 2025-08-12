import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Calendar, CreditCard, User, MapPin, MessageSquare, ChevronRight, ChevronDown, CheckCircle, Plus, Trash2, ShoppingCart, ChevronLeft, Truck, FileText, Send, Mail, Phone, Building, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { CustomerSearch } from '@/components/helpers/CustomerSearch';
import { AddressForm } from '@/components/forms/AddressForm';
import { EntityAvatar } from '@/components/helpers/EntityAvatar';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { iCustomer, iCustomerAddressFormData } from '@/types/customer';
import { iOrderFormData, iOrderFormProps, iOrderItem, iOrder } from '@/types/order';
import { showToast } from '@/components/ui/toast';

type FormStep = 'customer-address' | 'items' | 'details' | 'checkout' | 'notes';

interface ExtendedOrderItem extends iOrderItem {
  images?: string[];
}

const mockCustomer: iCustomer = {
  id: '67890',
  idNum: 12345,
  firstName: 'Cameron',
  lastName: 'Davis',
  email: 'cameron.davis@example.com',
  phone: '(555) 987-6543',
  website: 'promotionalproductinc.com',
  companyName: 'Davis Construction Co.',
  isBlocked: false,
  isBusinessCustomer: true,
  createdAt: '2025-01-10T09:00:00Z',
};

const mockCustomerAddresses = {
  billing: {
    type: 'billing' as const,
    label: 'Main Office',
    name: 'Cameron Davis',
    street: '789 Commerce Street',
    city: 'Houston',
    state: 'TX',
    zipCode: '77002',
    country: 'US',
    isPrimary: true,
  },
  shipping: {
    type: 'shipping' as const,
    label: 'Job Site',
    name: 'Cameron Davis',
    street: '321 Industrial Way',
    city: 'Houston',
    state: 'TX',
    zipCode: '77003',
    country: 'US',
    isPrimary: false,
  }
};

const mockOrderItems: ExtendedOrderItem[] = [
  {
    id: '1',
    productName: 'Safety Helmets with Logo',
    quantity: 50,
    unitPrice: 12.50,
    totalPrice: 625.00,
    supplierPrice: 8.75,
    customization: 'Company logo and safety certification',
    description: 'ANSI-approved hard hats with custom branding',
    images: [
      'https://images.unsplash.com/photo-1649027421785-6827863f0891??w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1652423790373-f113dd1aa7fc??w=400&h=400&fit=crop',
      'https://plus.unsplash.com/premium_photo-1671808063730-a9df57b66b42?w=400&h=400&fit=crop'
    ]
  },
  {
    id: '2',
    productName: 'Reflective Vests',
    quantity: 75,
    unitPrice: 15.80,
    totalPrice: 1185.00,
    supplierPrice: 11.20,
    customization: 'Company name on back panel',
    description: 'High-visibility safety vests Class 2',
    images: [
      'https://images.unsplash.com/photo-1662121396496-5c1d6c1db0d3?w=400&h=400&fit=crop',
      'https://plus.unsplash.com/premium_photo-1678837404794-35cd6a4a275c?w=400&h=400&fit=crop'
    ]
  },
  {
    id: '3',
    productName: 'Tool Bags with Embroidery',
    quantity: 25,
    unitPrice: 28.00,
    totalPrice: 700.00,
    supplierPrice: 19.50,
    customization: 'Embroidered company logo',
    description: 'Heavy-duty canvas tool bags',
    images: [
      'https://matohash.com/cdn/shop/products/carhartt-foundry-series-14-tool-bag-embroidery-202237.jpg?w=400&h=400&fit=crop',
      'https://matohash.com/cdn/shop/products/carhartt-foundry-series-14-tool-bag-embroidery-750945.jpg?w=400&h=400&fit=crop'
    ]
  }
];

export const OrderForm: React.FC<iOrderFormProps> = ({
  order,
  isEditing,
  onSubmit,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('customer-address');
  const [selectedCustomer, setSelectedCustomer] = useState<iCustomer | null>(null);
  const [showBillingAddressForm, setShowBillingAddressForm] = useState(false);
  const [showShippingAddressForm, setShowShippingAddressForm] = useState(false);
  const [orderItems, setOrderItems] = useState<ExtendedOrderItem[]>([]);
  
  const [formData, setFormData] = useState<iOrderFormData>({
    customer: '',
    customerEmail: '',
    status: 'new',
    paymentMethod: 'Credit Card',
    customerTotal: '0',
    supplierTotal: '0',
    inHandDate: '',
    notes: '',
    billingAddress: mockCustomerAddresses.billing,
    shippingAddress: mockCustomerAddresses.shipping,
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
      cost: 25.50,
      date: '',
      trackingNumber: ''
    }
  });
  
  const [formErrors, setFormErrors] = useState<Partial<iOrderFormData>>({});

  useEffect(() => {
    if (isEditing && order) {
      setSelectedCustomer(mockCustomer);
      setOrderItems(mockOrderItems);
      setFormData(prev => ({
        ...prev,
        customer: order.customer,
        customerEmail: order.customerEmail,
        status: order.status,
        paymentMethod: order.paymentMethod,
        customerTotal: order.customerTotal.toString(),
        supplierTotal: order.supplierTotal.toString(),
        inHandDate: order.inHandDate || '',
        notes: order.notes || '',
        items: mockOrderItems,
      }));
      setCurrentStep('customer-address');
    } else {
      setSelectedCustomer(mockCustomer);
      setOrderItems(mockOrderItems);
      const customerTotal = mockOrderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const supplierTotal = mockOrderItems.reduce((sum, item) => sum + (item.supplierPrice * item.quantity), 0);
      
      setFormData(prev => ({
        ...prev,
        customer: mockCustomer.firstName + ' ' + mockCustomer.lastName,
        customerEmail: mockCustomer.email,
        customerTotal: customerTotal.toString(),
        supplierTotal: supplierTotal.toString(),
        items: mockOrderItems,
      }));
    }
  }, [order, isEditing]);

  const handleNextStep = () => {
    const steps: FormStep[] = ['customer-address', 'items', 'details', 'checkout', 'notes'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const steps: FormStep[] = ['customer-address', 'items', 'details', 'checkout', 'notes'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<iOrderFormData> = {};
    
    if (!selectedCustomer) errors.customer = 'Customer is required';
    if (!formData.customerTotal || parseFloat(formData.customerTotal) <= 0) {
      errors.customerTotal = 'Customer total must be greater than 0';
    }
    if (orderItems.length === 0) {
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
    
    if (name.startsWith('checkout.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        checkoutDetails: {
          ...prev.checkoutDetails!,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('shipping.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingDetails: {
          ...prev.shippingDetails!,
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
        ...mockCustomerAddresses.billing,
        name: `${customer.firstName} ${customer.lastName}`,
      },
      shippingAddress: {
        ...mockCustomerAddresses.shipping,
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
    const newItem: ExtendedOrderItem = {
      id: Date.now().toString(),
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      supplierPrice: 0,
      customization: '',
      description: '',
      images: []
    };
    setOrderItems(prev => [...prev, newItem]);
  };

  const removeOrderItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
    showToast.success('Item removed from order');
  };

  const updateOrderItem = (itemId: string, field: keyof ExtendedOrderItem, value: any) => {
    setOrderItems(prev => prev.map(item => {
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

  const updateOrderItemImages = (itemId: string, images: string[]) => {
    updateOrderItem(itemId, 'images', images);
  };

  useEffect(() => {
    const customerTotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const supplierTotal = orderItems.reduce((sum, item) => sum + (item.supplierPrice * item.quantity), 0);
    
    setFormData(prev => ({
      ...prev,
      customerTotal: customerTotal.toString(),
      supplierTotal: supplierTotal.toString(),
      items: orderItems
    }));
  }, [orderItems]);

  const getStepTitle = (step: FormStep) => {
    switch (step) {
      case 'customer-address': return 'Customer & Address';
      case 'items': return 'Items';
      case 'details': return 'Details';
      case 'checkout': return 'Checkout';
      case 'notes': return 'Notes';
      default: return 'Order';
    }
  };

  const isStepCompleted = (step: FormStep) => {
    switch (step) {
      case 'customer-address': return !!(selectedCustomer && formData.billingAddress.street && formData.shippingAddress.street);
      case 'items': return orderItems.length > 0;
      case 'details': return !!(formData.customerTotal && parseFloat(formData.customerTotal) > 0);
      case 'checkout': return true;
      case 'notes': return true;
      default: return false;
    }
  };

  const renderStepIndicator = () => {
    const steps: FormStep[] = ['customer-address', 'items', 'details', 'checkout', 'notes'];
    
    return (
      <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
        <Button
          type="button"
          onClick={handlePrevStep}
          variant="secondary"
          size="sm"
          icon={ChevronLeft}
          iconOnly
          disabled={currentStep === 'customer-address'}
          className="w-8 h-8"
        />
        
        <div className="flex items-center space-x-1 flex-1 justify-center">
          {steps.map((step, index) => {
            const isActive = step === currentStep;
            const isCompleted = isStepCompleted(step);
            
            return (
              <React.Fragment key={step}>
                <div className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
                onClick={() => setCurrentStep(step)}
                >
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
            className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
            className="w-8 h-8"
          />
        )}
      </div>
    );
  };

  const renderCustomerAndAddressStep = () => {
    return (
      <div className="space-y-4">
        {/* Customer Selection */}
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            Customer Selection
          </h4>
          
          {isEditing && selectedCustomer ? (
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
          ) : (
            <CustomerSearch 
              onCustomerSelect={handleCustomerSelect}
              selectedCustomer={selectedCustomer}
              onNewCustomer={() => {}}
            />
          )}
        </Card>

        {/* Address Selection */}
        {selectedCustomer && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Billing Address */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Billing Address
                </h4>
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
                <div className="text-xs text-gray-600 mb-2 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">{formData.billingAddress.name}</p>
                  <p>{formData.billingAddress.street}</p>
                  <p>{formData.billingAddress.city}, {formData.billingAddress.state} {formData.billingAddress.zipCode}</p>
                  <p className="text-xs text-blue-600 mt-1">{formData.billingAddress.label}</p>
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

            {/* Shipping Address */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-500" />
                  Shipping Address
                </h4>
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
                <div className="text-xs text-gray-600 mb-2 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">{formData.shippingAddress.name}</p>
                  <p>{formData.shippingAddress.street}</p>
                  <p>{formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.zipCode}</p>
                  <p className="text-xs text-blue-600 mt-1">{formData.shippingAddress.label}</p>
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
        )}
      </div>
    );
  };

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

      {orderItems.length === 0 ? (
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
          {orderItems.map((item, index) => (
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
                  label="Description"
                  name={`description-${item.id}`}
                  value={item.description || ''}
                  onChange={(e) => updateOrderItem(item.id, 'description', e.target.value)}
                  placeholder="Product description"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-3">
                <FormInput
                  label="Quantity"
                  name={`quantity-${item.id}`}
                  type="number"
                  value={item.quantity.toString()}
                  onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  placeholder="1"
                  required
                />
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
                <div className="form-input-group">
                  <label className="form-label block text-sm font-medium text-gray-700 mb-1">
                    Profit
                  </label>
                  <div className="text-sm font-medium text-orange-600 py-2">
                    ${((item.unitPrice - item.supplierPrice) * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <FormInput
                  label="Customization/Notes"
                  name={`customization-${item.id}`}
                  value={item.customization || ''}
                  onChange={(e) => updateOrderItem(item.id, 'customization', e.target.value)}
                  placeholder="Special instructions or customization details"
                />
              </div>

              <div className="border-t pt-3">
                <ImageGallery
                  images={item.images || []}
                  onImagesChange={(images) => updateOrderItemImages(item.id, images)}
                  title={`${item.productName || 'Product'} Images`}
                  maxImages={8}
                  editable={true}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {orderItems.length > 0 && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800">Order Summary</span>
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">
                ${orderItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
              </div>
              <div className="text-xs text-blue-600">
                {orderItems.length} item{orderItems.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-orange-600">
                Profit: ${orderItems.reduce((sum, item) => sum + ((item.unitPrice - item.supplierPrice) * item.quantity), 0).toFixed(2)}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

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
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium text-gray-800">${formData.shippingDetails?.cost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="text-gray-600">Gross Profit:</span>
              <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${profit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Margin:</span>
              <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {customerTotal > 0 ? ((profit / customerTotal) * 100).toFixed(1) : '0.0'}%
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
              <option value="Net 30">Net 30</option>
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
            <span className="font-medium text-blue-800">{orderItems.length} item{orderItems.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Images:</span>
            <span className="font-medium text-blue-800">{orderItems.reduce((sum, item) => sum + (item.images?.length || 0), 0)} total</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Subtotal:</span>
            <span className="font-medium text-blue-800">${parseFloat(formData.customerTotal || '0').toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Shipping:</span>
            <span className="font-medium text-blue-800">${formData.shippingDetails?.cost?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span className="text-blue-700">Total Amount:</span>
            <span className="font-bold text-green-600 text-sm">
              ${(parseFloat(formData.customerTotal || '0') + (formData.shippingDetails?.cost || 0)).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Payment:</span>
            <span className="font-medium text-blue-800">{formData.checkoutDetails?.paymentMethod || formData.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Status:</span>
            <span className="font-medium text-blue-800">
              {formData.status === 'new' ? 'New Order' : 
               formData.status === 'in-production' ? 'In Production' : 
               formData.status === 'shipped' ? 'Shipped' : 
               formData.status === 'delivered' ? 'Delivered' : 'Cancelled'}
            </span>
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
            onClick={() => showToast.success('Invoice generated successfully')}
            variant="secondary"
            size="sm"
            icon={FileText}
            className="w-full"
          >
            Generate Invoice
          </Button>
          <Button
            onClick={() => showToast.success('Invoice sent successfully to ' + formData.customerEmail)}
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
      case 'customer-address': return renderCustomerAndAddressStep();
      case 'items': return renderItemsStep();
      case 'details': return renderDetailsStep();
      case 'checkout': return renderCheckoutStep();
      case 'notes': return renderNotesStep();
      default: return renderCustomerAndAddressStep();
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
          <h4 className="text-sm font-medium text-gray-700 mb-2">Order Information</h4>
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
          </div>
        </div>
      )}
    </div>
  );
};