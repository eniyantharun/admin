/**
 * Product Helper Utilities
 * Helper functions for product data manipulation
 */

/**
 * Calculate price range from variants
 */
export function calculatePriceRange(variants: any[]): { min: number; max: number } | null {
  if (!variants || variants.length === 0) {
    return null;
  }

  const prices = variants
    .flatMap((v) => v.priceTables || [])
    .map((pt) => pt.price)
    .filter((p) => typeof p === 'number' && p > 0);

  if (prices.length === 0) {
    return null;
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Format variant name with SKU
 */
export function formatVariantName(variant: any): string {
  if (variant.sku) {
    return `${variant.name} (${variant.sku})`;
  }
  return variant.name;
}

/**
 * Format price as currency
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Format price range
 */
export function formatPriceRange(min: number, max: number, currency: string = 'USD'): string {
  const formattedMin = formatPrice(min, currency);
  if (min === max) {
    return formattedMin;
  }
  return `${formattedMin} - ${formatPrice(max, currency)}`;
}

/**
 * Generate product slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get product image URL
 */
export function getProductImageUrl(productId: number, pictureIndex: number): string {
  return `https://static2.promotionalproductinc.com/p2/src/${productId}/${pictureIndex}.webp`;
}

/**
 * Get product thumbnail URL
 */
export function getProductThumbnailUrl(productId: number, thumbIndex: number): string {
  return `https://static2.promotionalproductinc.com/p2/src/${productId}/${thumbIndex}.webp`;
}

/**
 * Check if product has multiple variants
 */
export function hasMultipleVariants(product: any): boolean {
  return product.variants && product.variants.length > 1;
}

/**
 * Check if product is exclusive
 */
export function isExclusiveProduct(product: any): boolean {
  return product.exclusive === true;
}

/**
 * Check if product is enabled
 */
export function isProductEnabled(product: any): boolean {
  return product.visibility === 'Enabled';
}

/**
 * Get variant by ID
 */
export function getVariantById(product: any, variantId: number): any | null {
  if (!product.variants) {
    return null;
  }
  return product.variants.find((v: any) => v.id === variantId) || null;
}

/**
 * Get primary variant
 */
export function getPrimaryVariant(product: any): any | null {
  if (!product.variants || product.variants.length === 0) {
    return null;
  }
  return product.variants.find((v: any) => v.isPrimary) || product.variants[0];
}

/**
 * Sort variants by position
 */
export function sortVariantsByPosition(variants: any[]): any[] {
  return [...variants].sort((a, b) => (a.position || 0) - (b.position || 0));
}

/**
 * Sort price tables by min quantity
 */
export function sortPriceTablesByQuantity(priceTables: any[]): any[] {
  return [...priceTables].sort((a, b) => a.minQuantity - b.minQuantity);
}

/**
 * Get price for quantity
 */
export function getPriceForQuantity(priceTables: any[], quantity: number): number | null {
  if (!priceTables || priceTables.length === 0) {
    return null;
  }

  const sorted = sortPriceTablesByQuantity(priceTables);

  for (let i = sorted.length - 1; i >= 0; i--) {
    const pt = sorted[i];
    if (quantity >= pt.minQuantity) {
      if (!pt.maxQuantity || quantity <= pt.maxQuantity) {
        return pt.price;
      }
    }
  }

  return sorted[0]?.price || null;
}

/**
 * Calculate total production time range
 */
export function calculateProductionTimeRange(variants: any[]): { min: number; max: number } | null {
  if (!variants || variants.length === 0) {
    return null;
  }

  const times = variants
    .flatMap((v) => v.decorationMethods || [])
    .map((dm) => dm.productionTime)
    .filter((t) => typeof t === 'number' && t > 0);

  if (times.length === 0) {
    return null;
  }

  return {
    min: Math.min(...times),
    max: Math.max(...times),
  };
}

/**
 * Format production time range
 */
export function formatProductionTimeRange(min: number, max: number): string {
  if (min === max) {
    return `${min} day${min !== 1 ? 's' : ''}`;
  }
  return `${min}-${max} days`;
}

/**
 * Check if product has images
 */
export function hasProductImages(product: any): boolean {
  return product.pictures && product.pictures.length > 0;
}

/**
 * Get product's primary image
 */
export function getPrimaryImage(product: any): any | null {
  if (!product.pictures || product.pictures.length === 0) {
    return null;
  }
  return product.pictures.find((p: any) => p.isPrimary) || product.pictures[0];
}

/**
 * Get product category names
 */
export function getCategoryNames(product: any): string[] {
  if (!product.categories || product.categories.length === 0) {
    return [];
  }
  return product.categories.map((c: any) => c.name);
}

/**
 * Format category list
 */
export function formatCategoryList(categories: string[], maxDisplay: number = 2): string {
  if (categories.length === 0) {
    return 'No category';
  }
  if (categories.length <= maxDisplay) {
    return categories.join(', ');
  }
  const displayed = categories.slice(0, maxDisplay);
  const remaining = categories.length - maxDisplay;
  return `${displayed.join(', ')} +${remaining} more`;
}

/**
 * Check if product matches search term
 */
export function matchesSearch(product: any, searchTerm: string): boolean {
  if (!searchTerm) {
    return true;
  }

  const term = searchTerm.toLowerCase();
  const name = product.name?.toLowerCase() || '';
  const sku = product.sku?.toLowerCase() || '';
  const description = product.description?.toLowerCase() || '';

  return name.includes(term) || sku.includes(term) || description.includes(term);
}

/**
 * Validate product data completeness
 */
export function isProductComplete(product: any): boolean {
  return !!(
    product.name &&
    product.description &&
    product.variants &&
    product.variants.length > 0 &&
    product.pictures &&
    product.pictures.length > 0
  );
}

/**
 * Get completion percentage
 */
export function getProductCompletionPercentage(product: any): number {
  let completed = 0;
  let total = 8;

  if (product.name) completed++;
  if (product.description) completed++;
  if (product.shortDescription) completed++;
  if (product.variants && product.variants.length > 0) completed++;
  if (product.pictures && product.pictures.length > 0) completed++;
  if (product.categories && product.categories.length > 0) completed++;
  if (product.features && product.features.length > 0) completed++;
  if (product.colors && product.colors.length > 0) completed++;

  return Math.round((completed / total) * 100);
}
