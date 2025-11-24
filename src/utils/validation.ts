/**
 * Validation Utilities
 * Zod schemas and validation helpers for product data
 */

import { z } from 'zod';

// ============================================
// PRODUCT SCHEMAS
// ============================================

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  material: z.string().max(255).optional(),
  dimensions: z.string().max(255).optional(),
  weight: z.string().max(100).optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  visibility: z.enum(['Enabled', 'Disabled']).optional(),
  exclusive: z.boolean().optional(),
  merchantCenterEnabled: z.boolean().optional(),
  freeSetup: z.boolean().optional(),
  freeShipping: z.boolean().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  supplierId: z.number().positive().optional(),
  brandId: z.number().positive().optional(),
  visibility: z.enum(['Enabled', 'Disabled']).optional(),
});

// ============================================
// VARIANT SCHEMAS
// ============================================

export const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required').max(255),
  sku: z.string().max(100).optional(),
  supplierProductId: z.string().max(100).optional(),
  enabled: z.boolean().optional(),
});

export const createVariantSchema = z.object({
  productId: z.number().positive('Product ID is required'),
  name: z.string().min(1, 'Variant name is required').max(255),
  sku: z.string().max(100).optional(),
  supplierProductId: z.string().max(100).optional(),
});

// ============================================
// PRICING SCHEMAS
// ============================================

export const priceTableSchema = z.object({
  minQuantity: z.number().positive('Minimum quantity must be positive'),
  maxQuantity: z.number().positive().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  setupCharge: z.number().min(0, 'Setup charge must be non-negative').optional(),
}).refine(
  (data) => !data.maxQuantity || data.maxQuantity > data.minQuantity,
  {
    message: 'Maximum quantity must be greater than minimum quantity',
    path: ['maxQuantity'],
  }
);

export const createPriceTableSchema = z.object({
  variantId: z.number().positive('Variant ID is required'),
  methodId: z.number().positive('Method ID is required'),
  minQuantity: z.number().positive('Minimum quantity must be positive'),
  maxQuantity: z.number().positive().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  setupCharge: z.number().min(0, 'Setup charge must be non-negative').optional(),
});

// ============================================
// COLOR SCHEMAS
// ============================================

export const colorOptionSchema = z.object({
  name: z.string().min(1, 'Color name is required').max(100),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code'),
});

export const createColorOptionSchema = z.object({
  productId: z.number().positive('Product ID is required'),
  name: z.string().min(1, 'Color name is required').max(100),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code'),
});

// ============================================
// FEATURE SCHEMAS
// ============================================

export const featureTypeSchema = z.object({
  name: z.string().min(1, 'Feature type name is required').max(100),
  displayName: z.string().min(1, 'Display name is required').max(100),
  description: z.string().max(500).optional(),
});

export const productFeatureSchema = z.object({
  featureTypeId: z.number().positive('Feature type ID is required'),
  value: z.string().min(1, 'Feature value is required').max(255),
});

export const addProductFeatureSchema = z.object({
  productId: z.number().positive('Product ID is required'),
  featureTypeId: z.number().positive('Feature type ID is required'),
  value: z.string().min(1, 'Feature value is required').max(255),
});

// ============================================
// IMAGE SCHEMAS
// ============================================

export const imageFileSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, 'File is required'),
  maxSize: z.number().optional().default(10 * 1024 * 1024), // 10MB
  allowedTypes: z.array(z.string()).optional().default(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
}).refine(
  (data) => data.file.size <= data.maxSize,
  (data) => ({ message: `File size must be less than ${data.maxSize / (1024 * 1024)}MB` })
).refine(
  (data) => data.allowedTypes.includes(data.file.type),
  (data) => ({ message: `File type must be one of: ${data.allowedTypes.join(', ')}` })
);

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate data against a schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Get validation error messages
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
}

/**
 * Validate and throw on error
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Check if value is a valid URL
 */
export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is a valid hex color
 */
export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

/**
 * Check if file is valid image
 */
export function isValidImageFile(file: File, maxSize: number = 10 * 1024 * 1024): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return file.size <= maxSize && allowedTypes.includes(file.type);
}
