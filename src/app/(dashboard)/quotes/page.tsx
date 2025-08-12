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
import { iQuote, iQuoteFormData, iQuoteSearchParams } from "@/types/quotes";
import { showToast } from "@/components/ui/toast";
import { Header } from "@/components/layout/Header";
import { QuoteService } from "@/lib/api";
import { WebsiteType, QuoteStatus } from "@/types/enums";

const getStatusConfig = (status: iQuote["status"]) => {
  switch (status) {
    case QuoteStatus.NEW_QUOTE:
      return {
        enabled: true,
        label: { enabled: "New Quote", disabled: "New Quote" },
        icon: FileText,
        bgGradient: "from-blue-500 to-blue-600",
        bgSolid: "bg-blue-100",
        textColor: "text-blue-800",
      };
    case QuoteStatus.QUOTE_SENT_TO_CUSTOMER:
      return {
        enabled: true,
        label: { enabled: "Quote Sent", disabled: "Quote Sent" },
        icon: Send,
        bgGradient: "from-orange-500 to-orange-600",
        bgSolid: "bg-orange-100",
        textColor: "text-orange-800",
      };
    case QuoteStatus.QUOTE_CONVERTED_TO_ORDER:
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
        enabled: false,
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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedQuote, setSelectedQuote] = useState<iQuote | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const openNewQuoteDrawer = () => {
    setSelectedQuote(null);
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const params: iQuoteSearchParams = {
        isQuote: true,
        pageSize: rowsPerPage,
        pageIndex: currentPage,
        quoteStatus: selectedStatus === 'all' ? undefined : [selectedStatus],
        website: WebsiteType.PROMOTIONAL_PRODUCT_INC,
      };
      const response = await QuoteService.getQuotes(params);
      setQuotes(response.data);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      showToast.error('Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, currentPage, selectedStatus]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(0);
  };

  const handleSubmit = async (formData: iQuoteFormData) => {
    try {
      setFormLoading(true);
      if (isEditing && selectedQuote) {
        await QuoteService.updateQuote(selectedQuote.id, { status: formData.status });
        showToast.success('Quote updated successfully');
      } else {
        await QuoteService.createQuote(formData.customerId);
        showToast.success('Quote created successfully');
      }
      closeDrawer();
      fetchQuotes();
    } catch (error) {
      showToast.error('Failed to save quote');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditQuoteDrawer = (quote: iQuote) => {
    setSelectedQuote(quote);
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedQuote(null);
    setIsEditing(false);
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = currentPage * rowsPerPage + 1;
  const endIndex = Math.min((currentPage + 1) * rowsPerPage, totalCount);

  const { contextData } = useQuotesHeaderContext({
    totalCount,
    onAddNew: openNewQuoteDrawer,
    statusFilter: selectedStatus,
    onStatusFilterChange: setSelectedStatus,
    onRefresh: fetchQuotes,
    onExport: () => showToast.info('Export functionality coming soon')
  });

  // Update searchTerm when context changes
  useEffect(() => {
    if (contextData.searchTerm !== searchTerm) {
      setSearchTerm(contextData.searchTerm);
    }
  }, [contextData.searchTerm, searchTerm]);

  if (loading) {
    return <LoadingState message="Loading quotes..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        contextData={{
          totalCount: totalCount,
          searchTerm: searchTerm || '',
          onSearchChange: contextData.onSearchChange,
          onAddNew: openNewQuoteDrawer,
          filters: []
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {quotes?.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No quotes found"
            description="Get started by creating your first quote"
            hasSearch={false}
          />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {quotes?.map((quote) => {
                const statusConfig = getStatusConfig(quote.status);
                const customerName = quote.customer?.name || 'Unknown Customer';
                const customerEmail = quote.customer?.email || 'No email';
                const customerTotal = quote.customerEstimates?.total || 0;
                const inHandDate = quote.inHandDate;
                const createdAt = quote.createdAt;

                return (
                  <Card key={quote.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          #{quote.id}
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
                        <span>${customerTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditQuoteDrawer(quote)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditQuoteDrawer(quote)}
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
        title={isEditing ? `Edit Quote #${selectedQuote?.id}` : "New Quote"}
        size="xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="quote-form"
              loading={formLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? "Update Quote" : "Create Quote"}
            </Button>
          </div>
        }
      >
        <QuoteForm
          quote={selectedQuote}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          loading={formLoading}
        />
      </EntityDrawer>
    </div>
  );
}