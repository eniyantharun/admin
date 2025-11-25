'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AsyncForm } from '@/components/ui/AsyncForm';
import { TierPricesTable } from './TierPricesTable';
import { SearchableMethodInput } from './SearchableMethodInput';
import { parseProductionTime, toProductionTimeString, toProductionTimeArray } from '@/utils/productUtils';
import { useApi } from '@/hooks/useApi';

interface DecorationMethod {
  id: number;
  name: string;
}

interface MethodFormValue {
  priceIncludes: string;
  areaAndLocation: string;
  setupCharge: number;
  productionTime: string;
  hasFreeSetup: boolean;
}

interface TierPrice {
  quantity: number;
  originalPrice: number;
  regularPrice: number;
  discountPrice: number;
  msrpDiscount: number;
  isSamplePricing: boolean;
  setupCharge: number;
  isFreeSetup: boolean;
}

interface TierPricesData {
  quantities: number[];
  originalPrices: number[];
  tierPrices: TierPrice[];
  eqpEnabled: boolean;
  supplierDiscount: number;
}

interface PriceTable {
  id: string;
  variantId: number;
  method: DecorationMethod;
  general: {
    priceIncludes?: string;
    areaAndLocation?: string;
    setupCharge?: number;
    productionTime?: number[];
  };
  tierPrices: TierPricesData;
  status: string;
}

interface DecorationMethodFormProps {
  table: PriceTable;
  productId: number;
  isPrimary: boolean;
  onPrimaryChange: () => void;
  onMethodChange: (method: DecorationMethod) => void;
}

export function DecorationMethodForm({
  table,
  productId,
  isPrimary,
  onPrimaryChange,
  onMethodChange,
}: DecorationMethodFormProps) {
  const { post } = useApi();
  const [method, setMethod] = useState<DecorationMethod>(table.method);
  const [status, setStatus] = useState(table.status);
  const [priceIncludesSuggestions, setPriceIncludesSuggestions] = useState<string[]>([]);

  const form = useForm<MethodFormValue>({
    defaultValues: {
      priceIncludes: table.general.priceIncludes || '',
      areaAndLocation: table.general.areaAndLocation || '',
      setupCharge: table.general.setupCharge || 0,
      productionTime: toProductionTimeString(table.general.productionTime),
      hasFreeSetup: table.general.setupCharge === 0,
    },
  });

  const hasFreeSetup = form.watch('hasFreeSetup');

  // Disable setup charge when free setup is checked
  useEffect(() => {
    if (hasFreeSetup) {
      form.setValue('setupCharge', 0);
    }
  }, [hasFreeSetup, form]);

  const handleMethodChange = async (newMethod: DecorationMethod) => {
    setMethod(newMethod);
    await post('/Admin/ProductEditor/SetPriceTableDetail', {
      tableId: table.id,
      methodId: newMethod.id,
    });
    onMethodChange(newMethod);
  };

  const handleGeneralSubmit = async (data: MethodFormValue) => {
    await post('/Admin/ProductEditor/SetPriceTableDetail', {
      tableId: table.id,
      general: {
        priceIncludes: data.priceIncludes,
        areaAndLocation: data.areaAndLocation,
        setupCharge: data.setupCharge,
        productionTime: toProductionTimeArray(data.productionTime),
      },
    });
  };

  const handlePrimaryChange = async () => {
    await post('/Admin/ProductEditor/SetProductDetail', {
      id: productId,
      primaryPriceTableId: table.id,
    });
    onPrimaryChange();
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await post('/Admin/ProductEditor/SetPriceTableDetail', {
      tableId: table.id,
      status: newStatus,
    });
  };

  const productionTimeParsed = parseProductionTime(form.watch('productionTime'));

  return (
    <div className="p-6 bg-gray-100 border border-solid border-gray-300">
      <AsyncForm form={form} onSubmit={handleGeneralSubmit}>
        {/* Method Details */}
        <div className="grid grid-cols-3 gap-4">
          <SearchableMethodInput
            value={method}
            onChange={handleMethodChange}
            label="Imprint Method"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Includes
            </label>
            <input
              type="text"
              {...form.register('priceIncludes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., One color, one location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area and Location
            </label>
            <input
              type="text"
              {...form.register('areaAndLocation')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='e.g., 3" x 3" - Center'
            />
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-6 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Setup Charge
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                {...form.register('setupCharge', { valueAsNumber: true })}
                disabled={hasFreeSetup}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Production Time
            </label>
            <input
              type="text"
              {...form.register('productionTime')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5-7"
            />
            {productionTimeParsed && (
              <div className="text-xs text-gray-500 mt-1">{productionTimeParsed}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Import Status
            </label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Unchecked">Unchecked</option>
              <option value="Checked">Checked</option>
              <option value="PriceChange">Price Change</option>
              <option value="NewMethod">New Method</option>
              <option value="Discontinued">Discontinued</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={isPrimary}
                onChange={handlePrimaryChange}
                className="mr-2 w-4 h-4"
              />
              <span className="text-sm font-medium">Primary</span>
            </label>
          </div>

          <div className="flex items-end">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...form.register('hasFreeSetup')}
                className="mr-2 w-4 h-4"
              />
              <span className="text-sm">Free Setup</span>
            </label>
          </div>
        </div>
      </AsyncForm>

      {/* Pricing Table (separate form) */}
      <TierPricesTableForm table={table} />
    </div>
  );
}

// Separate component for pricing table with its own form
function TierPricesTableForm({ table }: { table: PriceTable }) {
  const { post } = useApi();

  const form = useForm({
    defaultValues: {
      quantity0: table.tierPrices.quantities[0] || 0,
      quantity1: table.tierPrices.quantities[1] || 0,
      quantity2: table.tierPrices.quantities[2] || 0,
      quantity3: table.tierPrices.quantities[3] || 0,
      quantity4: table.tierPrices.quantities[4] || 0,
      quantity5: table.tierPrices.quantities[5] || 0,
      price0: table.tierPrices.originalPrices[0] || 0,
      price1: table.tierPrices.originalPrices[1] || 0,
      price2: table.tierPrices.originalPrices[2] || 0,
      price3: table.tierPrices.originalPrices[3] || 0,
      price4: table.tierPrices.originalPrices[4] || 0,
      price5: table.tierPrices.originalPrices[5] || 0,
    },
  });

  const handlePricingSubmit = async (data: any) => {
    const tierPricesObject: { [key: number]: number } = {
      [data.quantity0 || 0]: data.price0 || 0,
      [data.quantity1 || 0]: data.price1 || 0,
      [data.quantity2 || 0]: data.price2 || 0,
      [data.quantity3 || 0]: data.price3 || 0,
      [data.quantity4 || 0]: data.price4 || 0,
      [data.quantity5 || 0]: data.price5 || 0,
    };

    await post('/Admin/ProductEditor/SetPriceTableDetail', {
      tableId: table.id,
      tierPrices: tierPricesObject,
    });
  };

  return (
    <AsyncForm form={form} onSubmit={handlePricingSubmit}>
      <TierPricesTable tierPrices={table.tierPrices} />
    </AsyncForm>
  );
}
