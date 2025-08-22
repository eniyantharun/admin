import React, { useState } from 'react';
import { FileText, Send, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/toast';
import { generateInvoicePDF, downloadPDF, openPDFInNewTab, InvoiceResponse } from '@/lib/pdfUtils';
import { iQuoteFormData, SaleSummary, LineItemData } from '@/types/quotes';

interface QuoteNotesStepProps {
  formData: iQuoteFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  saleSummary: SaleSummary | null;
  lineItems: LineItemData[];
  isEditing: boolean;
  currentSaleId?: string; // Add this prop to the existing interface
}

export const QuoteNotesStep: React.FC<QuoteNotesStepProps> = ({
  formData,
  handleInputChange,
  saleSummary,
  lineItems,
  isEditing,
  currentSaleId
}) => {
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [lastGeneratedInvoice, setLastGeneratedInvoice] = useState<InvoiceResponse | null>(null);

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
        
        // Optionally auto-download the PDF
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

  return (
    <div className="space-y-4">
      <div className="form-input-group">
        <label className="form-label block text-sm font-medium text-gray-700 mb-1">
          Quote Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
          placeholder="Add any special instructions, requirements, or notes for this quote..."
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">These notes will be visible to the customer on the quote</p>
      </div>

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
            {/* Generate PDF Button */}
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

            {/* Last Generated Invoice Actions */}
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
                    <p className="text-xs text-gray-500">
                      File: {lastGeneratedInvoice.asset.filename} ({(lastGeneratedInvoice.asset.size / 1024).toFixed(1)} KB)
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

            {/* Sale ID Info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <span>Sale ID: {currentSaleId}</span>
            </div>
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
    </div>
  );
};