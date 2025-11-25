'use client';

import React, { useState, useEffect } from 'react';
import { VariantForm } from './VariantForm';
import { MethodsSection } from './MethodsSection';
import { useApi } from '@/hooks/useApi';

interface VariantGeneral {
  name: string;
  supplierUrl: string;
  supplierItemNumber: string;
}

interface PriceTable {
  id: string;
  variantId: number;
  method: {
    id: number;
    name: string;
  };
  general: any;
  tierPrices: any;
  status: string;
}

interface VariantDetails {
  id: number;
  name: string;
  general: VariantGeneral;
  tables: PriceTable[];
}

interface VariantTabProps {
  variantId: number;
  productId: number;
  primaryPriceTableId: string | null;
  allVariantSkus: string[];
  onVariantChange: (variantId: number, data: Partial<VariantGeneral>) => void;
  onPrimaryChange: (tableId: string) => void;
}

export function VariantTab({
  variantId,
  productId,
  primaryPriceTableId,
  allVariantSkus,
  onVariantChange,
  onPrimaryChange,
}: VariantTabProps) {
  const { get } = useApi();
  const [variant, setVariant] = useState<VariantDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Load variant details
  useEffect(() => {
    const loadVariant = async () => {
      setLoading(true);
      try {
        const response = await get<{ variant: VariantDetails }>(
          `/Admin/ProductEditor/GetProductVariantDetails?variantId=${variantId}`
        );
        if (response) {
          setVariant(response.variant);
        }
      } catch (error) {
        console.error('Failed to load variant details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVariant();
  }, [variantId, get]);

  const handleVariantSave = (data: any) => {
    onVariantChange(variantId, data);
    if (variant) {
      setVariant({
        ...variant,
        general: data,
      });
    }
  };

  const handleTablesChange = (tables: PriceTable[]) => {
    if (variant) {
      setVariant({
        ...variant,
        tables,
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="animate-spin inline-block w-6 h-6 border-4 border-current border-t-transparent rounded-full" />
        <div className="mt-2">Loading variant details...</div>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load variant details. Please try again.
      </div>
    );
  }

  return (
    <div>
      {/* Variant Form */}
      <VariantForm
        variantId={variantId}
        initialData={variant.general}
        allVariantSkus={allVariantSkus}
        onSave={handleVariantSave}
      />

      {/* Methods Section */}
      <MethodsSection
        tables={variant.tables}
        productId={productId}
        variantId={variantId}
        primaryPriceTableId={primaryPriceTableId}
        onTablesChange={handleTablesChange}
        onPrimaryChange={onPrimaryChange}
      />
    </div>
  );
}
