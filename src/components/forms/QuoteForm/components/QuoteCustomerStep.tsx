import React, { useState } from 'react';
import { User, MapPin, CheckCircle, ChevronDown, ChevronRight, Mail, Phone, Building } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EntityAvatar } from '@/components/helpers/EntityAvatar';
import { CustomerSearch } from '@/components/helpers/CustomerSearch';
import { AddressForm } from '@/components/forms/AddressForm';
import { iCustomer, iCustomerAddressFormData } from '@/types/customer';
import { iQuoteFormData } from '@/types/quotes';

interface QuoteCustomerStepProps {
  selectedCustomer: iCustomer | null;
  onCustomerSelect: (customer: iCustomer) => void;
  formData: iQuoteFormData;
  setFormData: React.Dispatch<React.SetStateAction<iQuoteFormData>>;
}

export const QuoteCustomerStep: React.FC<QuoteCustomerStepProps> = ({
  selectedCustomer,
  onCustomerSelect,
  formData,
  setFormData
}) => {
  const [showBillingAddressForm, setShowBillingAddressForm] = useState(false);
  const [showShippingAddressForm, setShowShippingAddressForm] = useState(false);

  const handleCustomerSelect = (customer: iCustomer) => {
    onCustomerSelect(customer);
    setFormData(prev => ({
      ...prev,
      customer: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      billingAddress: {
        type: 'billing' as const,
        label: 'Corporate Office',
        name: `${customer.firstName} ${customer.lastName}`,
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
        name: `${customer.firstName} ${customer.lastName}`,
        street: '456 Industrial Blvd',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30310',
        country: 'US',
        isPrimary: false,
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
            <div className="flex items-center justify-between mb-1">
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