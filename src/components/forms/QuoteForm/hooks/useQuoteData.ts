import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';
import { iCustomer, iCustomerAddress } from '@/types/customer';
import { iQuote, iQuoteFormData, LineItemData, SaleSummary, QuoteDetailsResponse, ProductPicture } from '@/types/quotes';
import { documentFormatToHtml } from '@/lib/documentConverter';

interface CreateQuoteResponse {
  saleId: string;
  id: number;
}

interface SetSaleDetailRequest {
  saleId: string;
  addresses: {
    billing: {
      addressLine: string;
      city: string;
      state: string;
      addressLine2: string;
      country: string;
      name: string;
      zipCode: string;
    };
    shipping?: {
      addressLine: string;
      city: string;
      state: string;
      addressLine2: string;
      country: string;
      name: string;
      zipCode: string;
    };
  };
}

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
    colorId: apiItem.form?.colorId,
    // Handle image data from API response
    sourceUri: apiItem.sourceUri || null,
    customPicture: apiItem.customPicture || null
  });

  const loadNotesContent = useCallback(async (documentId: string): Promise<string> => {
    if (!documentId) {
      console.log('No documentId provided to loadNotesContent');
      return '';
    }
    
    try {
      console.log('Loading notes content for documentId:', documentId);
      const response = await get(`/Admin/Document/GetDocumentDetail?documentId=${documentId}`);
      
      if (response?.content) {
        console.log('Raw notes API response:', response.content);
        
        const htmlContent = documentFormatToHtml(response.content);
        console.log('Converted notes HTML:', htmlContent);
        
        return htmlContent;
      }
      
      console.log('No content found in notes API response');
      return '';
    } catch (error) {
      console.error('Failed to load notes content:', error);
      showToast.error('Failed to load notes content');
      return '';
    }
  }, [get]);

  const updateQuoteNotesId = useCallback(async (quoteId: number, notesId: string) => {
    try {
      await post('/Admin/SaleEditor/SetQuoteDetail', {
        id: quoteId,
        notesId: notesId
      });
      console.log('Successfully updated quote notesId:', notesId);
    } catch (error) {
      console.error('Failed to update quote notesId:', error);
      throw error;
    }
  }, [post]);

  const fetchQuoteDetails = async (quoteId: number) => {
    setIsLoadingLineItems(true);
    try {
      const response = await get(`/Admin/SaleEditor/GetQuoteDetail?id=${quoteId}`) as QuoteDetailsResponse;
      
      if (response?.quote?.sale) {
        setQuoteDetails(response);
        setCurrentSaleId(response.quote.saleId);
        
        console.log('Fetched quote details with notesId:', response.quote.sale.notesId);
        
        if (response.quote.sale.lineItems && Array.isArray(response.quote.sale.lineItems)) {
          const transformedItems = response.quote.sale.lineItems
            .filter(item => item.form?.productName)
            .map(transformApiLineItem);
          
          setLineItems(transformedItems);
        } else {
          setLineItems([]);
        }

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

        const fallbackNotes = response.quote.sale.comments?.[0]?.comment || '';
        
        setFormData(prev => ({
          ...prev,
          customerTotal: customerTotal.toString(),
          inHandDate: response.quote.sale.dates.inHandDate || '',
          notes: fallbackNotes,
        }));

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

        if (customer.id) {
          await fetchCustomerAddresses(customer.id);
        }

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
      
    } catch (error) {
      console.error('Error fetching quote details:', error);
      showToast.error('Failed to load quote details');
      setLineItems([]);
      setSaleSummary(null);
    } finally {
      setIsLoadingLineItems(false);
    }
  };

  const fetchSaleSummary = useCallback(async () => {
    if (!currentSaleId) return;
    
    try {
      const response = await get(`/Admin/SaleEditor/GetSaleSummary?saleId=${currentSaleId}`);
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
  }, [currentSaleId, get, setFormData]);

  const createNewQuote = useCallback(async (customerId: string): Promise<string | null> => {
    try {
      const response = await post('/Admin/SaleEditor/AddEmptyQuote', {
        customerId: customerId
      }) as CreateQuoteResponse;
      
      if (response && response.saleId) {
        setCurrentSaleId(response.saleId);
        console.log('Created new quote:', response);
        return response.saleId;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to create new quote:', error);
      showToast.error('Failed to create new quote');
      return null;
    }
  }, [post]);

  const setSaleDetail = useCallback(async (saleId: string, billingAddress?: any, shippingAddress?: any) => {
    if (!billingAddress && !shippingAddress) {
      return;
    }

    try {
      const payload: SetSaleDetailRequest = {
        saleId,
        addresses: {
          billing: {
            addressLine: billingAddress?.street || '',
            city: billingAddress?.city || '',
            state: billingAddress?.state || '',
            addressLine2: '',
            country: billingAddress?.country || 'United States',
            name: billingAddress?.name || '',
            zipCode: billingAddress?.zipCode || '',
          }
        }
      };

      if (shippingAddress && shippingAddress !== billingAddress) {
        payload.addresses.shipping = {
          addressLine: shippingAddress.street || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          addressLine2: '',
          country: shippingAddress.country || 'United States',
          name: shippingAddress.name || '',
          zipCode: shippingAddress.zipCode || '',
        };
      }

      await post('/Admin/SaleEditor/SetSaleDetail', payload);
      console.log('Set sale detail successfully');
    } catch (error) {
      console.error('Failed to set sale detail:', error);
      showToast.error('Failed to update quote addresses');
    }
  }, [post]);

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
      // Only fetch if we haven't already or if the quote ID changed
      if (!quoteDetails || quoteDetails.quote.id !== quote.id) {
        fetchQuoteDetails(quote.id);
      }
      
      // Initialize form data with quote data - only if not already initialized
      if (!selectedCustomer || selectedCustomer.firstName !== quote.customer.split(' ')[0]) {
        setFormData(prev => ({
          ...prev,
          customer: quote.customer,
          customerEmail: quote.customerEmail,
          status: quote.status,
          customerTotal: quote.customerTotal.toString(),
          inHandDate: quote.inHandDate || '',
          // Don't set notes here - let QuoteNotesStep handle it
          billingAddress: prev.billingAddress.street ? prev.billingAddress : {
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
          shippingAddress: prev.shippingAddress.street ? prev.shippingAddress : {
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
        }));
      }
    } else if (!isEditing) {
      // Reset all state for new quotes
      setSelectedCustomer(null);
      setFormData(prev => ({
        ...prev,
        customer: '',
        customerEmail: '',
        notes: '', // Clear notes for new quotes
      }));
      setLineItems([]);
      setSaleSummary(null);
      setQuoteDetails(null);
      setCurrentSaleId('');
    }
  }, [quote?.id, isEditing]); 

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
    fetchCustomerAddresses,
    createNewQuote,
    setSaleDetail,
    loadNotesContent,
    updateQuoteNotesId,
  };
};