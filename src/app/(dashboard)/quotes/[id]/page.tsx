"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { QuoteForm } from "@/components/forms/QuoteForm/QuoteForm";
import { useApi } from "@/hooks/useApi";
import { iQuote, iQuoteFormData } from "@/types/quotes";
import { showToast } from "@/components/ui/toast";
import { Header } from "@/components/layout/Header";

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params?.id as string;
  const [quote, setQuote] = useState<iQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { get } = useApi({
    cancelOnUnmount: true,
    dedupe: false,
  });

  const submitApi = useApi();

  const isNewQuote = false;

  useEffect(() => {
    if (!isNewQuote && quoteId) {
      fetchQuoteDetails();
    } else {
      setIsLoading(false);
    }
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    try {
      const response = await get(
        `/Admin/SaleEditor/GetQuoteDetail?id=${quoteId}`
      );

      if (response?.quote?.sale) {
        const saleData = response.quote.sale;
        const customerTotal =
          typeof saleData.customerEstimates?.total === "string"
            ? parseFloat(saleData.customerEstimates.total)
            : saleData.customerEstimates?.total || 0;

        const transformedQuote: iQuote = {
          id: parseInt(quoteId),
          saleId: response.quote.saleId, 
          quoteNumber: quoteId,
          customer: `${saleData.customer.form.firstName} ${saleData.customer.form.lastName}`,
          customerEmail: saleData.customer.form.email,
          status: response.quote.status,
          dateTime: new Date(saleData.dates.createdAt).toLocaleString(),
          inHandDate: saleData.dates.inHandDate || null,
          customerTotal: customerTotal,
        };

        setQuote(transformedQuote);
      }
    } catch (error: any) {
      if (error?.name !== "CanceledError") {
        showToast.error("Failed to load quote details");
        router.push("/quotes");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: iQuoteFormData) => {
    try {
      // showToast.success(
      //   isNewQuote ? "Quote created successfully" : "Quote updated successfully"
      // );
      //router.push("/quotes");
    } catch (error: any) {
      if (error?.name !== "CanceledError") {
        showToast.error("Failed to save quote");
      }
    }
  };

  const handleBack = () => {
    router.push("/quotes");
  };

  const contextData = {
    totalCount: 0,
    searchTerm: "",
    onSearchChange: () => {},
    onAddNew: () => {},
    filters: [],
    actions: [],
  };

  if (isLoading) {
    return (
      <div className="quotes-detail-page">
        <Header contextData={contextData} />
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="quotes-detail-page">
      <Header contextData={contextData} />

      <div className="p-6 max-w-7xl mx-auto">

        <Card className="p-6">
          <QuoteForm
            quote={quote}
            isEditing={!isNewQuote}
            onSubmit={handleSubmit}
            loading={submitApi.loading}
          />
        </Card>
      </div>
    </div>
  );
}
