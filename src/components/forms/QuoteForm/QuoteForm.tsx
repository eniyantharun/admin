import React, { useState, useEffect } from "react";
import { CheckCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EntityDrawer } from "@/components/helpers/EntityDrawer";
import { iCustomer, iCustomerAddress } from "@/types/customer";
import {
  iQuoteFormData,
  iQuoteFormProps,
  iQuote,
  LineItemData,
  SaleSummary,
  QuoteDetailsResponse,
} from "@/types/quotes";
import { useApi } from "@/hooks/useApi";
import { showToast } from "@/components/ui/toast";
import { useQuoteData } from "./hooks/useQuoteData";
import { QuoteCustomerStep } from "./components/QuoteCustomerStep";
import { QuoteItemsStep } from "./components/QuoteItemsStep";
import { QuoteDetailsStep } from "./components/QuoteDetailsStep";
import { QuoteNotesStep } from "./components/QuoteNotesStep";
import { QuoteInformation } from "./components/QuoteInformation";
import { QuoteShippingStep } from "./components/QuoteShippingStep";

export const QuoteForm: React.FC<iQuoteFormProps> = ({
  quote,
  isEditing,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<iQuoteFormData>({
    customer: "",
    customerEmail: "",
    status: "new-quote",
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
  });
  const [formErrors, setFormErrors] = useState<Partial<iQuoteFormData>>({});
  const [customerAddresses, setCustomerAddresses] = useState<
    iCustomerAddress[]
  >([]);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);

  const {
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
    updateQuoteNotesId,
  } = useQuoteData(
    quote,
    isEditing,
    formData,
    setFormData,
    setCustomerAddresses
  );

  const { post } = useApi();

  const handleCustomerSelect = async (customer: iCustomer) => {
    setSelectedCustomer(customer);

    if (!isEditing && !currentSaleId && customer.id) {
      setIsCreatingQuote(true);
      try {
        const saleId = await createNewQuote(customer.id);
        if (saleId) {
          showToast.success("New quote created successfully");
          console.log("New quote created with saleId:", saleId);
        }
      } catch (error) {
        console.error("Error creating new quote:", error);
      } finally {
        setIsCreatingQuote(false);
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<iQuoteFormData> = {};

    if (!selectedCustomer) {
      errors.customer = "Customer is required";
      showToast.error("Please select a customer");
      return false;
    }

    if (!currentSaleId) {
      showToast.error("Quote not properly created. Please try again.");
      return false;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditing && quote && formData.status !== quote.status) {
        await post("/Admin/SaleEditor/SetQuoteDetail", {
          id: quote.id,
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

      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting quote:", error);
      showToast.error("Failed to save quote");
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

    if (formErrors[name as keyof iQuoteFormData]) {
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
      {isCreatingQuote && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-blue-700 text-sm font-medium">Creating new quote...</span>
          </div>
        </div>
      )}

      {isEditing && quote && quoteDetails && (
        <QuoteInformation
          quote={quote}
          quoteDetails={quoteDetails}
          lineItems={lineItems}
          currentSaleId={currentSaleId}
          formData={formData}
          handleInputChange={handleInputChange}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <QuoteCustomerStep
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
            <QuoteItemsStep
              lineItems={lineItems}
              isLoadingLineItems={isLoadingLineItems}
              saleSummary={saleSummary}
              onAddEmptyLineItem={handleAddEmptyLineItem}
              onUpdateLineItem={handleUpdateLineItem}
              onRemoveLineItem={handleRemoveLineItem}
              onRefreshSummary={fetchSaleSummary}
              currentSaleId={currentSaleId}
            />

            <QuoteDetailsStep
              formData={formData}
              handleInputChange={handleInputChange}
              saleSummary={saleSummary}
              quoteId={quote?.id}
              isEditing={isEditing}
              currentSaleId={currentSaleId}
              onRefreshSummary={fetchSaleSummary}
            />

            <QuoteShippingStep
              formData={formData}
              handleInputChange={handleInputChange}
              saleSummary={saleSummary}
            />

            <QuoteNotesStep
              formData={formData}
              handleInputChange={handleInputChange}
              saleSummary={saleSummary}
              lineItems={lineItems}
              isEditing={isEditing}
              currentSaleId={currentSaleId}
              documentId={quoteDetails?.quote?.sale?.notesId}
              onDocumentIdCreated={async (newDocumentId) => {
                console.log("New document created:", newDocumentId);
                if (isEditing && quote?.id) {
                  try {
                    await updateQuoteNotesId(quote.id, newDocumentId);
                  } catch (error) {
                    console.error('Failed to link document to quote:', error);
                  }
                }
              }}
            />
          </>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-200 gap-3">
          <Button
            type="submit"
            loading={loading || isCreatingQuote}
            icon={isEditing ? Save : CheckCircle}
            className=""
          >
            {isEditing ? "Save Quote" : "Create Quote"}
          </Button>
        </div>
      </form>
    </div>
  );
};