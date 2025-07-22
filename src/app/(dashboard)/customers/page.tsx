'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Edit2, Phone, Mail, Building, X, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useApi } from '@/hooks/useApi';
import { usePageSearch, useSearch } from '@/contexts/SearchContext';

// Import helper components
import { EntityAvatar } from '@/components/helpers/EntityAvatar';
import { DateDisplay } from '@/components/helpers/DateDisplay';
import { EmptyState, LoadingState } from '@/components/helpers/EmptyLoadingStates';
import { FormInput } from '@/components/helpers/FormInput';
import { PaginationControls } from '@/components/helpers/PaginationControls';
import { SearchStatusIndicator } from '@/components/helpers/SearchStatusIndicator';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  joinedDate: string;
}

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
}

interface Comment {
  id: string;
  text: string;
  timestamp: string;
  type: 'manual' | 'auto';
}

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface ApiCustomer {
  form: {
    companyName: string | null;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  website: string;
  id: string;
  idNum: number;
  name: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<CustomerFormData>>({});
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      street: '19680 Tree Stand Terrace',
      city: 'Loxahatchee',
      state: 'Florida',
      zipCode: '33470',
      country: 'US'
    }
  ]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const { get, post, put, loading } = useApi();
  const submitApi = useApi();
  
  const { searchQuery, setSearchResults } = useSearch();

  const transformApiCustomer = useCallback((apiCustomer: ApiCustomer): Customer => {
    return {
      id: apiCustomer.idNum,
      firstName: apiCustomer.form.firstName || '',
      lastName: apiCustomer.form.lastName || '',
      email: apiCustomer.form.email || '',
      phone: apiCustomer.form.phoneNumber || '',
      companyName: apiCustomer.form.companyName || '',
      joinedDate: new Date(apiCustomer.createdAt).toLocaleString()
    };
  }, []);

  const handleGlobalSearch = useCallback(async (query: string) => {
    try {
      const queryParams = new URLSearchParams({
        website: 'PromotionalProductInc',
        search: query,
        count: '10',
        index: '0'
      });

      const response = await get(`/Admin/CustomerEditor/GetCustomersList?${queryParams}`);
      const transformedCustomers = response.customers.map(transformApiCustomer);
      
      const searchResults = transformedCustomers.map((customer: Customer) => ({
        id: customer.id,
        title: `${customer.firstName} ${customer.lastName}`,
        subtitle: customer.email,
        description: customer.companyName || 'No company',
        type: 'customer',
        data: customer
      }));
      
      setSearchResults(searchResults);
    } catch (error) {
      console.error('Error searching customers:', error);
      setSearchResults([]);
    }
  }, [get, setSearchResults, transformApiCustomer]);

  // Memoized search configuration
  const searchConfig = useMemo(() => ({
    placeholder: 'Search customers by name, email, or company...',
    enabled: true,
    searchFunction: handleGlobalSearch,
    filters: [
      {
        key: 'company',
        label: 'Company',
        type: 'select' as const,
        options: [
          { value: '', label: 'All Companies' },
          { value: 'with-company', label: 'With Company' },
          { value: 'without-company', label: 'Without Company' }
        ]
      }
    ]
  }), [handleGlobalSearch]);

  usePageSearch(searchConfig);

  const effectiveSearchTerm = searchQuery || localSearchTerm;

  const fetchCustomers = useCallback(async () => {
    if (!isInitialLoad && loading) return;

    try {
      const queryParams = new URLSearchParams({
        website: 'PromotionalProductInc',
        search: effectiveSearchTerm,
        count: rowsPerPage.toString(),
        index: ((currentPage - 1) * rowsPerPage).toString()
      });

      const response = await get(`/Admin/CustomerEditor/GetCustomersList?${queryParams}`);
      const transformedCustomers = response.customers.map(transformApiCustomer);
      
      setCustomers(transformedCustomers);
      setTotalCount(response.count);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsInitialLoad(false);
    }
  }, [effectiveSearchTerm, currentPage, rowsPerPage, get, transformApiCustomer, isInitialLoad, loading]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [effectiveSearchTerm]);

  useEffect(() => {
    if (searchQuery && searchQuery !== localSearchTerm) {
      setLocalSearchTerm(searchQuery);
    }
  }, [searchQuery, localSearchTerm]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  const validateForm = (): boolean => {
    const errors: Partial<CustomerFormData> = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isEditing && selectedCustomer) {
        await submitApi.put(`/Admin/CustomerEditor/UpdateCustomer/${selectedCustomer.id}`, {
          form: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phone,
            companyName: formData.companyName || null
          }
        });
      } else {
        await submitApi.post('/Admin/CustomerEditor/CreateCustomer', {
          website: 'PromotionalProductInc',
          form: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phone,
            companyName: formData.companyName || null
          }
        });
      }

      await fetchCustomers();
      closeModal();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const openNewCustomerModal = () => {
    setFormData({ firstName: '', lastName: '', email: '', phone: '', companyName: '' });
    setFormErrors({});
    setIsEditing(false);
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const openEditCustomerModal = (customer: Customer) => {
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      companyName: customer.companyName
    });
    setFormErrors({});
    setIsEditing(true);
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    setIsEditing(false);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', companyName: '' });
    setFormErrors({});
    setNewComment('');
    setShowAddressForm(false);
    setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '' });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      timestamp: new Date().toLocaleDateString() + '\n' + new Date().toLocaleTimeString(),
      type: 'manual'
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const addAutoComment = (text: string) => {
    const comment: Comment = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toLocaleDateString() + '\n' + new Date().toLocaleTimeString(),
      type: 'auto'
    };
    setComments([comment, ...comments]);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street.trim() || !newAddress.city.trim()) return;

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress
    };

    setAddresses([...addresses, address]);
    setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '' });
    setShowAddressForm(false);
  };

  const sendResetPasswordEmail = async () => {
    if (selectedCustomer) {
      try {
        await post('/Admin/CustomerEditor/SendResetPasswordEmail', {
          email: selectedCustomer.email,
          website: 'PromotionalProductInc'
        });
        alert(`Reset password email sent to ${selectedCustomer.email}`);
        addAutoComment(`Sent reset password email to ${selectedCustomer.email}`);
      } catch (error) {
        console.error('Error sending reset password email:', error);
        alert('Failed to send reset password email');
      }
    }
  };

  const sendNewAccountEmail = async () => {
    if (selectedCustomer) {
      try {
        await post('/Admin/CustomerEditor/SendNewAccountEmail', {
          email: selectedCustomer.email,
          website: 'PromotionalProductInc'
        });
        alert(`New account email sent to ${selectedCustomer.email}`);
        addAutoComment(`Sent new account email to ${selectedCustomer.email}`);
      } catch (error) {
        console.error('Error sending new account email:', error);
        alert('Failed to send new account email');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name as keyof CustomerFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  // Memoized ContactInfo component
  const ContactInfo = React.memo(({ customer }: { customer: Customer }) => (
    <>
      <div className="text-sm text-gray-900 flex items-center gap-1">
        <Mail className="w-3 h-3 text-gray-400" />
        <span className="truncate max-w-xs">{customer.email}</span>
      </div>
      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
        <Phone className="w-3 h-3 text-gray-400" />
        <span>{customer.phone || 'No phone'}</span>
      </div>
    </>
  ));

  ContactInfo.displayName = 'ContactInfo';

  return (
    <div className="customers-page space-y-4">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Customer List ({totalCount.toLocaleString()})
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {searchQuery && <SearchStatusIndicator query={searchQuery} />}
              <Button
                onClick={openNewCustomerModal}
                icon={Plus}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                New Customer
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && isInitialLoad ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8">
                    <LoadingState message="Loading customers..." />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8">
                    <EmptyState
                      icon={User}
                      title="No customers found"
                      description="Get started by adding your first customer."
                      hasSearch={!!effectiveSearchTerm}
                    />
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <EntityAvatar name={`${customer.firstName} ${customer.lastName}`} id={customer.id} type="customer" />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-xs text-gray-500">ID: {customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <ContactInfo customer={customer} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-xs">{customer.companyName || "No company"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <DateDisplay date={customer.joinedDate} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <Button
                        onClick={() => openEditCustomerModal(customer)}
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        iconOnly
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalCount > 0 && !loading && (
        <Card>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </Card>
      )}

      {/* Modal content with improved organization */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 pt-20 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl lg:max-w-4xl max-h-[calc(100vh-5rem)] overflow-y-auto my-4">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Edit Customer" : "Add New Customer"}
              </h3>
              <Button
                onClick={closeModal}
                variant="secondary"
                size="sm"
                icon={X}
                iconOnly
                disabled={submitApi.loading}
              />
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={formErrors.firstName}
                  required
                  placeholder="First Name"
                />
                <FormInput
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={formErrors.lastName}
                  required
                  placeholder="Last Name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={formErrors.email}
                  required
                  placeholder="email@example.com"
                />
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                />
              </div>

              <FormInput
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Company Name (Optional)"
              />

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="secondary"
                  disabled={submitApi.loading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitApi.loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isEditing ? "Update Customer" : "Add Customer"}
                </Button>
              </div>
            </form>

            {/* Additional sections for editing mode */}
            {isEditing && selectedCustomer && (
              <div className="border-t border-gray-200">
                <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
                    <Button onClick={sendResetPasswordEmail} variant="secondary" size="sm">
                      SEND RESET PASSWORD EMAIL
                    </Button>
                    <Button onClick={sendNewAccountEmail} variant="secondary" size="sm">
                      SEND NEW ACCOUNT EMAIL
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Send test email to:</span><br />
                    <span className="text-gray-800 break-all">{selectedCustomer.email}</span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Comment</h4>
                  <form onSubmit={handleCommentSubmit} className="space-y-3">
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Comment"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        rows={4}
                        maxLength={1000}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">Max. 1000 characters</span>
                        <span className="text-xs text-gray-500">{newComment.length} / 1000</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={!newComment.trim()} variant="secondary" size="sm">
                        SUBMIT
                      </Button>
                    </div>
                  </form>

                  <div className="mt-6">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Comments History</h5>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                                comment.type === "auto" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                              }`}>
                                {comment.type === "auto" ? "AUTO" : "MANUAL"}
                              </span>
                              <p className="text-sm text-gray-900">{comment.text}</p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2 whitespace-pre-line">
                            {comment.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Addresses</h4>
                    <Button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      NEW ADDRESS
                    </Button>
                  </div>

                  <div className="space-y-3 mb-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {selectedCustomer.companyName || "No Company"}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {address.street}<br />
                            {address.city}, {address.state} {address.zipCode} ({address.country})
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" icon={Edit2} iconOnly />
                          <Button variant="danger" size="sm" icon={X} iconOnly />
                        </div>
                      </div>
                    ))}
                  </div>

                  {showAddressForm && (
                    <Card className="bg-gray-50 p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Add New Address</h5>
                      <form onSubmit={handleAddressSubmit} className="space-y-3">
                        <input
                          type="text"
                          name="street"
                          value={newAddress.street}
                          onChange={handleAddressInputChange}
                          placeholder="Street Address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="city"
                            value={newAddress.city}
                            onChange={handleAddressInputChange}
                            placeholder="City"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                          />
                          <input
                            type="text"
                            name="state"
                            value={newAddress.state}
                            onChange={handleAddressInputChange}
                            placeholder="State"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="zipCode"
                            value={newAddress.zipCode}
                            onChange={handleAddressInputChange}
                            placeholder="ZIP Code"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                          <input
                            type="text"
                            name="country"
                            value={newAddress.country}
                            onChange={handleAddressInputChange}
                            placeholder="Country"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <Button
                            type="submit"
                            size="sm"
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            Add Address
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            variant="secondary"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}