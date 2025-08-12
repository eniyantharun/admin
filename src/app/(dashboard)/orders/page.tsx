"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { Eye, Calendar, DollarSign, ShoppingCart, CreditCard, Package, CheckCircle, Clock, Truck, X, Mail, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/helpers/StatusBadge";
import { DateDisplay } from "@/components/helpers/DateDisplay";
import { EmptyState, LoadingState } from "@/components/helpers/EmptyLoadingStates";
import { PaginationControls } from "@/components/helpers/PaginationControls";
import { EntityDrawer } from "@/components/helpers/EntityDrawer";
import { OrderForm } from "@/components/forms/OrderForm";
import { useOrdersHeaderContext } from "@/hooks/useHeaderContext";
import { iOrder, iOrderFormData } from "@/types/order";
import { showToast } from "@/components/ui/toast";
import { Header } from "@/components/layout/Header";
import { useApi } from "@/hooks/useApi";
import { WebsiteType, OrderStatus } from "@/types/enums";

// Helper function to safely format currency
const formatCurrency = (value: number | string | undefined | null): string => {
  if (value === null || value === undefined) return "0.00";
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : Number(value) || 0;
  return numValue.toFixed(2);
};

// Transform API response to match our Order interface
const transformApiOrder = (apiOrder: any): iOrder => {
  return {
    id: apiOrder.order?.id || Math.floor(Math.random() * 10000),
    saleId: apiOrder.id,
    status: apiOrder.order?.status || OrderStatus.NEW_ORDER,
    customer: {
      id: apiOrder.customer?.id || '',
      idNum: 0,
      name: apiOrder.customer?.name || 'Unknown Customer',
      email: apiOrder.customer?.email || '',
      companyName: apiOrder.customer?.companyName || '',
      phoneNumber: apiOrder.customer?.phoneNumber || '',
    },
    createdAt: apiOrder.createdAt,
    inHandDate: apiOrder.inHandDate,
    paidAt: apiOrder.paidAt,
    customerEstimates: {
      items: apiOrder.customerEstimates?.items || [],
      itemsSubTotal: Number(apiOrder.customerEstimates?.itemsSubTotal) || 0,
      itemsTotal: Number(apiOrder.customerEstimates?.itemsTotal) || 0,
      setupCharge: Number(apiOrder.customerEstimates?.setupCharge) || 0,
      shipping: Number(apiOrder.customerEstimates?.shipping) || 0,
      discount: Number(apiOrder.customerEstimates?.discount) || 0,
      subTotal: Number(apiOrder.customerEstimates?.subTotal) || 0,
      total: Number(apiOrder.customerEstimates?.total) || 0,
    },
    supplierEstimates: {
      items: apiOrder.supplierEstimates?.items || [],
      itemsSubTotal: Number(apiOrder.supplierEstimates?.itemsSubTotal) || 0,
      itemsTotal: Number(apiOrder.supplierEstimates?.itemsTotal) || 0,
      setupCharge: Number(apiOrder.supplierEstimates?.setupCharge) || 0,
      shipping: Number(apiOrder.supplierEstimates?.shipping) || 0,
      subTotal: Number(apiOrder.supplierEstimates?.subTotal) || 0,
      total: Number(apiOrder.supplierEstimates?.total) || 0,
    },
    profit: Number(apiOrder.profit) || 0,
    lineItems: [],
    isPaid: apiOrder.order?.status === OrderStatus.COMPLETED,
    paymentMethod: apiOrder.order?.paymentMethod,
    notes: apiOrder.notes,
    comments: [],
    purchaseOrders: [],
    shippingAddress: apiOrder.shippingAddress,
    billingAddress: apiOrder.billingAddress,
    checkoutDetails: apiOrder.checkoutDetails,
    shippingDetails: apiOrder.shippingDetails,
  };
};

const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.NEW_ORDER:
      return {
        enabled: true,
        label: { enabled: "New Order", disabled: "New Order" },
        icon: ShoppingCart,
        bgSolid: "bg-blue-100",
        textColor: "text-blue-800",
      };
    case OrderStatus.IN_PRODUCTION:
      return {
        enabled: true,
        label: { enabled: "In Production", disabled: "In Production" },
        icon: Package,
        bgSolid: "bg-yellow-100",
        textColor: "text-yellow-800",
      };
    case OrderStatus.SHIPPED:
      return {
        enabled: true,
        label: { enabled: "Shipped", disabled: "Shipped" },
        icon: Truck,
        bgSolid: "bg-purple-100",
        textColor: "text-purple-800",
      };
    case OrderStatus.COMPLETED:
      return {
        enabled: true,
        label: { enabled: "Completed", disabled: "Completed" },
        icon: CheckCircle,
        bgSolid: "bg-green-100",
        textColor: "text-green-800",
      };
    case OrderStatus.CANCELLED:
      return {
        enabled: false,
        label: { enabled: "Cancelled", disabled: "Cancelled" },
        icon: X,
        bgSolid: "bg-red-100",
        textColor: "text-red-800",
      };
    default:
      return {
        enabled: false,
        label: { enabled: "Unknown", disabled: "Unknown" },
        icon: Clock,
        bgSolid: "bg-gray-100",
        textColor: "text-gray-800",
      };
  }
};

const CustomerInfo = memo<{ order: iOrder }>(({ order }) => (
  <>
    <div className="text-sm text-gray-900 flex items-center gap-1">
      <span className="truncate max-w-xs">{order.customer.name}</span>
    </div>
    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
      <Mail className="w-3 h-3 text-gray-400" />
      <span className="truncate max-w-xs">{order.customer.email}</span>
    </div>
    {order.customer.companyName && (
      <div className="text-xs text-gray-500 mt-1">
        <span className="truncate max-w-xs">{order.customer.companyName}</span>
      </div>
    )}
  </>
));

CustomerInfo.displayName = "CustomerInfo";

const OrderAmounts = memo<{ order: iOrder }>(({ order }) => (
  <>
    <div className="text-sm text-gray-900 flex items-center gap-1">
      <DollarSign className="w-3 h-3 text-gray-400" />
      <span className="font-medium">${formatCurrency(order.customerEstimates.total)}</span>
    </div>
    <div className="text-xs text-gray-500 mt-1">
      Profit: ${formatCurrency(order.profit)}
    </div>
    {order.supplierEstimates.total > 0 && (
      <div className="text-xs text-gray-500">
        Cost: ${formatCurrency(order.supplierEstimates.total)}
      </div>
    )}
  </>
));

OrderAmounts.displayName = "OrderAmounts";

export default function OrdersPage() {
  const [orders, setOrders] = useState<iOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState<iOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Use ref to prevent infinite re-renders
  const mountedRef = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Create a stable API instance
  const apiRef = useRef(useApi());
  const api = apiRef.current;

  const openNewOrderDrawer = useCallback(() => {
    setSelectedOrder(null);
    setIsEditing(false);
    setIsDrawerOpen(true);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!mountedRef.current || (!isInitialLoad && loading)) {
      return;
    }

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce the API call
    fetchTimeoutRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;

      try {
        setLoading(true);
        
        // Build request parameters matching the API structure
        const requestBody = {
          isQuote: false, // This is for orders, not quotes
          pageSize: rowsPerPage,
          pageIndex: currentPage - 1, // Convert to 0-based for API
          website: WebsiteType.PROMOTIONAL_PRODUCT_INC,
          ...(selectedStatus !== 'all' && { orderStatus: [selectedStatus] }),
          ...(searchTerm && { search: searchTerm })
        };

        const response = await api.post('/Admin/SaleList/GetSalesList', requestBody);

        if (!mountedRef.current) return;

        if (response && response.sales) {
          // Transform API orders to match our interface
          const transformedOrders = response.sales
            .filter((sale: any) => sale.order) // Only include items that have order data
            .map(transformApiOrder);
          
          setOrders(transformedOrders);
          setTotalCount(response.count || 0);
        } else {
          setOrders([]);
          setTotalCount(0);
          showToast.error('Invalid response from server');
        }
      } catch (error) {
        if (!mountedRef.current) return;
        console.error('Error fetching orders:', error);
        setOrders([]);
        setTotalCount(0);
        showToast.error('Failed to fetch orders');
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setIsInitialLoad(false);
        }
      }
    }, 300); // 300ms debounce
  }, [rowsPerPage, currentPage, selectedStatus, searchTerm, isInitialLoad]);

  // Memoize context data to prevent unnecessary re-renders
  const contextData = useMemo(() => ({
    totalCount,
    searchTerm,
    onSearchChange: (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1); // Reset to first page when searching
    },
    onAddNew: openNewOrderDrawer,
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'select' as const,
        value: selectedStatus,
        onChange: (value: string | boolean) => {
          if (typeof value === 'string') {
            setSelectedStatus(value as OrderStatus | 'all');
            setCurrentPage(1);
          }
        },
        options: [
          { value: 'all', label: 'All Orders' },
          { value: OrderStatus.NEW_ORDER, label: 'New Orders' },
          { value: OrderStatus.IN_PRODUCTION, label: 'In Production' },
          { value: OrderStatus.SHIPPED, label: 'Shipped' },
          { value: OrderStatus.COMPLETED, label: 'Completed' },
          { value: OrderStatus.CANCELLED, label: 'Cancelled' }
        ]
      }
    ],
    actions: [
      {
        key: 'refresh',
        label: 'Refresh',
        icon: () => null,
        onClick: fetchOrders,
        variant: 'secondary' as const
      }
    ]
  }), [totalCount, searchTerm, selectedStatus, openNewOrderDrawer, fetchOrders]);

  // Component lifecycle management
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Fetch orders when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, selectedStatus]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowsPerPageChange = useCallback((rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  }, []);

  const handleSubmit = async (formData: iOrderFormData) => {
    try {
      setFormLoading(true);
      if (isEditing && selectedOrder) {
        // Update order logic here
        showToast.success('Order updated successfully');
      } else {
        // Create order logic here
        showToast.success('Order created successfully');
      }
      closeDrawer();
      fetchOrders();
    } catch (error) {
      showToast.error('Failed to save order');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditOrderDrawer = useCallback((order: iOrder) => {
    setSelectedOrder(order);
    setIsEditing(true);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedOrder(null);
    setIsEditing(false);
  }, []);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  return (
    <div className="orders-page">
      <Header contextData={contextData} />

      <div className="p-2 space-y-2">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount & Profit
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In-Hand Date
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && isInitialLoad ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8">
                      <LoadingState message="Loading orders..." />
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8">
                      <EmptyState
                        icon={ShoppingCart}
                        title="No orders found"
                        description={
                          searchTerm || selectedStatus !== 'all'
                            ? "Try adjusting your search terms or filters to find orders."
                            : "Get started by creating your first order."
                        }
                        hasSearch={!!searchTerm || selectedStatus !== 'all'}
                      />
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    
                    return (
                      <tr
                        key={order.saleId}
                        className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        onClick={() => openEditOrderDrawer(order)}
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                Order #{order.id}
                              </div>
                              <div className="text-xs text-gray-500">
                                Sale ID: {order.saleId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <CustomerInfo order={order} />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <OrderAmounts order={order} />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgSolid} ${statusConfig.textColor}`}>
                            <statusConfig.icon className="w-3 h-3 mr-1" />
                            {statusConfig.label.enabled}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-gray-400" />
                            <span>{order.paymentMethod || 'Unknown'}</span>
                          </div>
                          {order.isPaid && (
                            <div className="text-xs text-green-600 mt-1">
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              Paid
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <DateDisplay date={order.createdAt} />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {order.inHandDate ? (
                            <div className="text-sm text-gray-900 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{new Date(order.inHandDate).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Not set</span>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditOrderDrawer(order);
                            }}
                            variant="secondary"
                            size="sm"
                            icon={Edit2}
                            iconOnly
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
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </Card>
        )}

        <EntityDrawer
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          title={isEditing ? `Edit Order #${selectedOrder?.id}` : "New Order"}
          size="xl"
          footer={
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={closeDrawer}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="order-form"
                loading={formLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isEditing ? "Update Order" : "Create Order"}
              </Button>
            </div>
          }
        >
          <OrderForm
            order={selectedOrder}
            isEditing={isEditing}
            onSubmit={handleSubmit}
            loading={formLoading}
          />
        </EntityDrawer>
      </div>
    </div>
  );
}