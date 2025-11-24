'use client';

import React, { useState } from 'react';
import { Plus, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface PriceTier {
  quantity: number;
  basePrice: number;
  regularPrice: number;
  discountedPrice: number;
}

export interface ImprintMethod {
  id: string;
  name: string;
  priceIncludes: string;
  areaAndLocation: string;
  setupCharge: string;
  productionTime: number;
  importStatus: 'Checked' | 'Unchecked';
  isPrimary: boolean;
  hasFreeSetup: boolean;
  pricingTiers: PriceTier[];
}

export interface Variant {
  id: string;
  name: string;
  supplierUrls: string[];
  sku: string;
  isPrimary: boolean;
  imprintMethods: ImprintMethod[];
}

interface PricesAndVariantsProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  onVariantSave?: (variantId: string, variantData: any) => void;
  onPricingSave?: (methodId: string, pricingData: any) => void;
}

export const PricesAndVariants: React.FC<PricesAndVariantsProps> = ({
  variants,
  onChange,
  onVariantSave,
  onPricingSave,
}) => {
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [activeMethodIndex, setActiveMethodIndex] = useState(0);

  const activeVariant = variants[activeVariantIndex];
  const activeMethod = activeVariant?.imprintMethods[activeMethodIndex];

  const handleAddVariant = () => {
    const newVariant: Variant = {
      id: `variant-${Date.now()}`,
      name: '',
      supplierUrls: [''],
      sku: '',
      isPrimary: variants.length === 0,
      imprintMethods: [
        {
          id: `method-${Date.now()}`,
          name: 'New Method',
          priceIncludes: '',
          areaAndLocation: '',
          setupCharge: '',
          productionTime: 5,
          importStatus: 'Unchecked',
          isPrimary: true,
          hasFreeSetup: true,
          pricingTiers: [
            { quantity: 250, basePrice: 0, regularPrice: 0, discountedPrice: 0 },
            { quantity: 1000, basePrice: 0, regularPrice: 0, discountedPrice: 0 },
            { quantity: 2500, basePrice: 0, regularPrice: 0, discountedPrice: 0 },
            { quantity: 5000, basePrice: 0, regularPrice: 0, discountedPrice: 0 },
          ],
        },
      ],
    };

    onChange([...variants, newVariant]);
    setActiveVariantIndex(variants.length);
    setActiveMethodIndex(0);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length === 1) return; // Keep at least one variant
    const newVariants = variants.filter((_, i) => i !== index);
    onChange(newVariants);
    if (activeVariantIndex >= newVariants.length) {
      setActiveVariantIndex(Math.max(0, newVariants.length - 1));
    }
  };

  const handleAddMethod = () => {
    const newMethod: ImprintMethod = {
      id: `method-${Date.now()}`,
      name: 'New Method',
      priceIncludes: '',
      areaAndLocation: '',
      setupCharge: '',
      productionTime: 5,
      importStatus: 'Unchecked',
      isPrimary: activeVariant.imprintMethods.length === 0,
      hasFreeSetup: true,
      pricingTiers: [
        { quantity: 250, basePrice: 0, regularPrice: 0, discountedPrice: 0 },
        { quantity: 1000, basePrice: 0, regularPrice: 0, discountedPrice: 0 },
        { quantity: 2500, basePrice: 0, regularPrice: 0, discountedPrice: 0 },
        { quantity: 5000, basePrice: 0, regularPrice: 0, discountedPrice: 0 },
      ],
    };

    const updatedVariants = [...variants];
    updatedVariants[activeVariantIndex].imprintMethods.push(newMethod);
    onChange(updatedVariants);
    setActiveMethodIndex(activeVariant.imprintMethods.length);
  };

  const handleRemoveMethod = (methodIndex: number) => {
    if (activeVariant.imprintMethods.length === 1) return; // Keep at least one method
    const updatedVariants = [...variants];
    updatedVariants[activeVariantIndex].imprintMethods = activeVariant.imprintMethods.filter(
      (_, i) => i !== methodIndex
    );
    onChange(updatedVariants);
    if (activeMethodIndex >= updatedVariants[activeVariantIndex].imprintMethods.length) {
      setActiveMethodIndex(Math.max(0, updatedVariants[activeVariantIndex].imprintMethods.length - 1));
    }
  };

  const updateVariantField = (field: keyof Variant, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[activeVariantIndex] = {
      ...updatedVariants[activeVariantIndex],
      [field]: value,
    };
    onChange(updatedVariants);

    // Trigger save callback if provided
    if (onVariantSave) {
      onVariantSave(updatedVariants[activeVariantIndex].id, updatedVariants[activeVariantIndex]);
    }
  };

  const updateMethodField = (field: keyof ImprintMethod, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[activeVariantIndex].imprintMethods[activeMethodIndex] = {
      ...updatedVariants[activeVariantIndex].imprintMethods[activeMethodIndex],
      [field]: value,
    };
    onChange(updatedVariants);
  };

  const updatePricingTier = (tierIndex: number, field: keyof PriceTier, value: number) => {
    const updatedVariants = [...variants];
    const tiers = [...updatedVariants[activeVariantIndex].imprintMethods[activeMethodIndex].pricingTiers];
    tiers[tierIndex] = { ...tiers[tierIndex], [field]: value };

    // Auto-sort by quantity
    tiers.sort((a, b) => a.quantity - b.quantity);

    updatedVariants[activeVariantIndex].imprintMethods[activeMethodIndex].pricingTiers = tiers;
    onChange(updatedVariants);

    // Trigger save callback if provided (only save basePrice changes)
    if (onPricingSave && field === 'basePrice') {
      onPricingSave(
        updatedVariants[activeVariantIndex].imprintMethods[activeMethodIndex].id,
        updatedVariants[activeVariantIndex].imprintMethods[activeMethodIndex]
      );
    }
  };

  const addSupplierUrl = () => {
    const updatedVariants = [...variants];
    updatedVariants[activeVariantIndex].supplierUrls.push('');
    onChange(updatedVariants);
  };

  const updateSupplierUrl = (urlIndex: number, value: string) => {
    const updatedVariants = [...variants];
    updatedVariants[activeVariantIndex].supplierUrls[urlIndex] = value;
    onChange(updatedVariants);

    // Trigger save callback if provided
    if (onVariantSave) {
      onVariantSave(updatedVariants[activeVariantIndex].id, updatedVariants[activeVariantIndex]);
    }
  };

  const removeSupplierUrl = (urlIndex: number) => {
    if (activeVariant.supplierUrls.length === 1) return;
    const updatedVariants = [...variants];
    updatedVariants[activeVariantIndex].supplierUrls = activeVariant.supplierUrls.filter(
      (_, i) => i !== urlIndex
    );
    onChange(updatedVariants);
  };

  const setVariantAsPrimary = (variantIndex: number) => {
    const updatedVariants = variants.map((v, i) => ({
      ...v,
      isPrimary: i === variantIndex,
    }));
    onChange(updatedVariants);
  };

  // Handle empty states with informative UI
  if (!variants.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">No variants available</p>
        <p className="text-sm mt-2">Add a product variant to manage pricing and imprint methods.</p>
      </div>
    );
  }

  if (!activeVariant) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">Variant not found</p>
        <p className="text-sm mt-2">The selected variant could not be loaded.</p>
      </div>
    );
  }

  if (!activeMethod) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">No imprint methods available</p>
        <p className="text-sm mt-2">Add an imprint method to manage pricing tiers for this variant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Variant Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {variants.map((variant, index) => (
          <div
            key={variant.id}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-t-lg cursor-pointer border border-b-0 ${
              activeVariantIndex === index
                ? 'bg-white border-gray-300 border-b-white -mb-[1px]'
                : 'bg-gray-100 border-transparent hover:bg-gray-200'
            }`}
            onClick={() => setActiveVariantIndex(index)}
          >
            <span className="text-sm text-gray-600">{variant.name || 'No name'}</span>
            {variant.isPrimary && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
            {variants.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveVariant(index);
                }}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleAddVariant}
          className="px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Variant Details */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Variant Name</label>
          <input
            type="text"
            value={activeVariant.name}
            onChange={(e) => updateVariantField('name', e.target.value)}
            placeholder="Variant Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>

        <div className="col-span-6">
          <label className="block text-xs font-medium text-gray-700 mb-1">Supplier URL</label>
          <div className="space-y-2">
            {activeVariant.supplierUrls.map((url, urlIndex) => (
              <div key={urlIndex} className="flex items-center gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateSupplierUrl(urlIndex, e.target.value)}
                  placeholder="https://www.example.com/product"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs whitespace-nowrap"
                  >
                    Visit
                  </a>
                )}
                {activeVariant.supplierUrls.length > 1 && (
                  <button
                    onClick={() => removeSupplierUrl(urlIndex)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addSupplierUrl}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add URL
            </button>
          </div>
        </div>

        <div className="col-span-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
          <input
            type="text"
            value={activeVariant.sku}
            onChange={(e) => updateVariantField('sku', e.target.value)}
            placeholder="AC1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Imprint Method Tabs */}
      <div className="flex items-center gap-2 mt-6">
        {activeVariant.imprintMethods.map((method, index) => (
          <div
            key={method.id}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer border ${
              activeMethodIndex === index
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
            }`}
            onClick={() => setActiveMethodIndex(index)}
          >
            <span className="text-sm">{method.name}</span>
            {method.isPrimary && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
            {activeVariant.imprintMethods.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveMethod(index);
                }}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleAddMethod}
          className="px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Imprint Method Details */}
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Imprint Method</label>
            <input
              type="text"
              value={activeMethod.name}
              onChange={(e) => updateMethodField('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Price Includes</label>
            <input
              type="text"
              value={activeMethod.priceIncludes}
              onChange={(e) => updateMethodField('priceIncludes', e.target.value)}
              placeholder="1 color imprint, 1 side, 1 location"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Area and Location</label>
            <input
              type="text"
              value={activeMethod.areaAndLocation}
              onChange={(e) => updateMethodField('areaAndLocation', e.target.value)}
              placeholder='2"w x 0.50"h'
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Setup Charge</label>
            <input
              type="text"
              value={activeMethod.setupCharge}
              onChange={(e) => updateMethodField('setupCharge', e.target.value)}
              placeholder="$ Setup Charge"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Production Time</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={activeMethod.productionTime}
                onChange={(e) => updateMethodField('productionTime', parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
              />
              <span className="text-xs text-gray-500">day(s)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Import Status</label>
            <select
              value={activeMethod.importStatus}
              onChange={(e) => updateMethodField('importStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
            >
              <option value="Unchecked">Unchecked</option>
              <option value="Checked">Checked</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name={`primary-method-${activeVariantIndex}`}
                checked={activeMethod.isPrimary}
                onChange={(e) => {
                  if (e.target.checked) {
                    const updatedVariants = [...variants];
                    updatedVariants[activeVariantIndex].imprintMethods = updatedVariants[
                      activeVariantIndex
                    ].imprintMethods.map((m, i) => ({
                      ...m,
                      isPrimary: i === activeMethodIndex,
                    }));
                    onChange(updatedVariants);
                  }
                }}
                className="w-4 h-4 text-blue-600"
              />
              <label className="text-xs text-gray-700">Primary</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeMethod.hasFreeSetup}
                onChange={(e) => updateMethodField('hasFreeSetup', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label className="text-xs text-gray-700">Free Setup</label>
            </div>
          </div>
        </div>

        {/* Pricing Table - Horizontal Layout */}
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <tbody>
                {/* Quantity Row */}
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2 font-semibold text-sm text-gray-700 w-40 bg-gray-100">
                    Quantity
                  </td>
                  {activeMethod.pricingTiers.map((tier, tierIndex) => (
                    <td key={tierIndex} className="border border-gray-300 px-4 py-2 text-center bg-white">
                      <input
                        type="number"
                        value={tier.quantity}
                        onChange={(e) =>
                          updatePricingTier(tierIndex, 'quantity', parseInt(e.target.value) || 0)
                        }
                        className="w-full text-center px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded text-sm"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 bg-white"></td>
                  <td className="border border-gray-300 px-4 py-2 bg-white"></td>
                </tr>

                {/* Base Price Row */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold text-sm text-gray-700 bg-gray-100">
                    Base Price
                  </td>
                  {activeMethod.pricingTiers.map((tier, tierIndex) => (
                    <td key={tierIndex} className="border border-gray-300 px-4 py-2 text-center bg-white">
                      <input
                        type="number"
                        step="0.01"
                        value={tier.basePrice}
                        onChange={(e) =>
                          updatePricingTier(tierIndex, 'basePrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-full text-center px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded text-sm"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 bg-white"></td>
                  <td className="border border-gray-300 px-4 py-2 bg-white"></td>
                </tr>

                {/* Regular Price Row */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold text-sm text-gray-700 bg-gray-100">
                    Regular Price
                  </td>
                  {activeMethod.pricingTiers.map((tier, tierIndex) => (
                    <td key={tierIndex} className="border border-gray-300 px-4 py-2 text-center bg-gray-50">
                      <div className="flex items-center justify-center">
                        <span className="text-sm text-gray-700 italic">
                          ${tier.regularPrice.toFixed(2)}
                        </span>
                      </div>
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 bg-white">
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-gray-600">$0.00</span>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 bg-white"></td>
                </tr>

                {/* Discounted Price Row */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-100">
                    <div>
                      <div className="font-semibold text-sm text-gray-700">Discounted Price</div>
                      <div className="text-xs text-gray-500 italic">(Displayed in the frontend)</div>
                    </div>
                  </td>
                  {activeMethod.pricingTiers.map((tier, tierIndex) => (
                    <td key={tierIndex} className="border border-gray-300 px-4 py-2 text-center bg-gray-50 relative">
                      <div className="flex items-center justify-center">
                        <span className="text-sm text-gray-700 italic">
                          ${tier.discountedPrice.toFixed(2)}
                        </span>
                      </div>
                      {activeMethod.pricingTiers.length > 1 && (
                        <button
                          onClick={() => {
                            const updatedVariants = [...variants];
                            updatedVariants[activeVariantIndex].imprintMethods[
                              activeMethodIndex
                            ].pricingTiers = activeMethod.pricingTiers.filter((_, i) => i !== tierIndex);
                            onChange(updatedVariants);
                          }}
                          className="absolute top-1 right-1 text-gray-400 hover:text-red-600"
                          title="Remove this tier"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 bg-white">
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-gray-600">$0.00</span>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 bg-white"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => {
                const updatedVariants = [...variants];
                updatedVariants[activeVariantIndex].imprintMethods[activeMethodIndex].pricingTiers.push({
                  quantity: 0,
                  basePrice: 0,
                  regularPrice: 0,
                  discountedPrice: 0,
                });
                onChange(updatedVariants);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Tier
            </button>
            <p className="text-xs text-gray-500 italic">
              Tier prices will be automatically sorted by quantity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
