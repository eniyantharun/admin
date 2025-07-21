'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Eye, Calendar, DollarSign, User, FileText, Mail, X, CheckCircle, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useApi } from '@/hooks/useApi';
import { usePageSearch, useSearch } from '@/contexts/SearchContext';

// Import helper components
import { StatusBadge } from '@/components/helpers/StatusBadge';
import { DateDisplay } from '@/components/helpers/DateDisplay';
import { EmptyState, LoadingState } from '@/components/helpers/EmptyLoadingStates';
import { FormInput } from '@/components/helpers/FormInput';
import { PaginationControls } from '@/components/helpers/PaginationControls';
import { SearchStatusIndicator } from '@/components/helpers/SearchStatusIndicator';

interface Quote {
  id: number;
  quoteNumber: string;
  customer: string;
  customerEmail: string;
  status: 'new-quote' | 'quote-sent-to-customer' | 'quote-converted-to-order';
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
    quoteNumber: 'QUO-10679',
    customer: 'Cynthia Bogucki',
    customerEmail: 'cynthia.bogucki@example.com',
    status: 'new-quote',
    dateTime: '7/18/2025 2:15:42 PM',
    inHandDate: '7/29/2025',
    customerTotal: 678.74
  },
  {
    id: 10678,
    quoteNumber: 'QUO-10678',
    customer: 'Kathy Dennis',
    customerEmail: 'kathy.dennis@example.com',
    status: 'new-quote',
    dateTime: '7/18/2025 1:21:12 PM',
    inHandDate: '7/24/2025',
    customerTotal: 748.28
  },
  {
    id: 10677,
    quoteNumber: 'QUO-10677',
    customer: 'Jake Mahon',
    customerEmail: 'jake.mahon@example.com',
    status: 'quote-sent-to-customer',
    dateTime: '7/15/2025 6:49:46 PM',
    inHandDate: '8/24/2025',
    customerTotal: 925.13
  },
  {
    id: 10676,
    quoteNumber: 'QUO-10676',
    customer: 'Christina Johnson',
    customerEmail: 'christina.johnson@example.com',
    status: 'quote-sent-to-customer',
    dateTime: '7/15/2025 8:07:15 AM',
    inHandDate: '8/3/2025',
    customerTotal: 451.18
  },
  {
    id: 10675,
    quoteNumber: 'QUO-10675',
    customer: 'Nic Hunter',
    customerEmail: 'nic.hunter@example.com',
    status: 'quote-converted-to-order',
    dateTime: '7/14/2025 11:48:49 AM',
    inHandDate: '7/30/2025',
    customerTotal: 556.00
  },
  {
    id: 10674,
    quoteNumber: 'QUO-10674',
    customer: 'Rosalie Poulin',
    customerEmail: 'rosalie.poulin@example.com',
    status: 'quote-sent-to-customer',
    dateTime: '7/11/2025 11:09:41 AM',
    inHandDate: null,
    customerTotal: 2580.00
  },
  {
    id: 10672,
    quoteNumber: 'QUO-10672',
    customer: 'Kaitlin Zull',
    customerEmail: 'kaitlin.zull@example.com',
    status: 'quote-sent-to-customer',
    dateTime: '7/10/2025 1:21:10 PM',
    inHandDate: '8/28/2025',
    customerTotal: 598.00
  },
  {
    id: 10671,
    quoteNumber: 'QUO-10671',
    customer: 'Natalia Valerin Jimenez',
    customerEmail: 'natalia.jimenez@example.com',
    status: 'quote-sent-to-customer',
    dateTime: '7/9/2025 3:44:42 PM',
    inHandDate: null,
    customerTotal: 1350.00
  },
  {
    id: 10670,
    quoteNumber: 'QUO-10670',
    customer: 'Taylor Bullock',
    customerEmail: 'taylor.bullock@example.com',
    status: 'quote-sent-to-customer',
    dateTime: '7/9/2025 11:07:58 AM',
    inHandDate: null,
    customerTotal: 745.00
  },
  {
    id: 10669,
    quoteNumber: 'QUO-10669',
    customer: 'Thomas Washburn',
    customerEmail: 'thomas.washburn@example.com',
    status: 'quote-converted-to-order',
    dateTime: '7/9/2025 9:47:36 AM',
    inHandDate: null,
    customerTotal: 1435.00
  },
  {
    id: 10667,
    quoteNumber: 'QUO-10667',
    customer: 'Nick Ganz',
    customerEmail: 'nick.ganz@example.com',
    status: 'quote-converted-to-order',
    dateTime: '7/8/2025 9:49:11 PM',
    inHandDate: '8/23/2025',
    customerTotal: 302.90
  }
];

const getStatusConfig = (status: Quote['status']) => {
  switch (status) {
    case 'new-quote':
      return { 
        enabled: true, 
        label: { enabled: 'New Quote', disabled: 'New Quote' },
        icon: FileText,
        color: 'text-blue-600 bg-blue-100'
      };
    case 'quote-sent-to-customer':
      return { 
        enabled: true, 
        label: { enabled: 'Quote Sent', disabled: 'Quote Sent' },
        icon: Send,
        color: 'text-orange-600 bg-orange-100'
      };
    case 'quote-converted-to-order':
      return { 
        enabled: true, 
        label: { enabled: 'Converted to Order', disabled: 'Converted to Order' },
        icon: CheckCircle,
        color: 'text-green-600 bg-green-100'
      };
    default:
      return { 
        enabled: true, 
        label: { enabled: 'Unknown', disabled: 'Unknown' },
        icon: Clock,
        color: 'text-gray-600 bg-gray-100'
      };
  }
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<QuoteFormData>({
    customer: '',
    customerEmail: '',
    status: 'new-quote',
    customerTotal: '0',
    inHandDate: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<QuoteFormData>>({});

  const { get, post, put, loading } = useApi();
  const submitApi = useApi();
  
  const { searchQuery, setSearchResults } = useSearch();

  const handleGlobalSearch = useCallback(async (query: string) => {
    try {
      const filteredQuotes = mockQuotes.filter((quote: Quote) =>
        quote.quoteNumber.toLowerCase().includes(query.toLowerCase()) ||
        quote.customer.toLowerCase().includes(query.toLowerCase()) ||
        quote.customerEmail.toLowerCase().includes(query.toLowerCase())
      );
      
      const searchResults = filteredQuotes.map((quote: Quote) => ({
        id: quote.id.toString(),
        title: quote.quoteNumber,
        subtitle: `${quote.customer} - ${quote.customerTotal.toFixed(2)}`,
        description: `${quote.status.replace(/-/g, ' ')} • ${quote.dateTime}`,
        type: 'quote',
        data: quote
      }));
      
      setSearchResults(searchResults);
    } catch (error) {
      console.error('Error searching quotes:', error);
      setSearchResults([]);
    }
  }, [setSearchResults]);

  usePageSearch({
    placeholder: 'Search quotes by number, customer, or email...',
    enabled: true,
    searchFunction: handleGlobalSearch,
    filters: [
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'all', label: 'All Quotes' },
          { value: 'new-quote', label: 'New Quotes' },
          { value: 'quote-sent-to-customer', label: 'Sent to Customer' },
          { value: 'quote-converted-to-order', label: 'Converted to Order' }
        ]
      }
    ]
  });

  const effectiveSearchTerm = searchQuery || localSearchTerm;

  const fetchQuotes = useCallback(async () => {
    if (!isInitialLoad && loading) return;

    try {
      let filteredQuotes = [...mockQuotes];
      
      if (effectiveSearchTerm) {
        filteredQuotes = filteredQuotes.filter((quote: Quote) =>
          quote.quoteNumber.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
          quote.customer.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
          quote.customerEmail.toLowerCase().includes(effectiveSearchTerm.toLowerCase())
        );
      }

      if (statusFilter !== 'all') {
        filteredQuotes = filteredQuotes.filter((quote: Quote) => quote.status === statusFilter);
      }
      
      const startIndex = (currentPage - 1) * rowsPerPage;
      const paginatedQuotes = filteredQuotes.slice(startIndex, startIndex + rowsPerPage);
      
      setQuotes(paginatedQuotes);
      setTotalCount(filteredQuotes.length);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setIsInitialLoad(false);
    }
  }, [effectiveSearchTerm, statusFilter, currentPage, rowsPerPage, loading, isInitialLoad]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [effectiveSearchTerm, statusFilter]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  const validateForm = (): boolean => {
    const errors: Partial<QuoteFormData> = {};
    
    if (!formData.customer.trim()) errors.customer = 'Customer is required';
    if (!formData.customerEmail.trim()) {
      errors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      errors.customerEmail = 'Email is invalid';
    }
    const customerTotal = parseFloat(formData.customerTotal);
    if (isNaN(customerTotal) || customerTotal <= 0) errors.customerTotal = 'Customer total must be greater than 0';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isEditing && selectedQuote) {
        console.log('Updating quote:', selectedQuote.id, formData);
      } else {
        console.log('Creating quote:', formData);
      }

      await fetchQuotes();
      closeModal();
    } catch (error) {
      console.error('Error saving quote:', error);
    }
  };

  const openNewQuoteModal = () => {
    setFormData({
      customer: '',
      customerEmail: '',
      status: 'new-quote',
      customerTotal: '0',
      inHandDate: ''
    });
    setFormErrors({});
    setIsEditing(false);
    setSelectedQuote(null);
    setIsModalOpen(true);
  };

  const openEditQuoteModal = (quote: Quote) => {
    setFormData({
      customer: quote.customer,
      customerEmail: quote.customerEmail,
      status: quote.status,
      customerTotal: quote.customerTotal.toString(),
      inHandDate: quote.inHandDate || ''
    });
    setFormErrors({});
    setIsEditing(true);
    setSelectedQuote(quote);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuote(null);
    setIsEditing(false);
    setFormData({
      customer: '',
      customerEmail: '',
      status: 'new-quote',
      customerTotal: '0',
      inHandDate: ''
    });
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    if (formErrors[name as keyof QuoteFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="quotes-page space-y-4">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Quotes ({totalCount.toLocaleString()})
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {searchQuery && <SearchStatusIndicator query={searchQuery} />}
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Quotes</option>
                  <option value="new-quote">New Quotes</option>
                  <option value="quote-sent-to-customer">Sent to Customer</option>
                  <option value="quote-converted-to-order">Converted to Order</option>
                </select>
                <Button
                  onClick={openNewQuoteModal}
                  icon={Plus}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  New Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In-Hand Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                      hasSearch={!!effectiveSearchTerm || statusFilter !== 'all'}
                    />
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => {
                  const statusConfig = getStatusConfig(quote.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors duration-150">
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
                            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusConfig.color}`}>
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
                          {quote.inHandDate || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${quote.customerTotal.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Button
                          onClick={() => openEditQuoteModal(quote)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 pt-20 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[calc(100vh-5rem)] overflow-y-auto my-4">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Edit Quote" : "Create New Quote"}
              </h3>
              <Button
                onClick={closeModal}
                variant="secondary"
                size="sm"
                icon={X}
                iconOnly
                disabled={submitApi.loading}
              />
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Customer Name"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  error={formErrors.customer}
                  required
                  placeholder="Enter customer name"
                />

                <FormInput
                  label="Customer Email"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  error={formErrors.customerEmail}
                  required
                  placeholder="customer@example.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-input-group">
                  <label className="form-label block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="new-quote">New Quote</option>
                    <option value="quote-sent-to-customer">Quote Sent to Customer</option>
                    <option value="quote-converted-to-order">Quote Converted to Order</option>
                  </select>
                </div>

                <FormInput
                  label="Customer Total"
                  name="customerTotal"
                  type="number"
                  value={formData.customerTotal}
                  onChange={handleInputChange}
                  error={formErrors.customerTotal}
                  required
                  placeholder="0.00"
                />
              </div>

              <FormInput
                label="In-Hand Date"
                name="inHandDate"
                type="date"
                value={formData.inHandDate}
                onChange={handleInputChange}
                helpText="Expected delivery date (optional)"
              />

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="secondary"
                  disabled={submitApi.loading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitApi.loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {isEditing ? "Update Quote" : "Create Quote"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}