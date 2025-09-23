import { api } from '@/lib/api';
import { showToast } from '@/components/ui/toast';

export interface InvoiceResponse {
  invoice: {
    typeTitle: string;
    number: number;
    companyContact: {
      address: string;
      email: string;
    };
    createdAt: string;
    generatedAt: string;
    
  };
  asset: {
    id: string;
    filename: string;
    contentType: string;
    size: number;
    isPublic: boolean;
    createdAt: string;
    sourceKey: string;
    webpKey: string;
    url: string;
    convertedTo: string | null;
  };
}

export const generateInvoicePDF = async (saleId: string): Promise<InvoiceResponse | null> => {
  try {
    showToast.loading('Generating PDF invoice...');
    
    const response = await api.get<InvoiceResponse>(
      `/Admin/Invoice/GenerateInvoice?saleId=${saleId}`
    );
    
    showToast.dismiss();
    
    if (response && response.asset) {
      showToast.success(`Invoice #${response.invoice.number} generated successfully`);
      return response;
    } else {
      showToast.error('Failed to generate invoice - invalid response');
      return null;
    }
  } catch (error: any) {
    showToast.dismiss();
    console.log('Error generating invoice:', error);
    
    if (error?.response?.status === 404) {
      showToast.error('Sale not found - cannot generate invoice');
    } else if (error?.response?.status === 400) {
      showToast.error('Invalid sale data - cannot generate invoice');
    } else {
      showToast.error('Failed to generate invoice. Please try again.');
    }
    
    return null;
  }
};

export const downloadPDF = async (url: string, filename: string): Promise<void> => {
  try {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast.success('PDF download started');
  } catch (error) {
    console.error('Error downloading PDF:', error);
    showToast.error('Failed to download PDF');
  }
};

export const openPDFInNewTab = (url: string): void => {
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Error opening PDF:', error);
    showToast.error('Failed to open PDF');
  }
};
