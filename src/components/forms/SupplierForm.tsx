import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/helpers/FormInput';

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

interface SupplierFormProps {
  supplier?: Supplier | null;
  isEditing: boolean;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  loading?: boolean;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({
  supplier,
  isEditing,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    companyName: '',
    webUrl: '',
    emailAddress: '',
    telephoneNumber: '',
    enabled: true,
    exclusive: false
  });
  const [formErrors, setFormErrors] = useState<Partial<SupplierFormData>>({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        companyName: supplier.companyName,
        webUrl: supplier.webUrl,
        emailAddress: supplier.emailAddress || '',
        telephoneNumber: supplier.telephoneNumber || '',
        enabled: supplier.enabled,
        exclusive: supplier.exclusive
      });
    } else {
      setFormData({
        companyName: '',
        webUrl: '',
        emailAddress: '',
        telephoneNumber: '',
        enabled: true,
        exclusive: false
      });
    }
  }, [supplier]);

  const validateForm = (): boolean => {
    const errors: Partial<SupplierFormData> = {};
    
    if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    if (!formData.webUrl.trim()) errors.webUrl = 'Website URL is required';
    else if (!formData.webUrl.startsWith('http')) {
      errors.webUrl = 'Website URL must start with http:// or https://';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (formErrors[name as keyof SupplierFormData]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof SupplierFormData];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
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

        <Button
          type="submit"
          loading={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isEditing ? "Update Supplier" : "Add Supplier"}
        </Button>
      </form>

      {isEditing && supplier && (
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Supplier Statistics</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Products:</span>
              <span className="ml-2 font-medium">{supplier.productCount}</span>
            </div>
            <div>
              <span className="text-gray-500">Enabled Products:</span>
              <span className="ml-2 font-medium">{supplier.visibilityStats?.Enabled || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <span className="ml-2 font-medium">{new Date(supplier.updatedAt).toLocaleDateString()}</span>
            </div>
            {supplier.importedAt && (
              <div>
                <span className="text-gray-500">Last Import:</span>
                <span className="ml-2 font-medium">{new Date(supplier.importedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};