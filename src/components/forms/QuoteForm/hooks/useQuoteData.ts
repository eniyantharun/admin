import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';
import { iCustomer, iCustomerAddress } from '@/types/customer';
import { iQuote, iQuoteFormData, LineItemData, SaleSummary, QuoteDetailsResponse } from '@/types/quotes';
import { documentFormatToHtml } from '@/lib/documentConverter';

export const useQuoteData = (
  quote: iQuote | null | undefined,
  isEditing: boolean,
  formData: iQuoteFormData,
  setFormData: React.Dispatch<React.SetStateAction<iQuoteFormData>>,
  setCustomerAddresses: React.Dispatch<React.SetStateAction<iCustomerAddress[]>>
) => {
  const [selectedCustomer, setSelectedCustomer] = useState<iCustomer | null>(null);
  const [lineItems, setLineItems] = useState<LineItemData[]>([]);
  const [saleSummary, setSaleSummary] = useState<SaleSummary | null>(null);
  const [isLoadingLineItems, setIsLoadingLineItems] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetailsResponse | null>(null);
  const [currentSaleId, setCurrentSaleId] = useState<string>('');

  const { get, post } = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  const fetchCustomerAddresses = useCallback(async (customerId: string) => {
    try {
      const response = await get(`/Admin/CustomerEditor/GetCustomerById?customerId=${customerId}`);
      if (response?.addresses) {
        setCustomerAddresses(response.addresses);
      }
    } catch (error) {
      console.error('Error fetching customer addresses:', error);
      showToast.error('Failed to load customer addresses');
    }
  }, [get, setCustomerAddresses]);

  const transformApiLineItem = (apiItem: any): LineItemData => ({
    id: apiItem.id,
    productName: apiItem.form?.productName || '',
    variantName: apiItem.form?.variantName || '',
    methodName: apiItem.form?.methodName || '',
    color: apiItem.form?.color || '',
    quantity: apiItem.form?.quantity || 1,
    productItemNumber: apiItem.form?.productItemNumber || '',
    supplierItemNumber: apiItem.form?.supplierItemNumber || '',
    customerPricePerQuantity: apiItem.form?.customerPricePerQuantity || 0,
    customerSetupCharge: apiItem.form?.customerSetupCharge || 0,
    supplierPricePerQuantity: apiItem.form?.supplierPricePerQuantity || 0,
    supplierSetupCharge: apiItem.form?.supplierSetupCharge || 0,
    artworkText: apiItem.form?.artworkText || '',
    artworkSpecialInstructions: apiItem.form?.artworkSpecialInstructions || '',
    images: [],
    selectedProduct: apiItem.product || null,
    variantId: apiItem.form?.variantId,
    methodId: apiItem.form?.methodId,
    colorId: apiItem.form?.colorId
  });

  const fetchQuoteDetails = async (quoteId: number) => {
  setIsLoadingLineItems(true);
  try {
    const response = await get(`/Admin/SaleEditor/GetQuoteDetail?id=${quoteId}`) as QuoteDetailsResponse;
    
    if (response?.quote?.sale) {
      // Set the quote details first
      setQuoteDetails(response);
      setCurrentSaleId(response.quote.saleId);
      
      // Log the notesId to confirm it's being received
      console.log('Fetched quote details with notesId:', response.quote.sale.notesId);
      
      // Transform line items
      if (response.quote.sale.lineItems && Array.isArray(response.quote.sale.lineItems)) {
        const transformedItems = response.quote.sale.lineItems
          .filter(item => item.form?.productName)
          .map(transformApiLineItem);
        
        setLineItems(transformedItems);
      } else {
        setLineItems([]);
      }

      // Calculate summary
      const customerTotal = response.quote.sale.lineItems.reduce((sum, item) => sum + item.customerEstimates.total, 0);
      const supplierTotal = response.quote.sale.lineItems.reduce((sum, item) => sum + item.supplierEstimates.total, 0);
      const profit = customerTotal - supplierTotal;

      setSaleSummary({
        customerSummary: {
          itemsTotal: customerTotal,
          setupCharge: response.quote.sale.lineItems.reduce((sum, item) => sum + item.customerEstimates.setupCharge, 0),
          subTotal: customerTotal,
          total: customerTotal
        },
        totalSupplierSummary: {
          itemsTotal: supplierTotal,
          setupCharge: response.quote.sale.lineItems.reduce((sum, item) => sum + item.supplierEstimates.setupCharge, 0),
          subTotal: supplierTotal,
          total: supplierTotal
        },
        profit: profit
      });

      // Update form data including notes from comments if available
      const latestComment = response.quote.sale.comments?.[0]?.comment || '';
      
      setFormData(prev => ({
        ...prev,
        customerTotal: customerTotal.toString(),
        inHandDate: response.quote.sale.dates.inHandDate || '',
        notes: latestComment, // You might want to load actual notes content from the document
      }));

      // Set customer data
      const customer = response.quote.sale.customer;
      const customerData: iCustomer = {
        id: customer.id,
        idNum: customer.idNum,
        firstName: customer.form.firstName,
        lastName: customer.form.lastName,
        email: customer.form.email,
        phone: customer.form.phoneNumber || '',
        website: customer.website,
        companyName: customer.form.companyName || '',
        isBlocked: false,
        isBusinessCustomer: !!customer.form.companyName,
        createdAt: customer.createdAt,
      };
      setSelectedCustomer(customerData);

      // Fetch customer addresses
      if (customer.id) {
        await fetchCustomerAddresses(customer.id);
      }

      // Set addresses
      const billing = response.quote.sale.billingAddress;
      const shipping = response.quote.sale.shippingAddress;

      if (billing.addressLine) {
        setFormData(prev => ({
          ...prev,
          billingAddress: {
            type: 'billing' as const,
            label: 'Billing Address',
            name: billing.name,
            street: billing.addressLine,
            city: billing.city,
            state: billing.state,
            zipCode: billing.zipCode,
            country: billing.country || 'US',
            isPrimary: true,
          }
        }));
      }

      if (shipping.addressLine) {
        setFormData(prev => ({
          ...prev,
          shippingAddress: {
            type: 'shipping' as const,
            label: 'Shipping Address',
            name: shipping.name,
            street: shipping.addressLine,
            city: shipping.city,
            state: shipping.state,
            zipCode: shipping.zipCode,
            country: shipping.country || 'US',
            isPrimary: false,
          }
        }));
      }
    }
    if (response.quote.sale.notesId) {
  const notesContent = await loadNotesContent(response.quote.sale.notesId);
  setFormData(prev => ({
    ...prev,
    notes: notesContent
  }));
}
    
  } catch (error) {
    console.error('Error fetching quote details:', error);
    showToast.error('Failed to load quote details');
    setLineItems([]);
    setSaleSummary(null);
  } finally {
    setIsLoadingLineItems(false);
  }
};

const loadNotesContent = useCallback(async (documentId: string) => {
  if (!documentId) return '';
  
  try {
    const response = await get(`/Admin/Document/GetDocument?documentId=${documentId}`);
    if (response?.content) {
      // Convert document format back to HTML for the editor
      return documentFormatToHtml(response.content);
    }
    return '';
  } catch (error) {
    console.error('Failed to load notes content:', error);
    return '';
  }
}, [get]);


  const fetchSaleSummary = useCallback(async () => {
    if (!currentSaleId) return;
    
    try {
      const response = await post(`https://api.promowe.com/Admin/SaleEditor/GetSaleSummary?saleId=${currentSaleId}`);
      if (response) {
        setSaleSummary(response);
        setFormData(prev => ({
          ...prev,
          customerTotal: response.customerSummary.total.toString()
        }));
      }
    } catch (error) {
      console.error('Failed to fetch sale summary:', error);
      showToast.error('Failed to fetch sale summary');
    }
  }, [currentSaleId, post, setFormData]);

  const handleAddEmptyLineItem = async () => {
    if (!currentSaleId) {
      showToast.error('No sale ID available to add line item');
      return;
    }

    try {
      const response = await post('/Admin/SaleEditor/AddEmptyLineItem', {
        saleId: currentSaleId
      });
      
      if (response && response.lineItems) {
        const newItems: LineItemData[] = response.lineItems.map(transformApiLineItem);
        setLineItems(newItems);
        await fetchSaleSummary();
        showToast.success('Line item added successfully');
      }
    } catch (error) {
      console.error('Failed to add line item:', error);
      showToast.error('Failed to add line item');
    }
  };

  const handleUpdateLineItem = async (itemId: string, updatedItem: LineItemData) => {
    setLineItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
    await fetchSaleSummary();
  };

  const handleRemoveLineItem = async (itemId: string) => {
    if (!currentSaleId) {
      showToast.error('No sale ID available to remove line item');
      return;
    }

    try {
      const response = await post('/Admin/SaleEditor/RemoveLineItems', {
        saleId: currentSaleId,
        lineItemIds: [itemId]
      });
      
      if (response && response.lineItems) {
        const updatedItems: LineItemData[] = response.lineItems.map(transformApiLineItem);
        setLineItems(updatedItems);
        await fetchSaleSummary();
        showToast.success('Line item removed successfully');
      }
    } catch (error) {
      showToast.error('Failed to remove line item');
    }
  };

  useEffect(() => {
    if (isEditing && quote) {
      // Use the actual quote ID instead of a hardcoded value
      fetchQuoteDetails(quote.id);
      
      setFormData({
        customer: quote.customer,
        customerEmail: quote.customerEmail,
        status: quote.status,
        customerTotal: quote.customerTotal.toString(),
        inHandDate: quote.inHandDate || '',
        notes: quote.notes || '',
        billingAddress: {
          type: 'billing' as const,
          label: '',
          name: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US',
          isPrimary: false,
        },
        shippingAddress: {
          type: 'shipping' as const,
          label: '',
          name: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US',
          isPrimary: false,
        },
        sameAsShipping: false,
      });
    } else {
      // For new quotes, start with empty form
      setSelectedCustomer(null);
      setFormData(prev => ({
        ...prev,
        customer: '',
        customerEmail: '',
      }));
      setLineItems([]);
      setSaleSummary(null);
      setQuoteDetails(null);
      setCurrentSaleId('');
    }
  }, [quote, isEditing]);

  return {
    selectedCustomer,
    setSelectedCustomer,
    lineItems,
    setLineItems,
    saleSummary,
    setSaleSummary,
    isLoadingLineItems,
    quoteDetails,
    currentSaleId,
    handleAddEmptyLineItem,
    handleUpdateLineItem,
    handleRemoveLineItem,
    fetchSaleSummary,
    fetchCustomerAddresses
  };
};