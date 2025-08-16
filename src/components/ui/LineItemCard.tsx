import React, { useState, useEffect } from 'react';
import { Trash2, Package, DollarSign, Hash, FileText, Building, Palette, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';
import { ProductDropdown } from './ProductDropdown';


interface LineItemData {
  id: string;
  productName: string;
  variantName?: string;
  methodName?: string;
  color?: string;
  quantity: number;
  productItemNumber?: string;
  supplierItemNumber?: string;
  customerPricePerQuantity: number;
  customerSetupCharge: number;
  supplierPricePerQuantity: number;
  supplierSetupCharge: number;
  artworkText?: string;
  artworkSpecialInstructions?: string;
  customization?: string;
  description?: string;
  images?: string[];
  selectedProduct?: any;
}

interface LineItemCardProps {
  item: LineItemData;
  index: number;
  saleId: string;
  onRemove: (itemId: string) => void;
  onUpdate: (itemId: string, updatedItem: LineItemData) => void;
  isNew?: boolean;
}

export const LineItemCard: React.FC<LineItemCardProps> = ({
  item,
  index,
  saleId,
  onRemove,
  onUpdate,
  isNew = false
}) => {
  const [formData, setFormData] = useState<LineItemData>(item);
  const [isExpanded, setIsExpanded] = useState(isNew);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { post, loading } = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  useEffect(() => {
    setFormData(item);
  }, [item]);

  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(item);
    setHasUnsavedChanges(hasChanges);
  }, [formData, item]);

  const handleInputChange = (field: keyof LineItemData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductSelect = (product: any) => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        selectedProduct: product,
        productName: product.name,
        customerPricePerQuantity: product.minPrice || prev.customerPricePerQuantity,
        customerSetupCharge: product.setupCharge || prev.customerSetupCharge,
        productItemNumber: product.id?.toString() || prev.productItemNumber
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedProduct: null
      }));
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        lineItemId: item.id,
        general: {
          productName: formData.productName || null,
          variantName: formData.variantName || null,
          methodName: formData.methodName || null,
          color: formData.color || null,
          quantity: formData.quantity,
          productItemNumber: formData.productItemNumber || null,
          supplierItemNumber: formData.supplierItemNumber || null,
          customerPricePerQuantity: formData.customerPricePerQuantity,
          customerSetupCharge: formData.customerSetupCharge,
          supplierPricePerQuantity: formData.supplierPricePerQuantity,
          supplierSetupCharge: formData.supplierSetupCharge,
          artworkText: formData.artworkText || null,
          artworkSpecialInstructions: formData.artworkSpecialInstructions || null
        }
      };

      await post('https://api.promowe.com/Admin/SaleEditor/SetLineItemDetail', payload);
      onUpdate(item.id, formData);
      setHasUnsavedChanges(false);
      showToast.success('Line item updated successfully');
    } catch (error) {
      showToast.error('Failed to update line item');
    }
  };

  const customerTotal = formData.quantity * formData.customerPricePerQuantity + formData.customerSetupCharge;
  const supplierTotal = formData.quantity * formData.supplierPricePerQuantity + formData.supplierSetupCharge;
  const profit = customerTotal - supplierTotal;
  const margin = customerTotal > 0 ? ((profit / customerTotal) * 100) : 0;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {formData.productName || `Item #${index + 1}`}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Qty: {formData.quantity}</span>
                <span className="text-green-600 font-medium">${customerTotal.toFixed(2)}</span>
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs">Unsaved changes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                loading={loading}
                size="sm"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                Save
              </Button>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              variant="danger"
              size="sm"
              icon={Trash2}
              iconOnly
              className="w-8 h-8"
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <ProductDropdown
              selectedProduct={formData.selectedProduct}
              onProductSelect={handleProductSelect}
              placeholder="Search and select a product..."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Product Name"
                name="productName"
                value={formData.productName || ''}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="Enter product name"
                required
              />
              <FormInput
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Product description"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Variant Name"
              name="variantName"
              value={formData.variantName || ''}
              onChange={(e) => handleInputChange('variantName', e.target.value)}
              placeholder="e.g., Large, Blue"
            />
            <FormInput
              label="Method"
              name="methodName"
              value={formData.methodName || ''}
              onChange={(e) => handleInputChange('methodName', e.target.value)}
              placeholder="e.g., Screen Print, Embroidery"
            />
            <FormInput
              label="Color"
              name="color"
              value={formData.color || ''}
              onChange={(e) => handleInputChange('color', e.target.value)}
              placeholder="Product color"
            />
          </div>

          {/* SKU and Item Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Product Item Number"
              name="productItemNumber"
              value={formData.productItemNumber || ''}
              onChange={(e) => handleInputChange('productItemNumber', e.target.value)}
              placeholder="Internal SKU"
            />
            <FormInput
              label="Supplier Item Number"
              name="supplierItemNumber"
              value={formData.supplierItemNumber || ''}
              onChange={(e) => handleInputChange('supplierItemNumber', e.target.value)}
              placeholder="Supplier SKU"
            />
          </div>

          {/* Pricing Section */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pricing & Quantity
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <FormInput
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity.toString()}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                placeholder="1"
                required
              />
              <FormInput
                label="Customer Unit Price"
                name="customerPricePerQuantity"
                type="number"
                value={formData.customerPricePerQuantity.toString()}
                onChange={(e) => handleInputChange('customerPricePerQuantity', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
              <FormInput
                label="Customer Setup"
                name="customerSetupCharge"
                type="number"
                value={formData.customerSetupCharge.toString()}
                onChange={(e) => handleInputChange('customerSetupCharge', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <FormInput
                label="Supplier Unit Price"
                name="supplierPricePerQuantity"
                type="number"
                value={formData.supplierPricePerQuantity.toString()}
                onChange={(e) => handleInputChange('supplierPricePerQuantity', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <FormInput
                label="Supplier Setup"
                name="supplierSetupCharge"
                type="number"
                value={formData.supplierSetupCharge.toString()}
                onChange={(e) => handleInputChange('supplierSetupCharge', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-blue-200">
              <div className="text-center">
                <div className="text-sm text-blue-700 mb-1">Customer Total</div>
                <div className="text-xl font-bold text-green-600">${customerTotal.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-blue-700 mb-1">Supplier Total</div>
                <div className="text-lg font-medium text-gray-800">${supplierTotal.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-blue-700 mb-1">Profit</div>
                <div className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${profit.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-blue-700 mb-1">Margin</div>
                <div className={`text-lg font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {margin.toFixed(1)}%
                </div>
              </div>
            </div>
          </Card>

          {/* Artwork Section */}
          <Card className="p-4 bg-purple-50 border-purple-200">
            <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Artwork & Customization
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-input-group">
                  <label className="form-label block text-sm font-medium text-gray-700 mb-1">
                    Artwork Text
                  </label>
                  <textarea
                    value={formData.artworkText || ''}
                    onChange={(e) => handleInputChange('artworkText', e.target.value)}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Text to be printed/embroidered"
                    rows={3}
                  />
                </div>
                <div className="form-input-group">
                  <label className="form-label block text-sm font-medium text-gray-700 mb-1">
                    Special Instructions
                  </label>
                  <textarea
                    value={formData.artworkSpecialInstructions || ''}
                    onChange={(e) => handleInputChange('artworkSpecialInstructions', e.target.value)}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Special artwork instructions"
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <ImageGallery
                  images={formData.images || []}
                  onImagesChange={(images) => handleInputChange('images', images)}
                  title="Product & Artwork Images"
                  maxImages={8}
                  editable={true}
                />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          {hasUnsavedChanges && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSave}
                loading={loading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};