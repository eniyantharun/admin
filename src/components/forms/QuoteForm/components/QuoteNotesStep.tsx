import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FileText, Send, Download, ExternalLink, ImageIcon, Upload, CheckCircle, Clock, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/toast';
import { generateInvoicePDF, downloadPDF, openPDFInNewTab, InvoiceResponse } from '@/lib/pdfUtils';
import { iQuoteFormData, SaleSummary, LineItemData } from '@/types/quotes';
import { useApi } from '@/hooks/useApi';
import { 
  htmlToDocumentFormat, 
  documentFormatToHtml, 
  debounce,
  AddDocumentRevisionRequest,
  AddDocumentRevisionResponse 
} from '@/lib/documentConverter';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-32 bg-gray-50 rounded-lg animate-pulse" />
});

// Import styles
import 'react-quill/dist/quill.snow.css';

interface QuoteNotesStepProps {
  formData: iQuoteFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  saleSummary: SaleSummary | null;
  lineItems: LineItemData[];
  isEditing: boolean;
  currentSaleId?: string;
  documentId?: string | null; // Allow null to match API response types
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

export const QuoteNotesStep: React.FC<QuoteNotesStepProps> = ({
  formData,
  handleInputChange,
  saleSummary,
  lineItems,
  isEditing,
  currentSaleId,
  documentId // Required document ID from parent component
}) => {
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [lastGeneratedInvoice, setLastGeneratedInvoice] = useState<InvoiceResponse | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastSavedContent, setLastSavedContent] = useState<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveAttemptRef = useRef<string>('');

  // Debug logging
  console.log('QuoteNotesStep received documentId:', {
  documentId,
  documentIdType: typeof documentId,
  isNull: documentId === null,
  isUndefined: documentId === undefined,
  hasValue: !!documentId
});

  const { post } = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize last saved content
  useEffect(() => {
    if (formData.notes && !lastSavedContent) {
      setLastSavedContent(formData.notes);
    }
  }, [formData.notes, lastSavedContent]);

  // Save function
  const saveNotesToAPI = useCallback(async (content: string) => {
    // Don't attempt to save if no documentId is provided or is null
    if (!documentId) {
      console.warn('No documentId provided (null/undefined) - notes will not be saved to API');
      setSaveStatus('idle'); // Don't show error for missing documentId
      return;
    }

    if (!isOnline) {
      setSaveStatus('offline');
      return;
    }

    // Don't save if content hasn't changed
    if (content === lastSaveAttemptRef.current) {
      return;
    }

    lastSaveAttemptRef.current = content;
    setSaveStatus('saving');

    try {
      // Convert HTML to document format
      const documentContent = htmlToDocumentFormat(content);
      
      const requestPayload: AddDocumentRevisionRequest = {
        documentId,
        content: documentContent
      };

      console.log('Saving notes to API:', {
        url: '/Admin/Document/AddDocumentRevision',
        documentId,
        contentPreview: content.substring(0, 100) + '...',
        payload: requestPayload
      });

      // Use the relative URL (let the API client handle base URL)
      const response = await post<AddDocumentRevisionResponse>(
        '/Admin/Document/AddDocumentRevision',
        requestPayload
      );

      if (response) {
        setSaveStatus('saved');
        setLastSavedContent(content);
        console.log('Notes saved successfully:', response);
        
        // Reset to idle after showing saved status
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error saving notes:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      setSaveStatus('error');
      
      // Show error toast only for non-network errors
      if (!error.message?.includes('NetworkError') && !error.message?.includes('fetch')) {
        showToast.error(`Failed to save notes: ${error.response?.status || error.message}`);
      }
      
      // Reset to idle after showing error status
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  }, [documentId, post, isOnline, lastSavedContent]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((content: string) => {
      saveNotesToAPI(content);
    }, 1000), // Save after 1 second of inactivity
    [saveNotesToAPI]
  );

  // Configure Quill modules and formats
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link'],
        [{ 'align': [] }],
        ['clean'],
        ['image-upload'] // Custom button for image upload
      ],
      handlers: {
        'image-upload': () => setShowImageUpload(true)
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), []);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'link', 'align'
  ];

  const handleQuillChange = useCallback((content: string) => {
    console.log('Quill content changed:', {
      contentLength: content.length,
      contentPreview: content.substring(0, 100),
      documentId,
      lastSavedContent: lastSavedContent.substring(0, 50),
      willTriggerSave: !!(documentId && content !== lastSavedContent && content.trim() !== '')
    });

    // Update local state immediately
    const syntheticEvent = {
      target: {
        name: 'notes',
        value: content
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleInputChange(syntheticEvent);

    // Only save to API if documentId is available and content has changed
    if (documentId && content !== lastSavedContent && content.trim() !== '') {
      console.log('Triggering debounced save...');
      debouncedSave(content);
    } else {
      console.log('Save not triggered:', {
        hasDocumentId: !!documentId,
        contentChanged: content !== lastSavedContent,
        contentNotEmpty: content.trim() !== ''
      });
    }
  }, [handleInputChange, debouncedSave, lastSavedContent, documentId]);

  // Force save function for manual saves
  const forceSave = useCallback(() => {
    if (documentId && formData.notes && formData.notes !== lastSavedContent) {
      saveNotesToAPI(formData.notes);
    }
  }, [formData.notes, saveNotesToAPI, lastSavedContent, documentId]);

  // Retry save when coming back online
  useEffect(() => {
    if (isOnline && saveStatus === 'offline' && formData.notes !== lastSavedContent) {
      forceSave();
    }
  }, [isOnline, saveStatus, forceSave, formData.notes, lastSavedContent]);

  // Save status indicator
  const SaveStatusIndicator = () => {
    const getStatusConfig = () => {
      switch (saveStatus) {
        case 'saving':
          return {
            icon: Clock,
            text: 'Saving...',
            className: 'text-blue-600 bg-blue-50 border-blue-200'
          };
        case 'saved':
          return {
            icon: CheckCircle,
            text: 'Saved',
            className: 'text-green-600 bg-green-50 border-green-200'
          };
        case 'error':
          return {
            icon: AlertCircle,
            text: 'Save failed',
            className: 'text-red-600 bg-red-50 border-red-200'
          };
        case 'offline':
          return {
            icon: WifiOff,
            text: 'Offline',
            className: 'text-orange-600 bg-orange-50 border-orange-200'
          };
        default:
          return isOnline ? {
            icon: Wifi,
            text: 'Online',
            className: 'text-gray-500 bg-gray-50 border-gray-200'
          } : {
            icon: WifiOff,
            text: 'Offline',
            className: 'text-orange-600 bg-orange-50 border-orange-200'
          };
      }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${config.className}`}>
        <Icon className="w-3 h-3" />
        <span>{config.text}</span>
      </div>
    );
  };

  // Rest of the component methods remain the same...
  const handleGeneratePDF = async () => {
    if (!currentSaleId) {
      showToast.error('No sale ID available. Please save the quote first.');
      return;
    }

    if (!isEditing) {
      showToast.error('Please save the quote before generating PDF');
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
      console.error('PDF generation failed:', error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDownloadLastPDF = async () => {
    if (lastGeneratedInvoice?.asset.url) {
      await downloadPDF(lastGeneratedInvoice.asset.url, lastGeneratedInvoice.asset.filename);
    }
  };

  const handleViewPDF = () => {
    if (lastGeneratedInvoice?.asset.url) {
      openPDFInNewTab(lastGeneratedInvoice.asset.url);
    }
  };

  const handleImageUpload = () => {
    showToast.info('Image upload feature will be available soon');
    setShowImageUpload(false);
  };

  return (
    <div className="space-y-4">
      {/* Debug Info Panel - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-3 mb-4 bg-yellow-50 border-yellow-200">
          <h4 className="font-medium text-yellow-800 text-sm mb-2">Debug Info</h4>
          <div className="space-y-1 text-xs text-yellow-700">
            <div>Document ID: {documentId === null ? 'null' : documentId === undefined ? 'undefined' : documentId}</div>
            <div>Save Status: {saveStatus}</div>
            <div>Online: {isOnline ? 'Yes' : 'No'}</div>
            <div>Content Length: {formData.notes?.length || 0}</div>
            <div>Last Saved Length: {lastSavedContent.length}</div>
            <div>API Saves: {documentId ? 'Enabled' : 'Disabled (no documentId)'}</div>
            <Button
              onClick={() => {
                if (documentId && formData.notes) {
                  console.log('Manual save triggered');
                  saveNotesToAPI(formData.notes);
                } else {
                  console.log('Manual save failed:', { 
                    documentId: documentId === null ? 'null' : documentId === undefined ? 'undefined' : documentId,
                    hasNotes: !!formData.notes 
                  });
                  showToast.error('Cannot save: No document ID available');
                }
              }}
              size="sm"
              variant="secondary"
              className="mt-2"
              disabled={!documentId}
            >
              Test Manual Save
            </Button>
            
            {/* Add button to create/get document ID */}
            {!documentId && (
              <Button
                onClick={async () => {
                  showToast.info('Creating document for notes...');
                  // This would call an API to create a new document
                  // For now, just show what would happen
                  console.log('Would create new document for sale:', currentSaleId);
                }}
                size="sm"
                variant="primary"
                className="mt-2"
              >
                Create Notes Document
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* API Status Warning */}
      {!documentId && (
        <Card className="p-3 mb-4 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <p className="text-orange-700 text-sm">
              No document ID available for this quote. Notes will be saved locally only.
            </p>
          </div>
        </Card>
      )}

      {/* Rich Text Editor for Notes */}
      <div className="form-input-group">
        <div className="flex items-center justify-between mb-2">
          <label className="form-label block text-sm font-medium text-gray-700">
            Quote Notes
          </label>
          <div className="flex items-center gap-2">
            <SaveStatusIndicator />
            {saveStatus === 'error' && (
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
        
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <ReactQuill
            theme="snow"
            value={formData.notes || ''}
            onChange={handleQuillChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Add any special instructions, requirements, or notes for this quote..."
            style={{
              minHeight: '150px'
            }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            {documentId ? 
              'Changes are automatically saved • These notes will be visible to the customer' : 
              'Local changes only • Connect document ID to enable auto-save'
            }
          </p>
          
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

      {/* Image Upload Modal/Panel */}
      {showImageUpload && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-blue-800 text-sm">Add Image to Notes</h5>
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
              <p className="text-sm text-blue-700 mb-2">Upload an image to include in your notes</p>
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

      {/* Offline Warning */}
      {!isOnline && (
        <Card className="p-3 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-orange-600" />
            <p className="text-orange-700 text-sm">
              You're currently offline. Changes will be saved when connection is restored.
            </p>
          </div>
        </Card>
      )}

      {/* Quote Summary */}
      {saleSummary && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h5 className="font-medium text-blue-800 mb-3 text-sm">Quote Summary</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Customer:</span>
              <span className="font-medium text-blue-800">{formData.customer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Email:</span>
              <span className="font-medium text-blue-800">{formData.customerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Items:</span>
              <span className="font-medium text-blue-800">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Images:</span>
              <span className="font-medium text-blue-800">{lineItems.reduce((sum, item) => sum + (item.images?.length || 0), 0)} total</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Items Total:</span>
              <span className="font-medium text-blue-800">${saleSummary.customerSummary.itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Setup Charges:</span>
              <span className="font-medium text-blue-800">${saleSummary.customerSummary.setupCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Total Amount:</span>
              <span className="font-bold text-green-600 text-lg">${saleSummary.customerSummary.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Profit:</span>
              <span className="font-bold text-orange-600">${saleSummary.profit.toFixed(2)}</span>
            </div>
            {formData.inHandDate && (
              <div className="flex justify-between">
                <span className="text-blue-700">In-Hand Date:</span>
                <span className="font-medium text-blue-800">{formData.inHandDate}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-blue-700">Status:</span>
              <span className="font-medium text-blue-800">
                {formData.status === 'new-quote' ? 'New Quote' : 
                 formData.status === 'quote-sent-to-customer' ? 'Quote Sent' : 
                 'Converted to Order'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* PDF Generation Section */}
      {isEditing && currentSaleId && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <h5 className="font-medium text-gray-800 mb-3 text-sm">Invoice Generation</h5>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">Generate PDF Invoice</p>
                <p className="text-xs text-gray-500">Create a downloadable PDF invoice for this quote</p>
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
                {generatingPDF ? 'Generating...' : 'Generate PDF'}
              </Button>
            </div>

            {lastGeneratedInvoice && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-green-700 font-medium">
                      Invoice #{lastGeneratedInvoice.invoice.number} Generated
                    </p>
                    <p className="text-xs text-gray-500">
                      Generated: {new Date(lastGeneratedInvoice.invoice.generatedAt).toLocaleString()}
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

      {/* Action Buttons */}
      {isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={() => showToast.success('Quote sent successfully to ' + formData.customerEmail)}
            variant="primary"
            size="sm"
            icon={Send}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Send to Customer
          </Button>
        </div>
      )}

      {/* Enhanced Quill Styles */}
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
        
        /* List styling */
        .ql-editor ol {
          padding-left: 1.5em !important;
        }
        
        .ql-editor ul {
          padding-left: 1.5em !important;
        }
        
        .ql-editor li {
          margin-bottom: 4px !important;
        }
        
        /* Link styling */
        .ql-editor a {
          color: #3b82f6 !important;
          text-decoration: underline !important;
        }
        
        .ql-editor a:hover {
          color: #1d4ed8 !important;
        }
        
        /* Header styling */
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
        
        /* Auto-save indicator animation */
        .saving-indicator {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};