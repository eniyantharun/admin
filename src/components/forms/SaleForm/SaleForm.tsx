import React, { useState, useEffect } from "react";
import { CheckCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EntityDrawer } from "@/components/helpers/EntityDrawer";
import { iCustomer, iCustomerAddress } from "@/types/customer";
import {
  iQuoteFormData,
  LineItemData,
  SaleSummary,
  QuoteDetailsResponse,
} from "@/types/quotes";
import { iOrder, iOrderFormData } from "@/types/order";
import { useApi } from "@/hooks/useApi";
import { showToast } from "@/components/ui/toast";
import { useSaleData } from "./hooks/useSaleData";
import { SaleCustomerStep } from "./components/SaleCustomerStep";
import { SaleItemsStep } from "./components/SaleItemsStep";
import { SaleDetailsStep } from "./components/SaleDetailsStep";
import { SaleInformation } from "./components/SaleInformation";
import { SaleShippingStep } from "./components/SaleShippingStep";
import { SaleNotesStep } from "./components/SaleNotesStep";
import { PaymentSection } from "./components/PaymentSection";
import { PurchaseOrderSection } from "./components/PurchaseOrderSection";

type SaleType = "quote" | "order";

export interface SaleFormProps {
  type: SaleType;
  sale?: any | null;
  isEditing: boolean;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export const SaleForm: React.FC<SaleFormProps> = ({
  type,
  sale,
  isEditing,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<any>({
    customer: "",
    customerEmail: "",
    status: type === "quote" ? "new-quote" : "new",
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
      additionalInstructions: "",
    },
  });
  const [formErrors, setFormErrors] = useState<Partial<any>>({});
  const [customerAddresses, setCustomerAddresses] = useState<
    iCustomerAddress[]
  >([]);
  const [isCreatingSale, setIsCreatingSale] = useState(false);

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
    type,
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
      setIsCreatingSale(true);
      try {
        const saleId = await createNewSale(customer.id);
        if (saleId) {
          showToast.success(`New ${type} created successfully`);
        }
      } catch (error) {
        console.error(`Error creating new ${type}:`, error);
      } finally {
        setIsCreatingSale(false);
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<any> = {};

    if (!selectedCustomer) {
      errors.customer = "Customer is required";
      showToast.error("Please select a customer");
      return false;
    }

    if (!currentSaleId) {
      showToast.error(
        `${
          type === "quote" ? "Quote" : "Order"
        } not properly created. Please try again.`
      );
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
        const endpoint = type === "quote"
            ? "/Admin/SaleEditor/SetQuoteDetail"
            : "/Admin/SaleEditor/SetOrderDetail";

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

      await onSubmit(formData);
    } catch (error) {
      console.error(`Error submitting ${type}:`, error);
      showToast.error(`Failed to save ${type}`);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const canProceedToNext = (stepIndex: number) => {
    if (stepIndex === 0) {
      return !!(selectedCustomer && (currentSaleId || isEditing));
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {isCreatingSale && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-blue-700 text-sm font-medium">
              Creating new {type}...
            </span>
          </div>
        </div>
      )}

      {isEditing && sale && saleDetails && (
        <SaleInformation
          type={type}
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
            />

            <SaleDetailsStep
              type={type}
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
              currentSaleId={currentSaleId}
              onRefreshSummary={fetchSaleSummary}
            />

            {type === "order" && isEditing && saleDetails?.order && (
              <>
                <PaymentSection orderDetails={saleDetails.order} />
                <PurchaseOrderSection orderDetails={saleDetails.order} />
              </>
            )}

            <SaleNotesStep
              type={type}
              formData={formData}
              handleInputChange={handleInputChange}
              saleSummary={saleSummary}
              lineItems={lineItems}
              isEditing={isEditing}
              currentSaleId={currentSaleId}
              documentId={saleDetails?.sale?.notesId}
              onDocumentIdCreated={async (newDocumentId: any) => {
                if (isEditing && sale?.id) {
                  try {
                    await updateSaleNotesId(sale.id, newDocumentId);
                  } catch (error) {
                    console.error("Failed to link document:", error);
                  }
                }
              }}
            />
          </>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-200 gap-3">
          <Button
            type="submit"
            loading={loading || isCreatingSale}
            icon={isEditing ? Save : CheckCircle}
          >
            {isEditing
              ? `Save ${type === "quote" ? "Quote" : "Order"}`
              : `Create ${type === "quote" ? "Quote" : "Order"}`}
          </Button>
        </div>
      </form>
    </div>
  );
};
