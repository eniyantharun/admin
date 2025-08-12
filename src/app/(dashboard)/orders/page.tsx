"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Eye, Calendar, DollarSign, User, ShoppingCart, CreditCard, Package, CheckCircle, Clock, Truck, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApi } from "@/hooks/useApi";
import { StatusBadge } from "@/components/helpers/StatusBadge";
import { DateDisplay } from "@/components/helpers/DateDisplay";
import { EmptyState, LoadingState } from "@/components/helpers/EmptyLoadingStates";
import { PaginationControls } from "@/components/helpers/PaginationControls";
import { EntityDrawer } from "@/components/helpers/EntityDrawer";
import { OrderForm } from "@/components/forms/OrderForm";
import { useOrdersHeaderContext } from "@/hooks/useHeaderContext";
import { iOrder, iOrderFormData, iOrderSearchParams } from "@/types/order";
import { showToast } from "@/components/ui/toast";
import { Header } from "@/components/layout/Header";
import { OrderService } from "@/lib/api";
import { WebsiteType, OrderStatus } from "@/types/enums";

const getStatusConfig = (status: iOrder["status"]) => {
  switch (status) {
    case OrderStatus.NEW_ORDER:
      return {
        enabled: true,
        label: { enabled: "New Order", disabled: "New Order" },
        icon: ShoppingCart,
        bgGradient: "from-blue-500 to-blue-600",
        bgSolid: "bg-blue-100",
        textColor: "text-blue-800",
      };
    case OrderStatus.IN_PRODUCTION:
      return {
        enabled: true,
        label: { enabled: "In Production", disabled: "In Production" },
        icon: Package,
        bgGradient: "from-yellow-500 to-yellow-600",
        bgSolid: "bg-yellow-100",
        textColor: "text-yellow-800",
      };
    case OrderStatus.SHIPPED:
      return {
        enabled: true,
        label: { enabled: "Shipped", disabled: "Shipped" },
        icon: Truck,
        bgGradient: "from-purple-500 to-purple-600",
        bgSolid: "bg-purple-100",
        textColor: "text-purple-800",
      };
    case OrderStatus.COMPLETED:
      return {
        enabled: true,
        label: { enabled: "Completed", disabled: "Completed" },
        icon: CheckCircle,
        bgGradient: "from-green-500 to-green-600",
        bgSolid: "bg-green-100",
        textColor: "text-green-800",
      };
    case OrderStatus.CANCELLED:
      return {
        enabled: false,
        label: { enabled: "Cancelled", disabled: "Cancelled" },
        icon: X,
        bgGradient: "from-red-500 to-red-600",
        bgSolid: "bg-red-100",
        textColor: "text-red-800",
      };
    default:
      return {
        enabled: false,
        label: { enabled: "Unknown", disabled: "Unknown" },
        icon: Clock,
        bgGradient: "from-gray-500 to-gray-600",
        bgSolid: "bg-gray-100",
        textColor: "text-gray-800",
      };
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<iOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<iOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const openNewOrderDrawer = () => {
    setSelectedOrder(null);
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params: iOrderSearchParams = {
        isQuote: false,
        pageSize: rowsPerPage,
        pageIndex: currentPage,
        orderStatus: selectedStatus === 'all' ? undefined : [selectedStatus],
        website: WebsiteType.PROMOTIONAL_PRODUCT_INC,
      };
      const response = await OrderService.getOrders(params);
      setOrders(response.data);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, currentPage, selectedStatus]);

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
    setCurrentPage(0);
  };

  const handleSubmit = async (formData: iOrderFormData) => {
    try {
      setFormLoading(true);
      if (isEditing && selectedOrder) {
        await OrderService.updateOrder(selectedOrder.id, { 
          status: formData.status,
          paymentMethod: formData.paymentMethod
        });
        showToast.success('Order updated successfully');
      } else {
        await OrderService.createOrder(formData.customerId);
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
  const startIndex = currentPage * rowsPerPage + 1;
  const endIndex = Math.min((currentPage + 1) * rowsPerPage, totalCount);

  if (loading) {
    return <LoadingState message="Loading orders..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        contextData={{
          totalCount: totalCount,
          searchTerm: searchTerm || '',
          onSearchChange: contextData.onSearchChange,
          onAddNew: openNewOrderDrawer,
          filters: []
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders?.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders found"
            description="Get started by creating your first order"
            hasSearch={false}
          />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {orders?.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const customerName = order.customer?.name || 'Unknown Customer';
                const customerEmail = order.customer?.email || 'No email';
                const customerTotal = order.customerEstimates?.total || 0;
                const supplierTotal = order.supplierEstimates?.total || 0;
                const profit = order.profit || 0;
                const inHandDate = order.inHandDate;
                const createdAt = order.createdAt;
                const itemCount = order.lineItems?.length || 0;
                const paymentMethod = order.paymentMethod || 'Unknown';

                return (
                  <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            #{order.id}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{customerName}</p>
                          <p className="text-xs text-gray-500 mb-3">{customerEmail}</p>
                        </div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          statusConfig.enabled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
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
                          <span>In Hand: {inHandDate}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>Customer: ${customerTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="w-4 h-4 mr-2" />
                        <span>Supplier: ${supplierTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>Profit: ${profit.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        <span>Items: {itemCount}</span>
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

            <div className="mt-8">
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
            </div>
          </>
        )}
      </div>

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
  );
}