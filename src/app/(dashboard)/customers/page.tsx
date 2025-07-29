"use client";

import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import {
  Search,
  Plus,
  Edit2,
  Phone,
  Mail,
  Building,
  X,
  User,
  Calendar,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApi } from "@/hooks/useApi";
import { EntityAvatar } from "@/components/helpers/EntityAvatar";
import { DateDisplay } from "@/components/helpers/DateDisplay";
import {
  EmptyState,
  LoadingState,
} from "@/components/helpers/EmptyLoadingStates";
import { PaginationControls } from "@/components/helpers/PaginationControls";
import { EntityDrawer } from "@/components/helpers/EntityDrawer";
import { CustomerForm } from "@/components/forms/CustomerForm";
import { Customer, CustomerFormData, ApiCustomer } from "@/types/customer";

const ContactInfo = memo<{ customer: Customer }>(({ customer }) => (
  <>
    <div className="text-sm text-gray-900 flex items-center gap-1">
      <Mail className="w-3 h-3 text-gray-400" />
      <span className="truncate max-w-xs">{customer.email}</span>
    </div>
    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
      <Phone className="w-3 h-3 text-gray-400" />
      <span>{customer.phone || "No phone"}</span>
    </div>
  </>
));

ContactInfo.displayName = "ContactInfo";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [businessFilter, setBusinessFilter] = useState<string>("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const mountedRef = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  const mainApi = useApi({
    cancelOnUnmount: true,
    dedupe: true,
    cacheDuration: 60000,
  });

  const submitApi = useApi({
    cancelOnUnmount: false,
    dedupe: false,
  });

  const transformApiCustomer = useCallback(
    (apiCustomer: ApiCustomer): Customer => {
      return {
        id: apiCustomer.id,
        idNum: apiCustomer.idNum,
        firstName: apiCustomer.form.firstName || "",
        lastName: apiCustomer.form.lastName || "",
        email: apiCustomer.form.email || "",
        phone: apiCustomer.form.phoneNumber || "",
        website: apiCustomer.website || "PromotionalProductInc",
        companyName: apiCustomer.form.companyName || "",
        isBlocked: false,
        isBusinessCustomer: !!apiCustomer.form.companyName,
        createdAt: apiCustomer.createdAt,
      };
    },
    []
  );

  const fetchCustomers = useCallback(async () => {
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
          Search: localSearchTerm || "",
          Count: rowsPerPage.toString(),
          Index: ((currentPage - 1) * rowsPerPage).toString(),
          Website: "promotional_product_inc"
        });

        const response = await mainApi.get(`/Admin/CustomerEditor/GetCustomersList?${queryParams}`);

        if (!mountedRef.current || !response) return;

        let transformedCustomers = (response.customers || []).map(transformApiCustomer);

        if (statusFilter === 'active') {
          transformedCustomers = transformedCustomers.filter((c: Customer) => !c.isBlocked);
        } else if (statusFilter === 'disabled') {
          transformedCustomers = transformedCustomers.filter((c: Customer) => c.isBlocked);
        }

        if (businessFilter === 'business') {
          transformedCustomers = transformedCustomers.filter((c: Customer) => c.isBusinessCustomer);
        } else if (businessFilter === 'individual') {
          transformedCustomers = transformedCustomers.filter((c: Customer) => !c.isBusinessCustomer);
        }

        setCustomers(transformedCustomers);
        setTotalCount(response.count || 0);
      } catch (error: any) {
        if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
          console.error("Error fetching customers:", error);
        }
      } finally {
        if (mountedRef.current) {
          setIsInitialLoad(false);
        }
      }
    }, 300);
  }, [
    localSearchTerm,
    statusFilter,
    businessFilter,
    currentPage,
    rowsPerPage,
    transformApiCustomer,
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
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [localSearchTerm, statusFilter, businessFilter]);
  
  const paginationData = {
    totalPages: Math.ceil(totalCount / rowsPerPage),
    startIndex: (currentPage - 1) * rowsPerPage,
    endIndex: Math.min(
      (currentPage - 1) * rowsPerPage + rowsPerPage,
      totalCount
    ),
  };

  const handleSubmit = useCallback(
    async (formData: CustomerFormData) => {
      try {
        if (isEditing && selectedCustomer) {
          await submitApi.post('/Admin/CustomerEditor/UpdateCustomer', {
            customerId: selectedCustomer.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            companyName: formData.companyName,
            isBusinessCustomer: formData.isBusinessCustomer,
            isBlocked: selectedCustomer.isBlocked,
            website: formData.website
          });
        } else {
          const response = await submitApi.post('/Admin/CustomerEditor/CreateCustomer', {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            website: formData.website,
            companyName: formData.companyName,
            isBusinessCustomer: formData.isBusinessCustomer
          });

          if (formData.addresses.length > 0 && response?.data?.id) {
            const customerId = response.data.id;
            for (const address of formData.addresses) {
              await submitApi.post('/Admin/CustomerEditor/AddCustomerAddress', {
                customerId,
                ...address
              });
            }
          }
        }

        await fetchCustomers();
        closeDrawer();
      } catch (error: any) {
        if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
          console.error("Error saving customer:", error);
        }
      }
    },
    [isEditing, selectedCustomer, fetchCustomers, submitApi]
  );

  const openNewCustomerDrawer = useCallback(() => {
    setIsEditing(false);
    setSelectedCustomer(null);
    setIsDrawerOpen(true);
  }, []);

  const openEditCustomerDrawer = useCallback((customer: Customer) => {
    setIsEditing(true);
    setSelectedCustomer(customer);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedCustomer(null);
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

  const sendResetPasswordEmail = useCallback(
    async (email: string) => {
      try {
        await submitApi.post('/Admin/CustomerEditor/SendResetPasswordEmail', {
          email: email,
          website: "PromotionalProductInc"
        });
        alert(`Reset password email sent to ${email}`);
      } catch (error: any) {
        if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
          console.error("Error sending reset password email:", error);
          alert("Failed to send reset password email");
        }
      }
    },
    [submitApi]
  );

  const sendNewAccountEmail = useCallback(
    async (email: string) => {
      try {
        await submitApi.post('/Admin/CustomerEditor/SendNewAccountEmail', {
          email: email,
          website: "PromotionalProductInc"
        });
        alert(`New account email sent to ${email}`);
      } catch (error: any) {
        if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
          console.error("Error sending new account email:", error);
          alert("Failed to send new account email");
        }
      }
    },
    [submitApi]
  );

  return (
    <div className="customers-page space-y-6">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Customer List ({totalCount.toLocaleString()})
            </h3>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search customers..."
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

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>

                <select
                  value={businessFilter}
                  onChange={(e) => setBusinessFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="business">Business</option>
                  <option value="individual">Individual</option>
                </select>
              </div>

              <Button
                onClick={openNewCustomerDrawer}
                icon={Plus}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg whitespace-nowrap"
              >
                Add Customer
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mainApi.loading && isInitialLoad ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8">
                    <LoadingState message="Loading customers..." />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8">
                    <EmptyState
                      icon={User}
                      title="No customers found"
                      description="Get started by adding your first customer."
                      hasSearch={!!localSearchTerm || statusFilter !== 'all' || businessFilter !== 'all'}
                    />
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => openEditCustomerDrawer(customer)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <EntityAvatar
                          name={`${customer.firstName} ${customer.lastName}`}
                          id={customer.idNum}
                          type="customer"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {customer.idNum}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <ContactInfo customer={customer} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-xs">
                          {customer.companyName || "No company"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        customer.isBusinessCustomer 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.isBusinessCustomer ? 'Business' : 'Individual'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        customer.isBlocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {customer.isBlocked ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <DateDisplay date={customer.createdAt} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCustomerDrawer(customer);
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
            totalPages={paginationData.totalPages}
            totalCount={totalCount}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
            startIndex={paginationData.startIndex}
            endIndex={paginationData.endIndex}
          />
        </Card>
      )}

      <EntityDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={isEditing ? "Edit Customer" : "Add New Customer"}
        size="xl"
        loading={submitApi.loading}
      >
        <CustomerForm
          customer={selectedCustomer}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          onSendResetPassword={sendResetPasswordEmail}
          onSendNewAccount={sendNewAccountEmail}
          onCustomerUpdated={fetchCustomers}
          loading={submitApi.loading}
        />
      </EntityDrawer>
    </div>
  );
}