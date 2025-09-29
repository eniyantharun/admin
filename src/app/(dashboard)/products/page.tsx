"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Eye, Building, Package, DollarSign, Star, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/helpers/StatusBadge";
import { EmptyState, LoadingState } from "@/components/helpers/EmptyLoadingStates";
import { PaginationControls } from "@/components/helpers/PaginationControls";
import { EntityDrawer } from "@/components/helpers/EntityDrawer";
import { useProductsHeaderContext } from "@/hooks/useHeaderContext";
import { iProduct, iProductFormData } from "@/types/product";
import { Header } from "@/components/layout/Header";
import { ProductForm } from "@/components/forms/ProductForm";

const mockProducts: iProduct[] = [
  {
    id: "1001",
    name: "Premium Business Cards",
    slug: "premium-business-cards",
    description: "High-quality business cards with UV coating and rounded corners",
    brand: "ProPrint Solutions",
    supplier: "CardCraft Inc",
    category: "Printing & Stationery",
    minPrice: 25.99,
    maxPrice: 89.99,
    setupCharge: 15.00,
    minQuantity: 100,
    maxQuantity: 10000,
    productionTime: "3-5 business days",
    enabled: true,
    featured: false,
    exclusive: false,
    images: ["https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400"],
    variants: 8,
    colors: 12,
    imprintMethods: ["Digital Print", "Offset Print", "Embossed"],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-02-01T14:22:00Z"
  },
  {
    id: "1002",
    name: "Custom Water Bottles - 24oz",
    slug: "custom-water-bottles-24oz",
    description: "Stainless steel water bottles with custom logo printing",
    brand: "HydroTech",
    supplier: "Bottle Masters LLC",
    category: "Drinkware",
    minPrice: 12.50,
    maxPrice: 28.75,
    setupCharge: 50.00,
    minQuantity: 50,
    maxQuantity: 5000,
    productionTime: "7-10 business days",
    enabled: true,
    featured: true,
    exclusive: false,
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400"],
    variants: 15,
    colors: 8,
    imprintMethods: ["Laser Engraving", "Screen Print", "Vinyl"],
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-28T16:45:00Z"
  },
  {
    id: "1003",
    name: "Corporate Polo Shirts",
    slug: "corporate-polo-shirts",
    description: "100% cotton polo shirts with embroidered logos",
    brand: "StyleWear Pro",
    supplier: "Apparel Direct",
    category: "Apparel",
    minPrice: 18.99,
    maxPrice: 35.50,
    setupCharge: 25.00,
    minQuantity: 12,
    maxQuantity: 2500,
    productionTime: "5-7 business days",
    enabled: true,
    featured: false,
    exclusive: true,
    images: ["https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400"],
    variants: 20,
    colors: 15,
    imprintMethods: ["Embroidery", "Screen Print", "Heat Transfer"],
    createdAt: "2024-01-08T11:20:00Z",
    updatedAt: "2024-01-25T13:30:00Z"
  },
  {
    id: "1004",
    name: "USB Flash Drives - 8GB",
    slug: "usb-flash-drives-8gb",
    description: "Custom USB drives with full-color printing",
    brand: "TechGear",
    supplier: "Digital Solutions Inc",
    category: "Technology",
    minPrice: 8.25,
    maxPrice: 15.99,
    setupCharge: 35.00,
    minQuantity: 25,
    maxQuantity: 10000,
    productionTime: "4-6 business days",
    enabled: false,
    featured: false,
    exclusive: false,
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400"],
    variants: 6,
    colors: 10,
    imprintMethods: ["Full Color Print", "Laser Engraving", "Pad Print"],
    createdAt: "2024-01-05T08:45:00Z",
    updatedAt: "2024-01-20T10:15:00Z"
  },
  {
    id: "1005",
    name: "Promotional Tote Bags",
    slug: "promotional-tote-bags",
    description: "Eco-friendly canvas tote bags with screen printing",
    brand: "EcoBag Co",
    supplier: "Green Products Ltd",
    category: "Bags",
    minPrice: 5.99,
    maxPrice: 12.50,
    setupCharge: 40.00,
    minQuantity: 50,
    maxQuantity: 5000,
    productionTime: "6-8 business days",
    enabled: true,
    featured: true,
    exclusive: false,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"],
    variants: 10,
    colors: 6,
    imprintMethods: ["Screen Print", "Heat Transfer", "Embroidery"],
    createdAt: "2024-01-03T14:30:00Z",
    updatedAt: "2024-01-22T09:20:00Z"
  },
  {
    id: "1006",
    name: "Desktop Calendar 2024",
    slug: "desktop-calendar-2024",
    description: "Full-color desktop calendars with custom branding",
    brand: "Calendar Pro",
    supplier: "Print Solutions LLC",
    category: "Printing & Stationery",
    minPrice: 3.25,
    maxPrice: 8.75,
    setupCharge: 65.00,
    minQuantity: 100,
    maxQuantity: 25000,
    productionTime: "8-12 business days",
    enabled: true,
    featured: false,
    exclusive: false,
    images: ["https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400"],
    variants: 4,
    colors: 20,
    imprintMethods: ["Full Color Print", "Spot Color", "Digital Print"],
    createdAt: "2023-12-28T16:45:00Z",
    updatedAt: "2024-01-18T11:35:00Z"
  }
];

export default function ProductsPage() {
  const [products, setProducts] = useState<iProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<iProduct | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const { contextData, searchTerm } = useProductsHeaderContext({
    totalCount,
    onAddNew: () => openNewProductDrawer(),
    statusFilter,
    onStatusFilterChange: setStatusFilter,
    featuredFilter,
    onFeaturedFilterChange: setFeaturedFilter,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredProducts = [...mockProducts];

      if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== "all") {
        filteredProducts = filteredProducts.filter(product => {
          if (statusFilter === "enabled") return product.enabled;
          if (statusFilter === "disabled") return !product.enabled;
          return true;
        });
      }

      if (featuredFilter !== "all") {
        filteredProducts = filteredProducts.filter(product => {
          if (featuredFilter === "featured") return product.featured;
          if (featuredFilter === "not-featured") return !product.featured;
          return true;
        });
      }

      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      setProducts(paginatedProducts);
      setTotalCount(filteredProducts.length);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [searchTerm, statusFilter, featuredFilter, currentPage, rowsPerPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, featuredFilter]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  const handleSubmit = async (formData: iProductFormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Product form submitted:", formData);
      await fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const openNewProductDrawer = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setIsDrawerOpen(true);
  };

  const openEditProductDrawer = (product: iProduct) => {
    setIsEditing(true);
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProduct(null);
    setIsEditing(false);
  };

  return (
    <div className="products-page">
      <Header contextData={contextData} />
      
      <div className="p-2 space-y-2">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand & Supplier
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Range
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && isInitialLoad ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6">
                      <LoadingState message="Loading products..." />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6">
                      <EmptyState
                        icon={Package}
                        title="No products found"
                        description="Get started by adding your first product."
                        hasSearch={!!searchTerm || statusFilter !== "all" || featuredFilter !== "all"}
                      />
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => openEditProductDrawer(product)}
                    >
                      <td className="px-2 py-2">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg border border-gray-200 object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </div>
                              {product.exclusive && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Star className="w-3 h-3 mr-1" />
                                  Exclusive
                                </span>
                              )}
                              {product.featured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {product.variants} variants
                              </span>
                              <StatusBadge
                                enabled={product.enabled}
                                label={{ enabled: "Active", disabled: "Inactive" }}
                                variant="compact"
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            {product.brand}
                          </div>
                          <div className="text-xs text-gray-500">
                            Supplier: {product.supplier}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${product.minPrice.toFixed(2)} - ${product.maxPrice.toFixed(2)}
                          </div>
                          {product.setupCharge > 0 && (
                            <div className="text-xs text-gray-500">
                              +${product.setupCharge.toFixed(2)} setup
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-600">
                            Qty: {product.minQuantity.toLocaleString()} - {product.maxQuantity.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            {product.productionTime}
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.colors} colors, {product.imprintMethods.length} methods
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditProductDrawer(product);
                          }}
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          iconOnly
                          title="View product"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
          title={isEditing ? "Edit Product" : "Create New Product"}
          size="xxl"
          loading={loading}
        >
          <ProductForm
            product={selectedProduct}
            isEditing={isEditing}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </EntityDrawer>
      </div>
    </div>
  );
}