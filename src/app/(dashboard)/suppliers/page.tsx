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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApi } from "@/hooks/useApi";
import { EntityAvatar } from "@/components/helpers/EntityAvatar";
import { StatusBadge } from "@/components/helpers/StatusBadge";
import { ProductStats } from "@/components/helpers/ProductStats";
import { DateDisplay } from "@/components/helpers/DateDisplay";
import {
  EmptyState,
  LoadingState,
} from "@/components/helpers/EmptyLoadingStates";
import { PaginationControls } from "@/components/helpers/PaginationControls";
import { SupplierForm } from "@/components/forms/SupplierForm";
import { EntityDrawer } from "@/components/helpers/EntityDrawer";

interface Supplier {
  id: number;
  companyName: string;
  webUrl: string;
  emailAddress: string | null;
  telephoneNumber: string | null;
  enabled: boolean;
  exclusive: boolean;
  updatedAt: string;
  importedAt: string | null;
  productCount: number;
  importStatus: {
    [key: string]: number;
  };
  visibilityStats: {
    [key: string]: number;
  };
  website: string;
}

interface SupplierFormData {
  companyName: string;
  webUrl: string;
  emailAddress: string;
  telephoneNumber: string;
  enabled: boolean;
  exclusive: boolean;
}

const ContactInfo = memo(({ supplier }: { supplier: Supplier }) => (
  <>
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
    <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
      <Globe className="w-3 h-3 text-blue-400" />
      <a
        href={supplier.webUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate max-w-xs hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {supplier.webUrl}
      </a>
    </div>
  </>
));

ContactInfo.displayName = "ContactInfo";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const mainApiRef = useRef(
    useApi({
      cancelOnUnmount: false,
      dedupe: true,
      cacheDuration: 60000,
    })
  );

  const submitApiRef = useRef(
    useApi({
      cancelOnUnmount: false,
      dedupe: false,
    })
  );

  const mainApi = mainApiRef.current;
  const submitApi = submitApiRef.current;

  const fetchSuppliers = useCallback(async () => {
    if (!isInitialLoad && mainApi.loading) return;

    try {
      const response = await mainApi.get(
        `/Admin/SupplierList/GetSuppliersList`
      );
      if (!response?.suppliers) return;

      let filteredSuppliers = response.suppliers;

      if (localSearchTerm) {
        filteredSuppliers = filteredSuppliers.filter(
          (supplier: Supplier) =>
            supplier.companyName
              .toLowerCase()
              .includes(localSearchTerm.toLowerCase()) ||
            (supplier.emailAddress &&
              supplier.emailAddress
                .toLowerCase()
                .includes(localSearchTerm.toLowerCase())) ||
            (supplier.webUrl &&
              supplier.webUrl
                .toLowerCase()
                .includes(localSearchTerm.toLowerCase()))
        );
      }

      const startIndex = (currentPage - 1) * rowsPerPage;
      const paginatedSuppliers = filteredSuppliers.slice(
        startIndex,
        startIndex + rowsPerPage
      );

      setSuppliers(paginatedSuppliers);
      setTotalCount(filteredSuppliers.length);
    } catch (error: any) {
      if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
        console.error("Error fetching suppliers:", error);
      }
    } finally {
      setIsInitialLoad(false);
    }
  }, [localSearchTerm, currentPage, rowsPerPage, mainApi.get, isInitialLoad]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [localSearchTerm]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  const handleSubmit = useCallback(
    async (formData: SupplierFormData) => {
      try {
        if (isEditing && selectedSupplier) {
          await submitApi.put(
            `/Admin/SupplierList/UpdateSupplier/${selectedSupplier.id}`,
            formData
          );
        } else {
          await submitApi.post("/Admin/SupplierList/CreateSupplier", formData);
        }

        await fetchSuppliers();
        closeDrawer();
      } catch (error: any) {
        if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
          console.error("Error saving supplier:", error);
        }
      }
    },
    [isEditing, selectedSupplier, submitApi.put, submitApi.post, fetchSuppliers]
  );

  const openNewSupplierDrawer = useCallback(() => {
    setIsEditing(false);
    setSelectedSupplier(null);
    setIsDrawerOpen(true);
  }, []);

  const openEditSupplierDrawer = useCallback((supplier: Supplier) => {
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
    <div className="suppliers-page space-y-6">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Supplier List ({totalCount.toLocaleString()})
            </h3>

            <div className="relative w-full sm:w-auto">
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
              className=" shadow-lg"
            >
              Add Supplier
            </Button>
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
                  Products
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
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
                    onClick={() => openEditSupplierDrawer(supplier)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
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
                            ID: {supplier.id}{" "}
                            {supplier.exclusive && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Exclusive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <ContactInfo supplier={supplier} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <ProductStats
                        totalProducts={supplier.productCount}
                        enabledProducts={supplier.visibilityStats?.Enabled || 0}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <StatusBadge enabled={supplier.enabled} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <DateDisplay date={supplier.updatedAt} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
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
        size="xl"
        loading={submitApi.loading}
      >
        <SupplierForm
          supplier={selectedSupplier}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          loading={submitApi.loading}
        />
      </EntityDrawer>
    </div>
  );
}
