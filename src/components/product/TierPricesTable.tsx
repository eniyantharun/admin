'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CurrencyPipe } from '@/utils/productUtils';
import { AsyncFormSavingStatus } from '@/components/ui/AsyncForm';

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

interface TierPricesTableProps {
  tierPrices: TierPricesData;
}

const TIER_INDICES = [0, 1, 2, 3, 4, 5];

export function TierPricesTable({ tierPrices }: TierPricesTableProps) {
  const { register } = useFormContext();

  return (
    <div className="mt-6">
      <table className="w-full border-collapse">
        <tbody>
          {/* Quantity Row */}
          <tr>
            <th className="border border-neutral-500 text-center bg-gray-50 px-4 py-2 font-semibold">
              Quantity
            </th>
            {TIER_INDICES.map((i) => (
              <td key={`qty-${i}`} className="border border-neutral-500 p-0">
                <input
                  type="number"
                  {...register(`quantity${i}`, {
                    valueAsNumber: true,
                    min: 0,
                    max: 10000,
                  })}
                  className="w-full py-1 px-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </td>
            ))}
          </tr>

          {/* Base Price Row */}
          <tr>
            <th className="border border-neutral-500 text-center bg-gray-50 px-4 py-2 font-semibold">
              Base Price
            </th>
            {TIER_INDICES.map((i) => (
              <td key={`price-${i}`} className="border border-neutral-500 p-0">
                <input
                  type="number"
                  step="any"
                  {...register(`price${i}`, {
                    valueAsNumber: true,
                  })}
                  className="w-full py-1 px-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </td>
            ))}
          </tr>

          {/* Status Row */}
          <tr>
            <td colSpan={7} className="border border-neutral-500 px-4 py-2 text-sm text-gray-600">
              <AsyncFormSavingStatus />
              <span>Tier prices will be automatically sorted by quantity.</span>
            </td>
          </tr>

          {/* Regular Price Row (Read-only) */}
          <tr>
            <th className="border border-neutral-500 text-center bg-gray-50 px-4 py-2 font-semibold">
              Regular Price
            </th>
            {TIER_INDICES.map((i) => {
              const tier = tierPrices.tierPrices[i];
              return (
                <td
                  key={`reg-${i}`}
                  className="border border-neutral-500 px-4 py-2 text-right"
                >
                  <CurrencyPipe value={tier?.regularPrice} />
                </td>
              );
            })}
          </tr>

          {/* Discounted Price Row (Read-only) */}
          <tr>
            <th className="border border-neutral-500 text-center bg-gray-50 px-4 py-2 font-semibold">
              Discounted Price
              <br />
              <span className="text-xs font-normal">(Displayed in the frontend)</span>
            </th>
            {TIER_INDICES.map((i) => {
              const tier = tierPrices.tierPrices[i];
              return (
                <td
                  key={`disc-${i}`}
                  className="border border-neutral-500 px-4 py-2 text-right"
                >
                  <CurrencyPipe value={tier?.discountPrice} />
                </td>
              );
            })}
          </tr>

          {/* Additional Info Row */}
          {(tierPrices.eqpEnabled || tierPrices.supplierDiscount > 0) && (
            <tr>
              <td colSpan={7} className="border border-neutral-500 px-4 py-2 text-sm text-gray-600">
                {tierPrices.eqpEnabled && (
                  <span className="mr-4">
                    <span className="font-semibold">EQP Enabled</span>
                  </span>
                )}
                {tierPrices.supplierDiscount > 0 && (
                  <span>
                    <span className="font-semibold">Supplier Discount Applied:</span>{' '}
                    {tierPrices.supplierDiscount}%
                  </span>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
