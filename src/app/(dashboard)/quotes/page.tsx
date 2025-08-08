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
import { iQuote, iQuoteFormData } from "@/types/quotes";
import { showToast } from "@/components/ui/toast";
import { Header } from "@/components/layout/Header";

const mockQuotes: iQuote[] = [
  {
    id: 10679,
    quoteNumber: "QUO-10679",
    customer: "Cynthia Bogucki",
    customerEmail: "cynthia.bogucki@example.com",
    status: "new-quote",
    dateTime: "7/18/2025 2:15:42 PM",
    inHandDate: "7/29/2025",
    customerTotal: 678.74,
  },
  {
    id: 10678,
    quoteNumber: "QUO-10678",
    customer: "Kathy Dennis",
    customerEmail: "kathy.dennis@example.com",
    status: "new-quote",
    dateTime: "7/18/2025 1:21:12 PM",
    inHandDate: "7/24/2025",
    customerTotal: 748.28,
  },
  {
    id: 10677,
    quoteNumber: "QUO-10677",
    customer: "Jake Mahon",
    customerEmail: "jake.mahon@example.com",
    status: "quote-sent-to-customer",
    dateTime: "7/15/2025 6:49:46 PM",
    inHandDate: "8/24/2025",
    customerTotal: 925.13,
  },
  {
    id: 10676,
    quoteNumber: "QUO-10676",
    customer: "Christina Johnson",
    customerEmail: "christina.johnson@example.com",
    status: "quote-sent-to-customer",
    dateTime: "7/15/2025 8:07:15 AM",
    inHandDate: "8/3/2025",
    customerTotal: 451.18,
  },
  {
    id: 10675,
    quoteNumber: "QUO-10675",
    customer: "Nic Hunter",
    customerEmail: "nic.hunter@example.com",
    status: "quote-converted-to-order",
    dateTime: "7/14/2025 11:48:49 AM",
    inHandDate: "7/30/2025",
    customerTotal: 556.0,
  },
];

const getStatusConfig = (status: iQuote["status"]) => {
  switch (status) {
    case "new-quote":
      return {
        enabled: true,
        label: { enabled: "New Quote", disabled: "New Quote" },
        icon: FileText,
        bgGradient: "from-blue-500 to-blue-600",
        bgSolid: "bg-blue-100",
        textColor: "text-blue-800",
      };
    case "quote-sent-to-customer":
      return {
        enabled: true,
        label: { enabled: "Quote Sent", disabled: "Quote Sent" },
        icon: Send,
        bgGradient: "from-orange-500 to-orange-600",
        bgSolid: "bg-orange-100",
        textColor: "text-orange-800",
      };
    case "quote-converted-to-order":
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

  const { get, post, put, loading } = useApi();
  const submitApi = useApi();

  // Header context with filters and actions
  const { contextData, searchTerm } = useQuotesHeaderContext({
    totalCount,
    onAddNew: () => openNewQuoteDrawer(),
    statusFilter,
    onStatusFilterChange: setStatusFilter,
  });

  const fetchQuotes = useCallback(async () => {
    if (!isInitialLoad && loading) return;

    try {
      let filteredQuotes = [...mockQuotes];

      if (searchTerm) {
        filteredQuotes = filteredQuotes.filter(
          (quote: iQuote) =>
            quote.quoteNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            quote.customer
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            quote.customerEmail
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== "all") {
        filteredQuotes = filteredQuotes.filter(
          (quote: iQuote) => quote.status === statusFilter
        );
      }

      const startIndex = (currentPage - 1) * rowsPerPage;
      const paginatedQuotes = filteredQuotes.slice(
        startIndex,
        startIndex + rowsPerPage
      );

      setQuotes(paginatedQuotes);
      setTotalCount(filteredQuotes.length);
    } catch (error: any) {
      if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
        showToast.error("Error fetching quotes");
      }
    } finally {
      setIsInitialLoad(false);
    }
  }, [
    searchTerm,
    statusFilter,
    currentPage,
    rowsPerPage,
    loading,
    isInitialLoad,
  ]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

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
      
      <div className="p-6 space-y-4">
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
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 bg-gradient-to-br ${statusConfig.bgGradient} rounded-lg flex items-center justify-center`}>
                                <StatusIcon className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {quote.quoteNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {quote.id}
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