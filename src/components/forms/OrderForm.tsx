import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/helpers/FormInput';

interface Order {
  id: number;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  status: 'new' | 'in-production' | 'shipped' | 'delivered' | 'cancelled';
  dateTime: string;
  inHandDate: string | null;
  customerTotal: number;
  supplierTotal: number;
  profit: number;
  paymentMethod: string;
  itemCount?: number;
}

interface OrderFormData {
  customer: string;
  customerEmail: string;
  status: string;
  paymentMethod: string;
  customerTotal: string;
  supplierTotal: string;
  inHandDate: string;
}

interface OrderFormProps {
  order?: Order | null;
  isEditing: boolean;
  onSubmit: (data: OrderFormData) => Promise<void>;
  loading?: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  order,
  isEditing,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    customer: '',
    customerEmail: '',
    status: 'new',
    paymentMethod: 'Credit Card',
    customerTotal: '0',
    supplierTotal: '0',
    inHandDate: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<OrderFormData>>({});

  useEffect(() => {
    if (order) {
      setFormData({
        customer: order.customer,
        customerEmail: order.customerEmail,
        status: order.status,
        paymentMethod: order.paymentMethod,
        customerTotal: order.customerTotal.toString(),
        supplierTotal: order.supplierTotal.toString(),
        inHandDate: order.inHandDate || ''
      });
    } else {
      setFormData({
        customer: '',
        customerEmail: '',
        status: 'new',
        paymentMethod: 'Credit Card',
        customerTotal: '0',
        supplierTotal: '0',
        inHandDate: ''
      });
    }
  }, [order]);

  const validateForm = (): boolean => {
    const errors: Partial<OrderFormData> = {};
    
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
    
    if (formErrors[name as keyof OrderFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const profit = parseFloat(formData.customerTotal) - parseFloat(formData.supplierTotal);

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
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="new">New Order</option>
              <option value="in-production">In Production</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-input-group">
            <label className="form-label block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <FormInput
            label="Supplier Total"
            name="supplierTotal"
            type="number"
            value={formData.supplierTotal}
            onChange={handleInputChange}
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

        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Calculated Profit:</span>
            <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${profit.toFixed(2)}
            </span>
          </div>
        </Card>

        <Button
          type="submit"
          loading={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isEditing ? "Update Order" : "Create Order"}
        </Button>
      </form>

      {isEditing && order && (
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Order Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Order Number:</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Created:</span>
              <span className="font-medium">{order.dateTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Items:</span>
              <span className="font-medium">{order.itemCount || 0} items</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Profit:</span>
              <span className={`font-medium ${order.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${order.profit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};