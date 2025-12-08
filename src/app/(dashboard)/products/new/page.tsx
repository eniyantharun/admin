/**
 * Create New Product Page
 * Matches old project pattern with required supplier selection
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProductCRUDService } from '@/lib/services/product/productCRUD';
import { useApi } from '@/hooks/useApi';
import toast from 'react-hot-toast';

interface Supplier {
  id: number;
  companyName: string;
  website?: string;
  isActive: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const api = useApi();

  const [name, setName] = useState('');
  const [isExclusive, setIsExclusive] = useState(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // Fetch suppliers based on search
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoadingSuppliers(true);
      try {
        const queryParams = new URLSearchParams({
          website: 'promotional_product_inc',
          search: supplierSearch,
        });

        const response = await api.get(
          `/Admin/SupplierEditor/GetSupplier?${queryParams}`
        );

        if (response?.data?.suppliers) {
          setSuppliers(
            response.data.suppliers.map((s: any) => ({
              id: s.id,
              companyName: s.companyName,
              website: s.website,
              isActive: s.isActive,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    const debounce = setTimeout(fetchSuppliers, 300);
    return () => clearTimeout(debounce);
  }, [supplierSearch, api]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!supplier) {
      toast.error('Please select a supplier');
      return;
    }

    setLoading(true);

    try {
      const response = await ProductCRUDService.createProduct({
        name,
        supplierId: supplier.id,
        isExclusive,
      });

      toast.success('Product created successfully!');

      // Navigate to product editor using correct field name
      router.push(`/products/${response.id}`);
    } catch (error: any) {
      console.error('Failed to create product:', error);
      toast.error(error?.message || 'Failed to create product');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
        <p className="text-gray-600 mt-1">
          Enter basic information to create a new product
        </p>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
              disabled={loading}
              required
            />
          </div>

          {/* Supplier Selection */}
          <div className="relative">
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
              Supplier *
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="supplier"
                  type="text"
                  value={supplier ? supplier.companyName : supplierSearch}
                  onChange={(e) => {
                    setSupplierSearch(e.target.value);
                    setSupplier(null);
                    setShowSupplierDropdown(true);
                  }}
                  onFocus={() => setShowSupplierDropdown(true)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search for a supplier..."
                  disabled={loading}
                  required
                />
              </div>

              {/* Supplier Dropdown */}
              {showSupplierDropdown && !supplier && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {loadingSuppliers ? (
                    <div className="p-4 text-center text-gray-500">Loading suppliers...</div>
                  ) : suppliers.length > 0 ? (
                    suppliers.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSupplier(s);
                          setShowSupplierDropdown(false);
                          setSupplierSearch('');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{s.companyName}</div>
                        {s.website && (
                          <div className="text-sm text-gray-500">{s.website}</div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {supplierSearch ? 'No suppliers found' : 'Start typing to search suppliers'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {supplier && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{supplier.companyName}</div>
                    {supplier.website && (
                      <div className="text-sm text-gray-500">{supplier.website}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSupplier(null);
                      setSupplierSearch('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exclusive Checkbox */}
          <div className="flex items-center">
            <input
              id="isExclusive"
              type="checkbox"
              checked={isExclusive}
              onChange={(e) => setIsExclusive(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <label htmlFor="isExclusive" className="ml-2 text-sm text-gray-700">
              Exclusive Product
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!name.trim() || !supplier}
            >
              Create Product
            </Button>
          </div>
        </form>
      </Card>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• A blank product will be created with the selected supplier</li>
          <li>• You'll be redirected to the product editor</li>
          <li>• Add variants, pricing, images, and other details</li>
          <li>• Set visibility and brand in the editor when ready</li>
        </ul>
      </div>
    </div>
  );
}
