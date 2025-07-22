'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Search, Plus, Edit2, Phone, Mail, Globe, X, Building } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useApi } from '@/hooks/useApi';

// Import helper components
import { EntityAvatar } from '@/components/helpers/EntityAvatar';
import { StatusBadge } from '@/components/helpers/StatusBadge';
import { ProductStats } from '@/components/helpers/ProductStats';
import { DateDisplay } from '@/components/helpers/DateDisplay';
import { EmptyState, LoadingState } from '@/components/helpers/EmptyLoadingStates';
import { FormInput } from '@/components/helpers/FormInput';
import { PaginationControls } from '@/components/helpers/PaginationControls';

interface Supplier {
  id: number;
  companyName: string;
  webUrl: string;
  emailAddress: string | null;
  telephoneNumber: string | null;
  enabled: boolean;
  exclusive: boolean;
  updatedAt: string;
  importedAt: string | null;
  productCount: number;
  importStatus: {
    [key: string]: number;
  };
  visibilityStats: {
    [key: string]: number;
  };
  website: string;
}

interface SupplierFormData {
  companyName: string;
  webUrl: string;
  emailAddress: string;
  telephoneNumber: string;
  enabled: boolean;
  exclusive: boolean;
}

// Memoized contact info component
const ContactInfo = memo(({ supplier }: { supplier: Supplier }) => (
  <>
    {supplier.emailAddress && (
      <div className="text-sm text-gray-900 flex items-center gap-1 mb-1">
        <Mail className="w-3 h-3 text-gray-400" />
        <span className="truncate max-w-xs">{supplier.emailAddress}</span>
      </div>
    )}
    {supplier.telephoneNumber && (
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Phone className="w-3 h-3 text-gray-400" />
        <span>{supplier.telephoneNumber}</span>
      </div>
    )}
    <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
      <Globe className="w-3 h-3 text-blue-400" />
      <a 
        href={supplier.webUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="truncate max-w-xs hover:underline"
      >
        {supplier.webUrl}
      </a>
    </div>
  </>
));

ContactInfo.displayName = 'ContactInfo';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [formData, setFormData] = useState<SupplierFormData>({
    companyName: '',
    webUrl: '',
    emailAddress: '',
    telephoneNumber: '',
    enabled: true,
    exclusive: false
  });
  const [formErrors, setFormErrors] = useState<Partial<SupplierFormData>>({});

  // Use the original useApi hook
  const { get, post, put, loading } = useApi();
  const submitApi = useApi();

  // Simplified fetch function that handles cancellation gracefully
  const fetchSuppliers = useCallback(async () => {
    if (!isInitialLoad && loading) return;

    try {
      const response = await get(`/Admin/SupplierList/GetSuppliersList`);
      if (!response?.suppliers) return;
      
      let filteredSuppliers = response.suppliers;
      
      // Simple local search filter
      if (localSearchTerm) {
        filteredSuppliers = filteredSuppliers.filter((supplier: Supplier) =>
          supplier.companyName.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
          (supplier.emailAddress && supplier.emailAddress.toLowerCase().includes(localSearchTerm.toLowerCase())) ||
          (supplier.webUrl && supplier.webUrl.toLowerCase().includes(localSearchTerm.toLowerCase()))
        );
      }
      
      const startIndex = (currentPage - 1) * rowsPerPage;
      const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + rowsPerPage);
      
      setSuppliers(paginatedSuppliers);
      setTotalCount(filteredSuppliers.length);
    } catch (error: any) {
      // Only log non-cancellation errors
      if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
        console.error('Error fetching suppliers:', error);
      }
    } finally {
      setIsInitialLoad(false);
    }
  }, [localSearchTerm, currentPage, rowsPerPage, get, loading, isInitialLoad]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [localSearchTerm]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<SupplierFormData> = {};
    
    if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    if (!formData.webUrl.trim()) errors.webUrl = 'Website URL is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isEditing && selectedSupplier) {
        await submitApi.put(`/Admin/SupplierList/UpdateSupplier/${selectedSupplier.id}`, formData);
      } else {
        await submitApi.post('/Admin/SupplierList/CreateSupplier', formData);
      }

      await fetchSuppliers();
      closeModal();
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
        console.error('Error saving supplier:', error);
      }
    }
  }, [validateForm, isEditing, selectedSupplier, formData, submitApi, fetchSuppliers]);

  const openNewSupplierModal = () => {
    setFormData({
      companyName: '',
      webUrl: '',
      emailAddress: '',
      telephoneNumber: '',
      enabled: true,
      exclusive: false
    });
    setFormErrors({});
    setIsEditing(false);
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const openEditSupplierModal = (supplier: Supplier) => {
    setFormData({
      companyName: supplier.companyName,
      webUrl: supplier.webUrl,
      emailAddress: supplier.emailAddress || '',
      telephoneNumber: supplier.telephoneNumber || '',
      enabled: supplier.enabled,
      exclusive: supplier.exclusive
    });
    setFormErrors({});
    setIsEditing(true);
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
    setIsEditing(false);
    setFormData({
      companyName: '',
      webUrl: '',
      emailAddress: '',
      telephoneNumber: '',
      enabled: true,
      exclusive: false
    });
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (formErrors[name as keyof SupplierFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  const clearLocalSearch = () => {
    setLocalSearchTerm('');
  };

  return (
    <div className="suppliers-page space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Suppliers</h1>
          <p className="text-gray-600">Manage your supplier database</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={openNewSupplierModal}
            icon={Plus}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            Add Supplier
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Supplier List ({totalCount.toLocaleString()})
            </h3>
            
            {/* Local search bar */}
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search suppliers..."
                value={localSearchTerm}
                onChange={handleLocalSearchChange}
                className="w-full sm:w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {localSearchTerm && (
                <button
                  onClick={clearLocalSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && isInitialLoad ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <LoadingState message="Loading suppliers..." />
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <EmptyState
                      icon={Building}
                      title="No suppliers found"
                      description="Get started by adding your first supplier."
                      hasSearch={!!localSearchTerm}
                    />
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <EntityAvatar name={supplier.companyName} id={supplier.id} type="supplier" />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {supplier.companyName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {supplier.id} {supplier.exclusive && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Exclusive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <ContactInfo supplier={supplier} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <ProductStats 
                        totalProducts={supplier.productCount}
                        enabledProducts={supplier.visibilityStats.Enabled || 0}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <StatusBadge enabled={supplier.enabled} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <DateDisplay date={supplier.updatedAt} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <Button
                        onClick={() => openEditSupplierModal(supplier)}
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

      {/* Simplified Modal - Only renders when open */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 pt-20 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[calc(100vh-5rem)] overflow-y-auto my-4">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Edit Supplier" : "Add New Supplier"}
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
              <FormInput
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                error={formErrors.companyName}
                required
                placeholder="Enter company name"
              />

              <FormInput
                label="Website URL"
                name="webUrl"
                value={formData.webUrl}
                onChange={handleInputChange}
                error={formErrors.webUrl}
                required
                placeholder="https://example.com"
                helpText="Include the full URL including https://"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Email Address"
                  name="emailAddress"
                  type="email"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  placeholder="contact@company.com"
                />
                <FormInput
                  label="Phone Number"
                  name="telephoneNumber"
                  type="tel"
                  value={formData.telephoneNumber}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Status"
                  name="enabled"
                  type="checkbox"
                  value={formData.enabled}
                  onChange={handleInputChange}
                  placeholder="Enable this supplier"
                />
                <FormInput
                  label="Exclusivity"
                  name="exclusive"
                  type="checkbox"
                  value={formData.exclusive}
                  onChange={handleInputChange}
                  placeholder="Mark as exclusive supplier"
                />
              </div>

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
                  {isEditing ? "Update Supplier" : "Add Supplier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}