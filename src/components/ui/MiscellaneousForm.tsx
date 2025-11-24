'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { AsyncForm } from '@/components/ui/AsyncForm';
import { AsyncFormSavingStatus } from '@/components/ui/AsyncFormSavingStatus';
import { FormInput } from '@/components/helpers/FormInput';
import { ProductCRUDService } from '@/lib/services/product/productCRUD';

interface MiscellaneousFormData {
  capacity: number | null;
  inkColor: string | null;
  penOpeningType: string | null;
}

interface MiscellaneousFormProps {
  productId: number;
  initialData: MiscellaneousFormData;
  className?: string;
}

export const MiscellaneousForm: React.FC<MiscellaneousFormProps> = ({
  productId,
  initialData,
  className = '',
}) => {
  const form = useForm<MiscellaneousFormData>({
    defaultValues: {
      capacity: initialData.capacity,
      inkColor: initialData.inkColor || '',
      penOpeningType: initialData.penOpeningType || '',
    },
  });

  const handleSubmit = async (data: MiscellaneousFormData) => {
    // Send nested structure to SetProductDetail API
    await ProductCRUDService.updateProduct(productId, {
      id: productId,
      miscellaneous: {
        capacity: data.capacity,
        inkColor: data.inkColor || null,
        penOpeningType: data.penOpeningType || null,
      },
    });
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-gray-600" />
        Miscellaneous
      </h3>

      <AsyncForm
        form={form}
        onSubmit={handleSubmit}
        className="space-y-4"
        debounceMs={700}
      >
        <FormInput
          label="Capacity"
          name="capacity"
          type="number"
          value={form.watch('capacity') ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            form.setValue('capacity', value === '' ? null : Number(value), { shouldDirty: true });
          }}
        />

        <FormInput
          label="Ink Color"
          name="inkColor"
          value={form.watch('inkColor') ?? ''}
          onChange={(e) => form.setValue('inkColor', e.target.value || null, { shouldDirty: true })}
        />

        <FormInput
          label="Pen Opening Type"
          name="penOpeningType"
          value={form.watch('penOpeningType') ?? ''}
          onChange={(e) => form.setValue('penOpeningType', e.target.value || null, { shouldDirty: true })}
        />

        <AsyncFormSavingStatus className="text-end mt-1" />
      </AsyncForm>
    </div>
  );
};
