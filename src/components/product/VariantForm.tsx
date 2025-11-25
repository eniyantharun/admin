'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AsyncForm } from '@/components/ui/AsyncForm';
import { ExternalLink } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

interface VariantFormValue {
  name: string;
  supplierUrl: string;
  supplierItemNumber: string;
}

interface VariantFormProps {
  variantId: number;
  initialData: {
    name: string;
    supplierUrl: string;
    supplierItemNumber: string;
  };
  allVariantSkus: string[];
  onSave: (data: VariantFormValue) => void;
}

export function VariantForm({
  variantId,
  initialData,
  allVariantSkus,
  onSave,
}: VariantFormProps) {
  const { post } = useApi();
  const [showSkuSuggestions, setShowSkuSuggestions] = useState(false);
  const [filteredSkus, setFilteredSkus] = useState<string[]>([]);

  const form = useForm<VariantFormValue>({
    defaultValues: initialData,
  });

  const currentSku = form.watch('supplierItemNumber');
  const supplierUrl = form.watch('supplierUrl');

  // Filter SKU suggestions based on input
  useEffect(() => {
    if (currentSku) {
      const filtered = allVariantSkus.filter(
        (sku) =>
          sku &&
          sku.toLowerCase().includes(currentSku.toLowerCase()) &&
          sku !== currentSku
      );
      setFilteredSkus(filtered.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setFilteredSkus([]);
    }
  }, [currentSku, allVariantSkus]);

  const handleSubmit = async (data: VariantFormValue) => {
    await post('/Admin/ProductEditor/SetProductVariantDetails', {
      variantId,
      name: data.name,
      supplierUrl: data.supplierUrl,
      supplierItemNumber: data.supplierItemNumber,
    });
    onSave(data);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AsyncForm form={form} onSubmit={handleSubmit} className="p-6 bg-white border border-gray-300 border-t-0">
      <div className="grid grid-cols-6 gap-4">
        {/* Variant Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variant Name
          </label>
          <input
            type="text"
            {...form.register('name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter variant name"
          />
        </div>

        {/* Supplier URL */}
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier URL
          </label>
          <input
            type="url"
            {...form.register('supplierUrl')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
          />
          {supplierUrl && isValidUrl(supplierUrl) && (
            <a
              href={supplierUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open supplier page</span>
            </a>
          )}
        </div>

        {/* SKU with Autocomplete */}
        <div className="col-span-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input
            type="text"
            {...form.register('supplierItemNumber')}
            onFocus={() => setShowSkuSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSkuSuggestions(false), 200)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SKU"
          />
          {showSkuSuggestions && filteredSkus.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
              {filteredSkus.map((sku, index) => (
                <div
                  key={index}
                  onClick={() => {
                    form.setValue('supplierItemNumber', sku);
                    setShowSkuSuggestions(false);
                  }}
                  className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  {sku}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AsyncForm>
  );
}
