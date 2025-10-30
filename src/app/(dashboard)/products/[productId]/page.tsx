'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Eye, Package, Building, DollarSign, Calendar, Image as ImageIcon, Tag, Palette, Grid } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';
import { StatusBadge } from '@/components/helpers/StatusBadge';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { ProductImageSelector, ProductPicture } from '@/components/ui/ProductImageSelector';
import { ProductFeatures } from '@/components/ui/ProductFeatures';
import { ProductColors } from '@/components/ui/ProductColors';
import { ProductPicturesManager } from '@/components/ui/ProductPicturesManager';
import { Header } from '@/components/layout/Header';
import { showToast } from '@/components/ui/toast';
import { useApi } from '@/hooks/useApi';
import { EmptyState, LoadingState } from '@/components/helpers/EmptyLoadingStates';

interface ProductDetail {
  product: {
    id: number;
    isExclusive: boolean;
    name: string;
    slug: string;
    hasFreeSetup: boolean;
    hasFreeShipping: boolean;
    general: {
      form: {
        name: string;
        material: string | null;
        dimensions: string | null;
      };
    };
    supplier: {
      id: number;
      companyName: string;
      webUrl: string;
      emailAddress: string;
      telephoneNumber: string;
      importerKey: string;
      website: string;
    };
    dates: {
      indexedAt: string;
      importedAt: string;
      createdAt: string;
      updatedAt: string;
    };
    seo: {
      form: {
        customSlug: string;
        metaTitle: string;
        metaDescription: string;
      };
      defaultMetaTitle: string;
      generatedUrlSegment: string;
      slug: string;
    };
    merchantCenter: {
      form: {
        merchantCenterTitle: string | null;
        merchantCenterDescription: string;
      };
      isMerchantCenterEnabled: boolean;
      defaultMerchantCenterTitle: string;
    };
    visibility: string;
    isSeeDescriptionMaterial: boolean;
    isSeeDescriptionDimensions: boolean;
    features: any[];
    pictures: Array<{
      id: number;
      index: number;
      variants: Array<{
        id: number;
        name: string;
      }>;
      colors: any[];
    }>;
    primaryVariantId: number;
    primaryPicture: {
      id: number;
      index: number;
      variants: any[];
      colors: any[];
    };
    descriptionId: string;
    shortDescription: string;
    tags: {
      categories: Array<{
        id: number;
        name: string;
        breadcrumb: Array<{
          id: number;
          name: string;
        }>;
      }>;
      themes: any[];
      keywords: any[];
    };
    brand: string | null;
    primaryPriceTable: {
      supplierItemNumber: string;
      setupCharge: number;
      id: string;
      variantId: number;
      variantName: string;
      methodName: string;
      tierPrice: {
        quantity: number;
        originalPrice: number;
        msrpDiscount: number;
        regularPrice: number;
        discountPrice: number;
        isSamplePricing: boolean;
        setupCharge: number;
        isFreeSetup: boolean;
      };
    };
    variants: Array<{
      supplierItemNumber: string;
      entry: {
        offerId: string;
        url: string | null;
      };
      id: number;
      name: string;
    }>;
    colors: any[];
    selectedPriceTable: any;
    shipping: {
      form: {
        unitWeight: number | null;
        unitsPerCarton: number | null;
        weightPerCarton: number | null;
        cartonLength: number | null;
        cartonWidth: number | null;
        cartonHeight: number | null;
        piecesPerUnit: number | null;
        packaging: string;
      };
      hasFreeShipping: boolean;
    };
    miscellaneous: {
      inkColor: string | null;
      penOpeningType: string | null;
      capacity: number;
    };
    legacyFeatures: any[];
    isScrapedProduct: boolean;
    importingInto: any;
    importingFrom: any;
    hasPendingPicturesToDownload: boolean;
  };
}

interface ProductFormData {
  name: string;
  material: string;
  dimensions: string;
  customSlug: string;
  metaTitle: string;
  metaDescription: string;
  merchantCenterTitle: string;
  merchantCenterDescription: string;
  shortDescription: string;
  visibility: string;
  isExclusive: boolean;
  isMerchantCenterEnabled: boolean;
  hasFreeSetup: boolean;
  hasFreeShipping: boolean;
  packaging: string;
}

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState<ProductPicture | null>(null);

  const { get, put, loading } = useApi({
    cancelOnUnmount: true,
    dedupe: false,
  });

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.product.general.form.name,
        material: product.product.general.form.material || '',
        dimensions: product.product.general.form.dimensions || '',
        customSlug: product.product.seo.form.customSlug,
        metaTitle: product.product.seo.form.metaTitle,
        metaDescription: product.product.seo.form.metaDescription,
        merchantCenterTitle: product.product.merchantCenter.form.merchantCenterTitle || '',
        merchantCenterDescription: product.product.merchantCenter.form.merchantCenterDescription,
        shortDescription: product.product.shortDescription,
        visibility: product.product.visibility,
        isExclusive: product.product.isExclusive,
        isMerchantCenterEnabled: product.product.merchantCenter.isMerchantCenterEnabled,
        hasFreeSetup: product.product.hasFreeSetup,
        hasFreeShipping: product.product.hasFreeShipping,
        packaging: product.product.shipping.form.packaging || '',
      });
    }
  }, [product]);

  useEffect(() => {
    if (formData && product) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify({
        name: product.product.general.form.name,
        material: product.product.general.form.material || '',
        dimensions: product.product.general.form.dimensions || '',
        customSlug: product.product.seo.form.customSlug,
        metaTitle: product.product.seo.form.metaTitle,
        metaDescription: product.product.seo.form.metaDescription,
        merchantCenterTitle: product.product.merchantCenter.form.merchantCenterTitle || '',
        merchantCenterDescription: product.product.merchantCenter.form.merchantCenterDescription,
        shortDescription: product.product.shortDescription,
        visibility: product.product.visibility,
        isExclusive: product.product.isExclusive,
        isMerchantCenterEnabled: product.product.merchantCenter.isMerchantCenterEnabled,
        hasFreeSetup: product.product.hasFreeSetup,
        hasFreeShipping: product.product.hasFreeShipping,
        packaging: product.product.shipping.form.packaging || '',
      });
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, product]);

  const fetchProductDetails = async () => {
    try {
      const response = await get(`/Admin/ProductEditor/GetProductDetail?Id=${productId}`);
      if (response) {
        setProduct(response as ProductDetail);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      //showToast.error('Failed to load product details');
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      await put(`/Admin/ProductEditor/UpdateProduct?Id=${productId}`, formData);
      showToast.success('Product updated successfully');
      setHasUnsavedChanges(false);
      fetchProductDetails();
    } catch (error) {
      console.error('Error updating product:', error);
      showToast.error('Failed to update product');
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/products');
      }
    } else {
      router.push('/products');
    }
  };

  const getProductImageUrl = (pictureIndex: number): string => {
    return `https://static2.promotionalproductinc.com/p2/src/${productId}/${pictureIndex}.webp`;
  };

  const contextData = {
    totalCount: 0,
    searchTerm: '',
    onSearchChange: () => {},
    onAddNew: () => {},
    filters: [],
    actions: []
  };

  if (loading && !product) {
    return (
      <div className="product-edit-page">
        <Header contextData={contextData} />
        <div className="p-6">
          <LoadingState message="Loading product details..." />
        </div>
      </div>
    );
  }

  if (!product || !formData) {
    return (
      <div className="product-edit-page">
        <Header contextData={contextData} />
        <div className="p-6">
          <EmptyState
            icon={Package}
            title="Product not found"
            description="The product you're looking for doesn't exist or has been removed."
          />
        </div>
      </div>
    );
  }

  const primaryImage = product.product.primaryPicture ? getProductImageUrl(product.product.primaryPicture.index) : null;

  return (
    <div className="product-edit-page">
      <Header contextData={contextData} />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="secondary"
              icon={ArrowLeft}
              size="sm"
            >
              Back to Products
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.product.name}</h1>
              <p className="text-sm text-gray-600">Product ID: {productId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge
              enabled={product.product.visibility === 'enabled'}
              label={{ enabled: 'Active', disabled: 'Inactive' }}
            />
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 font-medium">Unsaved changes</span>
            )}
            <Button
              onClick={handleSave}
              loading={loading}
              icon={Save}
              disabled={!hasUnsavedChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Basic Information
              </h3>

              <div className="space-y-4">
                <FormInput
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Material"
                    name="material"
                    value={formData.material}
                    onChange={(e) => handleInputChange('material', e.target.value)}
                  />
                  <FormInput
                    label="Dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  />
                </div>

                <div className="form-input-group">
                  <label className="form-label block text-xs font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                SEO Settings
              </h3>

              <div className="space-y-4">
                <FormInput
                  label="Custom Slug"
                  name="customSlug"
                  value={formData.customSlug}
                  onChange={(e) => handleInputChange('customSlug', e.target.value)}
                />

                <FormInput
                  label="Meta Title"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                />

                <div className="form-input-group">
                  <label className="form-label block text-xs font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Grid className="w-5 h-5 text-green-600" />
                Merchant Center
              </h3>

              <div className="space-y-4">
                <FormInput
                  label="Merchant Center Enabled"
                  name="isMerchantCenterEnabled"
                  type="checkbox"
                  value={formData.isMerchantCenterEnabled}
                  onChange={(e) => handleInputChange('isMerchantCenterEnabled', (e.target as HTMLInputElement).checked)}
                  placeholder="Enable product in Merchant Center"
                />

                <FormInput
                  label="Merchant Center Title"
                  name="merchantCenterTitle"
                  value={formData.merchantCenterTitle}
                  onChange={(e) => handleInputChange('merchantCenterTitle', e.target.value)}
                  disabled={!formData.isMerchantCenterEnabled}
                />

                <div className="form-input-group">
                  <label className="form-label block text-xs font-medium text-gray-700 mb-1">
                    Merchant Center Description
                  </label>
                  <textarea
                    value={formData.merchantCenterDescription}
                    onChange={(e) => handleInputChange('merchantCenterDescription', e.target.value)}
                    disabled={!formData.isMerchantCenterEnabled}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    rows={4}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-orange-600" />
                Settings
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Exclusive"
                  name="isExclusive"
                  type="checkbox"
                  value={formData.isExclusive}
                  onChange={(e) => handleInputChange('isExclusive', (e.target as HTMLInputElement).checked)}
                  placeholder="Mark as exclusive product"
                />

                <FormInput
                  label="Free Setup"
                  name="hasFreeSetup"
                  type="checkbox"
                  value={formData.hasFreeSetup}
                  onChange={(e) => handleInputChange('hasFreeSetup', (e.target as HTMLInputElement).checked)}
                  placeholder="Offer free setup"
                />

                <FormInput
                  label="Free Shipping"
                  name="hasFreeShipping"
                  type="checkbox"
                  value={formData.hasFreeShipping}
                  onChange={(e) => handleInputChange('hasFreeShipping', (e.target as HTMLInputElement).checked)}
                  placeholder="Offer free shipping"
                />

                <FormInput
                  label="Visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                />
              </div>

              <div className="mt-4">
                <FormInput
                  label="Packaging"
                  name="packaging"
                  value={formData.packaging}
                  onChange={(e) => handleInputChange('packaging', e.target.value)}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <ProductFeatures apiFeatures={product.product.features} />
            </Card>

            <Card className="p-6">
              <ProductColors apiColors={product.product.colors} />
            </Card>

            <Card className="p-6">
              <ProductPicturesManager
                productId={productId}
                apiPictures={product.product.pictures}
                primaryPictureId={product.product.primaryPicture?.id}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-gray-600" />
                Supplier Information
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Company:</span>
                  <p className="font-medium text-gray-900">{product.product.supplier.companyName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium text-gray-900">{product.product.supplier.emailAddress}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium text-gray-900">{product.product.supplier.telephoneNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">Website:</span>
                  <a href={product.product.supplier.webUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                    {product.product.supplier.webUrl}
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Pricing Information
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Variant:</span>
                  <p className="font-medium text-gray-900">{product.product.primaryPriceTable.variantName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Method:</span>
                  <p className="font-medium text-gray-900">{product.product.primaryPriceTable.methodName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Price:</span>
                  <p className="font-medium text-green-600">${product.product.primaryPriceTable.tierPrice.regularPrice.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Setup Charge:</span>
                  <p className="font-medium text-gray-900">${product.product.primaryPriceTable.setupCharge?.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span>
                  <p className="font-medium text-gray-900">{product.product.primaryPriceTable.tierPrice.quantity}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Dates
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <p className="font-medium text-gray-900">{new Date(product.product.dates.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span>
                  <p className="font-medium text-gray-900">{new Date(product.product.dates.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Imported:</span>
                  <p className="font-medium text-gray-900">{new Date(product.product.dates.importedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ProductImageSelector
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onImageSelect={(picture) => {
          setSelectedPicture(picture);
          showToast.success('Image selected');
        }}
        productId={productId}
        currentPicture={selectedPicture}
        productName={product.product.name}
      />
    </div>
  );
}