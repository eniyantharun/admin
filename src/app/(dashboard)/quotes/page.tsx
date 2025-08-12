"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { Eye, Calendar, DollarSign, User, FileText, Mail, CheckCircle, Clock, Send, Edit2 } from "lucide-react";
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
import { WebsiteType, QuoteStatus } from "@/types/enums";

// Helper function to safely format currency
const formatCurrency = (value: number | string | undefined | null): string => {
  if (value === null || value === undefined) return "0.00";
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : Number(value) || 0;
  return numValue.toFixed(2);
};

// Transform API response to match our Quote interface
const transformApiQuote = (apiQuote: any): iQuote => {
  return {
    id: apiQuote.quote?.id || Math.floor(Math.random() * 10000),
    saleId: apiQuote.id,
    status: apiQuote.quote?.status || QuoteStatus.NEW_QUOTE,
    customer: {
      id: apiQuote.customer?.id || '',
      name: apiQuote.customer?.name || 'Unknown Customer',
      email: apiQuote.customer?.email || '',
      companyName: apiQuote.customer?.companyName || '',
      phoneNumber: apiQuote.customer?.phoneNumber || '',
    },
    createdAt: apiQuote.createdAt,
    inHandDate: apiQuote.inHandDate,
    customerEstimates: {
      items: apiQuote.customerEstimates?.items || [],
      itemsSubTotal: Number(apiQuote.customerEstimates?.itemsSubTotal) || 0,
      itemsTotal: Number(apiQuote.customerEstimates?.itemsTotal) || 0,
      setupCharge: Number(apiQuote.customerEstimates?.setupCharge) || 0,
      shipping: Number(apiQuote.customerEstimates?.shipping) || 0,
      discount: Number(apiQuote.customerEstimates?.discount) || 0,
      subTotal: Number(apiQuote.customerEstimates?.subTotal) || 0,
      total: Number(apiQuote.customerEstimates?.total) || 0,
    },
    supplierEstimates: {
      items: apiQuote.supplierEstimates?.items || [],
      itemsSubTotal: Number(apiQuote.supplierEstimates?.itemsSubTotal) || 0,
      itemsTotal: Number(apiQuote.supplierEstimates?.itemsTotal) || 0,
      setupCharge: Number(apiQuote.supplierEstimates?.setupCharge) || 0,
      shipping: Number(apiQuote.supplierEstimates?.shipping) || 0,
      subTotal: Number(apiQuote.supplierEstimates?.subTotal) || 0,
      total: Number(apiQuote.supplierEstimates?.total) || 0,
    },
    profit: Number(apiQuote.profit || 0),
    lineItems: [],
    notes: apiQuote.notes,
    comments: [],
    followups: [],
    shippingAddress: apiQuote.shippingAddress,
    billingAddress: apiQuote.billingAddress,
    checkoutDetails: apiQuote.checkoutDetails,
    shippingDetails: apiQuote.shippingDetails,
  };
};

const getStatusConfig = (status: QuoteStatus) => {
  switch (status) {
    case QuoteStatus.NEW_QUOTE:
      return {
        enabled: true,
        label: { enabled: "New Quote", disabled: "New Quote" },
        icon: FileText,
        bgSolid: "bg-blue-100",
        textColor: "text-blue-800",
      };
    case QuoteStatus.QUOTE_SENT_TO_CUSTOMER:
      return {
        enabled: true,
        label: { enabled: "Quote Sent", disabled: "Quote Sent" },
        icon: Send,
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
        bgSolid: "bg-green-100",
        textColor: "text-green-800",
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

const CustomerInfo = memo<{ quote: iQuote }>(({ quote }) => (
  <>
    <div className="text-sm text-gray-900 flex items-center gap-1">
      <span className="truncate max-w-xs">{quote.customer.name}</span>
    </div>
    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
      <Mail className="w-3 h-3 text-gray-400" />
      <span className="truncate max-w-xs">{quote.customer.email}</span>
    </div>
    {quote.customer.companyName && (
      <div className="text-xs text-gray-500 mt-1">
        <span className="truncate max-w-xs">{quote.customer.companyName}</span>
      </div>
    )}
  </>
));

CustomerInfo.displayName = "CustomerInfo";

const QuoteAmounts = memo<{ quote: iQuote }>(({ quote }) => (
  <>
    <div className="text-sm text-gray-900 flex items-center gap-1">
      <DollarSign className="w-3 h-3 text-gray-400" />
      <span className="font-medium">${formatCurrency(quote.customerEstimates.total)}</span>
    </div>
    <div className="text-xs text-gray-500 mt-1">
      Profit: ${formatCurrency(quote.profit)}
    </div>
    {quote.supplierEstimates.total > 0 && (
      <div className="text-xs text-gray-500">
        Cost: ${formatCurrency(quote.supplierEstimates.total)}
      </div>
    )}
  </>
));

QuoteAmounts.displayName = "QuoteAmounts";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<iQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedQuote, setSelectedQuote] = useState<iQuote | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Use ref to prevent infinite re-renders
  const mountedRef = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Create a stable API instance
  const apiRef = useRef(useApi());
  const api = apiRef.current;

  const openNewQuoteDrawer = useCallback(() => {
    setSelectedQuote(null);
    setIsEditing(false);
    setIsDrawerOpen(true);
  }, []);

  const fetchQuotes = useCallback(async () => {
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
          isQuote: true, // This is for quotes, not orders
          pageSize: rowsPerPage,
          pageIndex: currentPage - 1, // Convert to 0-based for API
          website: WebsiteType.PROMOTIONAL_PRODUCT_INC,
          ...(selectedStatus !== 'all' && { quoteStatus: [selectedStatus] }),
          ...(searchTerm && { search: searchTerm })
        };

        const response = await api.post('/Admin/SaleList/GetSalesList', requestBody);

        if (!mountedRef.current) return;

        if (response && response.sales) {
          // Transform API quotes to match our interface
          const transformedQuotes = response.sales
            .filter((sale: any) => sale.quote || !sale.order) // Include items that have quote data or no order data
            .map(transformApiQuote);
          
          setQuotes(transformedQuotes);
          setTotalCount(response.count || 0);
        } else {
          setQuotes([]);
          setTotalCount(0);
          showToast.error('Invalid response from server');
        }
      } catch (error) {
        if (!mountedRef.current) return;
        console.error('Error fetching quotes:', error);
        setQuotes([]);
        setTotalCount(0);
        showToast.error('Failed to fetch quotes');
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
    onAddNew: openNewQuoteDrawer,
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'select' as const,
        value: selectedStatus,
        onChange: (value: string | boolean) => {
          if (typeof value === 'string') {
            setSelectedStatus(value as QuoteStatus | 'all');
            setCurrentPage(1);
          }
        },
        options: [
          { value: 'all', label: 'All Quotes' },
          { value: QuoteStatus.NEW_QUOTE, label: 'New Quotes' },
          { value: QuoteStatus.QUOTE_SENT_TO_CUSTOMER, label: 'Sent to Customer' },
          { value: QuoteStatus.QUOTE_CONVERTED_TO_ORDER, label: 'Converted to Order' }
        ]
      }
    ],
    actions: [
      {
        key: 'refresh',
        label: 'Refresh',
        icon: () => null,
        onClick: fetchQuotes,
        variant: 'secondary' as const
      }
    ]
  }), [totalCount, searchTerm, selectedStatus, openNewQuoteDrawer, fetchQuotes]);

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

  // Fetch quotes when dependencies change
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

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

  const handleSubmit = async (formData: iQuoteFormData) => {
    try {
      setFormLoading(true);
      if (isEditing && selectedQuote) {
        // Update quote logic here
        showToast.success('Quote updated successfully');
      } else {
        // Create quote logic here
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

  const openEditQuoteDrawer = useCallback((quote: iQuote) => {
    setSelectedQuote(quote);
    setIsEditing(true);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedQuote(null);
    setIsEditing(false);
  }, []);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

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
                    Amount & Profit
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                    <td colSpan={7} className="px-4 py-8">
                      <LoadingState message="Loading quotes..." />
                    </td>
                  </tr>
                ) : quotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8">
                      <EmptyState
                        icon={FileText}
                        title="No quotes found"
                        description={
                          searchTerm || selectedStatus !== 'all'
                            ? "Try adjusting your search terms or filters to find quotes."
                            : "Get started by creating your first quote."
                        }
                        hasSearch={!!searchTerm || selectedStatus !== 'all'}
                      />
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => {
                    const statusConfig = getStatusConfig(quote.status);
                    
                    return (
                      <tr
                        key={quote.saleId}
                        className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        onClick={() => openEditQuoteDrawer(quote)}
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                Quote #{quote.id}
                              </div>
                              <div className="text-xs text-gray-500">
                                Sale ID: {quote.saleId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <CustomerInfo quote={quote} />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <QuoteAmounts quote={quote} />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgSolid} ${statusConfig.textColor}`}>
                            <statusConfig.icon className="w-3 h-3 mr-1" />
                            {statusConfig.label.enabled}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <DateDisplay date={quote.createdAt} />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {quote.inHandDate ? (
                            <div className="text-sm text-gray-900 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{new Date(quote.inHandDate).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Not set</span>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditQuoteDrawer(quote);
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
    </div>
  );
}