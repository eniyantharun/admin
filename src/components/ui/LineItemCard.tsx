import React, { useState, useEffect } from 'react';
import { Trash2, Package, DollarSign, Hash, FileText, Building, Palette, AlertCircle, ChevronDown, ChevronUp, Save, Edit3, ImageIcon, Eye, Grid } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { VariantDropdown, MethodDropdown, ColorDropdown, ApiVariant, ApiMethod, ApiColor } from '@/components/ui/ApiDropdowns';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';
import { ProductDropdown } from './ProductDropdown';
import { ProductImageSelector, ProductPicture } from './ProductImageSelector';

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
  variantId?: number;
  methodId?: number;
  colorId?: string;
  sourceUri?: string;
  customPicture?: ProductPicture;
}

interface LineItemCardProps {
  item: LineItemData;
  index: number;
  saleId: string;
  onRemove: (itemId: string) => void;
  onUpdate: (itemId: string, updatedItem: LineItemData) => void;
  onRefreshSummary?: () => void;
  isNew?: boolean;
}

export const LineItemCard: React.FC<LineItemCardProps> = ({
  item,
  index,
  saleId,
  onRemove,
  onUpdate,
  onRefreshSummary,
  isNew = false
}) => {
  const [formData, setFormData] = useState<LineItemData>(item);
  const [isExpanded, setIsExpanded] = useState(isNew);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);

  const { post, get, loading } = useApi({
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

  const handleImageSelect = (picture: ProductPicture) => {
    setFormData(prev => ({
      ...prev,
      customPicture: picture,
      sourceUri: picture.sourceUri
    }));
    showToast.success('Product image updated');
  };

  const openImageSelector = () => {
    const productId = formData.selectedProduct?.id || formData.productItemNumber;
    if (!productId) {
      showToast.error('No product selected to load images');
      return;
    }
    setShowImageSelector(true);
  };

  const getCurrentImageUrl = () => {
    // Priority: customPicture > sourceUri > selectedProduct pictures > fallback
    if (formData.customPicture?.sourceUri) {
      return formData.customPicture.sourceUri;
    }
    if (formData.sourceUri) {
      return formData.sourceUri;
    }
    if (formData.selectedProduct?.pictures?.[0]) {
      return `https://static2.promotionalproductinc.com/p2/src/${formData.selectedProduct.id}/${formData.selectedProduct.pictures[0]}.webp`;
    }
    return null;
  };

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
        productItemNumber: product.id?.toString() || prev.productItemNumber,
        // Reset variant, method, and color when product changes
        variantName: '',
        methodName: '',
        color: '',
        variantId: undefined,
        methodId: undefined,
        colorId: undefined,
        // Reset image data when product changes
        sourceUri: undefined,
        customPicture: undefined
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedProduct: null,
        variantName: '',
        methodName: '',
        color: '',
        variantId: undefined,
        methodId: undefined,
        colorId: undefined,
        sourceUri: undefined,
        customPicture: undefined
      }));
    }
  };

  const handleVariantSelect = (variantName: string, variantId?: string | number) => {
    setFormData(prev => ({
      ...prev,
      variantName,
      variantId: typeof variantId === 'number' ? variantId : undefined,
      supplierItemNumber: variantId && variantId !== -1 ? variantId.toString() : prev.supplierItemNumber
    }));
    
    if (onRefreshSummary) {
      setTimeout(onRefreshSummary, 100);
    }
  };

  const handleVariantChange = (variant: ApiVariant | null) => {
    if (variant) {
      handleVariantSelect(variant.name, variant.id);
    } else {
      handleVariantSelect('No Variant', -1);
    }
  };

  const handleMethodSelect = (methodName: string, methodId?: string | number) => {
    setFormData(prev => ({
      ...prev,
      methodName,
      methodId: typeof methodId === 'number' ? methodId : undefined
    }));
    
    if (onRefreshSummary) {
      setTimeout(onRefreshSummary, 100);
    }
  };

  const handleMethodChange = (method: ApiMethod | null) => {
    if (method) {
      handleMethodSelect(method.name, method.id);
    } else {
      handleMethodSelect('No Method', -1);
    }
  };

  const handleColorSelect = (colorName: string, colorId?: string | number) => {
    setFormData(prev => ({
      ...prev,
      color: colorName,
      colorId: typeof colorId === 'string' ? colorId : undefined
    }));
    
    if (onRefreshSummary) {
      setTimeout(onRefreshSummary, 100);
    }
  };

  const handleColorChange = (color: ApiColor | null) => {
    if (color) {
      handleColorSelect(color.name, color.id);
    } else {
      handleColorSelect('No Color', '-1');
    }
  };

  const handleSave = async () => {
    try {
      // First, save the general line item details
      const generalPayload = {
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
          artworkSpecialInstructions: formData.artworkSpecialInstructions || null,
          variantId: formData.variantId || null,
          methodId: formData.methodId || null,
          colorId: formData.colorId || null
        }
      };

      console.log('Sending general line item details:', generalPayload);
      const response = await post('/Admin/SaleEditor/SetLineItemDetail', generalPayload);
      
      // If there's a custom picture selected, send a separate request for the thumbnail
      if (formData.customPicture?.pictureId) {
        const thumbnailPayload = {
          lineItemId: item.id,
          thumbnail: {
            pictureId: formData.customPicture.pictureId
          }
        };

        console.log('Sending thumbnail update:', thumbnailPayload);
        await post('/Admin/SaleEditor/SetLineItemDetail', thumbnailPayload);
      }

      // Update sourceUri from response if available
      if (response?.sourceUri) {
        const updatedFormData = { ...formData, sourceUri: response.sourceUri };
        setFormData(updatedFormData);
        onUpdate(item.id, updatedFormData);
      } else {
        onUpdate(item.id, formData);
      }
      
      setHasUnsavedChanges(false);
      
      if (onRefreshSummary) {
        onRefreshSummary();
      }
      
      showToast.success('Line item updated successfully');
    } catch (error) {
      console.error('Error updating line item:', error);
      showToast.error('Failed to update line item');
    }
  };


  const customerTotal = (formData.quantity || 0) * (Number(formData.customerPricePerQuantity) || 0) + (Number(formData.customerSetupCharge) || 0);
  const supplierTotal = (formData.quantity || 0) * (Number(formData.supplierPricePerQuantity) || 0) + (Number(formData.supplierSetupCharge) || 0);
  const profit = customerTotal - supplierTotal;

  const productId = formData.selectedProduct?.id || formData.productItemNumber;
  const currentImageUrl = getCurrentImageUrl();

  return (
    <>
      <Card className="overflow-hidden border border-gray-200 hover:border-purple-300 transition-all duration-200">
        {/* Compact Header */}
        <div className="p-3 bg-gradient-to-r from-gray-50 to-purple-50 border-b">
          <div className="flex items-start gap-3">
            {/* Product Image with Change Option */}
            <div className="w-12 h-12 bg-gray-100 rounded border flex-shrink-0 relative group overflow-hidden">
              {currentImageUrl ? (
                <>
                  <img 
                    src={currentImageUrl}
                    alt={formData.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}                                                  
                  />
                  <div className="w-full h-full flex items-center justify-center text-gray-400 invisible">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openImageSelector();
                      }}
                      size="sm"
                      variant="secondary"
                      icon={Grid}
                      className="w-6 h-6 p-1 bg-white/90 hover:bg-white text-gray-700 shadow-lg"
                      title="Change product image"
                    />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors cursor-pointer"
                     onClick={openImageSelector}>
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Add</span>
                </div>
              )}
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
                    <span>Qty: <span className="font-medium">{formData.quantity || 0}</span></span>
                    <span>@<span className="font-medium">${(Number(formData?.customerPricePerQuantity) || 0).toFixed(2)}</span></span>
                    <span className="font-medium text-green-600">${customerTotal.toFixed(2)}</span>
                    {profit > 0 && (
                      <span className="text-orange-600">Profit: ${profit.toFixed(2)}</span>
                    )}
                  </div>
                  {/* Display variant, method, color info in header */}
                  {(formData.variantName || formData.methodName || formData.color) && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      {formData.variantName && formData.variantName !== 'No Variant' && (
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{formData.variantName}</span>
                      )}
                      {formData.methodName && formData.methodName !== 'No Method' && (
                        <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{formData.methodName}</span>
                      )}
                      {formData.color && formData.color !== 'No Color' && (
                        <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{formData.color}</span>
                      )}
                    </div>
                  )}
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

            {/* Product Details with API Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="form-input-group">
                <label className="form-label block text-xs font-medium text-gray-700 mb-1">
                  Variant
                </label>
                <VariantDropdown
                  productId={productId}
                  value={formData.variantName || ''}
                  onChange={handleVariantSelect}
                  onVariantSelect={handleVariantChange}
                  disabled={!productId}
                />
              </div>
              
              <div className="form-input-group">
                <label className="form-label block text-xs font-medium text-gray-700 mb-1">
                  Method
                </label>
                <MethodDropdown
                  productId={productId}
                  value={formData.methodName || ''}
                  onChange={handleMethodSelect}
                  onMethodSelect={handleMethodChange}
                  disabled={!productId}
                />
              </div>
              
              <div className="form-input-group">
                <label className="form-label block text-xs font-medium text-gray-700 mb-1">
                  Color
                </label>
                <ColorDropdown
                  productId={productId}
                  value={formData.color || ''}
                  onChange={handleColorSelect}
                  onColorSelect={handleColorChange}
                  disabled={!productId}
                />
              </div>
              
              <FormInput
                label="Quantity"
                name="quantity"
                type="number"
                value={(formData.quantity || 1).toString()}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 1;
                  handleInputChange('quantity', newQuantity);
                  if (onRefreshSummary) {
                    setTimeout(onRefreshSummary, 100);
                  }
                }}
                placeholder="1"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <FormInput
                label="Customer Unit Price"
                name="customerPricePerQuantity"
                type="number"
                value={(Number(formData?.customerPricePerQuantity) || 0).toString()}
                onChange={(e) => {
                  const newPrice = parseFloat(e.target.value) || 0;
                  handleInputChange('customerPricePerQuantity', newPrice);
                  if (onRefreshSummary) {
                    setTimeout(onRefreshSummary, 100);
                  }
                }}
                placeholder="0.00"
              />
              <FormInput
                label="Customer Setup"
                name="customerSetupCharge"
                type="number"
                value={(Number(formData.customerSetupCharge) || 0).toString()}
                onChange={(e) => {
                  const newSetup = parseFloat(e.target.value) || 0;
                  handleInputChange('customerSetupCharge', newSetup);
                  if (onRefreshSummary) {
                    setTimeout(onRefreshSummary, 100);
                  }
                }}
                placeholder="0.00"
              />
              <FormInput
                label="Supplier Unit Price"
                name="supplierPricePerQuantity"
                type="number"
                value={(Number(formData.supplierPricePerQuantity) || 0).toString()}
                onChange={(e) => {
                  const newPrice = parseFloat(e.target.value) || 0;
                  handleInputChange('supplierPricePerQuantity', newPrice);
                  if (onRefreshSummary) {
                    setTimeout(onRefreshSummary, 100);
                  }
                }}
                placeholder="0.00"
              />
              <FormInput
                label="Supplier Setup"
                name="supplierSetupCharge"
                type="number"
                value={(Number(formData.supplierSetupCharge) || 0).toString()}
                onChange={(e) => {
                  const newSetup = parseFloat(e.target.value) || 0;
                  handleInputChange('supplierSetupCharge', newSetup);
                  if (onRefreshSummary) {
                    setTimeout(onRefreshSummary, 100);
                  }
                }}
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

            {/* Product Image Section */}
            {currentImageUrl && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">Product Image</h4>
                  <Button
                    onClick={openImageSelector}
                    size="sm"
                    variant="secondary"
                    icon={Grid}
                    className="text-xs"
                  >
                    Change Image
                  </Button>
                </div>
                <div className="w-24 h-24 bg-gray-100 rounded border overflow-hidden">
                  <img 
                    src={currentImageUrl}
                    alt={formData.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

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

            {/* Additional Images Gallery */}
            <div>
              <ImageGallery
                images={formData.images || []}
                onImagesChange={(images) => handleInputChange('images', images)}
                title="Additional Images"
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
                  className="hover:to-indigo-700"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Product Image Selector Modal */}
      <ProductImageSelector
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onImageSelect={handleImageSelect}
        productId={productId || ''}
        currentPicture={formData.customPicture}
        productName={formData.productName}
      />    </>
  );
};