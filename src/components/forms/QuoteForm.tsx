import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Calendar, Send, CheckCircle, User, MapPin, MessageSquare, ChevronRight, ChevronDown, ChevronLeft, Plus, Package, Mail, Phone, Building, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { CustomerSearch } from '@/components/helpers/CustomerSearch';
import { AddressForm } from '@/components/forms/AddressForm';
import { EntityAvatar } from '@/components/helpers/EntityAvatar';
import { iCustomer, iCustomerAddressFormData } from '@/types/customer';
import { iQuoteFormData, iQuoteFormProps, iQuote, LineItemData, SaleSummary, QuoteDetailsResponse } from '@/types/quotes';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';
import { LineItemCard } from '../ui/LineItemCard';

type FormStep = 'customer-address' | 'items' | 'quote' | 'notes';

const DEFAULT_QUOTE_ID = 10698; // Default quote ID as shown in the API example

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

export const QuoteForm: React.FC<iQuoteFormProps> = ({
  quote,
  isEditing,
  onSubmit,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('customer-address');
  const [selectedCustomer, setSelectedCustomer] = useState<iCustomer | null>(null);
  const [showBillingAddressForm, setShowBillingAddressForm] = useState(false);
  const [showShippingAddressForm, setShowShippingAddressForm] = useState(false);
  const [lineItems, setLineItems] = useState<LineItemData[]>([]);
  const [saleSummary, setSaleSummary] = useState<SaleSummary | null>(null);
  const [isLoadingLineItems, setIsLoadingLineItems] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetailsResponse | null>(null);
  const [currentSaleId, setCurrentSaleId] = useState<string>('');
  
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

  const { get, post } = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  // Transform API line item to our LineItemData format
  const transformApiLineItem = (apiItem: any): LineItemData => ({
    id: apiItem.id,
    productName: apiItem.form?.productName || '',
    variantName: apiItem.form?.variantName || '',
    methodName: apiItem.form?.methodName || '',
    color: apiItem.form?.color || '',
    quantity: apiItem.form?.quantity || 1,
    productItemNumber: apiItem.form?.productItemNumber || '',
    supplierItemNumber: apiItem.form?.supplierItemNumber || '',
    customerPricePerQuantity: apiItem.form?.customerPricePerQuantity || 0,
    customerSetupCharge: apiItem.form?.customerSetupCharge || 0,
    supplierPricePerQuantity: apiItem.form?.supplierPricePerQuantity || 0,
    supplierSetupCharge: apiItem.form?.supplierSetupCharge || 0,
    artworkText: apiItem.form?.artworkText || '',
    artworkSpecialInstructions: apiItem.form?.artworkSpecialInstructions || '',
    images: [],
    selectedProduct: apiItem.product || null
  });

  // Fetch quote details including line items
  const fetchQuoteDetails = async (quoteId: number) => {
    setIsLoadingLineItems(true);
    try {
      const response = await get(`https://api.promowe.com/Admin/SaleEditor/GetQuoteDetail?id=${DEFAULT_QUOTE_ID}`) as QuoteDetailsResponse;
      
      if (response?.quote?.sale) {
        setQuoteDetails(response);
        setCurrentSaleId(response.quote.saleId);
        
        // Transform and set line items from the quote details
        if (response.quote.sale.lineItems && Array.isArray(response.quote.sale.lineItems)) {
          const transformedItems = response.quote.sale.lineItems
            .filter(item => item.form?.productName) // Only include items with product names
            .map(transformApiLineItem);
          
          setLineItems(transformedItems);
          console.log('Fetched quote line items:', transformedItems);
        } else {
          setLineItems([]);
        }

        // Calculate sale summary from the quote details
        const customerTotal = response.quote.sale.lineItems.reduce((sum, item) => sum + item.customerEstimates.total, 0);
        const supplierTotal = response.quote.sale.lineItems.reduce((sum, item) => sum + item.supplierEstimates.total, 0);
        const profit = customerTotal - supplierTotal;

        setSaleSummary({
          customerSummary: {
            itemsTotal: customerTotal,
            setupCharge: response.quote.sale.lineItems.reduce((sum, item) => sum + item.customerEstimates.setupCharge, 0),
            subTotal: customerTotal,
            total: customerTotal
          },
          totalSupplierSummary: {
            itemsTotal: supplierTotal,
            setupCharge: response.quote.sale.lineItems.reduce((sum, item) => sum + item.supplierEstimates.setupCharge, 0),
            subTotal: supplierTotal,
            total: supplierTotal
          },
          profit: profit
        });

        // Update form data with quote details
        setFormData(prev => ({
          ...prev,
          customerTotal: customerTotal.toString(),
          inHandDate: response.quote.sale.dates.inHandDate || '',
          notes: response.quote.sale.comments?.[0]?.comment || '',
        }));

        // Set customer data from quote details
        const customer = response.quote.sale.customer;
        const customerData: iCustomer = {
          id: customer.id,
          idNum: customer.idNum,
          firstName: customer.form.firstName,
          lastName: customer.form.lastName,
          email: customer.form.email,
          phone: customer.form.phoneNumber || '',
          website: customer.website,
          companyName: customer.form.companyName || '',
          isBlocked: false,
          isBusinessCustomer: !!customer.form.companyName,
          createdAt: customer.createdAt,
        };
        setSelectedCustomer(customerData);

        // Set addresses from quote details
        const billing = response.quote.sale.billingAddress;
        const shipping = response.quote.sale.shippingAddress;

        if (billing.addressLine) {
          setFormData(prev => ({
            ...prev,
            billingAddress: {
              type: 'billing' as const,
              label: 'Billing Address',
              name: billing.name,
              street: billing.addressLine,
              city: billing.city,
              state: billing.state,
              zipCode: billing.zipCode,
              country: billing.country || 'US',
              isPrimary: true,
            }
          }));
        }

        if (shipping.addressLine) {
          setFormData(prev => ({
            ...prev,
            shippingAddress: {
              type: 'shipping' as const,
              label: 'Shipping Address',
              name: shipping.name,
              street: shipping.addressLine,
              city: shipping.city,
              state: shipping.state,
              zipCode: shipping.zipCode,
              country: shipping.country || 'US',
              isPrimary: false,
            }
          }));
        }
      }
      
    } catch (error) {
      console.error('Error fetching quote details:', error);
      showToast.error('Failed to load quote details');
      setLineItems([]);
      setSaleSummary(null);
    } finally {
      setIsLoadingLineItems(false);
    }
  };

  useEffect(() => {
    if (isEditing && quote) {
      // Use the quote ID to fetch details
      fetchQuoteDetails(quote.id);
      
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
      setCurrentStep('customer-address');
    } else {
      // For new quotes, use default data and fetch default quote details for demo
      setSelectedCustomer(mockCustomer);
      setFormData({
        customer: mockCustomer.firstName + ' ' + mockCustomer.lastName,
        customerEmail: mockCustomer.email,
        status: 'new-quote',
        customerTotal: '0',
        inHandDate: '',
        notes: '',
        billingAddress: mockAddresses.billing,
        shippingAddress: mockAddresses.shipping,
        sameAsShipping: false,
      });

      // Fetch default quote details for demo purposes
      const timeoutId = setTimeout(() => {
        fetchQuoteDetails(DEFAULT_QUOTE_ID);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [quote, isEditing]);

  const fetchSaleSummary = async () => {
    if (!currentSaleId) return;
    
    try {
      const response = await post(`https://api.promowe.com/Admin/SaleEditor/GetSaleSummary?saleId=${currentSaleId}`);
      if (response) {
        setSaleSummary(response);
        setFormData(prev => ({
          ...prev,
          customerTotal: response.customerSummary.total.toString()
        }));
        console.log('Sale summary updated:', response);
      }
    } catch (error) {
      console.error('Failed to fetch sale summary:', error);
      showToast.error('Failed to fetch sale summary');
    }
  };

  const handleAddEmptyLineItem = async () => {
    if (!currentSaleId) {
      showToast.error('No sale ID available to add line item');
      return;
    }

    try {
      const response = await post('https://api.promowe.com/Admin/SaleEditor/AddEmptyLineItem', {
        saleId: currentSaleId
      });
      
      if (response && response.lineItems) {
        const newItems: LineItemData[] = response.lineItems.map(transformApiLineItem);
        setLineItems(newItems);
        await fetchSaleSummary();
        showToast.success('Line item added successfully');
      }
    } catch (error) {
      console.error('Failed to add line item:', error);
      showToast.error('Failed to add line item');
    }
  };

  const handleUpdateLineItem = async (itemId: string, updatedItem: LineItemData) => {
    setLineItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
    await fetchSaleSummary();
  };

  const handleRemoveLineItem = async (itemId: string) => {
    if (!currentSaleId) {
      showToast.error('No sale ID available to remove line item');
      return;
    }

    try {
      const response = await post('https://api.promowe.com/Admin/SaleEditor/RemoveLineItems', {
        saleId: currentSaleId,
        lineItemIds: [itemId]
      });
      
      if (response && response.lineItems) {
        const updatedItems: LineItemData[] = response.lineItems.map(transformApiLineItem);
        setLineItems(updatedItems);
        await fetchSaleSummary();
        showToast.success('Line item removed successfully');
      }
    } catch (error) {
      showToast.error('Failed to remove line item');
    }
  };

  const handleNextStep = () => {
    const steps: FormStep[] = ['customer-address', 'items', 'quote', 'notes'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const steps: FormStep[] = ['customer-address', 'items', 'quote', 'notes'];
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

  const getStepTitle = (step: FormStep) => {
    switch (step) {
      case 'customer-address': return 'Customer & Address';
      case 'items': return 'Items';
      case 'quote': return 'Quote Details';
      case 'notes': return 'Notes';
      default: return 'Quote';
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

  const renderStepIndicator = () => {
    const steps: FormStep[] = ['customer-address', 'items', 'quote', 'notes'];
    
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

  const renderCustomerAndAddressStep = () => {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            Customer Selection
          </h4>
          
          {selectedCustomer ? (
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

        {selectedCustomer && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-500" />
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
        )}
      </div>
    );
  };

  const renderItemsStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 text-sm">Quote Items</h4>
        <Button
          onClick={handleAddEmptyLineItem}
          variant="secondary"
          size="sm"
          icon={Plus}
          className="h-7"
          disabled={isLoadingLineItems}
        >
          Add Line Item
        </Button>
      </div>

      {isLoadingLineItems ? (
        <Card className="p-6 text-center">
          <div className="w-8 h-8 mx-auto mb-3 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading line items...</p>
        </Card>
      ) : lineItems.length === 0 ? (
        <Card className="p-6 text-center">
          <Package className="w-8 h-8 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 mb-3">No items added yet</p>
          <Button
            onClick={handleAddEmptyLineItem}
            variant="secondary"
            size="sm"
            icon={Plus}
          >
            Add First Line Item
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <LineItemCard
              key={item.id}
              item={item}
              index={index}
              saleId={currentSaleId}
              onRemove={handleRemoveLineItem}
              onUpdate={handleUpdateLineItem}
              isNew={false}
            />
          ))}
        </div>
      )}

      {saleSummary && !isLoadingLineItems && (
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-800">Quote Summary</span>
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">
                ${saleSummary.customerSummary.total.toFixed(2)}
              </div>
              <div className="text-xs text-purple-600">
                {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-orange-600">
                Profit: ${saleSummary.profit.toFixed(2)}
              </div>
            </div>
          </div>
        </Card>
      )}
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

      {saleSummary && (
        <Card className="p-4 bg-gray-50">
          <h5 className="font-medium text-gray-800 mb-3 text-sm">Financial Summary</h5>
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
          </div>
        </Card>
      )}
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

      {saleSummary && (
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
              <span className="font-medium text-blue-800">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Images:</span>
              <span className="font-medium text-blue-800">{lineItems.reduce((sum, item) => sum + (item.images?.length || 0), 0)} total</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Items Total:</span>
              <span className="font-medium text-blue-800">${saleSummary.customerSummary.itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Setup Charges:</span>
              <span className="font-medium text-blue-800">${saleSummary.customerSummary.setupCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Total Amount:</span>
              <span className="font-bold text-green-600 text-lg">${saleSummary.customerSummary.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Profit:</span>
              <span className="font-bold text-orange-600">${saleSummary.profit.toFixed(2)}</span>
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
      )}

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
      case 'customer-address': return renderCustomerAndAddressStep();
      case 'items': return renderItemsStep();
      case 'quote': return renderQuoteStep();
      case 'notes': return renderNotesStep();
      default: return renderCustomerAndAddressStep();
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

      {isEditing && quote && quoteDetails && (
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
              <span className="font-medium">{lineItems.reduce((sum, item) => sum + (item.images?.length || 0), 0)} total</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Sale ID:</span>
              <span className="font-medium">{currentSaleId}</span>
            </div>
          </div>

          {quoteDetails.quote.sale.comments.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2 text-sm">Recent Comments</h5>
              <div className="space-y-2">
                {quoteDetails.quote.sale.comments.map((comment, index) => (
                  <div key={comment.id} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-600">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-blue-700 ml-5">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};