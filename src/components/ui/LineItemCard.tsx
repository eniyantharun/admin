import React, { useState, useEffect } from 'react';
import { Trash2, Package, DollarSign, Hash, FileText, Building, Palette, AlertCircle, ChevronDown, ChevronUp, Save, Edit3 } from 'lucide-react';
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
  const [showProductDetails, setShowProductDetails] = useState(true);
  const [showPricing, setShowPricing] = useState(true);
  const [showArtwork, setShowArtwork] = useState(false);

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
      
      // Auto-calculate total price when quantity or unit price changes
      if (field === 'quantity' || field === 'customerPricePerQuantity') {
        const quantity = field === 'quantity' ? value : updated.quantity;
        const unitPrice = field === 'customerPricePerQuantity' ? value : updated.customerPricePerQuantity;
        // Note: Total calculation would be done server-side, this is just for immediate UI feedback
      }
      
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
  const margin = customerTotal > 0 ? ((profit / customerTotal) * 100) : 0;

  return (
    <Card className="overflow-hidden border border-gray-200 hover:border-purple-300 transition-all duration-200">
      {/* Header - Always Visible */}
      <div 
        className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 border-b cursor-pointer hover:from-gray-100 hover:to-purple-100 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-base">
                  {formData.productName || `Line Item #${index + 1}`}
                </h3>
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>Unsaved</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Qty: <span className="font-medium">{formData.quantity}</span>
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-medium text-green-600">${customerTotal.toFixed(2)}</span>
                </span>
                {profit > 0 && (
                  <span className="flex items-center gap-1 text-orange-600">
                    Profit: <span className="font-medium">${profit.toFixed(2)}</span>
                  </span>
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
                icon={Save}
                className="w-full"
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
              title="Remove item"
            />
            <div className="ml-2">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6 bg-white">
          {/* Product Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-purple-600" />
              <h4 className="font-semibold text-gray-900">Product Information</h4>
            </div>
            
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

          {/* Product Details Section */}
          <Card className="border border-gray-200">
            <div 
              className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setShowProductDetails(!showProductDetails)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-gray-600" />
                  <h5 className="font-medium text-gray-900">Product Details</h5>
                </div>
                {showProductDetails ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {showProductDetails && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Variant"
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
                    placeholder="e.g., Screen Print"
                  />
                  <FormInput
                    label="Color"
                    name="color"
                    value={formData.color || ''}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="Product color"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            )}
          </Card>

          {/* Pricing Section */}
          <Card className="border border-blue-200 bg-blue-50">
            <div 
              className="p-4 bg-blue-100 border-b border-blue-200 cursor-pointer hover:bg-blue-150 transition-colors"
              onClick={() => setShowPricing(!showPricing)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <h5 className="font-medium text-blue-900">Pricing & Quantity</h5>
                </div>
                {showPricing ? (
                  <ChevronUp className="w-4 h-4 text-blue-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-blue-600" />
                )}
              </div>
            </div>
            
            {showPricing && (
              <div className="p-2 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <FormInput
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity.toString()}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
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

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-blue-200">
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-xs text-blue-700 mb-1 font-medium uppercase tracking-wide">Customer Total</div>
                    <div className="text-xl font-bold text-green-600">${customerTotal.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-xs text-blue-700 mb-1 font-medium uppercase tracking-wide">Supplier Total</div>
                    <div className="text-lg font-semibold text-gray-800">${supplierTotal.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-xs text-blue-700 mb-1 font-medium uppercase tracking-wide">Profit</div>
                    <div className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${profit.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-xs text-blue-700 mb-1 font-medium uppercase tracking-wide">Margin</div>
                    <div className={`text-lg font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {margin.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Artwork Section */}
          <Card className="border border-purple-200 bg-purple-50">
            <div 
              className="p-4 bg-purple-100 border-b border-purple-200 cursor-pointer hover:bg-purple-150 transition-colors"
              onClick={() => setShowArtwork(!showArtwork)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <h5 className="font-medium text-purple-900">Artwork & Customization</h5>
                </div>
                {showArtwork ? (
                  <ChevronUp className="w-4 h-4 text-purple-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-purple-600" />
                )}
              </div>
            </div>
            
            {showArtwork && (
              <div className="p-4 space-y-4">
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
            )}
          </Card>

          {/* Save Button - Fixed at bottom */}
          {hasUnsavedChanges && (
            <div className="flex justify-end pt-4 border-t border-gray-200 bg-gray-50 -m-6 mt-6 p-6">
              <Button
                onClick={handleSave}
                loading={loading}
                icon={Save}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
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