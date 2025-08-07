import React, { useState, useEffect } from 'react';
import { FormInput } from '@/components/helpers/FormInput';
import { Button } from '../ui/Button';

interface SupplierFormProps {
  supplier?: Partial<IFSupplier> | null;
  isEditing: boolean;
  onSubmit: (data: ISupplierFormData) => Promise<void>;
  loading?: boolean;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({
  supplier,
  isEditing,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<ISupplierFormData>({
    companyName: '',
    contactFirstName: '',
    contactLastName: '',
    email: '',
    phone: '',
    website: 'promotional_product_inc',
    isActive: true,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (supplier) {
      setFormData(prev => ({
        ...prev,
        companyName: supplier.companyName || '',
        contactFirstName: supplier.contactFirstName || '',
        contactLastName: supplier.contactLastName || '',
        email: supplier.email || supplier.emailAddress || '',
        phone: supplier.phone || supplier.telephoneNumber || '',
        website: supplier.website || supplier.webUrl || 'promotional_product_inc',
        isActive:
          supplier.isActive !== undefined
            ? supplier.isActive
            : supplier.enabled !== undefined
            ? supplier.enabled
            : true,
        address: {
          street: supplier.address?.street || '',
          city: supplier.address?.city || '',
          state: supplier.address?.state || '',
          zipCode: supplier.address?.zipCode || '',
          country: supplier.address?.country || 'USA'
        }
      }));
    } else {
      setFormData({
        companyName: '',
        contactFirstName: '',
        contactLastName: '',
        email: '',
        phone: '',
        website: 'promotional_product_inc',
        isActive: true,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        }
      });
    }
  }, [supplier]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!formData.address.street.trim()) {
      errors.street = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.address.state.trim()) {
      errors.state = 'State is required';
    }

    if (!formData.address.zipCode.trim()) {
      errors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.address.zipCode)) {
      errors.zipCode = 'ZIP code should be in format: 12345 or 12345-6789';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (['street', 'city', 'state', 'zipCode', 'country'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">

        {/* Company Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Company Information
          </h3>

          <FormInput
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            error={formErrors.companyName}
            required
            placeholder="Enter company name"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Contact First Name"
              name="contactFirstName"
              value={formData.contactFirstName}
              onChange={handleInputChange}
              placeholder="John"
            />
            <FormInput
              label="Contact Last Name"
              name="contactLastName"
              value={formData.contactLastName}
              onChange={handleInputChange}
              placeholder="Smith"
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
              placeholder="contact@company.com"
            />
            <FormInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              error={formErrors.phone}
              required
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active Supplier
          </label>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Address Information
          </h3>

          <FormInput
            label="Street Address"
            name="street"
            value={formData.address.street}
            onChange={handleInputChange}
            error={formErrors.street}
            required
            placeholder="456 Industrial Blvd"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="City"
              name="city"
              value={formData.address.city}
              onChange={handleInputChange}
              error={formErrors.city}
              required
              placeholder="Chicago"
            />

            <div className="space-y-1">
               <FormInput
              label="State"
              name="state"
              value={formData.address.state}
              onChange={handleInputChange}
              error={formErrors.State}
              required
              placeholder="Chicago"
            />
             
            </div>

            <FormInput
              label="ZIP Code"
              name="zipCode"
              value={formData.address.zipCode}
              onChange={handleInputChange}
              error={formErrors.zipCode}
              required
              placeholder="60601"
            />
          </div>

          <FormInput
            label="Country"
            name="country"
            value={formData.address.country}
            onChange={handleInputChange}
            placeholder="USA"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {loading ? "Processing..." : (isEditing ? "Update Supplier" : "Add Supplier")}
        </Button>
      </form>

      {/* Supplier Statistics (for editing mode) */}
      {isEditing && supplier && (
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Supplier Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {supplier.rating && (
              <div>
                <span className="text-gray-500">Rating:</span>
                <span className="ml-2 font-medium">{supplier.rating}/5.0</span>
              </div>
            )}
            {supplier.totalOrders !== undefined && (
              <div>
                <span className="text-gray-500">Total Orders:</span>
                <span className="ml-2 font-medium">{supplier.totalOrders}</span>
              </div>
            )}
            {supplier.lastOrderDate && (
              <div>
                <span className="text-gray-500">Last Order:</span>
                <span className="ml-2 font-medium">{supplier.lastOrderDate} days ago</span>
              </div>
            )}
            {supplier.productCount !== undefined && (
              <div>
                <span className="text-gray-500">Total Products:</span>
                <span className="ml-2 font-medium">{supplier.productCount}</span>
              </div>
            )}
            {supplier.visibilityStats?.Enabled !== undefined && (
              <div>
                <span className="text-gray-500">Enabled Products:</span>
                <span className="ml-2 font-medium">{supplier.visibilityStats.Enabled}</span>
              </div>
            )}
            {supplier.createdAt && (
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 font-medium">{new Date(supplier.createdAt).toLocaleDateString()}</span>
              </div>
            )}
            {supplier.updatedAt && (
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-2 font-medium">{new Date(supplier.updatedAt).toLocaleDateString()}</span>
              </div>
            )}
            {supplier.importedAt && (
              <div>
                <span className="text-gray-500">Last Import:</span>
                <span className="ml-2 font-medium">{new Date(supplier.importedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {supplier.address?.isVerified && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-700 font-medium">Address Verified</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};