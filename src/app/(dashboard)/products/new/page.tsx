/**
 * Create New Product Page
 * Page for creating a new product
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProductMutations } from '@/hooks/api/useProductMutations';
import toast from 'react-hot-toast';

export default function NewProductPage() {
  const router = useRouter();
  const { createProduct, loading } = useProductMutations({
    showToast: true,
  });

  const [formData, setFormData] = useState({
    name: '',
    visibility: 'Disabled' as 'Enabled' | 'Disabled',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const response = await createProduct(formData);

      // Navigate to product editor
      router.push(`/products/${response.productId}`);
    } catch (error) {
      console.error('Failed to create product:', error);
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
          Enter the basic information to create a new product
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
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Initial Visibility */}
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
              Initial Status
            </label>
            <select
              id="visibility"
              value={formData.visibility}
              onChange={(e) => handleChange('visibility', e.target.value as 'Enabled' | 'Disabled')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="Disabled">Disabled (Draft)</option>
              <option value="Enabled">Enabled (Published)</option>
            </select>
            <p className="text-gray-500 text-sm mt-1">
              You can enable the product later after adding all details
            </p>
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
            <Button type="submit" variant="primary" loading={loading}>
              Create Product
            </Button>
          </div>
        </form>
      </Card>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• A blank product will be created</li>
          <li>• You'll be redirected to the product editor</li>
          <li>• Add variants, pricing, images, and other details</li>
          <li>• Enable the product when it's ready to publish</li>
        </ul>
      </div>
    </div>
  );
}
