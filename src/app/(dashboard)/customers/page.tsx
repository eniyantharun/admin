'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Phone, Mail, Building, Calendar, X, Loader2 } from 'lucide-react';
import { CustomerService, Customer, CustomerFormData } from '@/infrastructure/api/customer.service';

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
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

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { customers: fetchedCustomers, totalCount: count } = await CustomerService.getCustomers({
        search: searchTerm,
        count: rowsPerPage,
        index: (currentPage - 1) * rowsPerPage
      });
      
      setCustomers(fetchedCustomers);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching customers:', error);
      // You can add a toast notification here
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, rowsPerPage]);

  // Load customers on component mount and when dependencies change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Reset to first page when search term changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  // Utility: Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<CustomerFormData> = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    // Company name is optional based on the API response

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      if (isEditing && selectedCustomer) {
        // Update existing customer
        await CustomerService.updateCustomer(selectedCustomer.id, formData);
      } else {
        // Create new customer
        await CustomerService.createCustomer(formData);
      }

      // Refresh the customer list
      await fetchCustomers();
      closeModal();
    } catch (error) {
      console.error('Error saving customer:', error);
      // You can add a toast notification here
    } finally {
      setSubmitLoading(false);
    }
  };

  // Modal management
  const openNewCustomerModal = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: ''
    });
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
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: ''
    });
    setFormErrors({});
    setNewComment('');
    setShowAddressForm(false);
    setNewAddress({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    });
  };

  // Comment actions
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

  // Address actions
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street.trim() || !newAddress.city.trim()) return;

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress
    };

    setAddresses([...addresses, address]);
    setNewAddress({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    });
    setShowAddressForm(false);
  };

  // Email actions
  const sendResetPasswordEmail = async () => {
    if (selectedCustomer) {
      try {
        await CustomerService.sendResetPasswordEmail(selectedCustomer.email);
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
        await CustomerService.sendNewAccountEmail(selectedCustomer.email);
        alert(`New account email sent to ${selectedCustomer.email}`);
        addAutoComment(`Sent new account email to ${selectedCustomer.email}`);
      } catch (error) {
        console.error('Error sending new account email:', error);
        alert('Failed to send new account email');
      }
    }
  };

  // Input handlers
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Reusable Components
  const CustomerAvatar = ({ customer }: { customer: Customer }) => (
    <div className="customer-avatar h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs">
      {customer.firstName?.charAt(0) || ''}{customer.lastName?.charAt(0) || ''}
    </div>
  );

  const ContactInfo = ({ customer }: { customer: Customer }) => (
    <>
      <div className="customer-email text-sm text-gray-900 flex items-center gap-1">
        <Mail className="w-3 h-3 text-gray-400" />
        <span className="truncate max-w-xs">{customer.email}</span>
      </div>
      <div className="customer-phone text-xs text-gray-500 flex items-center gap-1 mt-1">
        <Phone className="w-3 h-3 text-gray-400" />
        {customer.phone || 'No phone'}
      </div>
    </>
  );

  const FormInput = ({ 
    label, 
    name, 
    value, 
    onChange, 
    error, 
    required = false, 
    type = "text", 
    placeholder 
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
  }) => (
    <div className="form-input-group">
      <label className="form-label block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`form-input w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
      />
      {error && (
        <p className="form-error text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );

  const EmptyState = () => (
    <div className="customers-empty-state text-center py-8">
      <div className="text-gray-400 mb-3">
        <Building className="w-10 h-10 mx-auto" />
      </div>
      <h3 className="customers-empty-title text-lg font-medium text-gray-900 mb-2">No customers found</h3>
      <p className="customers-empty-description text-gray-500 text-sm">
        {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first customer.'}
      </p>
    </div>
  );

  const LoadingState = () => (
    <div className="customers-loading-state text-center py-8">
      <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-3" />
      <p className="text-gray-500 text-sm">Loading customers...</p>
    </div>
  );

  return (
    <div className="customers-page space-y-4">
      {/* Customers Table */}
      <div className="customers-table-container bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="customers-table-header px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="customers-table-title text-lg font-semibold text-gray-900">
              Customer List ({totalCount.toLocaleString()})
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="customers-search-input pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm w-full sm:w-64"
                />
              </div>
              <button
                onClick={openNewCustomerModal}
                className="customers-add-btn flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                New Customer
              </button>
            </div>
          </div>
        </div>
        
        <div className="customers-table-wrapper overflow-x-auto">
          <table className="customers-table min-w-full divide-y divide-gray-200">
            <thead className="customers-table-head bg-gray-50">
              <tr>
                <th className="customers-table-th px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="customers-table-th px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="customers-table-th px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="customers-table-th px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="customers-table-th px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="customers-table-body bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8">
                    <LoadingState />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8">
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="customers-table-row hover:bg-gray-50 transition-colors duration-150">
                    <td className="customers-table-cell px-4 py-2 whitespace-nowrap">
                      <div className="customer-info flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <CustomerAvatar customer={customer} />
                        </div>
                        <div className="customer-details ml-3">
                          <div className="customer-name text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="customer-id text-xs text-gray-500">ID: {customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="customers-table-cell px-4 py-2 whitespace-nowrap">
                      <ContactInfo customer={customer} />
                    </td>
                    <td className="customers-table-cell px-4 py-2 whitespace-nowrap">
                      <div className="customer-company text-sm text-gray-900 flex items-center gap-1">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-xs">{customer.companyName || 'No company'}</span>
                      </div>
                    </td>
                    <td className="customers-table-cell px-4 py-2 whitespace-nowrap">
                      <div className="customer-joined text-sm text-gray-900 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs">{customer.joinedDate}</span>
                      </div>
                    </td>
                    <td className="customers-table-cell px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="customer-actions flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditCustomerModal(customer)}
                          className="customer-edit-btn text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalCount > 0 && !loading && (
        <div className="customers-pagination bg-white px-4 py-2 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="customers-pagination-mobile flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="customers-pagination-btn relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="customers-pagination-btn ml-3 relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
          <div className="customers-pagination-desktop hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="customers-pagination-info flex items-center space-x-4">
              <p className="customers-pagination-status text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{endIndex}</span> of{' '}
                <span className="font-medium">{totalCount.toLocaleString()}</span> results
              </p>
              <div className="customers-pagination-controls flex items-center space-x-2">
                <label className="text-sm text-gray-700">Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="customers-pagination-select border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <div className="customers-pagination-nav">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="customers-pagination-prev relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-300"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {getPageNumbers().map((pageNumber, index) => (
                  <React.Fragment key={index}>
                    {pageNumber === '...' ? (
                      <span className="customers-pagination-ellipsis relative inline-flex items-center px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    ) : (
                      <button
                        onClick={() => setCurrentPage(pageNumber as number)}
                        className={`customers-pagination-page relative inline-flex items-center px-3 py-1 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )}
                  </React.Fragment>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="customers-pagination-next relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-300"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="customers-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="customers-modal-content bg-white rounded-lg shadow-2xl w-full max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="customers-modal-header flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="customers-modal-title text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button
                onClick={closeModal}
                className="customers-modal-close text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                disabled={submitLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="customers-modal-form p-4 sm:p-6 space-y-4">
              <div className="customers-form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="customers-form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                error={formErrors.companyName}
                placeholder="Company Name (Optional)"
              />

              {/* Modal Footer */}
              <div className="customers-modal-footer flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitLoading}
                  className="customers-modal-cancel w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="customers-modal-submit w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditing ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>

            {/* Additional sections for editing mode */}
            {isEditing && selectedCustomer && (
              <div className="customers-modal-extended border-t border-gray-200">
                {/* Email Actions Section */}
                <div className="customers-email-actions p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
                    <button
                      onClick={sendResetPasswordEmail}
                      className="customers-email-btn px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-sm font-medium"
                    >
                      SEND RESET PASSWORD EMAIL
                    </button>
                    <button
                      onClick={sendNewAccountEmail}
                      className="customers-email-btn px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-sm font-medium"
                    >
                      SEND NEW ACCOUNT EMAIL
                    </button>
                  </div>
                  <div className="customers-email-info text-sm text-gray-600">
                    <span className="font-medium">Send test email to:</span>
                    <br />
                    <span className="text-gray-800 break-all">{selectedCustomer.email}</span>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="customers-comments p-4 sm:p-6 border-b border-gray-200">
                  <h4 className="customers-comments-title text-sm font-medium text-gray-700 mb-4">Comment</h4>
                  <form onSubmit={handleCommentSubmit} className="customers-comments-form space-y-3">
                    <div className="customers-comment-input relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Comment"
                        className="customers-comment-textarea w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        rows={4}
                        maxLength={1000}
                      />
                      <div className="customers-comment-meta flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">Max. 1000 characters</span>
                        <span className="text-xs text-gray-500">{newComment.length} / 1000</span>
                      </div>
                    </div>
                    <div className="customers-comment-submit flex justify-end">
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="customers-comment-btn px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors duration-150 text-sm font-medium"
                      >
                        SUBMIT
                      </button>
                    </div>
                  </form>

                  {/* Comments History */}
                  <div className="customers-comments-history mt-6">
                    <h5 className="customers-comments-history-title text-sm font-medium text-gray-900 mb-3">Comments History</h5>
                    <div className="customers-comments-list space-y-3 max-h-48 overflow-y-auto">
                      {comments.map((comment) => (
                        <div key={comment.id} className="customers-comment-item bg-white p-3 rounded-lg border border-gray-200">
                          <div className="customers-comment-content flex items-start justify-between">
                            <div className="flex-1">
                              <span className={`customers-comment-badge inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                                comment.type === 'auto' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {comment.type === 'auto' ? 'AUTO' : 'MANUAL'}
                              </span>
                              <p className="customers-comment-text text-sm text-gray-900">{comment.text}</p>
                            </div>
                          </div>
                          <div className="customers-comment-timestamp text-xs text-gray-500 mt-2 whitespace-pre-line">
                            {comment.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Addresses Section */}
                <div className="customers-addresses p-4 sm:p-6">
                  <div className="customers-addresses-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h4 className="customers-addresses-title text-sm font-medium text-gray-700">Addresses</h4>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="customers-addresses-add-btn px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                    >
                      NEW ADDRESS
                    </button>
                  </div>

                  {/* Address List */}
                  <div className="customers-addresses-list space-y-3 mb-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="customers-address-item bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="customers-address-content flex-1">
                          <div className="customers-address-company font-medium text-gray-900">{selectedCustomer.companyName || 'No Company'}</div>
                          <div className="customers-address-details text-sm text-gray-600 mt-1">
                            {address.street}<br />
                            {address.city}, {address.state} {address.zipCode} ({address.country})
                          </div>
                        </div>
                        <div className="customers-address-actions flex items-center gap-2">
                          <button className="customers-address-edit-btn text-blue-600 hover:text-blue-800 p-1">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="customers-address-delete-btn text-red-600 hover:text-red-800 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Address Form */}
                  {showAddressForm && (
                    <div className="customers-address-form bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h5 className="customers-address-form-title text-sm font-medium text-gray-900 mb-3">Add New Address</h5>
                      <form onSubmit={handleAddressSubmit} className="customers-address-form-fields space-y-3">
                        <div className="customers-address-street">
                          <input
                            type="text"
                            name="street"
                            value={newAddress.street}
                            onChange={handleAddressInputChange}
                            placeholder="Street Address"
                            className="customers-address-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                          />
                        </div>
                        <div className="customers-address-row grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="city"
                            value={newAddress.city}
                            onChange={handleAddressInputChange}
                            placeholder="City"
                            className="customers-address-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                          />
                          <input
                            type="text"
                            name="state"
                            value={newAddress.state}
                            onChange={handleAddressInputChange}
                            placeholder="State"
                            className="customers-address-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <div className="customers-address-row grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="zipCode"
                            value={newAddress.zipCode}
                            onChange={handleAddressInputChange}
                            placeholder="ZIP Code"
                            className="customers-address-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                          <input
                            type="text"
                            name="country"
                            value={newAddress.country}
                            onChange={handleAddressInputChange}
                            placeholder="Country"
                            className="customers-address-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <div className="customers-address-form-actions flex flex-col sm:flex-row items-center gap-3">
                          <button
                            type="submit"
                            className="customers-address-submit-btn w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                          >
                            Add Address
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="customers-address-cancel-btn w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
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