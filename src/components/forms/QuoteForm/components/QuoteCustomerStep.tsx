import React, { useState, useEffect } from 'react';
import { User, MapPin, CheckCircle, ChevronDown, ChevronRight, Mail, Phone, Building, Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EntityAvatar } from '@/components/helpers/EntityAvatar';
import { CustomerSearch } from '@/components/helpers/CustomerSearch';
import { AddressForm } from '@/components/forms/AddressForm';
import { iCustomer, iCustomerAddressFormData, iCustomerAddress } from '@/types/customer';
import { iQuoteFormData } from '@/types/quotes';

interface QuoteCustomerStepProps {
  selectedCustomer: iCustomer | null;
  onCustomerSelect: (customer: iCustomer) => void;
  formData: iQuoteFormData;
  setFormData: React.Dispatch<React.SetStateAction<iQuoteFormData>>;
  customerAddresses: iCustomerAddress[];
  onFetchCustomerAddresses: (customerId: string) => Promise<void>;
}

export const QuoteCustomerStep: React.FC<QuoteCustomerStepProps> = ({
  selectedCustomer,
  onCustomerSelect,
  formData,
  setFormData,
  customerAddresses,
  onFetchCustomerAddresses
}) => {
  const [showBillingAddressForm, setShowBillingAddressForm] = useState(false);
  const [showShippingAddressForm, setShowShippingAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<'billing' | 'shipping' | null>(null);

  const handleCustomerSelect = async (customer: iCustomer) => {
    onCustomerSelect(customer);
    setFormData(prev => ({
      ...prev,
      customer: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
    }));
    
    // Fetch customer addresses
    if (customer.id) {
      await onFetchCustomerAddresses(customer.id);
    }
  };

  useEffect(() => {
    // Auto-populate addresses when customer addresses are loaded
    if (customerAddresses.length > 0 && selectedCustomer) {
      const billingAddress = customerAddresses.find(addr => addr.type === 'billing' && addr.isPrimary) || 
                            customerAddresses.find(addr => addr.type === 'billing') ||
                            customerAddresses[0];
      
      const shippingAddress = customerAddresses.find(addr => addr.type === 'shipping' && addr.isPrimary) || 
                             customerAddresses.find(addr => addr.type === 'shipping') ||
                             customerAddresses[0];

      if (billingAddress && !formData.billingAddress.street) {
        setFormData(prev => ({
          ...prev,
          billingAddress: {
            type: 'billing' as const,
            label: billingAddress.label,
            name: billingAddress.name,
            street: billingAddress.street,
            city: billingAddress.city,
            state: billingAddress.state,
            zipCode: billingAddress.zipCode,
            country: billingAddress.country,
            isPrimary: billingAddress.isPrimary,
          }
        }));
      }

      if (shippingAddress && !formData.shippingAddress.street) {
        setFormData(prev => ({
          ...prev,
          shippingAddress: {
            type: 'shipping' as const,
            label: shippingAddress.label,
            name: shippingAddress.name,
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country,
            isPrimary: shippingAddress.isPrimary,
          }
        }));
      }
    }
  }, [customerAddresses, selectedCustomer, formData.billingAddress.street, formData.shippingAddress.street, setFormData]);

  const handleAddressSelect = (address: iCustomerAddress, type: 'billing' | 'shipping') => {
    setFormData(prev => ({
      ...prev,
      [type === 'billing' ? 'billingAddress' : 'shippingAddress']: {
        type: type,
        label: address.label,
        name: address.name,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        isPrimary: address.isPrimary,
      }
    }));
  };

  const handleNewAddressSubmit = (addressData: iCustomerAddressFormData, type: 'billing' | 'shipping') => {
    setFormData(prev => ({
      ...prev,
      [type === 'billing' ? 'billingAddress' : 'shippingAddress']: addressData
    }));
    
    if (type === 'billing') {
      setShowBillingAddressForm(false);
    } else {
      setShowShippingAddressForm(false);
    }
    setEditingAddress(null);
  };

  return (
    <div className="space-y-2">
      <Card className="p-2">
        <h4 className="font-medium text-gray-900 text-sm mb-1 flex items-center gap-1">
          <User className="w-4 h-4 text-blue-500" />
          Customer Selection
        </h4>
        
        {selectedCustomer ? (
          <Card className="p-2 bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-2">
              <EntityAvatar
                name={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                id={selectedCustomer.idNum}
                type="customer"
                size="lg"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-1 mb-1">
                  <h6 className="text-sm font-semibold text-blue-800">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h6>
                  {selectedCustomer.isBusinessCustomer ? (
                      <span className="inline-flex items-center px-1 py-1 rounded-full text-2xs font-medium bg-blue-100 text-blue-800">
                        Business Customer
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1 py-1 rounded-full text-2xs font-medium bg-gray-100 text-gray-800">
                        Individual Customer
                      </span>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1 text-blue-700">
                    <Mail className="w-4 h-4" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-700">
                    <Phone className="w-4 h-4" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  {selectedCustomer.companyName && (
                    <div className="flex items-center gap-1 text-blue-700 sm:col-span-2">
                      <Building className="w-4 h-4" />
                      <span>{selectedCustomer.companyName}</span>
                    </div>
                  )}
                </div>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            
            {/* Customer Change Button */}
            <div className="mt-2 pt-2 border-t border-blue-200">
              <Button
                onClick={() => onCustomerSelect(null as any)}
                variant="secondary"
                size="sm"
                className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Change Customer
              </Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                Billing Address
              </h4>
              <div className="flex items-center gap-2">
                {customerAddresses.filter(addr => addr.type === 'billing').length > 0 && (
                  <select
                    onChange={(e) => {
                      const selectedAddr = customerAddresses.find(addr => addr.id === e.target.value);
                      if (selectedAddr) handleAddressSelect(selectedAddr, 'billing');
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                    defaultValue=""
                  >
                    <option value="">Select saved address</option>
                    {customerAddresses.filter(addr => addr.type === 'billing').map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} - {addr.street}
                      </option>
                    ))}
                  </select>
                )}
                <Button
                  onClick={() => {
                    setShowBillingAddressForm(!showBillingAddressForm);
                    setEditingAddress('billing');
                  }}
                  variant="secondary"
                  size="sm"
                  icon={formData.billingAddress.street ? Edit : Plus}
                  className="h-7"
                >
                  {formData.billingAddress.street ? 'Edit' : 'Add'}
                </Button>
              </div>
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
                  address={editingAddress === 'billing' ? formData.billingAddress : undefined}
                  onSubmit={(data) => handleNewAddressSubmit(data, 'billing')}
                  onCancel={() => {
                    setShowBillingAddressForm(false);
                    setEditingAddress(null);
                  }}
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
                {!formData.sameAsShipping && customerAddresses.filter(addr => addr.type === 'shipping').length > 0 && (
                  <select
                    onChange={(e) => {
                      const selectedAddr = customerAddresses.find(addr => addr.id === e.target.value);
                      if (selectedAddr) handleAddressSelect(selectedAddr, 'shipping');
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                    defaultValue=""
                  >
                    <option value="">Select saved address</option>
                    {customerAddresses.filter(addr => addr.type === 'shipping').map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} - {addr.street}
                      </option>
                    ))}
                  </select>
                )}
                <Button
                  onClick={() => {
                    setShowShippingAddressForm(!showShippingAddressForm);
                    setEditingAddress('shipping');
                  }}
                  variant="secondary"
                  size="sm"
                  icon={formData.shippingAddress.street ? Edit : Plus}
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
                  address={editingAddress === 'shipping' ? formData.shippingAddress : undefined}
                  onSubmit={(data) => handleNewAddressSubmit(data, 'shipping')}
                  onCancel={() => {
                    setShowShippingAddressForm(false);
                    setEditingAddress(null);
                  }}
                />
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};