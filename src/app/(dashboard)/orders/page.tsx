'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Eye, Calendar, DollarSign, User, ShoppingCart, CreditCard, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useApi } from '@/hooks/useApi';
import { usePageSearch, useSearch } from '@/contexts/SearchContext';

// Import helper components
import { StatusBadge } from '@/components/helpers/StatusBadge';
import { DateDisplay } from '@/components/helpers/DateDisplay';
import { EmptyState, LoadingState } from '@/components/helpers/EmptyLoadingStates';
import { FormInput } from '@/components/helpers/FormInput';
import { PaginationControls } from '@/components/helpers/PaginationControls';
import { SearchStatusIndicator } from '@/components/helpers/SearchStatusIndicator';

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
  status: string;
  paymentMethod: string;
  customerTotal: string;
  supplierTotal: string;
}

const mockOrders: Order[] = [
  {
    id: 6874,
    orderNumber: 'ORD-6874',
    customer: 'Andreka Driver',
    customerEmail: 'andreka.driver@example.com',
    status: 'new',
    dateTime: '7/20/2025 7:14:21 PM',
    inHandDate: '7/24/2025',
    customerTotal: 1.44,
    supplierTotal: 1.44,
    profit: 0.00,
    paymentMethod: 'Credit Card',
    itemCount: 1
  },
  {
    id: 6873,
    orderNumber: 'ORD-6873',
    customer: 'Bobbie Smith',
    customerEmail: 'bobbie.smith@example.com',
    status: 'new',
    dateTime: '7/20/2025 7:36:38 AM',
    inHandDate: '8/6/2025',
    customerTotal: 72.00,
    supplierTotal: 72.00,
    profit: 0.00,
    paymentMethod: 'Credit Card',
    itemCount: 3
  },
  {
    id: 6872,
    orderNumber: 'ORD-6872',
    customer: 'Cameron Davis',
    customerEmail: 'cameron.davis@example.com',
    status: 'new',
    dateTime: '7/20/2025 6:39:03 AM',
    inHandDate: '8/12/2025',
    customerTotal: 229.00,
    supplierTotal: 229.00,
    profit: 0.00,
    paymentMethod: 'Credit Card',
    itemCount: 5
  },
  {
    id: 6871,
    orderNumber: 'ORD-6871',
    customer: 'Matt Schechter',
    customerEmail: 'matt.schechter@example.com',
    status: 'new',
    dateTime: '7/19/2025 6:03:56 AM',
    inHandDate: '7/31/2025',
    customerTotal: 284.00,
    supplierTotal: 284.00,
    profit: 0.00,
    paymentMethod: 'Credit Card',
    itemCount: 2
  },
  {
    id: 6870,
    orderNumber: 'ORD-6870',
    customer: 'Jennifer Keepes',
    customerEmail: 'jennifer.keepes@example.com',
    status: 'new',
    dateTime: '7/18/2025 1:26:02 PM',
    inHandDate: '8/3/2025',
    customerTotal: 272.50,
    supplierTotal: 272.50,
    profit: 0.00,
    paymentMethod: 'Credit Card',
    itemCount: 4
  },
  {
    id: 6868,
    orderNumber: 'ORD-6868',
    customer: 'Cameron Davis',
    customerEmail: 'cameron.davis@example.com',
    status: 'new',
    dateTime: '7/17/2025 11:25:06 AM',
    inHandDate: '8/31/2025',
    customerTotal: 613.50,
    supplierTotal: 385.50,
    profit: 228.00,
    paymentMethod: 'Credit Card',
    itemCount: 8
  },
  {
    id: 6867,
    orderNumber: 'ORD-6867',
    customer: 'Molly Shumate',
    customerEmail: 'molly.shumate@example.com',
    status: 'shipped',
    dateTime: '7/17/2025 8:59:41 AM',
    inHandDate: '7/31/2025',
    customerTotal: 320.00,
    supplierTotal: 320.00,
    profit: 0.00,
    paymentMethod: 'Credit Card',
    itemCount: 6
  },
  {
    id: 6865,
    orderNumber: 'ORD-6865',
    customer: 'Jessica Mathis',
    customerEmail: 'jessica.mathis@example.com',
    status: 'new',
    dateTime: '7/16/2025 6:49:10 PM',
    inHandDate: '7/15/2025',
    customerTotal: 5.40,
    supplierTotal: 5.40,
    profit: 0.00,
    paymentMethod: 'Credit Card',
    itemCount: 1
  },
  {
    id: 6864,
    orderNumber: 'ORD-6864',
    customer: 'Julia Stephanie',
    customerEmail: 'julia.stephanie@example.com',
    status: 'new',
    dateTime: '7/15/2025 11:32:56 PM',
    inHandDate: '7/16/2025',
    customerTotal: 4.12,
    supplierTotal: 4.12,
    profit: 0.00,
    paymentMethod: 'Credit Card',
    itemCount: 1
  },
  {
    id: 6863,
    orderNumber: 'ORD-6863',
    customer: 'Nick Aslanyan',
    customerEmail: 'nick.aslanyan@example.com',
    status: 'in-production',
    dateTime: '7/15/2025 2:38:56 PM',
    inHandDate: null,
    customerTotal: 429.00,
    supplierTotal: 272.06,
    profit: 156.94,
    paymentMethod: 'Credit Card',
    itemCount: 7
  },
  {
    id: 6862,
    orderNumber: 'ORD-6862',
    customer: 'Nic Hunter',
    customerEmail: 'nic.hunter@example.com',
    status: 'in-production',
    dateTime: '7/15/2025 11:59:33 AM',
    inHandDate: '7/30/2025',
    customerTotal: 556.00,
    supplierTotal: 369.43,
    profit: 186.57,
    paymentMethod: 'Credit Card',
    itemCount: 9
  }
];

const getStatusConfig = (status: Order['status']) => {
  switch (status) {
    case 'new':
      return { enabled: true, label: { enabled: 'New Order', disabled: 'New Order' } };
    case 'in-production':
      return { enabled: true, label: { enabled: 'In Production', disabled: 'In Production' } };
    case 'shipped':
      return { enabled: true, label: { enabled: 'Shipped', disabled: 'Shipped' } };
    case 'delivered':
      return { enabled: true, label: { enabled: 'Delivered', disabled: 'Delivered' } };
    case 'cancelled':
      return { enabled: false, label: { enabled: 'Cancelled', disabled: 'Cancelled' } };
    default:
      return { enabled: true, label: { enabled: 'Unknown', disabled: 'Unknown' } };
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<OrderFormData>({
    customer: '',
    status: 'new',
    paymentMethod: 'Credit Card',
    customerTotal: '0',
    supplierTotal: '0'
  });
  const [formErrors, setFormErrors] = useState<Partial<OrderFormData>>({});

  const { get, post, put, loading } = useApi();
  const submitApi = useApi();
  
  const { searchQuery, setSearchResults } = useSearch();

  const handleGlobalSearch = useCallback(async (query: string) => {
    try {
      const filteredOrders = mockOrders.filter((order: Order) =>
        order.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
        order.customer.toLowerCase().includes(query.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(query.toLowerCase())
      );
      
      const searchResults = filteredOrders.map((order: Order) => ({
        id: order.id.toString(),
        title: order.orderNumber,
        subtitle: `${order.customer} - $${order.customerTotal.toFixed(2)}`,
        description: `${order.status} • ${order.itemCount || 0} items`,
        type: 'order',
        data: order
      }));
      
      setSearchResults(searchResults);
    } catch (error) {
      console.error('Error searching orders:', error);
      setSearchResults([]);
    }
  }, [setSearchResults]);

  usePageSearch({
    placeholder: 'Search orders by number, customer, or email...',
    enabled: true,
    searchFunction: handleGlobalSearch,
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'all', label: 'All Orders' },
          { value: 'new', label: 'New Orders' },
          { value: 'in-production', label: 'In Production' },
          { value: 'shipped', label: 'Shipped' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'cancelled', label: 'Cancelled' }
        ]
      }
    ]
  });

  const effectiveSearchTerm = searchQuery || localSearchTerm;

  const fetchOrders = useCallback(async () => {
    if (!isInitialLoad && loading) return;

    try {
      let filteredOrders = [...mockOrders];
      
      if (effectiveSearchTerm) {
        filteredOrders = filteredOrders.filter((order: Order) =>
          order.orderNumber.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
          order.customer.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(effectiveSearchTerm.toLowerCase())
        );
      }

      if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter((order: Order) => order.status === statusFilter);
      }
      
      const startIndex = (currentPage - 1) * rowsPerPage;
      const paginatedOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage);
      
      setOrders(paginatedOrders);
      setTotalCount(filteredOrders.length);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsInitialLoad(false);
    }
  }, [effectiveSearchTerm, statusFilter, currentPage, rowsPerPage, loading, isInitialLoad]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [effectiveSearchTerm, statusFilter]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  const validateForm = (): boolean => {
    const errors: Partial<OrderFormData> = {};
    
    if (!formData.customer.trim()) errors.customer = 'Customer is required';
    const customerTotal = parseFloat(formData.customerTotal);
    if (isNaN(customerTotal) || customerTotal <= 0) errors.customerTotal = 'Customer total must be greater than 0';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isEditing && selectedOrder) {
        console.log('Updating order:', selectedOrder.id, formData);
      } else {
        console.log('Creating order:', formData);
      }

      await fetchOrders();
      closeModal();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const openNewOrderModal = () => {
    setFormData({
      customer: '',
      status: 'new',
      paymentMethod: 'Credit Card',
      customerTotal: '0',
      supplierTotal: '0'
    });
    setFormErrors({});
    setIsEditing(false);
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const openEditOrderModal = (order: Order) => {
    setFormData({
      customer: order.customer,
      status: order.status,
      paymentMethod: order.paymentMethod,
      customerTotal: order.customerTotal.toString(),
      supplierTotal: order.supplierTotal.toString()
    });
    setFormErrors({});
    setIsEditing(true);
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setIsEditing(false);
    setFormData({
      customer: '',
      status: 'new',
      paymentMethod: 'Credit Card',
      customerTotal: '0',
      supplierTotal: '0'
    });
    setFormErrors({});
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

  return (
    <div className="orders-page space-y-4">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Orders ({totalCount.toLocaleString()})
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {searchQuery && <SearchStatusIndicator query={searchQuery} />}
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Orders</option>
                  <option value="new">New Orders</option>
                  <option value="in-production">In Production</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button
                  onClick={openNewOrderModal}
                  icon={Plus}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  New Order
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In-Hand Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && isInitialLoad ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8">
                    <LoadingState message="Loading orders..." />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8">
                    <EmptyState
                      icon={ShoppingCart}
                      title="No orders found"
                      description="Get started by creating your first order."
                      hasSearch={!!effectiveSearchTerm || statusFilter !== 'all'}
                    />
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {order.id}
                            </div>
                            <StatusBadge 
                              enabled={statusConfig.enabled} 
                              label={statusConfig.label}
                              variant="compact"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{order.customer}</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-5">
                          {order.customerEmail}
                        </div>
                        {order.itemCount && (
                          <div className="text-xs text-blue-600 ml-5">
                            <Package className="w-3 h-3 inline mr-1" />
                            {order.itemCount} items
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{order.dateTime}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.inHandDate || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${order.customerTotal.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          ${order.supplierTotal.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`text-sm font-medium flex items-center gap-1 ${
                          order.profit > 0 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          <DollarSign className="w-4 h-4" />
                          ${order.profit.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          {order.paymentMethod}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Button
                          onClick={() => openEditOrderModal(order)}
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          iconOnly
                          title="View order"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalCount > 0 && !loading && (
        <Card>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </Card>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 pt-20 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[calc(100vh-5rem)] overflow-y-auto my-4">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Edit Order" : "Create New Order"}
              </h3>
              <Button
                onClick={closeModal}
                variant="secondary"
                size="sm"
                icon={X}
                iconOnly
                disabled={submitApi.loading}
              />
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <FormInput
                label="Customer Name"
                name="customer"
                value={formData.customer}
                onChange={handleInputChange}
                error={formErrors.customer}
                required
                placeholder="Enter customer name"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-input-group">
                  <label className="form-label block text-sm font-medium text-gray-700 mb-1">
                    Status
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

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="secondary"
                  disabled={submitApi.loading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitApi.loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isEditing ? "Update Order" : "Create Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}