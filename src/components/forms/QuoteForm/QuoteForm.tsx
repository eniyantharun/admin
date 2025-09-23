import React from 'react';
import { SaleForm, SaleFormProps } from '../SaleForm/SaleForm';
import { iQuoteFormProps } from '@/types/quotes';

export const QuoteForm: React.FC<iQuoteFormProps> = ({
  quote,
  isEditing,
  onSubmit,
  loading = false
}) => {
  return (
    <SaleForm
      type="quote"
      sale={quote}
      isEditing={isEditing}
      onSubmit={onSubmit}
      loading={loading}
    />
  );
};