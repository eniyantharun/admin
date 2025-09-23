import React from 'react';
import { SaleForm } from './SaleForm/SaleForm';
import { iOrderFormProps } from '@/types/order';

export const OrderForm: React.FC<iOrderFormProps> = ({
  order,
  isEditing,
  onSubmit,
  loading = false
}) => {
  return (
    <SaleForm
      type="order"
      sale={order}
      isEditing={isEditing}
      onSubmit={onSubmit}
      loading={loading}
    />
  );
};