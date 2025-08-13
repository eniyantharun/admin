"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Eye, Calendar, DollarSign, User, ShoppingCart, CreditCard, Package, CheckCircle, Clock, Truck, X } from "lucide-react";
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
import { iOrder, iOrderFormData, iApiSale, iApiSalesResponse, iApiSalesRequest } from "@/types/order";
import { OrderStatus, PaymentMethod } from "@/lib/enums";
import { showToast } from "@/components/ui/toast";
import { Header } from "@/components/layout/Header";

const getStatusConfig = (status: string) => {
  let normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
  
  if (status === 'NewOrder') normalizedStatus = 'new';
  if (status === 'OrderInProduction') normalizedStatus = 'in-production';
  if (status === 'Completed') normalizedStatus = 'delivered';
  if (status === 'QuoteConvertedToOrder') normalizedStatus = 'new';
    
  switch (normalizedStatus) {
    case 'new':
    case 'neworder':
    case 'new-order':
      return {
        enabled: true,
        label: { enabled: "New Order", disabled: "New Order" },
        icon: ShoppingCart,
        bgGradient: "from-blue-500 to-blue-600",
        bgSolid: "bg-blue-100",
        textColor: "text-blue-800",
      };
    case 'in-production':
    case 'orderinproduction':
    case 'inproduction':
      return {
        enabled: true,
        label: { enabled: "In Production", disabled: "In Production" },
        icon: Package,
        bgGradient: "from-orange-500 to-orange-600",
        bgSolid: "bg-orange-100",
        textColor: "text-orange-800",
      };
    case 'shipped':
      return {
        enabled: true,
        label: { enabled: "Shipped", disabled: "Shipped" },
        icon: Truck,
        bgGradient: "from-purple-500 to-purple-600",
        bgSolid: "bg-purple-100",
        textColor: "text-purple-800",
      };
    case 'delivered':
    case 'completed':
      return {
        enabled: true,
        label: { enabled: "Completed", disabled: "Completed" },
        icon: CheckCircle,
        bgGradient: "from-green-500 to-green-600",
        bgSolid: "bg-green-100",
        textColor: "text-green-800",
      };
    case 'cancelled':
      return {
        enabled: false,
        label: { enabled: "Cancelled", disabled: "Cancelled" },
        icon: X,
        bgGradient: "from-red-500 to-red-600",
        bgSolid: "bg-red-100",
        textColor: "text-red-800",
      };
    default:
      console.warn(`No status config found for: "${status}" (normalized: "${normalizedStatus}")`);
      return {
        enabled: true,
        label: { enabled: status || "Unknown", disabled: status || "Unknown" },
        icon: Clock,
        bgGradient: "from-gray-500 to-gray-600",
        bgSolid: "bg-gray-100",
        textColor: "text-gray-800",
      };
  }
};


export default function OrdersPage() {
  const [orders, setOrders] = useState<iOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<iOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { post, loading } = useApi({
    cancelOnUnmount: true,
    dedupe: true,
    cacheDuration: 30000,
  });
  const submitApi = useApi();

  const { contextData, searchTerm } = useOrdersHeaderContext({
    totalCount,
    onAddNew: () => openNewOrderDrawer(),
    statusFilter,
    onStatusFilterChange: setStatusFilter,
   
  });

  const transformApiSaleToOrder = useCallback((sale: iApiSale): iOrder | null => {
    if (!sale.order) return null;
    
    const customerTotal = typeof sale.customerEstimates.total === 'string' 
      ? parseFloat(sale.customerEstimates.total) 
      : sale.customerEstimates.total;
    
    const supplierTotal = typeof sale.supplierEstimates.total === 'string'
      ? parseFloat(sale.supplierEstimates.total)
      : sale.supplierEstimates.total;
    
    const profit = typeof sale.profit === 'string'
      ? parseFloat(sale.profit)
      : sale.profit;

    return {
      id: sale.order.id,
      orderNumber: `ORD-${sale.order.id}`,
      customer: sale.customer.name,
      customerEmail: `${sale.customer.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      status: mapApiStatusToOrderStatus(sale.order.status),
      dateTime: new Date(sale.createdAt).toLocaleString(),
      inHandDate: sale.inHandDate,
      customerTotal: customerTotal || 0,
      supplierTotal: supplierTotal || 0,
      profit: profit || 0,
      paymentMethod: mapApiPaymentMethod(sale.order.paymentMethod),
      itemCount: sale.customerEstimates.items?.length || 0,
    };
  }, []);

  const mapApiStatusToOrderStatus = useCallback((apiStatus: string): iOrder['status'] => {
  
  switch (apiStatus) {
    case 'NewOrder':
    case 'InProgress':
    case 'WaitingForApproval':
      return 'new';
    case 'OrderInProduction':
    case 'InProduction':
      return 'in-production';
    case 'Shipped':
      return 'shipped';
    case 'Completed':
    case 'Delivered':
      return 'delivered';
    case 'Cancelled':
      return 'cancelled';
    case 'QuoteConvertedToOrder':
      return 'new'; 
    case 'OnHold':
      return 'new'; 
    default:
      console.warn(`Unknown order status received: "${apiStatus}". Defaulting to 'new'.`);
      return 'new';
  }
}, []);

  const mapApiPaymentMethod = useCallback((apiMethod: string): string => {
    switch (apiMethod) {
      case 'CreditCard':
        return 'Credit Card';
      case PaymentMethod.CHEQUE:
        return 'Cheque';
      case PaymentMethod.COMPANY_PAYMENT_ORDER:
        return 'Company Payment Order';
      default:
        return apiMethod || 'Credit Card';
    }
  }, []);

  const mapStatusFilterToApi = useCallback((filter: string): string[] => {
  switch (filter) {
    case 'new':
      return ['NewOrder', 'InProgress', 'WaitingForApproval', 'QuoteConvertedToOrder'];
    case 'in-production':
      return ['OrderInProduction', 'InProduction'];
    case 'shipped':
      return ['Shipped'];
    case 'delivered':
      return ['Completed', 'Delivered'];
    case 'cancelled':
      return ['Cancelled'];
    default:
      return [];
  }
}, []);

  const fetchOrders = useCallback(async () => {
    if (loading) return;

    try {
      const requestBody: iApiSalesRequest = {
        isQuote: false,
        search: searchTerm || "",
        pageSize: rowsPerPage,
        pageIndex: currentPage - 1,
        website: "promotional_product_inc"
      };

      if (statusFilter !== "all") {
        const mappedStatuses = mapStatusFilterToApi(statusFilter);
        if (mappedStatuses.length > 0) {
          requestBody.orderStatus = mappedStatuses;
        }
      }

      const response = await post("/Admin/SaleList/GetSalesList", requestBody) as iApiSalesResponse | null;

      if (response && response.sales) {
        const transformedOrders = response.sales
          .map(transformApiSaleToOrder)
          .filter((order): order is iOrder => order !== null);
        
        setOrders(transformedOrders);
        setTotalCount(response.count || 0);
      } else {
        setOrders([]);
        setTotalCount(0);
      }
    } catch (error: any) {
      if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
        showToast.error("Error fetching orders");
        setOrders([]);
        setTotalCount(0);
      }
    } finally {
      setIsInitialLoad(false);
    }
  }, [searchTerm, statusFilter, currentPage, rowsPerPage, post, transformApiSaleToOrder, mapStatusFilterToApi, loading]);

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  const handleSubmit = async (formData: iOrderFormData) => {
    try {
      if (isEditing && selectedOrder) {
        showToast.success("Order updated successfully");
      } else {
        showToast.success("Order created successfully");
      }

      await fetchOrders();
      closeDrawer();
    } catch (error: any) {
      if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
        showToast.error("Error saving order");
      }
    }
  };

  const openNewOrderDrawer = () => {
    setIsEditing(false);
    setSelectedOrder(null);
    setIsDrawerOpen(true);
  };

  const openEditOrderDrawer = (order: iOrder) => {
    setIsEditing(true);
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOrder(null);
    setIsEditing(false);
  };

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
                    Date & Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In-Hand Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Total
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier Total
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && isInitialLoad ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6">
                      <LoadingState message="Loading orders..." />
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6">
                      <EmptyState
                        icon={ShoppingCart}
                        title="No orders found"
                        description="Get started by creating your first order."
                        hasSearch={!!searchTerm || statusFilter !== "all"}
                      />
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        onClick={() => openEditOrderDrawer(order)}
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 bg-gradient-to-br ${statusConfig.bgGradient} rounded-lg flex items-center justify-center`}>
                                <StatusIcon className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {order.orderNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {order.id}
                              </div>
                              <div
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusConfig.bgSolid} ${statusConfig.textColor}`}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label.enabled}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="font-medium">{order.customer}</span>
                          </div>
                          <div className="text-xs text-gray-500 ml-4">
                            {order.customerEmail}
                          </div>
                          {order.itemCount !== null && order.itemCount !== undefined && (
                            <div className="text-xs text-blue-600 ml-4">
                              <Package className="w-3 h-3 inline mr-1" />
                              {order.itemCount} items
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-xs text-gray-900 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{order.dateTime}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-xs text-gray-900">
                            {order.inHandDate || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                            ${order.customerTotal.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            ${order.supplierTotal.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div
                            className={`text-sm font-medium flex items-center gap-1 ${
                              order.profit > 0
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            ${order.profit.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-xs text-gray-900 flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-gray-400" />
                            {order.paymentMethod}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditOrderDrawer(order);
                            }}
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

        <EntityDrawer
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          title={isEditing ? "Edit Order" : "Create New Order"}
          size="xxl"
          loading={submitApi.loading}
        >
          <OrderForm
            order={selectedOrder}
            isEditing={isEditing}
            onSubmit={handleSubmit}
            loading={submitApi.loading}
          />
        </EntityDrawer>
      </div>
    </div>
  );
}