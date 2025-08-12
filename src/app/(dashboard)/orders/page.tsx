"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Eye, Calendar, DollarSign, ShoppingCart, CreditCard, Package, CheckCircle, Clock, Truck, X, Mail } from "lucide-react";
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

// Helper function to safely convert to number and format
const formatCurrency = (value: any): string => {
  const numValue = parseFloat(value) || 0;
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
      itemsSubTotal: parseFloat(apiOrder.customerEstimates?.itemsSubTotal) || 0,
      itemsTotal: parseFloat(apiOrder.customerEstimates?.itemsTotal) || 0,
      setupCharge: parseFloat(apiOrder.customerEstimates?.setupCharge) || 0,
      shipping: parseFloat(apiOrder.customerEstimates?.shipping) || 0,
      discount: parseFloat(apiOrder.customerEstimates?.discount) || 0,
      subTotal: parseFloat(apiOrder.customerEstimates?.subTotal) || 0,
      total: parseFloat(apiOrder.customerEstimates?.total) || 0,
    },
    supplierEstimates: {
      items: apiOrder.supplierEstimates?.items || [],
      itemsSubTotal: parseFloat(apiOrder.supplierEstimates?.itemsSubTotal) || 0,
      itemsTotal: parseFloat(apiOrder.supplierEstimates?.itemsTotal) || 0,
      setupCharge: parseFloat(apiOrder.supplierEstimates?.setupCharge) || 0,
      shipping: parseFloat(apiOrder.supplierEstimates?.shipping) || 0,
      subTotal: parseFloat(apiOrder.supplierEstimates?.subTotal) || 0,
      total: parseFloat(apiOrder.supplierEstimates?.total) || 0,
    },
    profit: parseFloat(apiOrder.profit) || 0,
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<iOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<iOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { post } = useApi();

  const openNewOrderDrawer = () => {
    setSelectedOrder(null);
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const fetchOrders = useCallback(async () => {
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

      console.log('Fetching orders with params:', requestBody);

      const response = await post('/Admin/SaleList/GetSalesList', requestBody);
      
      console.log('Orders API response:', response);

      if (response && response.sales) {
        // Transform API orders to match our interface
        const transformedOrders = response.sales
          .filter((sale: any) => sale.order) // Only include items that have order data
          .map(transformApiOrder);
        
        setOrders(transformedOrders);
        setTotalCount(response.count || 0);
      } else {
        console.error('Invalid response structure:', response);
        setOrders([]);
        setTotalCount(0);
        showToast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setTotalCount(0);
      showToast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, currentPage, selectedStatus, searchTerm, post]);

  const { contextData } = useOrdersHeaderContext({
    totalCount,
    onAddNew: openNewOrderDrawer,
    statusFilter: selectedStatus,
    onStatusFilterChange: setSelectedStatus,
    onRefresh: fetchOrders,
    onExport: () => showToast.info('Export functionality coming soon')
  });

  // Update searchTerm when context changes
  useEffect(() => {
    if (contextData.searchTerm !== searchTerm) {
      setSearchTerm(contextData.searchTerm);
      // Reset to first page when searching
      setCurrentPage(1);
    }
  }, [contextData.searchTerm, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

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

  const openEditOrderDrawer = (order: iOrder) => {
    setSelectedOrder(order);
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOrder(null);
    setIsEditing(false);
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header contextData={contextData} />

      <div className="p-2 space-y-2">
        <Card className="p-4">
          {loading ? (
            <div className="py-12">
              <LoadingState message="Loading orders..." />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12">
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
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const customerName = order.customer?.name || 'Unknown Customer';
                const customerEmail = order.customer?.email || 'No email';
                
                // Safe number conversion for all monetary values
                const customerTotal = parseFloat(order.customerEstimates?.total) || 0;
                const supplierTotal = parseFloat(order.supplierEstimates?.total) || 0;
                const profit = parseFloat(order.profit) || 0;
                
                const inHandDate = order.inHandDate;
                const createdAt = order.createdAt;
                const paymentMethod = order.paymentMethod || 'Unknown';

                return (
                  <Card key={order.saleId} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{customerName}</p>
                        <p className="text-xs text-gray-500 mb-3">{customerEmail}</p>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgSolid} ${statusConfig.textColor}`}>
                        <statusConfig.icon className="w-4 h-4 mr-2" />
                        {statusConfig.label.enabled}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <DateDisplay date={createdAt} />
                      </div>
                      {inHandDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>In Hand: {new Date(inHandDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>Customer: ${formatCurrency(customerTotal)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="w-4 h-4 mr-2" />
                        <span>Supplier: ${formatCurrency(supplierTotal)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>Profit: ${formatCurrency(profit)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>Payment: {paymentMethod}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditOrderDrawer(order)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditOrderDrawer(order)}
                        className="flex-1"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
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