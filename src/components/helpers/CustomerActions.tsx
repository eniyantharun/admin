import React, { useState } from "react";
import { Trash2, UserX, UserCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApi } from "@/hooks/useApi";
import { iCustomer, iCustomerActionsProps } from "@/types/customer";
import { showToast } from "@/components/ui/toast";

export const CustomerActions: React.FC<iCustomerActionsProps> = ({
  customer,
  onCustomerUpdated,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusApi = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  const deleteApi = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  const handleToggleStatus = async () => {
    try {
      const newBlockedStatus = !customer.isBlocked;
      const response = await statusApi.post(
        "/Admin/CustomerEditor/ToggleCustomerStatus",
        {
          id: customer.id,
          isBlocked: newBlockedStatus,
        }
      );

      if (response && response.success) {
        customer.isBlocked = response.data.isBlocked;
        onCustomerUpdated();
      }
    } catch (error: any) {
      showToast.error("Failed to update customer status");

      if (error?.response?.status === 403) {
        showToast.error(
          "Access denied. You do not have permission to change customer status."
        );
      } else if (error?.response?.status === 404) {
        showToast.error(
          "Customer not found. Please refresh the page and try again."
        );
      } else {
        showToast.error("Failed to update customer status. Please try again.");
      }
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      const response = await deleteApi.delete(
        `/Admin/CustomerEditor/DeleteCustomers?customerId=${customer.id}`
      );

      if (response && response.success) {
        onCustomerUpdated();
        setShowDeleteConfirm(false);

        showToast.success("Customer deleted successfully");
      }
    } catch (error: any) {
      showToast.error("Failed to delete customer");

      if (error?.response?.status === 403) {
        showToast.error(
          "Access denied. You do not have permission to delete customers."
        );
      } else if (error?.response?.status === 404) {
        showToast.error(
          "Customer not found. They may have already been deleted."
        );
      } else {
        showToast.error("Failed to delete customer. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-3">
          Customer Status
        </h4>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">
              Current Status:{" "}
              <span
                className={
                  customer.isBlocked ? "text-red-600" : "text-green-600"
                }
              >
                {customer.isBlocked ? "Disabled" : "Active"}
              </span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {customer.isBlocked
                ? "Customer cannot place orders or access their account"
                : "Customer has full access to place orders"}
            </p>
          </div>
          <Button
            onClick={handleToggleStatus}
            variant={customer.isBlocked ? "success" : "warning"}
            size="sm"
            icon={customer.isBlocked ? UserCheck : UserX}
            loading={statusApi.loading}
          >
            {customer.isBlocked ? "Enable Customer" : "Disable Customer"}
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-red-50 border-red-200">
        <h4 className="text-sm font-medium text-red-800 mb-3">Danger Zone</h4>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-800">Delete Customer</p>
            <p className="text-xs text-red-600">
              Permanently remove this customer and all associated data
            </p>
          </div>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="danger"
            size="sm"
            icon={Trash2}
            disabled={statusApi.loading || deleteApi.loading}
          >
            Delete
          </Button>
        </div>
      </Card>

      {showDeleteConfirm && (
        <Card className="p-4 bg-red-50 border-red-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Confirm Customer Deletion
              </h4>
              <p className="text-sm text-red-700 mb-4">
                Are you sure you want to delete{" "}
                <strong>
                  {customer.firstName} {customer.lastName}
                </strong>
                ? This action cannot be undone and will permanently remove:
              </p>
              <ul className="text-xs text-red-600 mb-4 space-y-1">
                <li>• Customer profile and contact information</li>
                <li>• All associated addresses</li>
                <li>• Order history and transaction records</li>
                <li>• Any linked quotes or pending requests</li>
              </ul>
              <div className="flex gap-3">
                <Button
                  onClick={handleDeleteCustomer}
                  variant="danger"
                  size="sm"
                  loading={deleteApi.loading}
                  className="flex-1"
                >
                  Yes, Delete Customer
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  disabled={deleteApi.loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
