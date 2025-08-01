"use client";
import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import {
  Search,
  Plus,
  Edit2,
  Phone,
  Mail,
  Globe,
  X,
  Building,
  Star,
  Trash2,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/Button";
import { EntityAvatar } from "@/components/helpers/EntityAvatar";
import { StatusBadge } from "@/components/helpers/StatusBadge";
import { DateDisplay } from "@/components/helpers/DateDisplay";
import { Card } from "@/components/ui/Card";
import { PaginationControls } from "@/components/helpers/PaginationControls";
import { EntityDrawer } from "@/components/helpers/EntityDrawer";
import { SupplierForm } from "@/components/forms/SupplierForm";
import { EmptyState, LoadingState } from "@/components/helpers/EmptyLoadingStates";
import { ConfirmationModal } from "@/components/helpers/confirmationModal";
import { showToast } from "@/components/ui/toast";

const transformApiSupplier = (apiSupplier: IApiSupplier): ISupplier => ({
  id: apiSupplier.id,
  companyName: apiSupplier.companyName,
  webUrl: apiSupplier.website || "",
  emailAddress: apiSupplier.email,
  telephoneNumber: apiSupplier.phone,
  isActive: apiSupplier.isActive,
  exclusive: false,
  updatedAt: apiSupplier.createdAt,
  importedAt: null,
  productCount: 0,
  importStatus: {},
  visibilityStats: { Enabled: 0 },
  website: apiSupplier.website || "",
  contactFirstName: apiSupplier.contactFirstName,
  contactLastName: apiSupplier.contactLastName,
  totalOrders: apiSupplier.totalOrders,
  lastOrderId: apiSupplier.lastOrderId,
  rating: apiSupplier.rating,
  address: apiSupplier.address,
});

const ContactInfo = memo(({ supplier }: { supplier: ISupplier }) => (
  <>
    {(supplier.contactFirstName || supplier.contactLastName) && (
      <div className="text-sm text-gray-900 flex items-center gap-1 mb-1">
        <span className="truncate max-w-xs">
          {[supplier.contactFirstName, supplier.contactLastName].filter(Boolean).join(" ")}
        </span>
      </div>
    )}
    {supplier.emailAddress && (
      <div className="text-sm text-gray-900 flex items-center gap-1 mb-1">
        <Mail className="w-3 h-3 text-gray-400" />
        <span className="truncate max-w-xs">{supplier.emailAddress}</span>
      </div>
    )}
    {supplier.telephoneNumber && (
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Phone className="w-3 h-3 text-gray-400" />
        <span>{supplier.telephoneNumber}</span>
      </div>
    )}
    {supplier.webUrl && (
      <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
        <Globe className="w-3 h-3 text-blue-400" />
        <a
          href={supplier.webUrl.startsWith("http") ? supplier.webUrl : `promotional_product_inc`}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate max-w-xs hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {supplier.webUrl}
        </a>
      </div>
    )}
  </>
));

ContactInfo.displayName = "ContactInfo";

const OrderStats = memo(({ supplier }: { supplier: ISupplier }) => (
  <div className="space-y-1">
    <div className="text-sm text-gray-900">
      {supplier.totalOrders} orders
    </div>
    {supplier.lastOrderId && (
      <div className="text-xs text-gray-500">
        Last order ID: #{supplier.lastOrderId}
      </div>
    )}
    {supplier.rating && (
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 text-yellow-400 fill-current" />
        <span className="text-xs text-gray-600">{supplier.rating}</span>
      </div>
    )}
  </div>
));

OrderStats.displayName = "OrderStats";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplier | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const mountedRef = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  const mainApiRef = useRef(useApi());
  const submitApiRef = useRef(useApi());

  const mainApi = mainApiRef.current;
  const submitApi = submitApiRef.current;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<ISupplier | null>(null);

  const fetchSuppliers = useCallback(async () => {
    if (!mountedRef.current || (!isInitialLoad && mainApi.loading)) {
      return;
    }

    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;

      try {
        const queryParams = new URLSearchParams({
          website: "promotional_product_inc",
          search: localSearchTerm
        });

        const response: IApiResponse | null= await mainApi.get(
          `/Admin/SupplierEditor/GetSupplier?${queryParams}`
        );

        if (!mountedRef.current || !response?.data?.suppliers) return;

        const transformedSuppliers = response.data.suppliers.map(transformApiSupplier);

        setSuppliers(transformedSuppliers);
        setTotalCount(response.data.pagination.totalItems);
      } catch (error: any) {
        if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
          showToast.error("Error fetching suppliers:", error);
         alert("Failed to load suppliers."); 
        }
      } finally {
        if (mountedRef.current) {
          setIsInitialLoad(false);
        }
      }
    }, 300);
  }, [
    localSearchTerm,
    mainApi,
    isInitialLoad,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

 useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      console.log("none")
    }
  }, [localSearchTerm, currentPage, fetchSuppliers]);
     const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);
  const handleSubmit = useCallback(
    async (formData: ISupplierFormData) => {
      try {
        if (isEditing && selectedSupplier) {
          await submitApi.post(
          `/Admin/SupplierEditor/UpdateSupplier`,
          { ...formData, id: String(selectedSupplier.id) }
        );
        alert("Supplier updated successfully!");
        } else {
          await submitApi.post("/Admin/SupplierEditor/AddNewSupplier", formData);
          alert("Supplier added successfully!");
        }

        await fetchSuppliers();
        closeDrawer();
      } catch (error: any) {
        if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
          showToast.error("Error saving supplier:", error);
          alert("Failed to save supplier. Please try again.");
        }
      }
    },
    [isEditing, selectedSupplier, submitApi.put, submitApi.post, fetchSuppliers]
  );

  const handleDeleteSupplier = useCallback(
    (supplier: ISupplier) => {
      setSupplierToDelete(supplier);
      setIsDeleteModalOpen(true);
    },
    []
  );

const confirmDelete = useCallback(async () => {
  if (supplierToDelete) {
    try {
      await submitApi.post(`/Admin/SupplierEditor/RemoveSupplier`, { id: supplierToDelete.id });

      alert(`Supplier "${supplierToDelete.companyName}" deleted successfully.`);
      await fetchSuppliers();
      setIsDeleteModalOpen(false);
      setSupplierToDelete(null);
    } catch (error) {
      showToast.error("Error deleting supplier");
      alert("Failed to delete supplier. Please try again.");
      setIsDeleteModalOpen(false);
      setSupplierToDelete(null);
    }
  }
}, [supplierToDelete, submitApi.post, fetchSuppliers]);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSupplierToDelete(null);
  }, []);

  const openNewSupplierDrawer = useCallback(() => {
    setIsEditing(false);
    setSelectedSupplier(null);
    setIsDrawerOpen(true);
  }, []);

  const openEditSupplierDrawer = useCallback((supplier: ISupplier) => {
    setIsEditing(true);
    setSelectedSupplier(supplier);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedSupplier(null);
    setIsEditing(false);
  }, []);

  const handleLocalSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearchTerm(e.target.value);
    },
    []
  );

  const clearLocalSearch = useCallback(() => {
    setLocalSearchTerm("");
  }, []);

  return (
    <div className="suppliers-page space-y-6 p-6 bg-gray-50 min-h-screen">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Supplier List ({totalCount.toLocaleString()})
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search suppliers..."
                value={localSearchTerm}
                onChange={handleLocalSearchChange}
                className="w-full sm:w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {localSearchTerm && (
                <button
                  onClick={clearLocalSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <Button
              onClick={openNewSupplierDrawer}
              icon={Plus}
              className="shadow-lg"
            >
              Add Supplier
            </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders & Rating
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mainApi.loading && isInitialLoad ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <LoadingState message="Loading suppliers..." />
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <EmptyState
                      icon={Building}
                      title="No suppliers found"
                      description="Get started by adding your first supplier."
                      hasSearch={!!localSearchTerm}
                    />
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="px-4 py-2 whitespace-nowrap" onClick={() => openEditSupplierDrawer(supplier)}>
                      <div className="flex items-center">
                        <EntityAvatar
                          name={supplier.companyName}
                          id={supplier.id}
                          type="supplier"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {supplier.companyName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {supplier.companyName}
                            {supplier.exclusive && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Exclusive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap" onClick={() => openEditSupplierDrawer(supplier)}>
                      <ContactInfo supplier={supplier} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap" onClick={() => openEditSupplierDrawer(supplier)}>
                      <OrderStats supplier={supplier} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap" onClick={() => openEditSupplierDrawer(supplier)}>
                      <StatusBadge enabled={supplier.isActive} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap" onClick={() => openEditSupplierDrawer(supplier)}>
                      <DateDisplay date={supplier.updatedAt} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditSupplierDrawer(supplier);
                          }}
                          variant="secondary"
                          size="sm"
                          icon={Edit2}
                          iconOnly
                        />
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSupplier(supplier);
                          }}
                          variant="secondary" 
                          size="sm"
                          icon={Trash2}
                          iconOnly
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalCount > 0 && !mainApi.loading && (
        <Card>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </Card>
      )}

      <EntityDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={isEditing ? "Edit Supplier" : "Add New Supplier"}
        loading={submitApi.loading}
      >
        <SupplierForm
          supplier={selectedSupplier}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          loading={submitApi.loading}
        />
      </EntityDrawer>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete supplier "${supplierToDelete?.companyName || 'this supplier'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={submitApi.loading}
      />
    </div>
  );
}