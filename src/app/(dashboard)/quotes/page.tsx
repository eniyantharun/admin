"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Eye,
  Calendar,
  DollarSign,
  User,
  FileText,
  Mail,
  X,
  CheckCircle,
  Clock,
  Send,
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
import { QuoteForm } from "@/components/forms/QuoteForm";

interface Quote {
  id: number;
  quoteNumber: string;
  customer: string;
  customerEmail: string;
  status: "new-quote" | "quote-sent-to-customer" | "quote-converted-to-order";
  dateTime: string;
  inHandDate: string | null;
  customerTotal: number;
}

interface QuoteFormData {
  customer: string;
  customerEmail: string;
  status: string;
  customerTotal: string;
  inHandDate: string;
}

const mockQuotes: Quote[] = [
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
  {
    id: 10674,
    quoteNumber: "QUO-10674",
    customer: "Rosalie Poulin",
    customerEmail: "rosalie.poulin@example.com",
    status: "quote-sent-to-customer",
    dateTime: "7/11/2025 11:09:41 AM",
    inHandDate: null,
    customerTotal: 2580.0,
  },
  {
    id: 10672,
    quoteNumber: "QUO-10672",
    customer: "Kaitlin Zull",
    customerEmail: "kaitlin.zull@example.com",
    status: "quote-sent-to-customer",
    dateTime: "7/10/2025 1:21:10 PM",
    inHandDate: "8/28/2025",
    customerTotal: 598.0,
  },
  {
    id: 10671,
    quoteNumber: "QUO-10671",
    customer: "Natalia Valerin Jimenez",
    customerEmail: "natalia.jimenez@example.com",
    status: "quote-sent-to-customer",
    dateTime: "7/9/2025 3:44:42 PM",
    inHandDate: null,
    customerTotal: 1350.0,
  },
  {
    id: 10670,
    quoteNumber: "QUO-10670",
    customer: "Taylor Bullock",
    customerEmail: "taylor.bullock@example.com",
    status: "quote-sent-to-customer",
    dateTime: "7/9/2025 11:07:58 AM",
    inHandDate: null,
    customerTotal: 745.0,
  },
  {
    id: 10669,
    quoteNumber: "QUO-10669",
    customer: "Thomas Washburn",
    customerEmail: "thomas.washburn@example.com",
    status: "quote-converted-to-order",
    dateTime: "7/9/2025 9:47:36 AM",
    inHandDate: null,
    customerTotal: 1435.0,
  },
  {
    id: 10667,
    quoteNumber: "QUO-10667",
    customer: "Nick Ganz",
    customerEmail: "nick.ganz@example.com",
    status: "quote-converted-to-order",
    dateTime: "7/8/2025 9:49:11 PM",
    inHandDate: "8/23/2025",
    customerTotal: 302.9,
  },
];

const getStatusConfig = (status: Quote["status"]) => {
  switch (status) {
    case "new-quote":
      return {
        enabled: true,
        label: { enabled: "New Quote", disabled: "New Quote" },
        icon: FileText,
        color: "text-blue-600 bg-blue-100",
      };
    case "quote-sent-to-customer":
      return {
        enabled: true,
        label: { enabled: "Quote Sent", disabled: "Quote Sent" },
        icon: Send,
        color: "text-orange-600 bg-orange-100",
      };
    case "quote-converted-to-order":
      return {
        enabled: true,
        label: {
          enabled: "Converted to Order",
          disabled: "Converted to Order",
        },
        icon: CheckCircle,
        color: "text-green-600 bg-green-100",
      };
    default:
      return {
        enabled: true,
        label: { enabled: "Unknown", disabled: "Unknown" },
        icon: Clock,
        color: "text-gray-600 bg-gray-100",
      };
  }
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { get, post, put, loading } = useApi();
  const submitApi = useApi();

  const fetchQuotes = useCallback(async () => {
    if (!isInitialLoad && loading) return;

    try {
      let filteredQuotes = [...mockQuotes];

      if (localSearchTerm) {
        filteredQuotes = filteredQuotes.filter(
          (quote: Quote) =>
            quote.quoteNumber
              .toLowerCase()
              .includes(localSearchTerm.toLowerCase()) ||
            quote.customer
              .toLowerCase()
              .includes(localSearchTerm.toLowerCase()) ||
            quote.customerEmail
              .toLowerCase()
              .includes(localSearchTerm.toLowerCase())
        );
      }

      if (statusFilter !== "all") {
        filteredQuotes = filteredQuotes.filter(
          (quote: Quote) => quote.status === statusFilter
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
        console.error("Error fetching quotes:", error);
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
    fetchQuotes();
  }, [fetchQuotes]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [localSearchTerm, statusFilter]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  const handleSubmit = async (formData: QuoteFormData) => {
    try {
      if (isEditing && selectedQuote) {
        console.log("Updating quote:", selectedQuote.id, formData);
      } else {
        console.log("Creating quote:", formData);
      }

      await fetchQuotes();
      closeDrawer();
    } catch (error: any) {
      if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
        console.error("Error saving quote:", error);
      }
    }
  };

  const openNewQuoteDrawer = () => {
    setIsEditing(false);
    setSelectedQuote(null);
    setIsDrawerOpen(true);
  };

  const openEditQuoteDrawer = (quote: Quote) => {
    setIsEditing(true);
    setSelectedQuote(quote);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedQuote(null);
    setIsEditing(false);
  };

  const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  const clearLocalSearch = () => {
    setLocalSearchTerm("");
  };

  return (
    <div className="quotes-page space-y-6">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Quotes ({totalCount.toLocaleString()})
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search quotes..."
                  value={localSearchTerm}
                  onChange={handleLocalSearchChange}
                  className="w-full sm:w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Quotes</option>
                  <option value="new-quote">New Quotes</option>
                  <option value="quote-sent-to-customer">
                    Sent to Customer
                  </option>
                  <option value="quote-converted-to-order">
                    Converted to Order
                  </option>
                </select>
              </div>

              <Button
                onClick={openNewQuoteDrawer}
                icon={Plus}
                className=" shadow-lg"
              >
                Add Quote
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quote
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  In-Hand Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && isInitialLoad ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <LoadingState message="Loading quotes..." />
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <EmptyState
                      icon={FileText}
                      title="No quotes found"
                      description="Get started by creating your first quote."
                      hasSearch={!!localSearchTerm || statusFilter !== "all"}
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
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
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusConfig.color}`}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label.enabled}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{quote.customer}</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-5 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {quote.customerEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{quote.dateTime}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {quote.inHandDate || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                          ${quote.customerTotal.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
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
  );
}
