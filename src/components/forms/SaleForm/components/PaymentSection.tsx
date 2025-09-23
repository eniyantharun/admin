import React from 'react';
import { CreditCard, CheckCircle, XCircle, Calendar, Hash } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface PaymentSectionProps {
  orderDetails: any;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({ orderDetails }) => {
  const getPaymentStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'succeeded':
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatAmount = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <CreditCard className="w-5 h-5 text-green-500" />
        Payment Information
      </h3>

      <div className="space-y-4">
        {orderDetails.charges && orderDetails.charges.length > 0 ? (
          orderDetails.charges.map((charge: any) => (
            <Card key={charge.id} className="p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="flex items-center gap-2">
                      {getPaymentStatusIcon(charge.status)}
                      <span className={`text-sm font-medium ${
                        charge.status === 'succeeded' ? 'text-green-600' : 
                        charge.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {charge.status?.charAt(0).toUpperCase() + charge.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatAmount(charge.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Method</span>
                    <span className="text-sm font-medium text-gray-900">
                      {charge.brand} •••• {charge.last4}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Transaction ID</span>
                    <span className="text-xs font-mono text-gray-700">
                      {charge.responseDocument?.id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-xs text-gray-700">
                      {formatDate(charge.responseDocument?.created)}
                    </span>
                  </div>

                  {charge.responseDocument?.ref_num && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reference</span>
                      <span className="text-xs font-mono text-gray-700">
                        {charge.responseDocument.ref_num}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {charge.responseDocument?.auth_code && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Hash className="w-3 h-3" />
                    <span>Auth Code: {charge.responseDocument.auth_code}</span>
                  </div>
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No payment information available</p>
          </div>
        )}

        {orderDetails.paymentDetails && (
          <Card className="p-3 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Payment Date</span>
              <span className="text-sm font-medium text-blue-800">
                {new Date(orderDetails.paymentDetails.paymentDate).toLocaleDateString()}
              </span>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
};