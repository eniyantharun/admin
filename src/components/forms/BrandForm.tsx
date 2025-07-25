import React, { useState, useEffect } from 'react';
import { Award, Package, ExternalLink, Calendar, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';

interface Brand {
  id: number;
  name: string;
  imageUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  enabled: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

interface BrandFormData {
  name: string;
  imageUrl: string;
  websiteUrl: string;
  description: string;
  enabled: boolean;
}

interface BrandFormProps {
  brand?: Brand | null;
  isEditing: boolean;
  onSubmit: (data: BrandFormData) => Promise<void>;
  loading?: boolean;
}

export const BrandForm: React.FC<BrandFormProps> = ({
  brand,
  isEditing,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    imageUrl: '',
    websiteUrl: '',
    description: '',
    enabled: true
  });
  const [formErrors, setFormErrors] = useState<Partial<BrandFormData>>({});
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        imageUrl: brand.imageUrl || '',
        websiteUrl: brand.websiteUrl || '',
        description: brand.description || '',
        enabled: brand.enabled
      });
      setImageError(false);
    } else {
      setFormData({
        name: '',
        imageUrl: '',
        websiteUrl: '',
        description: '',
        enabled: true
      });
      setImageError(false);
    }
  }, [brand]);

  const validateForm = (): boolean => {
    const errors: Partial<BrandFormData> = {};
    
    if (!formData.name.trim()) errors.name = 'Brand name is required';
    if (formData.websiteUrl && !formData.websiteUrl.startsWith('http')) {
      errors.websiteUrl = 'Website URL must start with http:// or https://';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (formErrors[name as keyof BrandFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }

    if (name === 'imageUrl') {
      setImageError(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        <FormInput
          label="Brand Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={formErrors.name}
          required
          placeholder="Enter brand name"
        />

        <FormInput
          label="Brand Logo URL"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleInputChange}
          placeholder="https://example.com/brand-logo.png"
          helpText="URL to the brand logo image (optional)"
        />

        {formData.imageUrl && (
          <Card className="p-4 bg-gray-50">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Logo Preview</h5>
            <div className="flex items-center justify-center h-24 bg-white border border-gray-200 rounded-lg">
              {!imageError ? (
                <img 
                  src={formData.imageUrl} 
                  alt={formData.name || 'Brand logo'}
                  className="max-h-20 max-w-full object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Award className="w-8 h-8 mb-1" />
                  <span className="text-xs">Invalid image URL</span>
                </div>
              )}
            </div>
          </Card>
        )}

        <FormInput
          label="Website URL"
          name="websiteUrl"
          value={formData.websiteUrl}
          onChange={handleInputChange}
          error={formErrors.websiteUrl}
          placeholder="https://brandwebsite.com"
          helpText="Official brand website (optional)"
        />

        <div className="form-input-group">
          <label className="form-label block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Brief description of the brand and its products"
            rows={3}
          />
        </div>

        <FormInput
          label="Status"
          name="enabled"
          type="checkbox"
          value={formData.enabled}
          onChange={handleInputChange}
          placeholder="Enable this brand for product listings"
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
        >
          {isEditing ? "Update Brand" : "Add Brand"}
        </Button>
      </form>

      {isEditing && brand && (
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Brand Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Brand ID:</span>
              <span className="font-medium">{brand.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Products:</span>
              <span className="font-medium">{brand.productCount} items</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Created:</span>
              <span className="font-medium">{new Date(brand.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Updated:</span>
              <span className="font-medium">{new Date(brand.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {isEditing && brand && (
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-orange-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Brand Actions</h4>
          <div className="flex flex-col gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={Package}
              className="justify-start"
            >
              View All Products ({brand.productCount})
            </Button>
            {brand.websiteUrl && (
              <Button
                variant="secondary"
                size="sm"
                icon={ExternalLink}
                className="justify-start"
                onClick={() => window.open(brand.websiteUrl!, '_blank')}
              >
                Visit Brand Website
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={Globe}
              className="justify-start"
            >
              Brand Analytics & Performance
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};