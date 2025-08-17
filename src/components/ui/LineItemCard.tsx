import React, { useState, useEffect } from 'react';
import { Trash2, Package, DollarSign, Hash, FileText, Building, Palette, AlertCircle, ChevronDown, ChevronUp, Save, Edit3, ImageIcon } from 'lucide-react';
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
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
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

  return (
    <Card className="overflow-hidden border border-gray-200 hover:border-purple-300 transition-all duration-200">
      {/* Compact Header */}
      <div className="p-3 bg-gradient-to-r from-gray-50 to-purple-50 border-b">
        <div className="flex items-start gap-3">
          {/* Product Image */}
          <div className="w-12 h-12 bg-gray-100 rounded border flex-shrink-0 flex items-center justify-center overflow-hidden">
            {formData.selectedProduct?.pictures?.[0] ? (
              <img 
                src={`https://images.4imprint.com/prod/${formData.selectedProduct.pictures[0]}/300x300`}
                alt={formData.productName}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}                                                  
              />
            ) : null}
            <div className="w-full h-full flex items-center justify-center text-gray-400" style={{display: formData.selectedProduct?.pictures?.[0] ? 'none' : 'flex'}}>
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>

          {/* Item Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {formData.productName || `Line Item #${index + 1}`}
                  </h3>
                  {hasUnsavedChanges && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>Unsaved</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>Qty: <span className="font-medium">{formData.quantity}</span></span>
                  <span>@<span className="font-medium">${formData.customerPricePerQuantity.toFixed(2)}</span></span>
                  <span className="font-medium text-green-600">${customerTotal.toFixed(2)}</span>
                  {profit > 0 && (
                    <span className="text-orange-600">Profit: ${profit.toFixed(2)}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                {hasUnsavedChanges && (
                  <Button
                    onClick={handleSave}
                    loading={loading}
                    size="sm"
                    icon={Save}
                    className="w-6 h-6 text-xs"
                    title="Save changes"
                  />
                )}
                <Button
                  onClick={() => onRemove(item.id)}
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  iconOnly
                  className="w-6 h-6"
                  title="Remove item"
                />
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  variant="secondary"
                  size="sm"
                  icon={isExpanded ? ChevronUp : ChevronDown}
                  iconOnly
                  className="w-6 h-6"
                  title={isExpanded ? "Collapse" : "Expand"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 space-y-3 bg-white">
          {/* Product Selection */}
          <div>
            <ProductDropdown
              selectedProduct={formData.selectedProduct}
              onProductSelect={handleProductSelect}
              placeholder="Search and select a product..."
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormInput
              label="Product Name"
              name="productName"
              value={formData.productName || ''}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              placeholder="Enter product name"
            />
            <FormInput
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Product description"
            />
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <FormInput
              label="Variant"
              name="variantName"
              value={formData.variantName || ''}
              onChange={(e) => handleInputChange('variantName', e.target.value)}
              placeholder="Size, style"
            />
            <FormInput
              label="Method"
              name="methodName"
              value={formData.methodName || ''}
              onChange={(e) => handleInputChange('methodName', e.target.value)}
              placeholder="Print method"
            />
            <FormInput
              label="Color"
              name="color"
              value={formData.color || ''}
              onChange={(e) => handleInputChange('color', e.target.value)}
              placeholder="Product color"
            />
            <FormInput
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity.toString()}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              placeholder="1"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <FormInput
              label="Customer Unit Price"
              name="customerPricePerQuantity"
              type="number"
              value={formData.customerPricePerQuantity.toString()}
              onChange={(e) => handleInputChange('customerPricePerQuantity', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
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

          {/* SKUs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormInput
              label="Product Item #"
              name="productItemNumber"
              value={formData.productItemNumber || ''}
              onChange={(e) => handleInputChange('productItemNumber', e.target.value)}
              placeholder="Internal SKU"
            />
            <FormInput
              label="Supplier Item #"
              name="supplierItemNumber"
              value={formData.supplierItemNumber || ''}
              onChange={(e) => handleInputChange('supplierItemNumber', e.target.value)}
              placeholder="Supplier SKU"
            />
          </div>

          {/* Artwork */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="form-input-group">
              <label className="form-label block text-xs font-medium text-gray-700 mb-1">
                Artwork Text
              </label>
              <textarea
                value={formData.artworkText || ''}
                onChange={(e) => handleInputChange('artworkText', e.target.value)}
                className="form-input w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none"
                placeholder="Text to be printed/embroidered"
                rows={2}
              />
            </div>
            <div className="form-input-group">
              <label className="form-label block text-xs font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                value={formData.artworkSpecialInstructions || ''}
                onChange={(e) => handleInputChange('artworkSpecialInstructions', e.target.value)}
                className="form-input w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none"
                placeholder="Special artwork instructions"
                rows={2}
              />
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-4 gap-2 p-2 bg-blue-50 rounded">
            <div className="text-center">
              <div className="text-xs text-blue-700 font-medium">Customer Total</div>
              <div className="text-sm font-bold text-green-600">${customerTotal.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-blue-700 font-medium">Supplier Total</div>
              <div className="text-sm font-medium text-gray-800">${supplierTotal.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-blue-700 font-medium">Profit</div>
              <div className={`text-sm font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${profit.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-blue-700 font-medium">Margin</div>
              <div className={`text-sm font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {customerTotal > 0 ? ((profit / customerTotal) * 100).toFixed(1) : '0.0'}%
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <ImageGallery
              images={formData.images || []}
              onImagesChange={(images) => handleInputChange('images', images)}
              title="Product Images"
              maxImages={6}
              editable={true}
            />
          </div>

          {/* Save Button */}
          {hasUnsavedChanges && (
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <Button
                onClick={handleSave}
                loading={loading}
                icon={Save}
                size="sm"
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