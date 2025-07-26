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

interface Brand {
  id: number;
  name: string;
  imageUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  enabled: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

interface BrandFormData {
  name: string;
  imageUrl: string;
  websiteUrl: string;
  description: string;
  enabled: boolean;
}

const mockBrands: Brand[] = [
  {
    id: 1,
    name: "PRIME LINE",
    imageUrl: "https://logo.clearbit.com/primeline.com",
    websiteUrl: "https://www.primeline.com",
    description:
      "Premium promotional products and corporate gifts for businesses worldwide",
    enabled: true,
    productCount: 710,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: 2,
    name: "Devon and Jones",
    imageUrl:
      "https://cdn11.bigcommerce.com/s-ce94a/images/stencil/500x250/p/devon-and-jones-logo-blakclothing.ca_1636989173__25430.original.jpeg",
    websiteUrl: "https://www.devonandjones.com",
    description:
      "High-quality apparel and fashion accessories for professional environments",
    enabled: true,
    productCount: 132,
    createdAt: "2024-01-16T11:15:00Z",
    updatedAt: "2024-01-21T09:45:00Z",
  },
  {
    id: 3,
    name: "Harriton",
    imageUrl: "https://image.coastalreign.com/Harriton_1687204899048.jpg",
    websiteUrl: "https://www.harriton.com",
    description: "Professional business attire and corporate wear solutions",
    enabled: true,
    productCount: 120,
    createdAt: "2024-01-17T12:30:00Z",
    updatedAt: "2024-01-22T16:20:00Z",
  },
  {
    id: 4,
    name: "CORE 365",
    imageUrl:
      "https://images.seeklogo.com/logo-png/53/3/core-365-logo-png_seeklogo-531321.png",
    websiteUrl: "https://www.core365.com",
    description:
      "Performance sportswear and athletic apparel for active professionals",
    enabled: true,
    productCount: 101,
    createdAt: "2024-01-18T13:45:00Z",
    updatedAt: "2024-01-23T11:10:00Z",
  },
  {
    id: 5,
    name: "LEEMAN",
    imageUrl:
      "https://media.licdn.com/dms/image/v2/C4D0BAQHrv6Eflwkxxw/company-logo_200_200/company-logo_200_200/0/1644269888246/leeman_architectural_woodwork_logo?e=2147483647&v=beta&t=za5WlojrPY_BJ29BE-T-jOLR2O1umUMgyZ9enSn1cIs",
    websiteUrl: "https://www.leeman.com",
    description: "Luxury leather goods and executive accessories collection",
    enabled: true,
    productCount: 92,
    createdAt: "2024-01-19T14:20:00Z",
    updatedAt: "2024-01-24T10:30:00Z",
  },
  {
    id: 6,
    name: "BELLA+CANVAS",
    imageUrl:
      "https://s3.us-west-1.amazonaws.com/dtlaprint.com/wp-content/images/brands/color/bella-canvas-color.png",
    websiteUrl: "https://www.bellacanvas.com",
    description: "Premium fashion-forward apparel with sustainable practices",
    enabled: true,
    productCount: 83,
    createdAt: "2024-01-20T15:10:00Z",
    updatedAt: "2024-01-25T12:45:00Z",
  },
  {
    id: 7,
    name: "Citizen",
    imageUrl: "https://logo.clearbit.com/citizen.com",
    websiteUrl: "https://www.citizen.com",
    description: "Precision timepieces and watches for every occasion",
    enabled: false,
    productCount: 82,
    createdAt: "2024-01-21T16:00:00Z",
    updatedAt: "2024-01-26T14:15:00Z",
  },
  {
    id: 8,
    name: "Ray-Ban",
    imageUrl: "https://logo.clearbit.com/ray-ban.com",
    websiteUrl: "https://www.ray-ban.com",
    description: "Iconic eyewear and sunglasses since 1937",
    enabled: true,
    productCount: 81,
    createdAt: "2024-01-22T17:30:00Z",
    updatedAt: "2024-01-27T15:20:00Z",
  },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { get, post, put, loading } = useApi();
  const submitApi = useApi();

  const fetchBrands = useCallback(async () => {
    if (!isInitialLoad && loading) return;

    try {
      let filteredBrands = [...mockBrands];

      if (localSearchTerm) {
        filteredBrands = filteredBrands.filter(
          (brand: Brand) =>
            brand.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
            (brand.description &&
              brand.description
                .toLowerCase()
                .includes(localSearchTerm.toLowerCase()))
        );
      }

      const startIndex = (currentPage - 1) * rowsPerPage;
      const paginatedBrands = filteredBrands.slice(
        startIndex,
        startIndex + rowsPerPage
      );

      setBrands(paginatedBrands);
      setTotalCount(filteredBrands.length);
    } catch (error: any) {
      if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
        console.error("Error fetching brands:", error);
      }
    } finally {
      setIsInitialLoad(false);
    }
  }, [localSearchTerm, currentPage, rowsPerPage, loading, isInitialLoad]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [localSearchTerm]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  const handleSubmit = async (formData: BrandFormData) => {
    try {
      if (isEditing && selectedBrand) {
        console.log("Updating brand:", selectedBrand.id, formData);
      } else {
        console.log("Creating brand:", formData);
      }

      await fetchBrands();
      closeDrawer();
    } catch (error: any) {
      if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
        console.error("Error saving brand:", error);
      }
    }
  };

  const openNewBrandDrawer = () => {
    setIsEditing(false);
    setSelectedBrand(null);
    setIsDrawerOpen(true);
  };

  const openEditBrandDrawer = (brand: Brand) => {
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

  const BrandCard = ({ brand }: { brand: Brand }) => {
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
                  <div className="absolute -top-2 -right-2">
                    <StatusBadge enabled={brand.enabled} variant="compact" />
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-blue-600 transition-colors">
                      {brand.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">
                          {brand.productCount} products
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <DateDisplay
                          date={brand.updatedAt}
                          format="relative"
                          showIcon={false}
                        />
                      </div>
                      {brand.websiteUrl && (
                        <a
                          href={brand.websiteUrl}
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
            <div className="absolute top-3 right-3 z-10">
              <StatusBadge enabled={brand.enabled} variant="compact" />
            </div>

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
              <div className="mb-3">
                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                  {brand.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">
                    {brand.productCount} products
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {brand.description || "No description available"}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {brand.websiteUrl && (
                    <a
                      href={brand.websiteUrl}
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
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                List
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
            {brands.map((brand) => (
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
        loading={submitApi.loading}
      >
        <BrandForm
          brand={selectedBrand}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          loading={submitApi.loading}
        />
      </EntityDrawer>
    </div>
  );
}
