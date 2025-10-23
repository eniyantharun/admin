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
import { Header } from "@/components/layout/Header";
import { showToast } from "@/components/ui/toast";
import { Product, ProductService } from "@/types/productService";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
      const offset = (currentPage - 1) * rowsPerPage;
      
      const params: any = {
        pageSize: rowsPerPage,
        offset,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== "all") {
        params.visibility = statusFilter === "enabled" ? "Enabled" : "Disabled";
      }

      if (featuredFilter === "featured") {
        params.exclusive = true;
      } else if (featuredFilter === "not-featured") {
        params.exclusive = false;
      }

      const response = await ProductService.getProductsList(params);
      
      setProducts(response.products || []);
      setTotalCount(response.count || 0);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      showToast.error("Failed to load products");
      setProducts([]);
      setTotalCount(0);
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

  const openNewProductDrawer = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setIsDrawerOpen(true);
  };

  const openEditProductDrawer = (product: Product) => {
    setIsEditing(true);
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProduct(null);
    setIsEditing(false);
  };

  const getProductImageUrl = (product: Product): string | null => {
    if (product.pictures && product.pictures.length > 0 && product.thumbIndex) {
      return ProductService.getProductThumbnailUrl(product.id, product.thumbIndex);
    }
    return null;
  };

  const getProductionTime = (product: Product): string => {
    if (product.minDays === product.maxDays) {
      return `${product.minDays} days`;
    }
    return `${product.minDays}-${product.maxDays} days`;
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
                    Supplier
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
                  products.map((product) => {
                    const imageUrl = getProductImageUrl(product);
                    const isEnabled = product.visibility === "Enabled";
                    
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        onClick={() => openEditProductDrawer(product)}
                      >
                        <td className="px-2 py-2">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg border border-gray-200 object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const fallback = parent.querySelector('.fallback-icon');
                                      if (fallback) {
                                        (fallback as HTMLElement).style.display = 'flex';
                                      }
                                    }
                                  }}
                                />
                              ) : null}
                              <div 
                                className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center fallback-icon"
                                style={{ display: imageUrl ? 'none' : 'flex' }}
                              >
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
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
                                {product.merchantCenterEnabled && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  {product.variants.length} variants
                                </span>
                                <StatusBadge
                                  enabled={isEnabled}
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
                              {product.supplier.name}
                            </div>
                            {product.supplier.website && (
                              <div className="text-xs text-gray-500">
                                {product.supplier.website}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {product.categories && product.categories.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {product.categories.slice(0, 2).map((category) => (
                                <span 
                                  key={category.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                >
                                  {category.name}
                                </span>
                              ))}
                              {product.categories.length > 2 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                  +{product.categories.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No category</span>
                          )}
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
                              Production: {getProductionTime(product)}
                            </div>
                            {product.decorations && product.decorations.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {product.decorations.length} decoration{product.decorations.length !== 1 ? 's' : ''}
                              </div>
                            )}
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
                    );
                  })
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
          title={isEditing ? "Product Details" : "Create New Product"}
          size="xxl"
          loading={loading}
        >
          {selectedProduct && (
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedProduct.slug}</p>
                </div>

                {getProductImageUrl(selectedProduct) && (
                  <div>
                    <img
                      src={getProductImageUrl(selectedProduct)!}
                      alt={selectedProduct.name}
                      className="w-full max-w-md rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Supplier</label>
                    <p className="text-sm text-gray-900">{selectedProduct.supplier.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <StatusBadge 
                        enabled={selectedProduct.visibility === "Enabled"}
                        label={{ enabled: "Active", disabled: "Inactive" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Price Range</label>
                    <p className="text-sm text-gray-900">
                      ${selectedProduct.minPrice.toFixed(2)} - ${selectedProduct.maxPrice.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Setup Charge</label>
                    <p className="text-sm text-gray-900">${selectedProduct.setupCharge.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Production Time</label>
                    <p className="text-sm text-gray-900">{getProductionTime(selectedProduct)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Variants</label>
                    <p className="text-sm text-gray-900">{selectedProduct.variants.length}</p>
                  </div>
                </div>

                {selectedProduct.categories && selectedProduct.categories.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-2 block">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.categories.map((category) => (
                        <span 
                          key={category.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduct.decorations && selectedProduct.decorations.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-2 block">Decoration Methods</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.decorations.map((decoration) => (
                        <span 
                          key={decoration.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {decoration.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </EntityDrawer>
      </div>
    </div>
  );
}