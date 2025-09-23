import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { showToast } from "@/components/ui/toast";
import { iCustomer, iCustomerAddress } from "@/types/customer";
import { LineItemData, SaleSummary } from "@/types/quotes";
import { documentFormatToHtml } from "@/lib/documentConverter";

interface CreateSaleResponse {
  saleId: string;
  id: number;
}

export const useSaleData = (
  type: 'quote' | 'order',
  sale: any,
  isEditing: boolean,
  formData: any,
  setFormData: React.Dispatch<React.SetStateAction<any>>,
  setCustomerAddresses: React.Dispatch<React.SetStateAction<iCustomerAddress[]>>
) => {
  const [selectedCustomer, setSelectedCustomer] = useState<iCustomer | null>(null);
  const [lineItems, setLineItems] = useState<LineItemData[]>([]);
  const [saleSummary, setSaleSummary] = useState<SaleSummary | null>(null);
  const [isLoadingLineItems, setIsLoadingLineItems] = useState(false);
  const [saleDetails, setSaleDetails] = useState<any>(null);
  const [currentSaleId, setCurrentSaleId] = useState<string>("");

  const { get, post } = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  const fetchCustomerAddresses = useCallback(
    async (customerId: string) => {
      try {
        const response = await get(
          `/Admin/CustomerEditor/GetCustomerById?customerId=${customerId}`
        );
        if (response?.addresses) {
          setCustomerAddresses(response.addresses);
        }
      } catch (error) {
        console.error("Error fetching customer addresses:", error);
        showToast.error("Failed to load customer addresses");
      }
    },
    [get, setCustomerAddresses]
  );

  const transformApiLineItem = (apiItem: any): LineItemData => {
    let sourceUri = apiItem.sourceUri;
    
    if (!apiItem.customThumbnail && !apiItem.customPicture && !apiItem.sourceUri) {
      if (apiItem.product?.primaryPicture?.sourceUri) {
        sourceUri = apiItem.product.primaryPicture.sourceUri;
      } else if (apiItem.product?.id && apiItem.product?.pictures?.[0]) {
        sourceUri = `https://static2.promotionalproductinc.com/p2/src/${apiItem.product.id}/${apiItem.product.pictures[0]}.webp`;
      }
    }

    return {
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
      sourceUri: sourceUri,
      customPicture: apiItem.customPicture || null,
      customThumbnail: apiItem.customThumbnail || null
    };
  };

  const updateSaleNotesId = useCallback(
    async (saleId: number, notesId: string) => {
      try {
        const endpoint = "/Admin/SaleEditor/SetSaleDetail";

        await post(endpoint, {
          saleId: saleId,
          notesId: notesId,
        });
      } catch (error) {
        console.error("Failed to update notesId:", error);
        throw error;
      }
    },
    [post, type]
  );

  const fetchSaleDetails = async (saleId: number) => {
    setIsLoadingLineItems(true);
    try {
      const endpoint = type === 'quote'
        ? `/Admin/SaleEditor/GetQuoteDetail?id=${saleId}`
        : `/Admin/SaleEditor/GetOrderDetail?id=${saleId}`;
        
      const response = await get(endpoint);

      if (response?.[type]?.sale) {
        setSaleDetails(response);
        setCurrentSaleId(response[type].saleId);

        if (response[type].sale.lineItems && Array.isArray(response[type].sale.lineItems)) {
          const transformedItems = response[type].sale.lineItems
            .filter((item: any) => item.form?.productName)
            .map(transformApiLineItem);

          setLineItems(transformedItems);
        } else {
          setLineItems([]);
        }

        const customerTotal = response[type].sale.lineItems.reduce(
          (sum: number, item: any) => sum + item.customerEstimates.total,
          0
        );
        const supplierTotal = response[type].sale.lineItems.reduce(
          (sum: number, item: any) => sum + item.supplierEstimates.total,
          0
        );

        setSaleSummary({
          customerSummary: {
            itemsTotal: customerTotal,
            setupCharge: response[type].sale.lineItems.reduce(
              (sum: number, item: any) => sum + item.customerEstimates.setupCharge,
              0
            ),
            subTotal: customerTotal,
            total: customerTotal,
          },
          totalSupplierSummary: {
            itemsTotal: supplierTotal,
            setupCharge: response[type].sale.lineItems.reduce(
              (sum: number, item: any) => sum + item.supplierEstimates.setupCharge,
              0
            ),
            subTotal: supplierTotal,
            total: supplierTotal,
          },
          profit: customerTotal - supplierTotal,
        });

        setFormData((prev: any) => ({
          ...prev,
          customerTotal: customerTotal.toString(),
          inHandDate: response[type].sale.dates.inHandDate || "",
          notes: response[type].sale.comments?.[0]?.comment || "",
        }));

        const customer = response[type].sale.customer;
        const customerData: iCustomer = {
          id: customer.id,
          idNum: customer.idNum,
          firstName: customer.form.firstName,
          lastName: customer.form.lastName,
          email: customer.form.email,
          phone: customer.form.phoneNumber || "",
          website: customer.website,
          companyName: customer.form.companyName || "",
          isBlocked: false,
          isBusinessCustomer: !!customer.form.companyName,
          createdAt: customer.createdAt,
        };
        setSelectedCustomer(customerData);

        if (customer.id) {
          await fetchCustomerAddresses(customer.id);
        }

        const billing = response[type].sale.billingAddress;
        const shipping = response[type].sale.shippingAddress;

        if (billing.addressLine) {
          setFormData((prev: any) => ({
            ...prev,
            billingAddress: {
              type: "billing" as const,
              label: "Billing Address",
              name: billing.name,
              street: billing.addressLine,
              city: billing.city,
              state: billing.state,
              zipCode: billing.zipCode,
              country: billing.country || "US",
              isPrimary: true,
            },
          }));
        }

        if (shipping.addressLine) {
          setFormData((prev: any) => ({
            ...prev,
            shippingAddress: {
              type: "shipping" as const,
              label: "Shipping Address",
              name: shipping.name,
              street: shipping.addressLine,
              city: shipping.city,
              state: shipping.state,
              zipCode: shipping.zipCode,
              country: shipping.country || "US",
              isPrimary: false,
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
      showToast.error(`Failed to load ${type} details`);
      setLineItems([]);
      setSaleSummary(null);
    } finally {
      setIsLoadingLineItems(false);
    }
  };

  const fetchSaleSummary = useCallback(async () => {
    if (!currentSaleId) return;

    try {
      const response = await get(
        `/Admin/SaleEditor/GetSaleSummary?saleId=${currentSaleId}`
      );
      if (response) {
        setSaleSummary(response);
        setFormData((prev: any) => ({
          ...prev,
          customerTotal: response.customerSummary.total.toString(),
        }));
      }
    } catch (error) {
      console.error("Failed to fetch sale summary:", error);
      showToast.error("Failed to fetch sale summary");
    }
  }, [currentSaleId, get, setFormData]);

  const createNewSale = useCallback(
    async (customerId: string): Promise<string | null> => {
      try {
        const endpoint = type === 'quote'
          ? "/Admin/SaleEditor/AddEmptyQuote"
          : "/Admin/SaleEditor/AddEmptyOrder";
          
        const response = await post(endpoint, {
          customerId: customerId,
        }) as CreateSaleResponse;

        if (response && response.saleId) {
          setCurrentSaleId(response.saleId);
          return response.saleId;
        }

        return null;
      } catch (error) {
        console.error(`Failed to create new ${type}:`, error);
        showToast.error(`Failed to create new ${type}`);
        return null;
      }
    },
    [post, type]
  );

  const setSaleDetail = useCallback(
    async (saleId: string, billingAddress?: any, shippingAddress?: any) => {
      if (!billingAddress && !shippingAddress) {
        return;
      }

      try {
        const payload: any = {
          saleId,
          addresses: {
            billing: {
              addressLine: billingAddress?.street || "",
              city: billingAddress?.city || "",
              state: billingAddress?.state || "",
              addressLine2: "",
              country: billingAddress?.country || "United States",
              name: billingAddress?.name || "",
              zipCode: billingAddress?.zipCode || "",
            },
          },
        };

        if (shippingAddress && shippingAddress !== billingAddress) {
          payload.addresses.shipping = {
            addressLine: shippingAddress.street || "",
            city: shippingAddress.city || "",
            state: shippingAddress.state || "",
            addressLine2: "",
            country: shippingAddress.country || "United States",
            name: shippingAddress.name || "",
            zipCode: shippingAddress.zipCode || "",
          };
        }

        await post("/Admin/SaleEditor/SetSaleDetail", payload);
      } catch (error) {
        console.error("Failed to set sale detail:", error);
        showToast.error(`Failed to update ${type} addresses`);
      }
    },
    [post, type]
  );

  const handleAddEmptyLineItem = async () => {
    if (!currentSaleId) {
      showToast.error("No sale ID available to add line item");
      return;
    }

    try {
      const response = await post("/Admin/SaleEditor/AddEmptyLineItem", {
        saleId: currentSaleId,
      });

      if (response && response.lineItems) {
        const newItems: LineItemData[] = response.lineItems.map(transformApiLineItem);
        setLineItems(newItems);
        await fetchSaleSummary();
        showToast.success("Line item added successfully");
      }
    } catch (error) {
      console.error("Failed to add line item:", error);
      showToast.error("Failed to add line item");
    }
  };

  const handleUpdateLineItem = async (itemId: string, updatedItem: LineItemData) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === itemId ? updatedItem : item))
    );
    await fetchSaleSummary();
  };

  const handleRemoveLineItem = async (itemId: string) => {
    if (!currentSaleId) {
      showToast.error("No sale ID available to remove line item");
      return;
    }

    try {
      const response = await post("/Admin/SaleEditor/RemoveLineItems", {
        saleId: currentSaleId,
        lineItemIds: [itemId],
      });

      if (response && response.lineItems) {
        const updatedItems: LineItemData[] = response.lineItems.map(transformApiLineItem);
        setLineItems(updatedItems);
        await fetchSaleSummary();
        showToast.success("Line item removed successfully");
      }
    } catch (error) {
      showToast.error("Failed to remove line item");
    }
  };

  useEffect(() => {
    if (isEditing && sale) {
      if (!saleDetails || saleDetails[type].id !== sale.id) {
        fetchSaleDetails(sale.id);
      }

      if (!selectedCustomer || selectedCustomer.firstName !== sale.customer.split(" ")[0]) {
        setFormData((prev: any) => ({
          ...prev,
          customer: sale.customer,
          customerEmail: sale.customerEmail,
          status: sale.status,
          customerTotal: sale.customerTotal.toString(),
          inHandDate: sale.inHandDate || "",
        }));
      }
    } else if (!isEditing) {
      setSelectedCustomer(null);
      setFormData((prev: any) => ({
        ...prev,
        customer: "",
        customerEmail: "",
        notes: "",
      }));
      setLineItems([]);
      setSaleSummary(null);
      setSaleDetails(null);
      setCurrentSaleId("");
    }
  }, [sale?.id, isEditing, type]);

  return {
    selectedCustomer,
    setSelectedCustomer,
    lineItems,
    setLineItems,
    saleSummary,
    setSaleSummary,
    isLoadingLineItems,
    saleDetails,
    currentSaleId,
    handleAddEmptyLineItem,
    handleUpdateLineItem,
    handleRemoveLineItem,
    fetchSaleSummary,
    fetchCustomerAddresses,
    createNewSale,
    setSaleDetail,
    updateSaleNotesId,
  };
};