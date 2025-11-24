'use client';

import React, { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { AsyncForm } from '@/components/ui/AsyncForm';
import { AsyncFormSavingStatus } from '@/components/ui/AsyncFormSavingStatus';
import { FormInput } from '@/components/helpers/FormInput';
import { ProductCRUDService } from '@/lib/services/product/productCRUD';
import { api } from '@/lib/api';

interface ShippingFormData {
  unitWeight: number | null;
  unitsPerCarton: number | null;
  weightPerCarton: number | null;
  cartonLength: number | null;
  cartonWidth: number | null;
  cartonHeight: number | null;
  piecesPerUnit: number | null;
  packaging: string;
}

interface ShippingFormProps {
  productId: number;
  initialData: ShippingFormData & { hasFreeShipping: boolean };
}

interface CartonCalculations {
  unitWeight?: number;
  unitsPerCarton?: number;
  weightPerCarton?: number;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({
  productId,
  initialData,
}) => {
  const form = useForm<ShippingFormData>({
    defaultValues: {
      unitWeight: initialData.unitWeight,
      unitsPerCarton: initialData.unitsPerCarton,
      weightPerCarton: initialData.weightPerCarton,
      cartonLength: initialData.cartonLength,
      cartonWidth: initialData.cartonWidth,
      cartonHeight: initialData.cartonHeight,
      piecesPerUnit: initialData.piecesPerUnit,
      packaging: initialData.packaging || '',
    },
  });

  const [calculations, setCalculations] = useState<CartonCalculations>({});
  const [hasFreeShipping, setHasFreeShipping] = useState(initialData.hasFreeShipping);
  const [savingFreeShipping, setSavingFreeShipping] = useState(false);

  const formValues = form.watch();

  // Fetch carton calculations when relevant fields change
  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        const response = await api.get('/Admin/ProductEditor/GetCartonCalculations', {
          params: {
            unitWeight: formValues.unitWeight || undefined,
            weightPerCarton: formValues.weightPerCarton || undefined,
            unitsPerCarton: formValues.unitsPerCarton || undefined,
          },
        });
        setCalculations(response);
      } catch (error) {
        console.error('Failed to fetch carton calculations:', error);
      }
    };

    // Only fetch if we have at least one value
    if (formValues.unitWeight || formValues.weightPerCarton || formValues.unitsPerCarton) {
      fetchCalculations();
    }
  }, [formValues.unitWeight, formValues.weightPerCarton, formValues.unitsPerCarton]);

  const handleSubmit = async (data: ShippingFormData) => {
    // Convert string numbers to actual numbers and send nested structure
    await ProductCRUDService.updateProduct(productId, {
      id: productId,
      shipping: {
        unitWeight: data.unitWeight ? +data.unitWeight : null,
        unitsPerCarton: data.unitsPerCarton ? +data.unitsPerCarton : null,
        weightPerCarton: data.weightPerCarton ? +data.weightPerCarton : null,
        cartonLength: data.cartonLength ? +data.cartonLength : null,
        cartonWidth: data.cartonWidth ? +data.cartonWidth : null,
        cartonHeight: data.cartonHeight ? +data.cartonHeight : null,
        piecesPerUnit: data.piecesPerUnit ? +data.piecesPerUnit : null,
        packaging: data.packaging || null,
      },
    });
  };

  const handleFreeShippingChange = async (checked: boolean) => {
    try {
      setSavingFreeShipping(true);
      setHasFreeShipping(checked);

      // Separate API call for hasFreeShipping flag
      await ProductCRUDService.updateProduct(productId, {
        id: productId,
        hasFreeShipping: checked,
      });
    } catch (error) {
      console.error('Failed to update free shipping:', error);
      // Revert on error
      setHasFreeShipping(!checked);
    } finally {
      setSavingFreeShipping(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5 text-green-600" />
        Shipping Information
      </h3>

      <AsyncForm
        form={form}
        onSubmit={handleSubmit}
        className="grid grid-cols-5 gap-4"
        debounceMs={700}
      >
        {/* Weight & Carton Info */}
        <div>
          <FormInput
            label="Unit Weight (lbs)"
            name="unitWeight"
            type="number"
            step="0.01"
            {...form.register('unitWeight', { valueAsNumber: true })}
            placeholder={calculations.unitWeight?.toString() || '...'}
          />
          {calculations.unitWeight && !formValues.unitWeight && (
            <p className="text-xs text-gray-500 italic mt-1">Calculated value</p>
          )}
        </div>

        <div>
          <FormInput
            label="Units Per Carton"
            name="unitsPerCarton"
            type="number"
            {...form.register('unitsPerCarton', { valueAsNumber: true })}
            placeholder={calculations.unitsPerCarton?.toString() || '...'}
          />
          {calculations.unitsPerCarton && !formValues.unitsPerCarton && (
            <p className="text-xs text-gray-500 italic mt-1">Calculated value</p>
          )}
        </div>

        <div>
          <FormInput
            label="Weight Per Carton (lbs)"
            name="weightPerCarton"
            type="number"
            step="0.01"
            {...form.register('weightPerCarton', { valueAsNumber: true })}
            placeholder={calculations.weightPerCarton?.toString() || '...'}
          />
          {calculations.weightPerCarton && !formValues.weightPerCarton && (
            <p className="text-xs text-gray-500 italic mt-1">Calculated value</p>
          )}
        </div>

        {/* Carton Dimensions */}
        <div>
          <FormInput
            label="Carton Length (in.)"
            name="cartonLength"
            type="number"
            step="0.01"
            {...form.register('cartonLength', { valueAsNumber: true })}
          />
        </div>

        <div>
          <FormInput
            label="Carton Width (in.)"
            name="cartonWidth"
            type="number"
            step="0.01"
            {...form.register('cartonWidth', { valueAsNumber: true })}
          />
        </div>

        <div>
          <FormInput
            label="Carton Height (in.)"
            name="cartonHeight"
            type="number"
            step="0.01"
            {...form.register('cartonHeight', { valueAsNumber: true })}
          />
        </div>

        {/* Pieces Per Unit */}
        <div>
          <FormInput
            label="Pieces Per Unit"
            name="piecesPerUnit"
            type="number"
            {...form.register('piecesPerUnit', { valueAsNumber: true })}
          />
        </div>

        {/* Packaging */}
        <div className="col-span-3">
          <FormInput
            label="Packaging"
            name="packaging"
            {...form.register('packaging')}
          />
        </div>

        {/* Free Shipping Checkbox - Outside the AsyncForm submission */}
        <div className="col-span-1 flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasFreeShipping}
              onChange={(e) => handleFreeShippingChange(e.target.checked)}
              disabled={savingFreeShipping}
              data-no-auto-save="true"
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 rounded disabled:opacity-50"
            />
            <span className="text-sm font-medium text-gray-700">
              Free Shipping
              {savingFreeShipping && <span className="ml-1 text-xs text-gray-500">(saving...)</span>}
            </span>
          </label>
        </div>

        {/* Save Status */}
        <div className="col-span-5">
          <AsyncFormSavingStatus className="text-end" />
        </div>
      </AsyncForm>
    </div>
  );
};
