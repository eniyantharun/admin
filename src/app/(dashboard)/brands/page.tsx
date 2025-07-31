"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Eye,
  X,
  Award,
  Building,
  ExternalLink,
  Calendar,
  Package,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApi } from "@/hooks/useApi";
import { StatusBadge } from "@/components/helpers/StatusBadge";
import { DateDisplay } from "@/components/helpers/DateDisplay";
import {
  EmptyState,
  LoadingState,
} from "@/components/helpers/EmptyLoadingStates";
import { PaginationControls } from "@/components/helpers/PaginationControls";
import { EntityDrawer } from "@/components/helpers/EntityDrawer";
import { BrandForm } from "@/components/forms/BrandForm";
import { IBrand, IBrandFormData } from "@/types/brand";
import toast from "react-hot-toast";


export default function BrandsPage() {
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [enabledFilter, setEnabledFilter] = useState<boolean | null>(true); 

  const { get, loading, error } = useApi(); 
  const { post, put, loading: submitLoading, error: submitError } = useApi();

  const fetchBrands = useCallback(async () => {
    try {
      let queryParams = [];
      if (enabledFilter !== null) {
        queryParams.push(`enabled=${enabledFilter}`);
      }

      if (localSearchTerm) {
        queryParams.push(`search=${encodeURIComponent(localSearchTerm)}`);
      }

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const response = await get(`/Admin/BrandsList/GetBrandsList${queryString}`);

       const { success, data, message } = response || {};
       if (success && data?.brands?.length >= 0) {
        setBrands(data.brands);
        setTotalCount(data.brands.length);
       } else {
        toast.error("Failed to fetch brands:", message);
          setBrands([]);
          setTotalCount(0);
           }

    } catch (err: any) {
      if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
        toast.error("Error fetching brands:", err);
        setBrands([]);
        setTotalCount(0);
      }
    } finally {
      setIsInitialLoad(false);
    }
  }, [get, localSearchTerm, enabledFilter]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [localSearchTerm, enabledFilter]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  const handleSubmit = async (formData: IBrandFormData) => {
 try {
        if (isEditing && selectedBrand) {
        const updatePayload = {
          brandId: selectedBrand.id, 
          // name: formData.name,
          description: formData.description,
          website: "promotional_product_inc",
          logoUrl: formData.imageUrl,   
          isActive: formData.enabled,   
        };
        const response = await post("/Admin/BrandsList/UpdateBrandDetail", updatePayload);
        if (!response.success) {
          throw new Error(response.message || "Failed to update brand.");
        }
      } else {
        const createPayload = {
          name: formData.name,
          description: formData.description,
          website: "promotional_product_inc", 
          logoUrl: formData.imageUrl,   
          isActive: formData.enabled,   
        };
        const response = await post("/Admin/BrandsList/AddNewBrand", createPayload);
        if (!response.success) {
          throw new Error(response.message || "Failed to add new brand.");
        }
      }

      await fetchBrands(); 
      closeDrawer();
    } catch (err: any) {
      if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
        toast.error("Error saving brand:", err);
      }
    }
  };

  const openNewBrandDrawer = () => {
    setIsEditing(false);
    setSelectedBrand(null);
    setIsDrawerOpen(true);
  };

  const openEditBrandDrawer = (brand: IBrand) => {
    setIsEditing(true);
    setSelectedBrand(brand);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedBrand(null);
    setIsEditing(false);
  };

  const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  const clearLocalSearch = () => {
    setLocalSearchTerm("");
  };

  const BrandCard = ({ brand }: { brand: IBrand }) => {
    const [imageError, setImageError] = useState(false);

    if (viewMode === "list") {
      return (
        <div
          className="brand-list-item group cursor-pointer"
          onClick={() => openEditBrandDrawer(brand)}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border hover:border-blue-200">
            <div className="flex items-center p-4 gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="brand-image-container bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-center h-12 w-16">
                      {!imageError && brand.imageUrl ? (
                        <img
                          src={brand.imageUrl}
                          alt={brand.name}
                          className="max-h-10 max-w-full object-contain"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* REMOVED: StatusBadge from here */}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-blue-600 transition-colors flex items-center gap-2"> {/* Added flex and gap for badge */}
                      {brand.name}
                      <StatusBadge enabled={brand.enabled} variant="compact" /> {/* MOVED: StatusBadge here */}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      {brand.website && (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm">Visit Website</span>
                        </a>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 max-w-2xl">
                      {brand.description || "No description available"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditBrandDrawer(brand);
                      }}
                      variant="secondary"
                      size="sm"
                      icon={Edit2}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Products
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }


    return (
      <div
        className="brand-card group cursor-pointer"
        onClick={() => openEditBrandDrawer(brand)}
      >
        <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-blue-200 bg-gradient-to-br from-white to-gray-50">
          <div className="relative">
            {/* REMOVED: StatusBadge from absolute position here */}

            <div className="brand-image-container bg-white relative overflow-hidden h-32 border-b border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-30"></div>
              <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                {!imageError && brand.imageUrl ? (
                  <img
                    src={brand.imageUrl}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="mb-3 flex items-center justify-between"> {/* Added flex and justify-between for badge placement */}
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                  {brand.name}
                </h3>
                <StatusBadge enabled={brand.enabled} variant="compact" /> {/* MOVED: StatusBadge here */}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {brand.description || "No description available"}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <DateDisplay
                    date={brand.updatedAt}
                    format="relative"
                    showIcon={false}
                  />
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditBrandDrawer(brand);
                    }}
                    variant="secondary"
                    size="sm"
                    icon={Edit2}
                    iconOnly
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Edit brand"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                    iconOnly
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    title="View products"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };


  return (
    <div className="brands-page space-y-6">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {totalCount} {totalCount === 1 ? "Brand" : "Brands"}
            </h3>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search brands..."
                value={localSearchTerm}
                onChange={handleLocalSearchChange}
                className="w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
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
          </div>

          <div className="flex items-center gap-2">
            {/* <span className="text-sm text-gray-600">Filter:</span> */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setEnabledFilter(true)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  enabledFilter === true
                    ? "bg-white shadow-sm text-green-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Enabled
              </button>
              <button
                onClick={() => setEnabledFilter(false)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  enabledFilter === false
                    ? "bg-white shadow-sm text-red-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Disabled
              </button>
              <button
                onClick={() => setEnabledFilter(null)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  enabledFilter === null
                    ? "bg-white shadow-sm text-gray-800"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
            </div>
            {/* <span className="text-sm text-gray-600">View:</span> */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List size={15} />
              </button>
            </div>
            <Button
              onClick={openNewBrandDrawer}
              icon={Plus}
              className="shadow-lg"
            >
              Add Brand
            </Button>
          </div>
        </div>

        {loading && isInitialLoad ? (
          <div className="py-12">
            <LoadingState message="Loading brands..." />
          </div>
        ) : brands.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Award}
              title="No brands found"
              description={
                localSearchTerm
                  ? "Try adjusting your search terms to find brands."
                  : "Get started by adding your first brand to showcase your product collections."
              }
              hasSearch={!!localSearchTerm}
            />
          </div>
        ) : (
          <div
            className={`brands-container ${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-3"
            }`}
          >
            {brands
              .slice(startIndex, endIndex)
              .map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
          </div>
        )}
      </Card>

      {totalCount > 0 && !loading && (
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
        title={isEditing ? "Edit Brand" : "Add New Brand"}
        size="xl"
        loading={submitLoading} // Use submitLoading here
      >
        <BrandForm
          brand={selectedBrand}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          loading={submitLoading} // Use submitLoading here
        />
      </EntityDrawer>
    </div>
  );
}