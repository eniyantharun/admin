"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Eye, Calendar, DollarSign, User, FileText, Mail, CheckCircle, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApi } from "@/hooks/useApi";
import { StatusBadge } from "@/components/helpers/StatusBadge";
import { DateDisplay } from "@/components/helpers/DateDisplay";
import { EmptyState, LoadingState } from "@/components/helpers/EmptyLoadingStates";
import { PaginationControls } from "@/components/helpers/PaginationControls";
import { EntityDrawer } from "@/components/helpers/EntityDrawer";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { useQuotesHeaderContext } from "@/hooks/useHeaderContext";
import { iQuote, iQuoteFormData, iApiQuote } from "@/types/quotes";
import { iApiSale, iApiSalesResponse, iApiSalesRequest } from "@/types/order";
import { QuoteStatus } from "@/lib/enums";
import { showToast } from "@/components/ui/toast";
import { Header } from "@/components/layout/Header";

const getStatusConfig = (status: string) => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
  
  switch (normalizedStatus) {
    case 'newquote':
    case 'new-quote':
      return {
        enabled: true,
        label: { enabled: "New Quote", disabled: "New Quote" },
        icon: FileText,
        bgGradient: "from-blue-500 to-blue-600",
        bgSolid: "bg-blue-100",
        textColor: "text-blue-800",
      };
    case 'quotesenttocustomer':
    case 'quote-sent-to-customer':
      return {
        enabled: true,
        label: { enabled: "Quote Sent", disabled: "Quote Sent" },
        icon: Send,
        bgGradient: "from-orange-500 to-orange-600",
        bgSolid: "bg-orange-100",
        textColor: "text-orange-800",
      };
    case 'quoteconvertedtoorder':
    case 'quote-converted-to-order':
    case 'convertedtoorderbycustomer':
      return {
        enabled: true,
        label: {
          enabled: "Converted to Order",
          disabled: "Converted to Order",
        },
        icon: CheckCircle,
        bgGradient: "from-green-500 to-green-600",
        bgSolid: "bg-green-100",
        textColor: "text-green-800",
      };
    case 'cancelled':
      return {
        enabled: false,
        label: { enabled: "Cancelled", disabled: "Cancelled" },
        icon: Clock,
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

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<iQuote[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<iQuote | null>(null);
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

  const { contextData, searchTerm } = useQuotesHeaderContext({
    totalCount,
    onAddNew: () => openNewQuoteDrawer(),
    statusFilter,
    onStatusFilterChange: setStatusFilter,
  });

  const transformApiSaleToQuote = useCallback((sale: iApiSale): iQuote | null => {
    if (!sale.quote) return null;
    
    const customerTotal = typeof sale.customerEstimates.total === 'string' 
      ? parseFloat(sale.customerEstimates.total) 
      : sale.customerEstimates.total;

    return {
      id: sale.quote.id,
      quoteNumber: `QUO-${sale.quote.id}`,
      customer: sale.customer.name,
      customerEmail: `${sale.customer.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      status: mapApiStatusToQuoteStatus(sale.quote.status),
      dateTime: new Date(sale.createdAt).toLocaleString(),
      inHandDate: sale.inHandDate,
      customerTotal: customerTotal || 0,
    };
  }, []);

  const mapApiStatusToQuoteStatus = useCallback((apiStatus: string): iQuote['status'] => {
    switch (apiStatus) {
      case QuoteStatus.NEW_QUOTE:
        return 'new-quote';
      case QuoteStatus.QUOTE_SENT_TO_CUSTOMER:
        return 'quote-sent-to-customer';
      case QuoteStatus.QUOTE_CONVERTED_TO_ORDER:
      case QuoteStatus.CONVERTED_TO_ORDER_BY_CUSTOMER:
        return 'quote-converted-to-order';
      default:
        return 'new-quote';
    }
  }, []);

  const mapStatusFilterToApi = useCallback((filter: string): string[] => {
    switch (filter) {
      case 'new-quote':
        return [QuoteStatus.NEW_QUOTE];
      case 'quote-sent-to-customer':
        return [QuoteStatus.QUOTE_SENT_TO_CUSTOMER];
      case 'quote-converted-to-order':
        return [QuoteStatus.QUOTE_CONVERTED_TO_ORDER, QuoteStatus.CONVERTED_TO_ORDER_BY_CUSTOMER];
      default:
        return [];
    }
  }, []);

  const fetchQuotes = useCallback(async () => {
    if (loading) return;

    try {
      const requestBody: iApiSalesRequest = {
        isQuote: true,
        search: searchTerm || "",
        pageSize: rowsPerPage,
        pageIndex: currentPage - 1,
        website: "promotional_product_inc"
      };

      if (statusFilter !== "all") {
        const mappedStatuses = mapStatusFilterToApi(statusFilter);
        if (mappedStatuses.length > 0) {
          requestBody.quoteStatus = mappedStatuses;
        }
      }

      const response = await post("/Admin/SaleList/GetSalesList", requestBody) as iApiSalesResponse | null;

      if (response && response.sales) {
        const transformedQuotes = response.sales
          .map(transformApiSaleToQuote)
          .filter((quote): quote is iQuote => quote !== null);
        
        setQuotes(transformedQuotes);
        setTotalCount(response.count || 0);
      } else {
        setQuotes([]);
        setTotalCount(0);
      }
    } catch (error: any) {
      if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
        showToast.error("Error fetching quotes");
        setQuotes([]);
        setTotalCount(0);
      }
    } finally {
      setIsInitialLoad(false);
    }
  }, [searchTerm, statusFilter, currentPage, rowsPerPage, post, transformApiSaleToQuote, mapStatusFilterToApi, loading]);

  useEffect(() => {
    fetchQuotes();
  }, [searchTerm, statusFilter, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  const handleSubmit = async (formData: iQuoteFormData) => {
    try {
      if (isEditing && selectedQuote) {
        showToast.success("Quote updated successfully");
      } else {
        showToast.success("Quote created successfully");
      }

      await fetchQuotes();
      closeDrawer();
    } catch (error: any) {
      if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
        showToast.error("Error saving quote");
      }
    }
  };

  const openNewQuoteDrawer = () => {
    setIsEditing(false);
    setSelectedQuote(null);
    setIsDrawerOpen(true);
  };

  const openEditQuoteDrawer = (quote: iQuote) => {
    setIsEditing(true);
    setSelectedQuote(quote);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedQuote(null);
    setIsEditing(false);
  };

  return (
    <div className="quotes-page">
      <Header contextData={contextData} />
      
      <div className="p-2 space-y-2">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote
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
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && isInitialLoad ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6">
                      <LoadingState message="Loading quotes..." />
                    </td>
                  </tr>
                ) : quotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6">
                      <EmptyState
                        icon={FileText}
                        title="No quotes found"
                        description="Get started by creating your first quote."
                        hasSearch={!!searchTerm || statusFilter !== "all"}
                      />
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => {
                    const statusConfig = getStatusConfig(quote.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <tr
                        key={quote.id}
                        className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        onClick={() => openEditQuoteDrawer(quote)}
                      >
                        <td className="px-2 py-2">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 bg-gradient-to-br ${statusConfig.bgGradient} rounded-lg flex items-center justify-center`}>
                                <StatusIcon className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                ID: {quote.id}
                              </div>
                              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium mt-1 ${statusConfig.bgSolid} ${statusConfig.textColor}`}>
                                {statusConfig.label.enabled}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="font-medium">{quote.customer}</span>
                          </div>
                          <div className="text-xs text-gray-500 ml-4 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {quote.customerEmail}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-xs text-gray-900 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{quote.dateTime}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-xs text-gray-900">
                            {quote.inHandDate || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                            ${quote.customerTotal.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditQuoteDrawer(quote);
                            }}
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            iconOnly
                            title="View quote"
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
          title={isEditing ? "Edit Quote" : "Create New Quote"}
          size="xxl"
          loading={submitApi.loading}
        >
          <QuoteForm
            quote={selectedQuote}
            isEditing={isEditing}
            onSubmit={handleSubmit}
            loading={submitApi.loading}
          />
        </EntityDrawer>
      </div>
    </div>
  );
}