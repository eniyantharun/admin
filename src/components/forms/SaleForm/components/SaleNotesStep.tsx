import React, { useState, useCallback, useRef, useEffect } from "react";
import { FileText, Send, Download, ExternalLink, ImageIcon, Upload, CheckCircle, Clock, AlertCircle, Wifi, WifiOff, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { showToast } from "@/components/ui/toast";
import { generateInvoicePDF, downloadPDF, openPDFInNewTab, InvoiceResponse } from "@/lib/pdfUtils";
import { LineItemData, SaleSummary } from "@/types/quotes";
import { useApi } from "@/hooks/useApi";
import { htmlToDocumentFormat, documentFormatToHtml, debounce, AddDocumentRevisionRequest, AddDocumentRevisionResponse } from "@/lib/documentConverter";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-50 rounded-lg animate-pulse" />,
});

import "react-quill/dist/quill.snow.css";

interface SaleNotesStepProps {
  type: 'quote' | 'order';
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  saleSummary: SaleSummary | null;
  lineItems: LineItemData[];
  isEditing: boolean;
  currentSaleId?: string;
  documentId?: string | null;
  onDocumentIdCreated?: (documentId: string) => void;
  saleDetails?: any;
}

type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

export const SaleNotesStep: React.FC<SaleNotesStepProps> = ({
  type,
  formData,
  handleInputChange,
  saleSummary,
  lineItems,
  isEditing,
  currentSaleId,
  documentId,
  onDocumentIdCreated,
  saleDetails,
}) => {
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [lastGeneratedInvoice, setLastGeneratedInvoice] = useState<InvoiceResponse | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [lastSavedContent, setLastSavedContent] = useState<string>("");
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [hasLoadedInitialContent, setHasLoadedInitialContent] = useState(false);
  const [localDocumentId, setLocalDocumentId] = useState<string | null>(documentId || null);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [newComment, setNewComment] = useState("");

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveAttemptRef = useRef<string>("");

  const { get, post } = useApi({ cancelOnUnmount: false, dedupe: false });

  // Debug logging
  useEffect(() => {
    console.log('SaleNotesStep - saleDetails:', saleDetails);
    console.log('SaleNotesStep - type:', type);
    if (saleDetails) {
      console.log('SaleNotesStep - saleDetails.sale:', saleDetails.sale);
      console.log('SaleNotesStep - saleDetails[type]:', saleDetails[type]);
      if (saleDetails.sale) {
        console.log('SaleNotesStep - comments:', saleDetails.sale.comments);
      }
    }
  }, [saleDetails, type]);

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
        const response = await get(`/Admin/Document/GetDocumentDetail?documentId=${documentId}`);
        if (response?.content) {
          const htmlContent = documentFormatToHtml(response.content);
          setLastSavedContent(htmlContent);
          if (htmlContent !== formData.notes) {
            const syntheticEvent = {
              target: { name: "notes", value: htmlContent }
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        } else {
          setLastSavedContent(formData.notes || "");
        }
      } catch (error) {
        console.error("Error loading notes:", error);
        setLastSavedContent(formData.notes || "");
      } finally {
        setIsLoadingNotes(false);
        setHasLoadedInitialContent(true);
      }
    };

    loadNotesContent();
  }, [documentId]);

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

  const saveNotesToAPI = useCallback(async (content: string) => {
    if (!localDocumentId || !isOnline) {
      if (!isOnline) setSaveStatus("offline");
      return;
    }

    if (content === lastSaveAttemptRef.current) return;

    lastSaveAttemptRef.current = content;
    setSaveStatus("saving");

    try {
      const documentContent = htmlToDocumentFormat(content);
      const requestPayload: AddDocumentRevisionRequest = {
        documentId: localDocumentId,
        content: documentContent,
      };

      const response = await post<AddDocumentRevisionResponse>("/Admin/Document/AddDocumentRevision", requestPayload);

      if (response) {
        setSaveStatus("saved");
        setLastSavedContent(content);
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    } catch (error: any) {
      console.error("Error saving notes:", error);
      setSaveStatus("error");
      if (!error.message?.includes("NetworkError") && !error.message?.includes("fetch")) {
        showToast.error("Failed to save notes");
      }
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [localDocumentId, post, isOnline]);

  const createDocument = useCallback(async (): Promise<string | null> => {
    if (isCreatingDocument) return null;

    setIsCreatingDocument(true);
    try {
      const response = await post("/Admin/Document/AddDocument", {
        isPublic: false,
        saleId: currentSaleId,
      });

      if (response?.id) {
        if (currentSaleId) {
          try {
            const endpoint = type === 'quote'
              ? "/Admin/SaleEditor/SetSaleDetail"
              : "/Admin/SaleEditor/SetSaleDetail";
              
            await post(endpoint, {
              saleId: response.quote?.sale?.saleId,
              notesId: response.id,
            });
          } catch (linkError) {
            console.error("Failed to link document:", linkError);
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
  }, [post, currentSaleId, isCreatingDocument, type]);

  const debouncedSave = useCallback(
    debounce((content: string) => {
      saveNotesToAPI(content);
    }, 3000),
    [saveNotesToAPI]
  );

  const handleQuillChange = useCallback(async (content: string) => {
    if (isLoadingNotes || !hasLoadedInitialContent) return;

    const syntheticEvent = {
      target: { name: "notes", value: content }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(syntheticEvent);

    if (!localDocumentId && !isCreatingDocument && content.trim() !== "" && content !== "<p><br></p>") {
      const newDocumentId = await createDocument();
      if (newDocumentId) {
        setLocalDocumentId(newDocumentId);
        onDocumentIdCreated?.(newDocumentId);
        debouncedSave(content);
      }
      return;
    }

    const contentChanged = content !== lastSavedContent;
    const significantChange = Math.abs(content.length - lastSavedContent.length) > 5;
    const hasRealContent = content.replace(/<[^>]*>/g, "").trim().length > 0;

    if (localDocumentId && contentChanged && (significantChange || hasRealContent)) {
      debouncedSave(content);
    }
  }, [handleInputChange, debouncedSave, lastSavedContent, localDocumentId, isLoadingNotes, hasLoadedInitialContent, createDocument, onDocumentIdCreated, isCreatingDocument]);

  const handleGeneratePDF = async () => {
    if (!currentSaleId) {
      showToast.error("No sale ID available");
      return;
    }

    if (!isEditing) {
      showToast.error(`Please save the ${type} before generating PDF`);
      return;
    }

    setGeneratingPDF(true);

    try {
      const invoiceResponse = await generateInvoicePDF(currentSaleId);
      if (invoiceResponse) {
        setLastGeneratedInvoice(invoiceResponse);
        if (invoiceResponse.asset.url) {
          await downloadPDF(invoiceResponse.asset.url, invoiceResponse.asset.filename);
        }
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      showToast.error("Please enter a comment");
      return;
    }
    
    // This will be connected to API later
    showToast.success("Comment functionality will be connected to API");
    setNewComment("");
  };

  const SaveStatusIndicator = () => {
    const config = (() => {
      switch (saveStatus) {
        case 'saving': return { icon: Clock, text: 'Saving...', className: 'text-blue-600 bg-blue-50 border-blue-200' };
        case 'saved': return { icon: CheckCircle, text: 'Saved', className: 'text-green-600 bg-green-50 border-green-200' };
        case 'error': return { icon: AlertCircle, text: 'Save failed', className: 'text-red-600 bg-red-50 border-red-200' };
        case 'offline': return { icon: WifiOff, text: 'Offline', className: 'text-orange-600 bg-orange-50 border-orange-200' };
        default: return isOnline ? { icon: Wifi, text: 'Online', className: 'text-gray-500 bg-gray-50 border-gray-200' } : { icon: WifiOff, text: 'Offline', className: 'text-orange-600 bg-orange-50 border-orange-200' };
      }
    })();

    const Icon = config.icon;
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${config.className}`}>
        <Icon className="w-3 h-3" />
        <span>{config.text}</span>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
          <FileText className="w-5 h-5 text-green-500" />
          Notes
        </h3>
        <SaveStatusIndicator />
      </div>

      <div className="space-y-6">
        <div className="form-input-group">
          <label className="form-label block text-sm font-medium text-gray-700 mb-2">
            Notes & Instructions
          </label>

          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {isLoadingNotes ? (
              <div className="h-32 bg-gray-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-400 animate-spin" />
              </div>
            ) : (
              <ReactQuill
                theme="snow"
                value={formData.notes || ""}
                onChange={handleQuillChange}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    ["clean"]
                  ]
                }}
                placeholder="Add any special instructions..."
                style={{ minHeight: "150px" }}
              />
            )}
          </div>
        </div>

        {saleSummary && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h5 className="font-medium text-blue-800 mb-3 text-sm">Summary</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Customer:</span>
                <span className="font-medium text-blue-800">{formData.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Items:</span>
                <span className="font-medium text-blue-800">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Total Amount:</span>
                <span className="font-bold text-green-600 text-lg">${saleSummary.customerSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        )}

        {isEditing && currentSaleId && (
          <Card className="p-4 bg-gray-50 border-gray-200">
            <h5 className="font-medium text-gray-800 mb-3 text-sm">Invoice Generation</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 font-medium">Generate PDF Invoice</p>
                  <p className="text-xs text-gray-500">Create a downloadable PDF invoice</p>
                </div>
                <Button
                  onClick={handleGeneratePDF}
                  loading={generatingPDF}
                  variant="secondary"
                  size="sm"
                  icon={FileText}
                  disabled={!currentSaleId || generatingPDF}
                >
                  {generatingPDF ? "Generating..." : "Generate PDF"}
                </Button>
              </div>

              {lastGeneratedInvoice && (
                <div className="border-t pt-3">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => downloadPDF(lastGeneratedInvoice.asset.url, lastGeneratedInvoice.asset.filename)}
                      variant="secondary"
                      size="sm"
                      icon={Download}
                    >
                      Download
                    </Button>
                    <Button
                      onClick={() => openPDFInNewTab(lastGeneratedInvoice.asset.url)}
                      variant="secondary"
                      size="sm"
                      icon={ExternalLink}
                    >
                      View
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Add Comment Section */}
        <Card className="p-4 bg-white border-gray-200">
          <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Add Comment
          </h4>
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                size="sm"
                icon={Send}
                className="bg-gradient-to-r"
              >
                COMMENT
              </Button>
            </div>
          </div>
        </Card>

        {(() => {
          const comments = saleDetails?.sale?.comments || 
                          saleDetails?.[type]?.sale?.comments || 
                          [];
          
          console.log('Rendering comments, found:', comments.length, 'comments');
          
          return comments.length > 0 ? (
            <Card className="p-4 bg-white border-gray-200">
              <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                Recent Comments ({comments.length})
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="border-l-2 border-blue-300 pl-3 py-2 bg-blue-50 rounded-r">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-blue-600 font-medium">
                        {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null;
        })()}
      </div>
    </Card>
  );
};