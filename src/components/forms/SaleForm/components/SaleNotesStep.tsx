import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  FileText,
  Send,
  Download,
  ExternalLink,
  ImageIcon,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/toast";
import {
  generateInvoicePDF,
  downloadPDF,
  openPDFInNewTab,
  InvoiceResponse,
} from "@/lib/pdfUtils";
import { iQuoteFormData, SaleSummary, LineItemData } from "@/types/quotes";
import { iOrderFormData } from "@/types/order";
import { useApi } from "@/hooks/useApi";
import {
  htmlToDocumentFormat,
  documentFormatToHtml,
  debounce,
  AddDocumentRevisionRequest,
  AddDocumentRevisionResponse,
} from "@/lib/documentConverter";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-50 rounded-lg animate-pulse" />,
});

import "react-quill/dist/quill.snow.css";

interface SaleNotesStepProps {
  saleType: 'quote' | 'order';
  formData: iQuoteFormData | iOrderFormData;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  saleSummary: SaleSummary | null;
  lineItems: LineItemData[];
  isEditing: boolean;
  currentSaleId?: string;
  documentId?: string | null;
  onDocumentIdCreated?: (documentId: string) => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

export const SaleNotesStep: React.FC<SaleNotesStepProps> = ({
  saleType,
  formData,
  handleInputChange,
  saleSummary,
  lineItems,
  isEditing,
  currentSaleId,
  documentId,
  onDocumentIdCreated,
}) => {
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [lastGeneratedInvoice, setLastGeneratedInvoice] =
    useState<InvoiceResponse | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [lastSavedContent, setLastSavedContent] = useState<string>("");
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [hasLoadedInitialContent, setHasLoadedInitialContent] = useState(false);
  const [localDocumentId, setLocalDocumentId] = useState<string | null>(
    documentId || null
  );
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveAttemptRef = useRef<string>("");
  const isInitialLoadRef = useRef(true);

  const { get, post } = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  useEffect(() => {
    const loadNotesContent = async () => {
      if (!documentId || hasLoadedInitialContent) {
        if (!documentId && !hasLoadedInitialContent) {
          setHasLoadedInitialContent(true);
          setLastSavedContent(formData.notes || "");
        }
        return;
      }

      setIsLoadingNotes(true);
      try {
        console.log("Loading notes content for documentId:", documentId);
        const response = await get(
          `/Admin/Document/GetDocumentDetail?documentId=${documentId}`
        );

        if (response?.content) {
          const htmlContent = documentFormatToHtml(response.content);
          console.log("Loaded and converted notes content");

          setLastSavedContent(htmlContent);

          if (htmlContent !== formData.notes) {
            const syntheticEvent = {
              target: {
                name: "notes",
                value: htmlContent,
              },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        } else {
          setLastSavedContent(formData.notes || "");
        }
      } catch (error) {
        console.error("Error loading notes content:", error);
        setLastSavedContent(formData.notes || "");
      } finally {
        setIsLoadingNotes(false);
        setHasLoadedInitialContent(true);
      }
    };

    loadNotesContent();
  }, [documentId]);

  useEffect(() => {
    if (!hasLoadedInitialContent && !documentId) {
      setLastSavedContent(formData.notes || "");
      setHasLoadedInitialContent(true);
    }
  }, [hasLoadedInitialContent, documentId, formData.notes]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const saveNotesToAPI = useCallback(
    async (content: string) => {
      if (!localDocumentId || !isOnline) {
        if (!isOnline) setSaveStatus("offline");
        return;
      }

      if (content === lastSaveAttemptRef.current) {
        return;
      }

      lastSaveAttemptRef.current = content;
      setSaveStatus("saving");

      try {
        const documentContent = htmlToDocumentFormat(content);

        const requestPayload: AddDocumentRevisionRequest = {
          documentId: localDocumentId,
          content: documentContent,
        };

        const response = await post<AddDocumentRevisionResponse>(
          "/Admin/Document/AddDocumentRevision",
          requestPayload
        );

        if (response) {
          setSaveStatus("saved");
          setLastSavedContent(content);

          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      } catch (error: any) {
        console.error("Error saving notes:", error);
        setSaveStatus("error");

        if (
          !error.message?.includes("NetworkError") &&
          !error.message?.includes("fetch")
        ) {
          showToast.error("Failed to save notes");
        }

        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    },
    [localDocumentId, post, isOnline]
  );

  const createDocument = useCallback(async (): Promise<string | null> => {
    if (isCreatingDocument) {
      console.log("Document creation already in progress, skipping...");
      return null;
    }

    setIsCreatingDocument(true);
    try {
      console.log("Creating new document...");
      const response = await post("/Admin/Document/AddDocument", {
        isPublic: false,
        saleId: currentSaleId,
      });

      if (response?.id) {
        console.log("Created new document with ID:", response.id);

        if (currentSaleId) {
          try {
            const endpoint = saleType === 'quote' ? 
              "/Admin/SaleEditor/SetQuoteDetail" :
              "/Admin/SaleEditor/SetOrderDetail";
            
            await post(endpoint, {
              id: currentSaleId,
              notesId: response.id,
            });
            console.log(`Successfully linked document to ${saleType}`);
          } catch (linkError) {
            console.error(`Failed to link document to ${saleType}:`, linkError);
          }
        }

        return response.id;
      }

      return null;
    } catch (error) {
      console.error("Error creating document:", error);
      showToast.error("Failed to create document");
      return null;
    } finally {
      setIsCreatingDocument(false);
    }
  }, [post, currentSaleId, isCreatingDocument, saleType]);

  const debouncedSave = useMemo(
    () =>
      debounce((content: string) => {
        saveNotesToAPI(content);
      }, 3000),
    [saveNotesToAPI]
  );

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          ["link"],
          [{ align: [] }],
          ["clean"],
          ["image-upload"],
        ],
        handlers: {
          "image-upload": () => setShowImageUpload(true),
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "indent",
    "link",
    "align",
  ];

  const handleQuillChange = useCallback(
    async (content: string) => {
      if (isLoadingNotes || !hasLoadedInitialContent) {
        return;
      }

      const syntheticEvent = {
        target: {
          name: "notes",
          value: content,
        },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      handleInputChange(syntheticEvent);

      if (
        !localDocumentId &&
        !isCreatingDocument &&
        content.trim() !== "" &&
        content !== "<p><br></p>"
      ) {
        const newDocumentId = await createDocument();
        if (newDocumentId) {
          setLocalDocumentId(newDocumentId);
          onDocumentIdCreated?.(newDocumentId);

          debouncedSave(content);
        }
        return;
      }

      const contentChanged = content !== lastSavedContent;
      const significantChange =
        Math.abs(content.length - lastSavedContent.length) > 5;
      const hasRealContent = content.replace(/<[^>]*>/g, "").trim().length > 0;

      if (
        localDocumentId &&
        contentChanged &&
        (significantChange || hasRealContent)
      ) {
        debouncedSave(content);
      }
    },
    [
      handleInputChange,
      debouncedSave,
      lastSavedContent,
      localDocumentId,
      isLoadingNotes,
      hasLoadedInitialContent,
      createDocument,
      onDocumentIdCreated,
      isCreatingDocument,
    ]
  );

  const forceSave = useCallback(() => {
    if (documentId && formData.notes && formData.notes !== lastSavedContent) {
      saveNotesToAPI(formData.notes);
    }
  }, [formData.notes, saveNotesToAPI, lastSavedContent, documentId]);

  useEffect(() => {
    if (
      isOnline &&
      saveStatus === "offline" &&
      formData.notes !== lastSavedContent
    ) {
      forceSave();
    }
  }, [isOnline, saveStatus, forceSave, formData.notes, lastSavedContent]);

  const SaveStatusIndicator = () => {
    const getStatusConfig = () => {
      switch (saveStatus) {
        case "saving":
          return {
            icon: Clock,
            text: "Saving...",
            className: "text-blue-600 bg-blue-50 border-blue-200",
          };
        case "saved":
          return {
            icon: CheckCircle,
            text: "Saved",
            className: "text-green-600 bg-green-50 border-green-200",
          };
        case "error":
          return {
            icon: AlertCircle,
            text: "Save failed",
            className: "text-red-600 bg-red-50 border-red-200",
          };
        case "offline":
          return {
            icon: WifiOff,
            text: "Offline",
            className: "text-orange-600 bg-orange-50 border-orange-200",
          };
        default:
          return isOnline
            ? {
                icon: Wifi,
                text: "Online",
                className: "text-gray-500 bg-gray-50 border-gray-200",
              }
            : {
                icon: WifiOff,
                text: "Offline",
                className: "text-orange-600 bg-orange-50 border-orange-200",
              };
      }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${config.className}`}
      >
        <Icon className="w-3 h-3" />
        <span>{config.text}</span>
      </div>
    );
  };

  const handleGeneratePDF = async () => {
    if (!currentSaleId) {
      showToast.error(`No sale ID available. Please save the ${saleType} first.`);
      return;
    }

    if (!isEditing) {
      showToast.error(`Please save the ${saleType} before generating PDF`);
      return;
    }

    setGeneratingPDF(true);

    try {
      const invoiceResponse = await generateInvoicePDF(currentSaleId);

      if (invoiceResponse) {
        setLastGeneratedInvoice(invoiceResponse);

        if (invoiceResponse.asset.url) {
          await downloadPDF(
            invoiceResponse.asset.url,
            invoiceResponse.asset.filename
          );
        }
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDownloadLastPDF = async () => {
    if (lastGeneratedInvoice?.asset.url) {
      await downloadPDF(
        lastGeneratedInvoice.asset.url,
        lastGeneratedInvoice.asset.filename
      );
    }
  };

  const handleViewPDF = () => {
    if (lastGeneratedInvoice?.asset.url) {
      openPDFInNewTab(lastGeneratedInvoice.asset.url);
    }
  };

  const handleImageUpload = () => {
    showToast.info("Image upload feature will be available soon");
    setShowImageUpload(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
          <FileText className="w-5 h-5 text-green-500" />
          {saleType === 'quote' ? 'Quote' : 'Order'} Notes
        </h3>
        <div className="flex items-center gap-2">
          <SaveStatusIndicator />
          {saveStatus === "error" && (
            <Button
              onClick={forceSave}
              variant="secondary"
              size="sm"
              className="h-6 text-xs px-2"
            >
              Retry
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="form-input-group">
          <label className="form-label block text-sm font-medium text-gray-700 mb-2">
            {saleType === 'quote' ? 'Quote' : 'Order'} Notes & Instructions
          </label>

          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {isLoadingNotes ? (
              <div className="h-32 bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400 animate-spin" />
                  <span className="text-gray-500 text-sm">Loading notes...</span>
                </div>
              </div>
            ) : (
              <ReactQuill
                theme="snow"
                value={formData.notes || ""}
                onChange={handleQuillChange}
                modules={quillModules}
                formats={quillFormats}
                placeholder={`Add any special instructions, requirements, or notes for this ${saleType}...`}
                style={{
                  minHeight: "150px",
                }}
              />
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <Button
              onClick={() => setShowImageUpload(true)}
              variant="secondary"
              size="sm"
              icon={ImageIcon}
              className="h-7 text-xs px-2"
            >
              Add Image
            </Button>
          </div>
        </div>

        {showImageUpload && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-blue-800 text-sm">
                  Add Image to Notes
                </h5>
                <Button
                  onClick={() => setShowImageUpload(false)}
                  variant="secondary"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                <ImageIcon className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                <p className="text-sm text-blue-700 mb-2">
                  Upload an image to include in your notes
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleImageUpload}
                    variant="primary"
                    size="sm"
                    icon={Upload}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Choose File
                  </Button>
                  <Button
                    onClick={() => setShowImageUpload(false)}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>
            </div>
          </Card>
        )}

        {!isOnline && (
          <Card className="p-3 bg-orange-50 border-orange-200">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-orange-600" />
              <p className="text-orange-700 text-sm">
                You're currently offline. Changes will be saved when connection is
                restored.
              </p>
            </div>
          </Card>
        )}

        {saleSummary && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h5 className="font-medium text-blue-800 mb-3 text-sm">
              {saleType === 'quote' ? 'Quote' : 'Order'} Summary
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Customer:</span>
                <span className="font-medium text-blue-800">
                  {formData.customer}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Email:</span>
                <span className="font-medium text-blue-800">
                  {formData.customerEmail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Items:</span>
                <span className="font-medium text-blue-800">
                  {lineItems.length} item{lineItems.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Images:</span>
                <span className="font-medium text-blue-800">
                  {lineItems.reduce(
                    (sum, item) => sum + (item.images?.length || 0),
                    0
                  )}{" "}
                  total
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Items Total:</span>
                <span className="font-medium text-blue-800">
                  ${saleSummary.customerSummary.itemsTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Setup Charges:</span>
                <span className="font-medium text-blue-800">
                  ${saleSummary.customerSummary.setupCharge.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Total Amount:</span>
                <span className="font-bold text-green-600 text-lg">
                  ${saleSummary.customerSummary.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Profit:</span>
                <span className="font-bold text-orange-600">
                  ${saleSummary.profit.toFixed(2)}
                </span>
              </div>
              {formData.inHandDate && (
                <div className="flex justify-between">
                  <span className="text-blue-700">In-Hand Date:</span>
                  <span className="font-medium text-blue-800">
                    {formData.inHandDate}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-blue-700">Status:</span>
                <span className="font-medium text-blue-800">
                  {saleType === 'quote' ? (
                    formData.status === "new-quote" ? "New Quote" :
                    formData.status === "quote-sent-to-customer" ? "Quote Sent" :
                    "Converted to Order"
                  ) : (
                    formData.status === "new" ? "New Order" :
                    formData.status === "in-production" ? "In Production" :
                    formData.status === "shipped" ? "Shipped" :
                    formData.status === "delivered" ? "Delivered" : "Cancelled"
                  )}
                </span>
              </div>
            </div>
          </Card>
        )}

        {isEditing && currentSaleId && (
          <Card className="p-4 bg-gray-50 border-gray-200">
            <h5 className="font-medium text-gray-800 mb-3 text-sm">
              {saleType === 'quote' ? 'Invoice' : 'Order'} Generation
            </h5>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    Generate PDF {saleType === 'quote' ? 'Invoice' : 'Receipt'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Create a downloadable PDF {saleType === 'quote' ? 'invoice' : 'receipt'} for this {saleType}
                  </p>
                </div>
                <Button
                  onClick={handleGeneratePDF}
                  loading={generatingPDF}
                  variant="secondary"
                  size="sm"
                  icon={FileText}
                  disabled={!currentSaleId || generatingPDF}
                  className="bg-white border-gray-300 hover:bg-gray-50"
                >
                  {generatingPDF ? "Generating..." : "Generate PDF"}
                </Button>
              </div>

              {lastGeneratedInvoice && (
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-green-700 font-medium">
                        {saleType === 'quote' ? 'Invoice' : 'Receipt'} #{lastGeneratedInvoice.invoice.number} Generated
                      </p>
                      <p className="text-xs text-gray-500">
                        Generated:{" "}
                        {new Date(
                          lastGeneratedInvoice.invoice.generatedAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownloadLastPDF}
                      variant="secondary"
                      size="sm"
                      icon={Download}
                      className="bg-white border-gray-300 hover:bg-gray-50"
                    >
                      Download
                    </Button>
                    <Button
                      onClick={handleViewPDF}
                      variant="secondary"
                      size="sm"
                      icon={ExternalLink}
                      className="bg-white border-gray-300 hover:bg-gray-50"
                    >
                      View
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {isEditing && (
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() =>
                showToast.success(
                  `${saleType === 'quote' ? 'Quote' : 'Order'} sent successfully to ` + formData.customerEmail
                )
              }
              variant="primary"
              size="sm"
              icon={Send}
              className="w-auto hover:to-indigo-700"
            >
              Send to Customer
            </Button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .ql-toolbar {
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          border-radius: 0 !important;
          padding: 8px 12px !important;
          background: #f9fafb !important;
        }

        .ql-container {
          border: none !important;
          border-radius: 0 !important;
          font-family: inherit !important;
          font-size: 14px !important;
        }

        .ql-editor {
          min-height: 120px !important;
          padding: 12px !important;
          line-height: 1.5 !important;
        }

        .ql-editor.ql-blank::before {
          color: #9ca3af !important;
          font-style: normal !important;
          font-size: 14px !important;
        }

        .ql-toolbar .ql-formats {
          margin-right: 12px !important;
        }

        .ql-toolbar button {
          padding: 4px !important;
          margin: 0 1px !important;
          border-radius: 4px !important;
        }

        .ql-toolbar button:hover {
          background-color: #e5e7eb !important;
        }

        .ql-toolbar button.ql-active {
          background-color: #3b82f6 !important;
          color: white !important;
        }

        .ql-toolbar button.ql-image-upload:before {
          content: "🖼️" !important;
          font-size: 14px !important;
        }

        .ql-editor ol {
          padding-left: 1.5em !important;
        }

        .ql-editor ul {
          padding-left: 1.5em !important;
        }

        .ql-editor li {
          margin-bottom: 4px !important;
        }

        .ql-editor a {
          color: #3b82f6 !important;
          text-decoration: underline !important;
        }

        .ql-editor a:hover {
          color: #1d4ed8 !important;
        }

        .ql-editor h1 {
          font-size: 1.5em !important;
          font-weight: bold !important;
          margin-bottom: 0.5em !important;
        }

        .ql-editor h2 {
          font-size: 1.25em !important;
          font-weight: bold !important;
          margin-bottom: 0.5em !important;
        }

        .ql-editor h3 {
          font-size: 1.125em !important;
          font-weight: bold !important;
          margin-bottom: 0.5em !important;
        }

        .saving-indicator {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Card>
  );
};