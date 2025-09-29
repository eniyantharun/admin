import React, { useState, useEffect } from 'react';
import { Save, Package, DollarSign, Calendar, Star, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { iProduct, iProductFormData, iProductFormProps } from '@/types/product';

export const ProductForm: React.FC<iProductFormProps> = ({
  product,
  isEditing,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<iProductFormData>({
    name: '',
    slug: '',
    description: '',
    brand: '',
    supplier: '',
    category: '',
    minPrice: 0,
    maxPrice: 0,
    setupCharge: 0,
    minQuantity: 1,
    maxQuantity: 10000,
    productionTime: '',
    enabled: true,
    featured: false,
    exclusive: false,
    images: [],
    imprintMethods: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product && isEditing) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        brand: product.brand,
        supplier: product.supplier,
        category: product.category,
        minPrice: product.minPrice,
        maxPrice: product.maxPrice,
        setupCharge: product.setupCharge,
        minQuantity: product.minQuantity,
        maxQuantity: product.maxQuantity,
        productionTime: product.productionTime,
        enabled: product.enabled,
        featured: product.featured,
        exclusive: product.exclusive,
        images: product.images || [],
        imprintMethods: product.imprintMethods || []
      });
    }
  }, [product, isEditing]);

  const handleInputChange = (field: keyof iProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    if (field === 'name' && !isEditing) {
      const slug = value.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleMethodsChange = (value: string) => {
    const methods = value.split(',').map(method => method.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      imprintMethods: methods
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Product slug is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.supplier.trim()) newErrors.supplier = 'Supplier is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (formData.minPrice <= 0) newErrors.minPrice = 'Minimum price must be greater than 0';
    if (formData.maxPrice <= 0) newErrors.maxPrice = 'Maximum price must be greater than 0';
    if (formData.maxPrice < formData.minPrice) newErrors.maxPrice = 'Maximum price must be greater than minimum price';
    if (formData.minQuantity <= 0) newErrors.minQuantity = 'Minimum quantity must be greater than 0';
    if (formData.maxQuantity <= 0) newErrors.maxQuantity = 'Maximum quantity must be greater than 0';
    if (formData.maxQuantity < formData.minQuantity) newErrors.maxQuantity = 'Maximum quantity must be greater than minimum quantity';
    if (!formData.productionTime.trim()) newErrors.productionTime = 'Production time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Product' : 'Create New Product'}
            </h2>
            <p className="text-sm text-gray-600">
              {isEditing ? 'Update product information and settings' : 'Add a new product to your catalog'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                required
                placeholder="Enter product name"
              />
              
              <FormInput
                label="URL Slug"
                name="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                error={errors.slug}
                required
                placeholder="product-url-slug"
                helpText="URL-friendly version of the product name"
              />
            </div>

            <div className="mt-4">
              <div className="form-input-group">
                <label className="form-label block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Pricing & Quantities
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormInput
                label="Minimum Price"
                name="minPrice"
                type="number"
                value={formData.minPrice.toString()}
                onChange={(e) => handleInputChange('minPrice', parseFloat(e.target.value) || 0)}
                error={errors.minPrice}
                required
                placeholder="0.00"
              />
              
              <FormInput
                label="Maximum Price"
                name="maxPrice"
                type="number"
                value={formData.maxPrice.toString()}
                onChange={(e) => handleInputChange('maxPrice', parseFloat(e.target.value) || 0)}
                error={errors.maxPrice}
                required
                placeholder="0.00"
              />
              
              <FormInput
                label="Setup Charge"
                name="setupCharge"
                type="number"
                value={formData.setupCharge.toString()}
                onChange={(e) => handleInputChange('setupCharge', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Minimum Quantity"
                name="minQuantity"
                type="number"
                value={formData.minQuantity.toString()}
                onChange={(e) => handleInputChange('minQuantity', parseInt(e.target.value) || 1)}
                error={errors.minQuantity}
                required
                placeholder="1"
              />
              
              <FormInput
                label="Maximum Quantity"
                name="maxQuantity"
                type="number"
                value={formData.maxQuantity.toString()}
                onChange={(e) => handleInputChange('maxQuantity', parseInt(e.target.value) || 10000)}
                error={errors.maxQuantity}
                required
                placeholder="10000"
              />
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Production & Suppliers
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                error={errors.brand}
                required
                placeholder="Enter brand name"
              />
              
              <FormInput
                label="Supplier"
                name="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                error={errors.supplier}
                required
                placeholder="Enter supplier name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="Category"
                name="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                error={errors.category}
                required
                placeholder="Enter product category"
              />
              
              <FormInput
                label="Production Time"
                name="productionTime"
                value={formData.productionTime}
                onChange={(e) => handleInputChange('productionTime', e.target.value)}
                error={errors.productionTime}
                required
                placeholder="3-5 business days"
              />
            </div>

            <div className="mt-4">
              <div className="form-input-group">
                <label className="form-label block text-xs font-medium text-gray-700 mb-1">
                  Imprint Methods <span className="text-gray-500">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={formData.imprintMethods.join(', ')}
                  onChange={(e) => handleMethodsChange(e.target.value)}
                  className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Screen Print, Embroidery, Laser Engraving"
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-600" />
              Product Settings
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <FormInput
                  label="Enabled"
                  name="enabled"
                  type="checkbox"
                  value={formData.enabled}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    handleInputChange('enabled', target.checked);
                  }}
                  placeholder="Product is active and available"
                />
                
                <FormInput
                  label="Featured"
                  name="featured"
                  type="checkbox"
                  value={formData.featured}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    handleInputChange('featured', target.checked);
                  }}
                  placeholder="Show as featured product"
                />
                
                <FormInput
                  label="Exclusive"
                  name="exclusive"
                  type="checkbox"
                  value={formData.exclusive}
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    handleInputChange('exclusive', target.checked);
                  }}
                  placeholder="Exclusive to our platform"
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <ImageGallery
              images={formData.images}
              onImagesChange={(images) => handleInputChange('images', images)}
              title="Product Images"
              maxImages={10}
              editable={true}
            />
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
        <Button
          type="submit"
          loading={loading}
          icon={Save}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};