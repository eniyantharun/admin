"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Eye,
  Calendar,
  DollarSign,
  User,
  ShoppingCart,
  CreditCard,
  Package,
  X,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApi } from "@/hooks/useApi";
import { StatusBadge } from "@/components/helpers/StatusBadge";
import { DateDisplay } from "@/components/helpers/DateDisplay";
import {
  EmptyState,
  LoadingState,
} from "@/components/helpers/EmptyLoadingStates";
import { PaginationControls } from "@/components/helpers/PaginationControls";
import { EntityDrawer } from "@/components/helpers/EntityDrawer";
import { OrderForm } from "@/components/forms/OrderForm";
import { iOrder, iOrderFormData } from "@/types/order";
import { showToast } from "@/components/ui/toast";

const mockOrders: iOrder[] = [
  {
    id: 6874,
    orderNumber: "ORD-6874",
    customer: "Andreka Driver",
    customerEmail: "andreka.driver@example.com",
    status: "new",
    dateTime: "7/20/2025 7:14:21 PM",
    inHandDate: "7/24/2025",
    customerTotal: 1.44,
    supplierTotal: 1.44,
    profit: 0.0,
    paymentMethod: "Credit Card",
    itemCount: 1,
  },
  {
    id: 6873,
    orderNumber: "ORD-6873",
    customer: "Bobbie Smith",
    customerEmail: "bobbie.smith@example.com",
    status: "delivered",
    dateTime: "7/20/2025 7:36:38 AM",
    inHandDate: "8/6/2025",
    customerTotal: 72.0,
    supplierTotal: 72.0,
    profit: 0.0,
    paymentMethod: "Credit Card",
    itemCount: 3,
  },
  {
    id: 6872,
    orderNumber: "ORD-6872",
    customer: "Cameron Davis",
    customerEmail: "cameron.davis@example.com",
    status: "new",
    dateTime: "7/20/2025 6:39:03 AM",
    inHandDate: "8/12/2025",
    customerTotal: 229.0,
    supplierTotal: 229.0,
    profit: 0.0,
    paymentMethod: "Credit Card",
    itemCount: 5,
  },
  {
    id: 6871,
    orderNumber: "ORD-6871",
    customer: "Matt Schechter",
    customerEmail: "matt.schechter@example.com",
    status: "new",
    dateTime: "7/19/2025 6:03:56 AM",
    inHandDate: "7/31/2025",
    customerTotal: 284.0,
    supplierTotal: 284.0,
    profit: 0.0,
    paymentMethod: "Credit Card",
    itemCount: 2,
  },
  {
    id: 6870,
    orderNumber: "ORD-6870",
    customer: "Jennifer Keepes",
    customerEmail: "jennifer.keepes@example.com",
    status: "in-production",
    dateTime: "7/18/2025 1:26:02 PM",
    inHandDate: "8/3/2025",
    customerTotal: 272.5,
    supplierTotal: 272.5,
    profit: 0.0,
    paymentMethod: "Credit Card",
    itemCount: 4,
  },
  {
    id: 6868,
    orderNumber: "ORD-6868",
    customer: "Cameron Davis",
    customerEmail: "cameron.davis@example.com",
    status: "new",
    dateTime: "7/17/2025 11:25:06 AM",
    inHandDate: "8/31/2025",
    customerTotal: 613.5,
    supplierTotal: 385.5,
    profit: 228.0,
    paymentMethod: "Credit Card",
    itemCount: 8,
  },
  {
    id: 6867,
    orderNumber: "ORD-6867",
    customer: "Molly Shumate",
    customerEmail: "molly.shumate@example.com",
    status: "shipped",
    dateTime: "7/17/2025 8:59:41 AM",
    inHandDate: "7/31/2025",
    customerTotal: 320.0,
    supplierTotal: 320.0,
    profit: 0.0,
    paymentMethod: "Credit Card",
    itemCount: 6,
  },
  {
    id: 6865,
    orderNumber: "ORD-6865",
    customer: "Jessica Mathis",
    customerEmail: "jessica.mathis@example.com",
    status: "new",
    dateTime: "7/16/2025 6:49:10 PM",
    inHandDate: "7/15/2025",
    customerTotal: 5.4,
    supplierTotal: 5.4,
    profit: 0.0,
    paymentMethod: "Credit Card",
    itemCount: 1,
  },
  {
    id: 6864,
    orderNumber: "ORD-6864",
    customer: "Julia Stephanie",
    customerEmail: "julia.stephanie@example.com",
    status: "new",
    dateTime: "7/15/2025 11:32:56 PM",
    inHandDate: "7/16/2025",
    customerTotal: 4.12,
    supplierTotal: 4.12,
    profit: 0.0,
    paymentMethod: "Credit Card",
    itemCount: 1,
  },
  {
    id: 6863,
    orderNumber: "ORD-6863",
    customer: "Nick Aslanyan",
    customerEmail: "nick.aslanyan@example.com",
    status: "in-production",
    dateTime: "7/15/2025 2:38:56 PM",
    inHandDate: null,
    customerTotal: 429.0,
    supplierTotal: 272.06,
    profit: 156.94,
    paymentMethod: "Credit Card",
    itemCount: 7,
  },
  {
    id: 6862,
    orderNumber: "ORD-6862",
    customer: "Nic Hunter",
    customerEmail: "nic.hunter@example.com",
    status: "cancelled",
    dateTime: "7/15/2025 11:59:33 AM",
    inHandDate: "7/30/2025",
    customerTotal: 556.0,
    supplierTotal: 369.43,
    profit: 186.57,
    paymentMethod: "Credit Card",
    itemCount: 9,
  },
];

const getStatusConfig = (status: iOrder["status"]) => {
  switch (status) {
    case "new":
      return {
        enabled: true,
        label: { enabled: "New Order", disabled: "New Order" },
        icon: ShoppingCart,
        bgGradient: "from-blue-500 to-blue-600",
        bgSolid: "bg-blue-100",
        textColor: "text-blue-800",
      };
    case "in-production":
      return {
        enabled: true,
        label: { enabled: "In Production", disabled: "In Production" },
        icon: Package,
        bgGradient: "from-orange-500 to-orange-600",
        bgSolid: "bg-orange-100",
        textColor: "text-orange-800",
      };
    case "shipped":
      return {
        enabled: true,
        label: { enabled: "Shipped", disabled: "Shipped" },
        icon: Truck,
        bgGradient: "from-purple-500 to-purple-600",
        bgSolid: "bg-purple-100",
        textColor: "text-purple-800",
      };
    case "delivered":
      return {
        enabled: true,
        label: { enabled: "Delivered", disabled: "Delivered" },
        icon: CheckCircle,
        bgGradient: "from-green-500 to-green-600",
        bgSolid: "bg-green-100",
        textColor: "text-green-800",
      };
    case "cancelled":
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
        enabled: true,
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
  const [totalCount, setTotalCount] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<iOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { get, post, put, loading } = useApi();
  const submitApi = useApi();

  const fetchOrders = useCallback(async () => {
    if (!isInitialLoad && loading) return;

    try {
      let filteredOrders = [...mockOrders];

      if (localSearchTerm) {
        filteredOrders = filteredOrders.filter(
          (order: iOrder) =>
            order.orderNumber
              .toLowerCase()
              .includes(localSearchTerm.toLowerCase()) ||
            order.customer
              .toLowerCase()
              .includes(localSearchTerm.toLowerCase()) ||
            order.customerEmail
              .toLowerCase()
              .includes(localSearchTerm.toLowerCase())
        );
      }

      if (statusFilter !== "all") {
        filteredOrders = filteredOrders.filter(
          (order: iOrder) => order.status === statusFilter
        );
      }

      const startIndex = (currentPage - 1) * rowsPerPage;
      const paginatedOrders = filteredOrders.slice(
        startIndex,
        startIndex + rowsPerPage
      );

      setOrders(paginatedOrders);
      setTotalCount(filteredOrders.length);
    } catch (error: any) {
      if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
        showToast.error("Error fetching orders");
      }
    } finally {
      setIsInitialLoad(false);
    }
  }, [
    localSearchTerm,
    statusFilter,
    currentPage,
    rowsPerPage,
    loading,
    isInitialLoad,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [localSearchTerm, statusFilter]);

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

  const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  const clearLocalSearch = () => {
    setLocalSearchTerm("");
  };

  return (
    <div className="orders-page space-y-4">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Orders ({totalCount.toLocaleString()})
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={localSearchTerm}
                  onChange={handleLocalSearchChange}
                  className="w-full sm:w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {localSearchTerm && (
                  <button
                    onClick={clearLocalSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

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
              </div>

              <Button
                onClick={openNewOrderDrawer}
                icon={Plus}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                Add Order
              </Button>
            </div>
          </div>
        </div>
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
                      hasSearch={!!localSearchTerm || statusFilter !== "all"}
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
                        {order.itemCount && (
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
  );
}