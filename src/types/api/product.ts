/**
 * Product API Types
 * Type definitions for all Product module API requests and responses
 */

// ============================================
// COMMON TYPES
// ============================================

// Note: ApiResponse is exported from @/types/api/common

export interface BatchOperationResponse {
  batchId: string;
  total: number;
  processed: number;
  remaining: number;
  percentage: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface PaginationParams {
  pageSize?: number;
  offset?: number;
}

// ============================================
// PRODUCT CORE TYPES
// ============================================

export interface CreateProductRequest {
  name: string;
  supplierId: number;        // REQUIRED - matches old project DTO
  isExclusive?: boolean;     // Added to match old project
}

export interface CreateProductResponse {
  id: number;                // Changed from productId to match API response
}

export interface UpdateProductRequest {
  id: number;

  // General product info
  general?: {
    name?: string;
    material?: string | null;
    dimensions?: string | null;
  };

  // Shipping details
  shipping?: {
    unitWeight?: number | null;
    unitsPerCarton?: number | null;
    weightPerCarton?: number | null;
    cartonLength?: number | null;
    cartonWidth?: number | null;
    cartonHeight?: number | null;
    piecesPerUnit?: number | null;
    packaging?: string | null;
  };

  // Miscellaneous details
  miscellaneous?: {
    inkColor?: string | null;
    penOpeningType?: string | null;
    capacity?: number | null;
  };

  // SEO
  seo?: {
    customSlug?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
  };

  // Merchant Center
  merchantCenter?: {
    merchantCenterTitle?: string | null;
    merchantCenterDescription?: string | null;
  };

  // Short description
  shortDescription?: {
    shortDescription?: string | null;
  };

  // Supplier
  supplier?: {
    supplierId: number;
  };

  // Brand
  brand?: {
    brandId?: number | null;
  };

  // Primary selections
  primaryPriceTableId?: string | null;
  primaryPicture?: {
    primaryPictureId: number;
    index?: number | null;
  };

  // Flags (top-level)
  isSeeDescriptionMaterial?: boolean | null;
  isSeeDescriptionDimensions?: boolean | null;
  isMerchantCenterEnabled?: boolean | null;
  hasFreeSetup?: boolean | null;
  hasFreeShipping?: boolean | null;

  // Other
  visibility?: 'Enabled' | 'Disabled' | null;
  descriptionId?: string | null;
  breadcrumbId?: number | null;

  // Legacy flat fields (for backward compatibility, deprecated)
  name?: string;
  slug?: string;
  description?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  metaTitle?: string;
  metaDescription?: string;
  exclusive?: boolean;
  merchantCenterEnabled?: boolean;
  freeSetup?: boolean;
  freeShipping?: boolean;
  supplierId?: number;
  brandId?: number;
}

export interface DeleteProductRequest {
  productId: number;
}

export interface DuplicateProductRequest {
  productId: number;
  newName?: string;
}

export interface DuplicateProductResponse {
  newProductId: number;
  success: boolean;
}

export interface SetProductVisibilityRequest {
  productId: number;
  visibility: 'Enabled' | 'Disabled';
}

export interface CombineProductsRequest {
  targetProductId: number;
  sourceProductIds: number[];
}

// ============================================
// VARIANT TYPES
// ============================================

export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  sku?: string;
  supplierProductId?: string;
  position: number;
  enabled: boolean;
}

export interface CreateVariantRequest {
  productId: number;
  sourceVariantId?: number | null;  // For copying from existing variant - matches old DTO
}

export interface UpdateVariantRequest {
  variantId: number;
  general?: {                        // Nested structure to match old DTO
    name: string;
    supplierItemNumber?: string | null;   // Changed from 'sku'
    supplierUrl?: string | null;          // Changed from 'supplierProductId'
  } | null;
}

export interface DeleteVariantRequest {
  variantId: number;
}

export interface ReorderVariantsRequest {
  productId: number;
  variantIds: number[]; // Ordered array
}

export interface VariantDetailsResponse {
  variant: ProductVariant;
  priceTables: PriceTable[];
  decorationMethods: DecorationMethod[];
}

// ============================================
// PRICING TYPES
// ============================================

export interface PriceTable {
  id: number;
  variantId: number;
  methodId: number;
  minQuantity: number;
  maxQuantity?: number;
  price: number;
  setupCharge: number;
}

export interface PriceInclude {
  id: number;
  name: string;
  description?: string;
}

export interface CreatePriceTableRequest {
  variantId: number;
  sourceTableId?: string | null; // If provided, copies from this table
}

export interface UpdatePriceTableRequest {
  tableId: string; // Changed from priceTableId to match old project
  general?: {
    priceIncludes?: string | null;
    areaAndLocation?: string | null;
    setupCharge?: number | null;
    productionTime?: number[] | null;
  };
  tierPrices?: {
    [quantity: number]: number; // quantity: price mapping (object, not array)
  };
  methodId?: number | null;
  status?: string | null;
}

export interface DeletePriceTableRequest {
  tableId: string; // Changed from priceTableId to match old project
}

export interface DecorationMethod {
  id: number;
  name: string;
  description?: string;
  setupCharge: number;
  productionTime: number;
}

export interface CartonCalculation {
  productId: number;
  cartonLength: number;
  cartonWidth: number;
  cartonHeight: number;
  cartonWeight: number;
  unitsPerCarton: number;
}

// ============================================
// IMAGE TYPES
// ============================================

export interface ProductPicture {
  id: number;
  productId: number;
  assetId: string;           // Changed from number to string to match old DTO
  pictureIndex: number;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  colorIds?: number[];
  variantIds?: number[];
}

export interface UploadImageRequest {
  file: File;
  onProgress?: (progress: number) => void;
}

export interface UploadImageResponse {
  assetId: string;           // Changed from number to string to match old DTO
  url: string;
}

export interface AddPictureByAssetRequest {
  productId: number;
  assetId: string;           // Changed from number to string to match old DTO
  // isPrimary removed - set via SetProductDetail.primaryPicture instead
}

export interface RemovePicturesRequest {
  pictureIds: number[];
}

export interface ReorderPicturesRequest {
  productId: number;
  pictureIds: number[]; // Ordered array
}

export interface ColorPictureAssociation {
  pictureId: number;
  colorId: number;
}

export interface VariantPictureAssociation {
  pictureId: number;
  variantId: number;
}

export interface AddColorPictureAssociationRequest {
  pictureId: number;
  colorId: number;
}

export interface AddVariantPictureAssociationRequest {
  pictureId: number;
  variantId: number;
}

export interface RemoveColorPictureAssociationRequest {
  pictureId: number;
  colorId: number;
}

export interface RemoveVariantPictureAssociationRequest {
  pictureId: number;
  variantId: number;
}

// ============================================
// COLOR TYPES
// ============================================

export interface ColorOption {
  id: number;
  productId: number;
  name: string;
  hexCode: string;
  position: number;
}

export interface CreateColorOptionRequest {
  productId: number;
  name: string;
  // hexCode removed - only exists in UPDATE, not CREATE
}

export interface UpdateColorOptionRequest {
  colorOptionId: string;     // Changed from colorId: number to match old DTO
  name?: string | null;
  hex?: string[] | null;     // Changed from hexCode: string to match old DTO (array of hex codes)
}

export interface DeleteColorOptionsRequest {
  colorIds: number[];
}

export interface ReorderColorOptionsRequest {
  productId: number;
  colorIds: number[]; // Ordered array
}

// ============================================
// FEATURE TYPES
// ============================================

export interface FeatureType {
  id: number;
  name: string;
  displayName: string;
  description?: string;
}

export interface ProductFeature {
  id: number;
  productId: number;
  featureTypeId: number;
  featureTypeName: string;
  value: string;
}

export interface CreateFeatureTypeRequest {
  name: string;
  displayName: string;
  description?: string;
}

export interface AddProductFeatureRequest {
  productId: number;
  featureId: number;         // Changed from featureTypeId to match old DTO
  // value removed - doesn't exist in simple add operation
}

export interface AddProductFeaturesRequest {
  productId: number;
  features: Array<{
    featureTypeId: number;
    value: string;
  }>;
}

export interface RemoveProductFeatureRequest {
  featureId: number;
}

export interface RemoveProductFeaturesRequest {
  featureIds: number[];
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface AddProductCategorizationRequest {
  productId: number;
  categoryId: number;
}

export interface RemoveProductCategorizationRequest {
  productId: number;
  categoryId: number;
}

export interface AddCategoryBulkRequest {
  productIds: number[];
  categoryId: number;
}

export interface RemoveCategoryBulkRequest {
  productIds: number[];
  categoryId: number;
}

// ============================================
// SEARCH & REINDEX TYPES
// ============================================

export interface ReindexProductRequest {
  productId: number;
}

export interface ReindexProductResponse {
  success: boolean;
  message?: string;
}

export interface AddSearchBatchRequest {
  productIds: number[];
}

export interface AddSearchBatchResponse extends BatchOperationResponse {}

export interface UpdateSearchBatchRequest {
  batchId: string;
}

export interface UpdateSearchBatchResponse extends BatchOperationResponse {}

export interface ReindexInvalidProductsRequest {
  limit?: number;
}

export interface RemoveSearchOrphansRequest {
  dryRun?: boolean;
}

// ============================================
// MERCHANT CENTER TYPES
// ============================================

export interface AddMCBatchRequest {
  productIds: number[];
}

export interface AddMCBatchResponse extends BatchOperationResponse {}

export interface UpdateMCBatchRequest {
  batchId: string;
}

export interface UpdateMCBatchResponse extends BatchOperationResponse {}

export interface SetMerchantCenterEnabledRequest {
  productId: number;
  enabled: boolean;
}

export interface PullMCOffersRequest {
  force?: boolean;
}

export interface RemoveMCOrphansRequest {
  dryRun?: boolean;
}

// ============================================
// DOCUMENT & CAROUSEL TYPES
// ============================================

export interface ProductDocument {
  id: number;
  productId: number;
  title: string;
  content: string;
  type: string;
}

export interface CarouselItem {
  id: number;
  productId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  position: number;
}

export interface AddProductCarouselRequest {
  productId: number;
  title: string;
  description?: string;
}

export interface SetCarouselProductsRequest {
  carouselId: number;
  productIds: number[];
}

export interface SetProductCarouselItemDetailRequest {
  itemId: number;
  title?: string;
  description?: string;
  imageUrl?: string;
  position?: number;
}

// ============================================
// BULK OPERATION TYPES
// ============================================

export interface BulkDeleteRequest {
  productIds: number[];
}

export interface BulkUpdateRequest {
  productIds: number[];
  updates: Partial<UpdateProductRequest>;
}

export interface BulkVisibilityRequest {
  productIds: number[];
  visibility: 'Enabled' | 'Disabled';
}

// ============================================
// LIST & SEARCH TYPES
// ============================================

export interface GetProductsListRequest extends PaginationParams {
  search?: string;
  visibility?: 'Enabled' | 'Disabled';
  exclusive?: boolean;
  supplierId?: number;
  categoryId?: number;
  brandId?: number;
}

export interface GetProductsListResponse {
  products: any[]; // Use existing Product type
  count: number;
}

export interface GetSupplierProductsListRequest extends PaginationParams {
  supplierId: number;
}

export interface GetProductsBySlugRequest {
  slugs: string[];
}

export interface ImportProductByUrlRequest {
  url: string;
  supplierId?: number;
}

export interface ImportProductByUrlResponse {
  productId: number;
  success: boolean;
}
