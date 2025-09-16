import React, { useState, useEffect } from "react";
import { CheckCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EntityDrawer } from "@/components/helpers/EntityDrawer";
import { iCustomer, iCustomerAddress } from "@/types/customer";
import {
  iQuoteFormData,
  iQuote,
  LineItemData,
  SaleSummary,
  QuoteDetailsResponse,
} from "@/types/quotes";
import { iOrderFormData, iOrder } from "@/types/order";
import { useApi } from "@/hooks/useApi";
import { showToast } from "@/components/ui/toast";
import { useSaleData } from "./hooks/useSaleData";
import { SaleCustomerStep } from "./components/SaleCustomerStep";
import { SaleItemsStep } from "./components/SaleItemsStep";
import { SaleDetailsStep } from "./components/SaleDetailsStep";
import { SaleNotesStep } from "./components/SaleNotesStep";
import { SaleInformation } from "./components/SaleInformation";
import { SaleShippingStep } from "./components/SaleShippingStep";
import { SalePaymentStep } from "./components/SalePaymentStep";

type SaleType = 'quote' | 'order';

interface SaleFormProps {
  saleType: SaleType;
  sale?: iQuote | iOrder | null;
  isEditing: boolean;
  onSubmit: (formData: iQuoteFormData | iOrderFormData) => Promise<void>;
  loading?: boolean;
}

export const SaleForm: React.FC<SaleFormProps> = ({
  saleType,
  sale,
  isEditing,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<iQuoteFormData | iOrderFormData>(() => {
    const baseData = {
      customer: "",
      customerEmail: "",
      status: saleType === 'quote' ? "new-quote" : "new",
      customerTotal: "0",
      inHandDate: "",
      notes: "",
      billingAddress: {
        type: "billing" as const,
        label: "",
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
        isPrimary: false,
      },
      shippingAddress: {
        type: "shipping" as const,
        label: "",
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
        isPrimary: false,
      },
      sameAsShipping: false,
      checkoutDetails: {
        dateOrderNeededBy: "",
        additionalInstructions: ""
      },
    };

    if (saleType === 'order') {
      return {
        ...baseData,
        paymentMethod: "Credit Card",
        supplierTotal: "0",
        items: [],
        shippingDetails: {
          type: "Ground",
          company: "UPS",
          cost: 25.50,
          date: "",
          trackingNumber: ""
        }
      } as iOrderFormData;
    }

    return baseData as iQuoteFormData;
  });
  const [formErrors, setFormErrors] = useState<Partial<iQuoteFormData | iOrderFormData>>({});
  const [customerAddresses, setCustomerAddresses] = useState<
    iCustomerAddress[]
  >([]);
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);

  const {
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
  } = useSaleData(
    saleType,
    sale,
    isEditing,
    formData,
    setFormData,
    setCustomerAddresses
  );

  const { post } = useApi();

  const handleCustomerSelect = async (customer: iCustomer) => {
    setSelectedCustomer(customer);

    if (!isEditing && !currentSaleId && customer.id) {
      setIsCreatingRecord(true);
      try {
        const saleId = await createNewSale(customer.id);
        if (saleId) {
          showToast.success(`New ${saleType} created successfully`);
          console.log(`New ${saleType} created with saleId:`, saleId);
        }
      } catch (error) {
        console.error(`Error creating new ${saleType}:`, error);
      } finally {
        setIsCreatingRecord(false);
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<iQuoteFormData | iOrderFormData> = {};

    if (!selectedCustomer) {
      errors.customer = "Customer is required";
      showToast.error("Please select a customer");
      return false;
    }

    if (!currentSaleId) {
      showToast.error(`${saleType === 'quote' ? 'Quote' : 'Order'} not properly created. Please try again.`);
      return false;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditing && sale && formData.status !== sale.status) {
        const endpoint = saleType === 'quote' ? "/Admin/SaleEditor/SetQuoteDetail" : "/Admin/SaleEditor/SetOrderDetail";
        await post(endpoint, {
          id: sale.id,
          status: formData.status,
        });
      }

      if (currentSaleId) {
        const billing = formData.billingAddress.street
          ? formData.billingAddress
          : null;
        const shipping = formData.shippingAddress.street
          ? formData.shippingAddress
          : null;

        if (billing || shipping) {
          await setSaleDetail(currentSaleId, billing, shipping);
        }
      }

      await onSubmit(formData as any);
    } catch (error) {
      console.error(`Error submitting ${saleType}:`, error);
      showToast.error(`Failed to save ${saleType}`);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formErrors[name as keyof (iQuoteFormData | iOrderFormData)]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const canProceedToNext = (stepIndex: number) => {
    if (stepIndex === 0) {
      return !!(selectedCustomer && (currentSaleId || isEditing));
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {isCreatingRecord && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-blue-700 text-sm font-medium">Creating new {saleType}...</span>
          </div>
        </div>
      )}

      {isEditing && sale && saleDetails && (
        <SaleInformation
          saleType={saleType}
          sale={sale}
          saleDetails={saleDetails}
          lineItems={lineItems}
          currentSaleId={currentSaleId}
          formData={formData}
          handleInputChange={handleInputChange}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <SaleCustomerStep
          selectedCustomer={selectedCustomer}
          onCustomerSelect={handleCustomerSelect}
          formData={formData}
          setFormData={setFormData}
          customerAddresses={customerAddresses}
          onFetchCustomerAddresses={fetchCustomerAddresses}
          isEditing={isEditing}
        />

        {canProceedToNext(0) && (
          <>
            <SaleItemsStep
              lineItems={lineItems}
              isLoadingLineItems={isLoadingLineItems}
              saleSummary={saleSummary}
              onAddEmptyLineItem={handleAddEmptyLineItem}
              onUpdateLineItem={handleUpdateLineItem}
              onRemoveLineItem={handleRemoveLineItem}
              onRefreshSummary={fetchSaleSummary}
              currentSaleId={currentSaleId}
              saleType={saleType}
            />

            <SaleDetailsStep
              saleType={saleType}
              formData={formData}
              handleInputChange={handleInputChange}
              saleSummary={saleSummary}
              saleId={sale?.id}
              isEditing={isEditing}
              currentSaleId={currentSaleId}
              onRefreshSummary={fetchSaleSummary}
            />

            <SaleShippingStep
              formData={formData}
              handleInputChange={handleInputChange}
              saleSummary={saleSummary}
              saleType={saleType}
            />

            {saleType === 'order' && (
              <SalePaymentStep
                formData={formData as iOrderFormData}
                handleInputChange={handleInputChange}
                saleSummary={saleSummary}
              />
            )}

            <SaleNotesStep
              saleType={saleType}
              formData={formData}
              handleInputChange={handleInputChange}
              saleSummary={saleSummary}
              lineItems={lineItems}
              isEditing={isEditing}
              currentSaleId={currentSaleId}
              documentId={saleDetails?.quote?.sale?.notesId}
              onDocumentIdCreated={async (newDocumentId) => {
                console.log("New document created:", newDocumentId);
                if (isEditing && sale?.id) {
                  try {
                    await updateSaleNotesId(sale.id, newDocumentId);
                  } catch (error) {
                    console.error('Failed to link document to sale:', error);
                  }
                }
              }}
            />
          </>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-200 gap-3">
          <Button
            type="submit"
            loading={loading || isCreatingRecord}
            icon={isEditing ? Save : CheckCircle}
            className=""
          >
            {isEditing ? `Save ${saleType === 'quote' ? 'Quote' : 'Order'}` : `Create ${saleType === 'quote' ? 'Quote' : 'Order'}`}
          </Button>
        </div>
      </form>
    </div>
  );
};