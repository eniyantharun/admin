'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { PricesAndVariants, Variant } from '@/components/ui/PricesAndVariants';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { ProductDescriptionEditor } from '@/components/ui/ProductDescriptionEditor';
import { ShippingForm } from '@/components/ui/ShippingForm';
import { MiscellaneousForm } from '@/components/ui/MiscellaneousForm';
import { Header } from '@/components/layout/Header';
import { showToast } from '@/components/ui/toast';
import { useApi } from '@/hooks/useApi';
import { EmptyState, LoadingState } from '@/components/helpers/EmptyLoadingStates';
import { useProduct, useProductMutations, useAutoSave, useBackgroundSync } from '@/hooks/api';
import { AutoSaveIndicator } from '@/components/product/AutoSaveIndicator';
import { BackgroundSyncStatus } from '@/components/product/BackgroundSyncStatus';
import { ProductCRUDService } from '@/lib/services/product/productCRUD';

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
}

// Separate interfaces for shipping and misc (managed by their own forms)
interface ShippingFormData {
  unitWeight: number | null;
  unitsPerCarton: number | null;
  weightPerCarton: number | null;
  cartonLength: number | null;
  cartonWidth: number | null;
  cartonHeight: number | null;
  piecesPerUnit: number | null;
  packaging: string;
  hasFreeShipping: boolean;
}

interface MiscellaneousFormData {
  capacity: number | null;
  inkColor: string | null;
  penOpeningType: string | null;
}

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [miscData, setMiscData] = useState<MiscellaneousFormData | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState<ProductPicture | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(true);

  const { get, put, loading } = useApi({
    cancelOnUnmount: true,
    dedupe: false,
  });

  // Product mutations hook for CRUD operations
  const {
    uploadImage,
    deleteImage,
    createColor,
    updateColor,
    deleteColor,
    addFeature,
    removeFeature,
    loading: mutationLoading,
  } = useProductMutations({
    onSuccess: () => {
      fetchProductDetails();
    },
    showToast: true,
  });

  // Auto-save hook - saves form data automatically after 700ms of inactivity (matching old project)
  const { status: saveStatus, lastSaved, save: manualSave } = useAutoSave({
    data: formData,
    saveFunction: async (data) => {
      if (!data) return;
      // Send nested structure matching old project
      await ProductCRUDService.updateProduct(Number(productId), {
        id: Number(productId),
        general: {
          name: data.name,
          material: data.material || null,
          dimensions: data.dimensions || null,
        },
        seo: {
          customSlug: data.customSlug || null,
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
        },
        merchantCenter: {
          merchantCenterTitle: data.merchantCenterTitle || null,
          merchantCenterDescription: data.merchantCenterDescription || null,
        },
        shortDescription: {
          shortDescription: data.shortDescription || null,
        },
        isMerchantCenterEnabled: data.isMerchantCenterEnabled,
        hasFreeSetup: data.hasFreeSetup,
        visibility: data.visibility as 'Enabled' | 'Disabled' | null,
        // Note: hasFreeShipping is handled by ShippingForm separately
        // Note: Shipping and miscellaneous fields are handled by their own AsyncForms
      });
    },
    debounceMs: 700, // Match old project timing
    enabled: !!formData && !!productId,
    showToast: false, // Use visual indicator instead
  });

  // Background sync hook - triggers reindex and MC sync after saves
  const { status: syncStatus } = useBackgroundSync({
    productId: Number(productId),
    enabled: true,
    debounceMs: 300,
  });

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      // Main form data (general, SEO, merchant center)
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
      });

      // Shipping data (managed by ShippingForm)
      setShippingData({
        unitWeight: product.product.shipping.form.unitWeight || null,
        unitsPerCarton: product.product.shipping.form.unitsPerCarton || null,
        weightPerCarton: product.product.shipping.form.weightPerCarton || null,
        cartonLength: product.product.shipping.form.cartonLength || null,
        cartonWidth: product.product.shipping.form.cartonWidth || null,
        cartonHeight: product.product.shipping.form.cartonHeight || null,
        piecesPerUnit: product.product.shipping.form.piecesPerUnit || null,
        packaging: product.product.shipping.form.packaging || '',
        hasFreeShipping: product.product.hasFreeShipping,
      });

      // Miscellaneous data (managed by MiscellaneousForm)
      setMiscData({
        capacity: product.product.miscellaneous.capacity || null,
        inkColor: product.product.miscellaneous.inkColor || null,
        penOpeningType: product.product.miscellaneous.penOpeningType || null,
      });
    }
  }, [product]);


  const fetchProductDetails = async () => {
    try {
      const response = await get(`/Admin/ProductEditor/GetProductDetail?Id=${productId}`);
      if (response) {
        const productDetail = response as ProductDetail;
        setProduct(productDetail);
        // Fetch additional data for variants and pricing - pass the product data directly
        await fetchVariantsAndPricing(productDetail);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      //showToast.error('Failed to load product details');
    }
  };

  const fetchVariantsAndPricing = async (productData?: ProductDetail) => {
    try {
      setVariantsLoading(true);

      // Use the passed product data or fall back to state
      const productToUse = productData || product;

      // DEBUG: Log product data availability
      console.log('[DEBUG] fetchVariantsAndPricing called with:', {
        hasProductData: !!productData,
        hasProductState: !!product,
        productToUse: !!productToUse,
        variantsCount: productToUse?.product?.variants?.length || 0
      });

      // Use variants data directly from the product response (already loaded)
      if (!productToUse || !productToUse.product.variants || productToUse.product.variants.length === 0) {
        console.warn('[DEBUG] No variants found in product data:', {
          hasProductToUse: !!productToUse,
          hasProductProperty: !!productToUse?.product,
          hasVariants: !!productToUse?.product?.variants,
          variantsLength: productToUse?.product?.variants?.length
        });
        setVariants([]);
        setVariantsLoading(false);
        return;
      }

      console.log('[DEBUG] Found variants:', productToUse.product.variants.map((v: any) => ({ id: v.id, name: v.name, sku: v.supplierItemNumber })));

      // Get the primary price table for reference
      const primaryPriceTable = productToUse.product.primaryPriceTable;

      // For each variant, fetch detailed information to get decoration methods and pricing
      const variantDetailsPromises = productToUse.product.variants.map((variant: any) =>
        get(`/Admin/ProductEditor/GetProductVariantDetails?variantId=${variant.id}`)
      );

      // Use Promise.allSettled to handle partial failures gracefully
      console.log('[DEBUG] Fetching detailed variant data for', variantDetailsPromises.length, 'variants');
      const variantDetailsResults = await Promise.allSettled(variantDetailsPromises);

      // Process results and log failures
      const variantDetailsResponses = variantDetailsResults.map((result, idx) => {
        if (result.status === 'fulfilled') {
          console.log(`[DEBUG] Variant ${productToUse.product.variants[idx].id} loaded successfully`);
          return result.value;
        } else {
          // console.error(`[DEBUG] Failed to load variant ${productToUse.product.variants[idx].id}:`, result.reason);
          // showToast.error(`Failed to load details for variant ${productToUse.product.variants[idx].name || productToUse.product.variants[idx].id}`);
          return null;
        }
      });

      // Transform to match our Variant interface
      const transformedVariants: Variant[] = productToUse.product.variants.map((productVariant: any, index: number) => {
        // Get the detailed response for this variant (if available)
        const variantDetail = variantDetailsResponses[index];
        const general = variantDetail?.general || {};
        const decorationMethods = variantDetail?.decorationMethods || [];

        // Build imprint methods from API or use primary price table as fallback
        let imprintMethods = [];

        if (decorationMethods.length > 0) {
          // Use decoration methods from GetProductVariantDetails
          imprintMethods = decorationMethods.map((method: any, mIndex: number) => {
            const tierPrices = method.tierPrices || [];

            return {
              id: `method-${method.id}`,
              name: method.methodName || method.name || 'Method',
              priceIncludes: method.priceIncludes || '',
              areaAndLocation: method.areaAndLocation || '',
              setupCharge: method.setupCharge?.toString() || '',
              productionTime: method.productionTime || 5,
              importStatus: method.importStatus || 'Unchecked',
              isPrimary: mIndex === 0,
              hasFreeSetup: method.isFreeSetup || false,
              pricingTiers: tierPrices.map((tier: any) => ({
                quantity: tier.quantity || 0,
                basePrice: tier.originalPrice || tier.basePrice || 0,
                regularPrice: tier.regularPrice || 0,
                discountedPrice: tier.discountPrice || tier.discountedPrice || 0,
              })),
            };
          });
        } else if (primaryPriceTable && primaryPriceTable.variantId === productVariant.id) {
          // Use primary price table data as fallback
          imprintMethods = [{
            id: `method-primary-${productVariant.id}`,
            name: primaryPriceTable.methodName || 'Screen Print',
            priceIncludes: '',
            areaAndLocation: '',
            setupCharge: primaryPriceTable.setupCharge?.toString() || '',
            productionTime: 5,
            importStatus: 'Unchecked' as const,
            isPrimary: true,
            hasFreeSetup: primaryPriceTable.tierPrice?.isFreeSetup || false,
            pricingTiers: [{
              quantity: primaryPriceTable.tierPrice?.quantity || 0,
              basePrice: primaryPriceTable.tierPrice?.originalPrice || 0,
              regularPrice: primaryPriceTable.tierPrice?.regularPrice || 0,
              discountedPrice: primaryPriceTable.tierPrice?.discountPrice || 0,
            }],
          }];
        } else {
          // Create default imprint method when no data available
          imprintMethods = [{
            id: `method-default-${productVariant.id}`,
            name: 'Screen Print',
            priceIncludes: '',
            areaAndLocation: '',
            setupCharge: '',
            productionTime: 5,
            importStatus: 'Unchecked' as const,
            isPrimary: true,
            hasFreeSetup: true,
            pricingTiers: [
              { quantity: 250, basePrice: 0, regularPrice: 0, discountedPrice: 0 },
              { quantity: 1000, basePrice: 0, regularPrice: 0, discountedPrice: 0 },
              { quantity: 2500, basePrice: 0, regularPrice: 0, discountedPrice: 0 },
              { quantity: 5000, basePrice: 0, regularPrice: 0, discountedPrice: 0 },
            ],
          }];
        }

        return {
          id: `variant-${productVariant.id}`,
          name: productVariant.name || general.name || '',
          supplierUrls: productVariant.entry?.url ? [productVariant.entry.url] : (general.supplierUrl ? [general.supplierUrl] : ['']),
          sku: productVariant.supplierItemNumber || general.sku || general.supplierItemNumber || '',
          isPrimary: productVariant.id === productToUse.product.primaryVariantId,
          imprintMethods,
        };
      });

      console.log('[DEBUG] Transformation complete:', {
        transformedCount: transformedVariants.length,
        variants: transformedVariants.map(v => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          methodsCount: v.imprintMethods.length
        }))
      });

      if (transformedVariants.length === 0) {
        console.warn('[DEBUG] No variants after transformation - this should not happen if variants existed in product data');
        showToast.error('Unable to load variant pricing data');
      }

      setVariants(transformedVariants);
      setVariantsLoading(false);
    } catch (error) {
      console.error('[DEBUG] CRITICAL ERROR in fetchVariantsAndPricing:', error);
      console.error('[DEBUG] Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      // showToast.error('Failed to load variants: ' + (error as Error).message);
      setVariants([]);
      setVariantsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleManualSave = async () => {
    if (!formData) return;
    try {
      await manualSave();
      showToast.success('Product saved successfully');
    } catch (error) {
      console.error('Error saving product:', error);
      showToast.error('Failed to save product');
    }
  };

  // Debounced save handlers for variants and pricing
  const variantSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pricingSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleVariantSave = useCallback(async (variantId: string, variantData: any) => {
    // Clear previous timeout
    if (variantSaveTimeoutRef.current) {
      clearTimeout(variantSaveTimeoutRef.current);
    }

    // Debounce for 700ms (matching old project)
    variantSaveTimeoutRef.current = setTimeout(async () => {
      try {
        // Extract numeric ID from variant-{id} format
        const numericId = variantId.replace('variant-', '');

        // Use correct field names matching old project
        await put('/Admin/ProductEditor/SetProductVariantDetails', {
          variantId: Number(numericId), // Changed from 'id' to 'variantId'
          name: variantData.name,
          sku: variantData.sku,
          supplierProductId: Array.isArray(variantData.supplierUrls)
            ? variantData.supplierUrls[0]
            : variantData.supplierUrls, // Changed from 'supplierUrl' to 'supplierProductId'
        });

        // Refresh variant data to get updated values
        await fetchVariantsAndPricing();
      } catch (error) {
        console.error('Error saving variant:', error);
        showToast.error('Failed to save variant details');
      }
    }, 700); // Changed from 300ms to 700ms
  }, [put, fetchVariantsAndPricing]);

  const handlePricingSave = useCallback(async (methodId: string, pricingData: any) => {
    // Clear previous timeout
    if (pricingSaveTimeoutRef.current) {
      clearTimeout(pricingSaveTimeoutRef.current);
    }

    // Debounce for 700ms (matching old project)
    pricingSaveTimeoutRef.current = setTimeout(async () => {
      try {
        // Extract table ID (methodId is actually the price table ID)
        const tableId = methodId.replace('method-', '');

        // Convert tierPrices array to object format { quantity: price }
        // matching old project structure
        const tierPricesObject: { [key: number]: number } = {};
        pricingData.pricingTiers.forEach((tier: any) => {
          if (tier.quantity !== null && tier.quantity !== undefined) {
            // Only send basePrice (originalPrice) - regularPrice and discountPrice are calculated
            tierPricesObject[tier.quantity] = tier.basePrice || 0;
          }
        });

        await put('/Admin/ProductEditor/SetPriceTableDetail', {
          tableId, // Changed from 'id' to 'tableId'
          tierPrices: tierPricesObject, // Changed from array to object format
        });

        // Refresh variant data to get updated calculated prices
        await fetchVariantsAndPricing();
      } catch (error) {
        console.error('Error saving pricing:', error);
        showToast.error('Failed to save pricing details');
      }
    }, 700); // Changed from 300ms to 700ms
  }, [put, fetchVariantsAndPricing]);

  const handleBack = () => {
    if (saveStatus === 'saving') {
      if (confirm('Changes are still being saved. Are you sure you want to leave?')) {
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
            <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
            <BackgroundSyncStatus status={syncStatus} />
            <Button
              onClick={handleManualSave}
              loading={loading || saveStatus === 'saving'}
              icon={Save}
              size="sm"
            >
              Save Now
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
                <DollarSign className="w-5 h-5 text-purple-600" />
                Prices & Variants
              </h3>

              {variantsLoading ? (
                <LoadingState message="Loading variants and pricing..." />
              ) : (
                <PricesAndVariants
                  variants={variants}
                  onChange={setVariants}
                  onVariantSave={handleVariantSave}
                  onPricingSave={handlePricingSave}
                />
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Short Description</h3>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder="Short Description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <ProductDescriptionEditor
                documentId={product?.product.descriptionId}
                productId={Number(productId)}
                onDocumentCreated={(documentId) => {
                  // Document created, product already updated by the editor
                  fetchProductDetails();
                }}
              />
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
                  label="Visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={(e) => handleInputChange('visibility', e.target.value)}
                />
              </div>

              <p className="text-sm text-gray-500 mt-3">
                Note: Free Shipping and Packaging are managed in the Shipping section below.
              </p>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <ProductFeatures
                apiFeatures={product.product.features}
                onChange={(features) => {
                  // Features will be saved via auto-save
                }}
                onAdd={async (feature) => {
                  await addFeature(Number(productId), {
                    featureTypeId: feature.typeId,
                    value: feature.value,
                  });
                }}
                onRemove={async (featureId) => {
                  await removeFeature(featureId);
                }}
              />
            </Card>

            <Card className="p-6">
              <ProductColors
                apiColors={product.product.colors}
                onChange={(colors) => {
                  // Colors will be saved via callbacks
                }}
                onCreate={async (color) => {
                  await createColor(Number(productId), {
                    name: color.name,
                    hexCode: color.hexCode,
                  });
                }}
                onUpdate={async (colorId, updates) => {
                  await updateColor(colorId, updates);
                }}
                onDelete={async (colorId) => {
                  await deleteColor([colorId]);
                }}
              />
            </Card>

            <Card className="p-6">
              <ProductPicturesManager
                productId={productId}
                apiPictures={product.product.pictures}
                primaryPictureId={product.product.primaryPicture?.id}
                onChange={(pictures) => {
                  // Pictures managed via callbacks
                }}
                onUpload={async (file) => {
                  await uploadImage(Number(productId), file);
                }}
                onDelete={async (pictureId) => {
                  await deleteImage([pictureId]);
                }}
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
          </div>
        </div>

        {/* Bottom Section - Shipping & Miscellaneous (like old project) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Shipping - 2 columns */}
          <Card className="p-6 lg:col-span-2">
            {shippingData && (
              <ShippingForm
                productId={Number(productId)}
                initialData={shippingData}
              />
            )}
          </Card>

          {/* Miscellaneous - 1 column */}
          <Card className="p-6">
            {miscData && (
              <MiscellaneousForm
                productId={Number(productId)}
                initialData={miscData}
              />
            )}
          </Card>
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