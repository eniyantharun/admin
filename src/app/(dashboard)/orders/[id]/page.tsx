"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OrderForm } from "@/components/forms/OrderForm";
import { useApi } from "@/hooks/useApi";
import { iOrder, iOrderFormData } from "@/types/order";
import { showToast } from "@/components/ui/toast";
import { Header } from "@/components/layout/Header";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<iOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { get } = useApi({
    cancelOnUnmount: true,
    dedupe: false,
  });

  const submitApi = useApi();

  const isNewOrder = false;

  useEffect(() => {
    if (!isNewOrder && orderId) {
      fetchOrderDetails();
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await get(`/Admin/SaleEditor/GetOrderDetail?id=${orderId}`);
      
      if (response?.order?.sale) {
        const saleData = response.order.sale;
        const customerTotal = typeof saleData.customerEstimates?.total === 'string' 
          ? parseFloat(saleData.customerEstimates.total) 
          : saleData.customerEstimates?.total || 0;

        const supplierTotal = typeof saleData.supplierEstimates?.total === 'string'
          ? parseFloat(saleData.supplierEstimates.total)
          : saleData.supplierEstimates?.total || 0;

        const transformedOrder: iOrder = {
          id: parseInt(orderId),
          orderNumber: `ORD-${orderId}`,
          customer: `${saleData.customer.form.firstName} ${saleData.customer.form.lastName}`,
          customerEmail: saleData.customer.form.email,
          status: response.order.status,
          dateTime: new Date(saleData.dates.createdAt).toLocaleString(),
          inHandDate: saleData.dates.inHandDate || null,
          customerTotal: customerTotal,
          supplierTotal: supplierTotal,
          profit: customerTotal - supplierTotal,
          paymentMethod: response.order.paymentMethod || 'Credit Card',
        };

        setOrder(transformedOrder);
      }
    } catch (error: any) {
      if (error?.name !== 'CanceledError') {
        showToast.error('Failed to load order details');
        router.push('/orders');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: iOrderFormData) => {
    try {
      showToast.success(isNewOrder ? 'Order created successfully' : 'Order updated successfully');
      router.push('/orders');
    } catch (error: any) {
      if (error?.name !== 'CanceledError') {
        showToast.error('Failed to save order');
      }
    }
  };

  const handleBack = () => {
    router.push('/orders');
  };

  const contextData = {
    totalCount: 0,
    searchTerm: '',
    onSearchChange: () => {},
    onAddNew: () => {},
    filters: [],
    actions: []
  };

  if (isLoading) {
    return (
      <div className="orders-detail-page">
        <Header contextData={contextData} />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-detail-page">
      <Header contextData={contextData} />
      
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="secondary"
            icon={ArrowLeft}
            size="sm"
          >
            Back to Orders
          </Button>
        </div>

        <Card className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isNewOrder ? 'Create New Order' : `Edit Order #${orderId}`}
          </h1>
          
          <OrderForm
            order={order}
            isEditing={!isNewOrder}
            onSubmit={handleSubmit}
            loading={submitApi.loading}
          />
        </Card>
      </div>
    </div>
  );
}