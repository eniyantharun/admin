import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Calendar, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';

interface Quote {
  id: number;
  quoteNumber: string;
  customer: string;
  customerEmail: string;
  status: 'new-quote' | 'quote-sent-to-customer' | 'quote-converted-to-order';
  dateTime: string;
  inHandDate: string | null;
  customerTotal: number;
}

interface QuoteFormData {
  customer: string;
  customerEmail: string;
  status: string;
  customerTotal: string;
  inHandDate: string;
}

interface QuoteFormProps {
  quote?: Quote | null;
  isEditing: boolean;
  onSubmit: (data: QuoteFormData) => Promise<void>;
  loading?: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'new-quote':
      return FileText;
    case 'quote-sent-to-customer':
      return Send;
    case 'quote-converted-to-order':
      return CheckCircle;
    default:
      return FileText;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new-quote':
      return 'text-blue-600 bg-blue-100';
    case 'quote-sent-to-customer':
      return 'text-orange-600 bg-orange-100';
    case 'quote-converted-to-order':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const QuoteForm: React.FC<QuoteFormProps> = ({
  quote,
  isEditing,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<QuoteFormData>({
    customer: '',
    customerEmail: '',
    status: 'new-quote',
    customerTotal: '0',
    inHandDate: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<QuoteFormData>>({});

  useEffect(() => {
    if (quote) {
      setFormData({
        customer: quote.customer,
        customerEmail: quote.customerEmail,
        status: quote.status,
        customerTotal: quote.customerTotal.toString(),
        inHandDate: quote.inHandDate || ''
      });
    } else {
      setFormData({
        customer: '',
        customerEmail: '',
        status: 'new-quote',
        customerTotal: '0',
        inHandDate: ''
      });
    }
  }, [quote]);

  const validateForm = (): boolean => {
    const errors: Partial<QuoteFormData> = {};
    
    if (!formData.customer.trim()) errors.customer = 'Customer name is required';
    if (!formData.customerEmail.trim()) {
      errors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      errors.customerEmail = 'Email is invalid';
    }
    const customerTotal = parseFloat(formData.customerTotal);
    if (isNaN(customerTotal) || customerTotal <= 0) errors.customerTotal = 'Customer total must be greater than 0';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    if (formErrors[name as keyof QuoteFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const StatusIcon = getStatusIcon(formData.status);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Customer Name"
            name="customer"
            value={formData.customer}
            onChange={handleInputChange}
            error={formErrors.customer}
            required
            placeholder="Enter customer name"
          />

          <FormInput
            label="Customer Email"
            name="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={handleInputChange}
            error={formErrors.customerEmail}
            required
            placeholder="customer@example.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="new-quote">New Quote</option>
                <option value="quote-sent-to-customer">Quote Sent to Customer</option>
                <option value="quote-converted-to-order">Quote Converted to Order</option>
              </select>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(formData.status)}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {formData.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            </div>
          </div>

          <FormInput
            label="Customer Total"
            name="customerTotal"
            type="number"
            value={formData.customerTotal}
            onChange={handleInputChange}
            error={formErrors.customerTotal}
            required
            placeholder="0.00"
          />
        </div>

        <FormInput
          label="In-Hand Date"
          name="inHandDate"
          type="date"
          value={formData.inHandDate}
          onChange={handleInputChange}
          helpText="Expected delivery date (optional)"
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isEditing ? "Update Quote" : "Create Quote"}
        </Button>
      </form>

      {isEditing && quote && (
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Quote Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Quote Number:</span>
              <span className="font-medium">{quote.quoteNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Created:</span>
              <span className="font-medium">{quote.dateTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Total:</span>
              <span className="font-medium text-green-600">${quote.customerTotal.toFixed(2)}</span>
            </div>
            {quote.inHandDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">In-Hand Date:</span>
                <span className="font-medium">{quote.inHandDate}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {isEditing && quote && (
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-purple-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Quote Actions</h4>
          <div className="flex flex-col gap-3">
            {quote.status === 'new-quote' && (
              <Button
                variant="secondary"
                size="sm"
                icon={Send}
                className="justify-start"
              >
                Send Quote to Customer
              </Button>
            )}
            {quote.status === 'quote-sent-to-customer' && (
              <Button
                variant="secondary"
                size="sm"
                icon={CheckCircle}
                className="justify-start"
              >
                Convert to Order
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={FileText}
              className="justify-start"
            >
              Download Quote PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};