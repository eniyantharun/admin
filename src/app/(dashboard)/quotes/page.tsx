// src/app/(dashboard)/orders/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ListView } from '@/components/ui/ListView';
import { Search, Plus, Eye, Calendar, DollarSign, User, ShoppingCart } from 'lucide-react';
import { usePageSearch, useSearch } from '@/contexts/SearchContext';
import { useApi } from '@/hooks/useApi';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  itemCount: number;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    total: 299.99,
    status: 'delivered',
    createdAt: '2024-01-15',
    itemCount: 2,
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    total: 599.98,
    status: 'processing',
    createdAt: '2024-01-16',
    itemCount: 3,
  },
  {
    id: 'ORD-003',
    customerName: 'Bob Johnson',
    customerEmail: 'bob.johnson@example.com',
    total: 149.99,
    status: 'shipped',
    createdAt: '2024-01-17',
    itemCount: 1,
  },
];

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'orders-status-pending text-warning-700 bg-warning-100';
    case 'processing':
      return 'orders-status-processing text-primary-700 bg-primary-100';
    case 'shipped':
      return 'orders-status-shipped text-secondary-700 bg-secondary-100';
    case 'delivered':
      return 'orders-status-delivered text-success-700 bg-success-100';
    case 'cancelled':
      return 'orders-status-cancelled text-danger-700 bg-danger-100';
    default:
      return 'orders-status-default text-secondary-700 bg-secondary-100';
  }
};

const OrderItem: React.FC<{ order: Order }> = ({ order }) => (
  <Card className="orders-list-item p-4">
    <div className="orders-item-content flex items-center justify-between">
      <div className="orders-item-info flex items-center space-x-4">
        <div className="orders-item-icon-wrapper w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <ShoppingCart className="orders-item-icon w-5 h-5 text-primary-600" />
        </div>
        
        <div className="orders-item-details">
          <div className="orders-item-header flex items-center space-x-3 mb-1">
            <h3 className="orders-item-id text-sm font-semibold text-secondary-900">
              {order.id}
            </h3>
            <span className={`orders-item-status px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          
          <div className="orders-item-customer flex items-center space-x-1 mb-1">
            <User className="orders-customer-icon w-3 h-3 text-secondary-400" />
            <span className="orders-customer-name text-sm text-secondary-700">{order.customerName}</span>
            <span className="orders-customer-email text-xs text-secondary-500">({order.customerEmail})</span>
          </div>
          
          <div className="orders-item-meta flex items-center space-x-4">
            <div className="orders-item-date flex items-center space-x-1">
              <Calendar className="orders-date-icon w-3 h-3 text-secondary-400" />
              <span className="orders-date-text text-xs text-secondary-600">{order.createdAt}</span>
            </div>
            
            <div className="orders-item-count">
              <span className="orders-count-text text-xs text-secondary-600">
                {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="orders-item-right flex items-center space-x-4">
        <div className="orders-item-total flex items-center space-x-1">
          <DollarSign className="orders-total-icon w-4 h-4 text-success-500" />
          <span className="orders-total-text text-lg font-semibold text-success-700">
            ${order.total.toFixed(2)}
          </span>
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          icon={Eye}
          iconOnly
          className="orders-view-button"
        />
      </div>
    </div>
  </Card>
);

export default function OrdersPage() {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  
  const { get } = useApi();
  const { searchQuery, setSearchResults } = useSearch();

  // Global search function for header
  const handleGlobalSearch = useCallback(async (query: string) => {
    // Filter orders based on search query
    const filteredOrders = mockOrders.filter(order =>
      order.id.toLowerCase().includes(query.toLowerCase()) ||
      order.customerName.toLowerCase().includes(query.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(query.toLowerCase())
    );

    // Format results for global search dropdown
    const searchResults = filteredOrders.map((order: Order) => ({
      id: order.id,
      title: order.id,
      subtitle: `${order.customerName} - $${order.total.toFixed(2)}`,
      description: `${order.status} • ${order.itemCount} item${order.itemCount !== 1 ? 's' : ''}`,
      type: 'order',
      data: order
    }));

    setSearchResults(searchResults);
  }, [setSearchResults]);

  // Register this page's search configuration
  usePageSearch({
    placeholder: 'Search orders by ID, customer, or email...',
    enabled: true,
    searchFunction: handleGlobalSearch,
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'all', label: 'All Orders' },
          { value: 'pending', label: 'Pending' },
          { value: 'processing', label: 'Processing' },
          { value: 'shipped', label: 'Shipped' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'cancelled', label: 'Cancelled' },
        ]
      }
    ]
  });

  // Use either global search query or local search term
  const effectiveSearchTerm = searchQuery || localSearchTerm;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(effectiveSearchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sync global search with local results
  useEffect(() => {
    if (searchQuery && searchQuery !== localSearchTerm) {
      setLocalSearchTerm(searchQuery);
    }
  }, [searchQuery, localSearchTerm]);

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="orders-page-container space-y-6">
      <div className="orders-page-header">
        <h1 className="orders-page-title text-2xl font-bold text-secondary-900">Orders</h1>
        
      </div>

      <Card className="orders-page-toolbar p-4">
        <div className="orders-toolbar-content flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="orders-toolbar-left flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            {/* Local Search Input (backup when global search is not active) */}
            {/* {!searchQuery && (
              <div className="orders-search-wrapper relative flex-1 max-w-md">
                <Search className="orders-search-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search orders locally..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="orders-search-input w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )} */}

            {/* Search Status Indicator */}
            {searchQuery && (
              <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <Search className="w-4 h-4" />
                <span>Searching: "{searchQuery}"</span>
              </div>
            )}
            
            <div className="orders-filter-wrapper">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="orders-status-filter px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <Button
            icon={Plus}
            className="orders-add-button"
          >
            Create Order
          </Button>
        </div>
      </Card>

      <Card className="orders-page-list">
        <div className="orders-list-header p-4 border-b border-secondary-200">
          <h3 className="orders-list-title text-lg font-semibold text-secondary-900">
            Orders ({filteredOrders.length})
          </h3>
        </div>
        <div className="orders-list-content p-4">
          <ListView
            items={filteredOrders}
            keyExtractor={(order) => order.id}
            renderItem={(order) => <OrderItem order={order} />}
            emptyComponent={
              <div className="orders-empty-state text-center py-8">
                <ShoppingCart className="orders-empty-icon w-12 h-12 mx-auto text-secondary-300 mb-4" />
                <h3 className="orders-empty-title text-lg font-medium text-secondary-900 mb-2">
                  No orders found
                </h3>
                <p className="orders-empty-description text-secondary-500">
                  {effectiveSearchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No orders have been placed yet.'}
                </p>
              </div>
            }
            className="orders-list-items"
          />
        </div>
      </Card>
    </div>
  );
}