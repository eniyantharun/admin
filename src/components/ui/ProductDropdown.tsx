import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Package, Building, ChevronDown, ChevronUp, Star, Loader2 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';

interface ProductVariant {
  id: number;
  supplierItemNumber: string;
  supplierUrl: string;
}

interface ProductSupplier {
  id: number;
  name: string;
  website: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  minPrice: number;
  maxPrice: number;
  supplier: ProductSupplier;
  decorations: Array<{ id: number; name: string }>;
  setupCharge: number;
  minDays: number;
  maxDays: number;
  variants: ProductVariant[];
  pictures: number[];
  exclusive: boolean;
}

interface ProductSearchResponse {
  products: Product[];
  count: number;
}

interface ProductDropdownProps {
  selectedProduct?: Product | null;
  onProductSelect: (product: Product | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ProductDropdown: React.FC<ProductDropdownProps> = ({
  selectedProduct,
  onProductSelect,
  placeholder = "Search and select a product...",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { get, loading } = useApi({
    cancelOnUnmount: true,
    dedupe: true,
    cacheDuration: 30000,
  });

  const searchProducts = useCallback(async (term: string) => {
    if (!term.trim()) {
      setProducts([]);
      return;
    }

    try {
      const response = await get(`https://api.promowe.com/Admin/ProductList/GetProductsList?search=${encodeURIComponent(term)}&pageSize=20&offset=0`) as ProductSearchResponse;
      
      if (response?.products) {
        setProducts(response.products);
      }
    } catch (error: any) {
      if (error?.name !== 'CanceledError') {
        showToast.error('Failed to search products');
      }
    }
  }, [get]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen) {
        searchProducts(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchProducts, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClearSelection = () => {
    onProductSelect(null);
    setSearchTerm('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < products.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && products[highlightedIndex]) {
          handleProductSelect(products[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const displayValue = selectedProduct 
    ? selectedProduct.name 
    : searchTerm;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          } ${selectedProduct ? 'text-gray-900' : 'text-gray-500'}`}
        />
        
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {selectedProduct ? (
            <button
              onClick={handleClearSelection}
              disabled={disabled}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              ×
            </button>
          ) : (
            <button
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Selected Product Display */}
      {selectedProduct && (
        <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-purple-900">{selectedProduct.name}</h4>
                {selectedProduct.exclusive && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1" />
                    Exclusive
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-purple-700 mb-2">
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  <span>{selectedProduct.supplier.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <span>{selectedProduct.variants.length} variant{selectedProduct.variants.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium text-green-600">
                  ${selectedProduct.minPrice.toFixed(2)} - ${selectedProduct.maxPrice.toFixed(2)}
                </span>
                {selectedProduct.setupCharge > 0 && (
                  <span className="text-purple-600">
                    +${selectedProduct.setupCharge.toFixed(2)} setup
                  </span>
                )}
                <span className="text-purple-600">
                  {selectedProduct.minDays}-{selectedProduct.maxDays} days
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {!searchTerm.trim() ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Start typing to search for products</p>
            </div>
          ) : loading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-6 h-6 mx-auto mb-2 text-gray-400 animate-spin" />
              <p className="text-sm">Searching products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Package className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No products found</p>
              <p className="text-xs text-gray-400 mt-1">Try different search terms</p>
            </div>
          ) : (
            <div className="py-1">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    index === highlightedIndex 
                      ? 'bg-purple-50 text-purple-900' 
                      : 'hover:bg-gray-50 text-gray-900'
                  }`}
                  onClick={() => handleProductSelect(product)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{product.name}</h4>
                        {product.exclusive && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0">
                            <Star className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-1">
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          <span className="truncate">{product.supplier.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          <span>{product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-600 text-sm">
                          ${product.minPrice.toFixed(2)} - ${product.maxPrice.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {product.setupCharge > 0 && (
                            <span>+${product.setupCharge.toFixed(2)} setup</span>
                          )}
                          <span>{product.minDays}-{product.maxDays} days</span>
                        </div>
                      </div>

                      {product.decorations.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {product.decorations.slice(0, 2).map((decoration) => (
                            <span
                              key={decoration.id}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {decoration.name}
                            </span>
                          ))}
                          {product.decorations.length > 2 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              +{product.decorations.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};