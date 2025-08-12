import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, User, Building, Mail, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useApi } from '@/hooks/useApi';
import { EntityAvatar } from '@/components/helpers/EntityAvatar';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { EntityDrawer } from '@/components/helpers/EntityDrawer';
import { EmptyState, LoadingState } from '@/components/helpers/EmptyLoadingStates';
import { iCustomer, iApiCustomer, iCustomerFormData } from '@/types/customer';
import { googleMapsUtils } from '@/lib/googleMaps';
import { showToast } from '@/components/ui/toast';

interface CustomerSearchProps {
  onCustomerSelect: (customer: iCustomer) => void;
  selectedCustomer?: iCustomer | null;
  onNewCustomer?: () => void;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({
  onCustomerSelect,
  selectedCustomer,
  onNewCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<iCustomer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  
  const { get, loading } = useApi({
    cancelOnUnmount: true,
    dedupe: true,
    cacheDuration: 30000,
  });

  const submitApi = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  const transformApiCustomer = useCallback((apiCustomer: iApiCustomer): iCustomer => {
    return {
      id: apiCustomer.id,
      idNum: apiCustomer.idNum,
      firstName: apiCustomer.form.firstName || '',
      lastName: apiCustomer.form.lastName || '',
      email: apiCustomer.form.email || '',
      phone: apiCustomer.form.phoneNumber 
        ? googleMapsUtils.formatPhoneNumber(apiCustomer.form.phoneNumber) 
        : '',
      website: apiCustomer.website || 'PromotionalProductInc',
      companyName: apiCustomer.form.companyName || '',
      isBlocked: false,
      isBusinessCustomer: !!apiCustomer.form.companyName,
      createdAt: apiCustomer.createdAt,
    };
  }, []);

  const searchCustomers = useCallback(async (term: string) => {
    if (!term.trim()) {
      setCustomers([]);
      setShowResults(false);
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        Search: term,
        Count: '10',
        Index: '0',
        Website: 'promotional_product_inc',
      });

      const response = await get(`/Admin/CustomerEditor/GetCustomersList?${queryParams}`);
      
      if (response?.customers) {
        const transformedCustomers = response.customers.map(transformApiCustomer);
        setCustomers(transformedCustomers);
        setShowResults(true);
      }
    } catch (error: any) {
      if (error?.name !== 'CanceledError') {
        showToast.error('Failed to search customers');
      }
    }
  }, [get, transformApiCustomer]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCustomers(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchCustomers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCustomerSelect = (customer: iCustomer) => {
    onCustomerSelect(customer);
    setShowResults(false);
    setSearchTerm(`${customer.firstName} ${customer.lastName}`);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCustomers([]);
    setShowResults(false);
  };

  const handleNewCustomerSubmit = async (formData: iCustomerFormData) => {
    try {
      const response = await submitApi.post('/Admin/CustomerEditor/CreateCustomer', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        companyName: formData.companyName,
        isBusinessCustomer: formData.isBusinessCustomer,
      });

      if (response?.data) {
        const newCustomer: iCustomer = {
          id: response.data.id,
          idNum: response.data.idNum || 0,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          companyName: formData.companyName,
          isBlocked: false,
          isBusinessCustomer: formData.isBusinessCustomer,
          createdAt: new Date().toISOString(),
        };

        handleCustomerSelect(newCustomer);
        setShowNewCustomerForm(false);
        showToast.success('Customer created successfully');
      }
    } catch (error: any) {
      if (error?.name !== 'CanceledError') {
        showToast.error('Failed to create customer');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {showResults && (
        <Card className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4">
              <LoadingState message="Searching customers..." />
            </div>
          ) : customers.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={User}
                title="No customers found"
                description="Try a different search term or create a new customer"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="flex items-center space-x-3">
                    <EntityAvatar
                      name={`${customer.firstName} ${customer.lastName}`}
                      id={customer.idNum}
                      type="customer"
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {customer.firstName} {customer.lastName}
                        </p>
                        {customer.isBusinessCustomer && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Business
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                      {customer.companyName && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                          <Building className="w-3 h-3" />
                          <span className="truncate">{customer.companyName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="flex justify-center">
        <Button
          onClick={() => setShowNewCustomerForm(true)}
          variant="secondary"
          icon={Plus}
          className="border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
        >
          Create New Customer
        </Button>
      </div>

      <EntityDrawer
        isOpen={showNewCustomerForm}
        onClose={() => setShowNewCustomerForm(false)}
        title="Create New Customer"
        size="xl"
        loading={submitApi.loading}
      >
        <CustomerForm
          customer={null}
          isEditing={false}
          onSubmit={handleNewCustomerSubmit}
          loading={submitApi.loading}
        />
      </EntityDrawer>
    </div>
  );
};