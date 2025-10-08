import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Package, Palette, Settings } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { showToast } from '@/components/ui/toast';

interface ApiVariant {
  supplierItemNumber: string;
  entry: string | null;
  id: number;
  name: string;
}

interface ApiMethod {
  id: number;
  name: string;
}

interface ApiColor {
  id: string;
  name: string;
}

interface ApiVariantsResponse {
  variants: ApiVariant[];
}

interface ApiMethodsResponse {
  methods: ApiMethod[];
}

interface ApiColorsResponse {
  colors: ApiColor[];
}

interface BaseDropdownProps {
  productId?: string | number;
  value: string;
  onChange: (value: string, id?: string | number) => void;
  placeholder: string;
  icon: React.ComponentType<any>;
  disabled?: boolean;
  className?: string;
}

interface VariantDropdownProps extends Omit<BaseDropdownProps, 'icon' | 'placeholder'> {
  onVariantSelect?: (variant: ApiVariant | null) => void;
}

export const VariantDropdown: React.FC<VariantDropdownProps> = ({
  productId,
  value,
  onChange,
  onVariantSelect,
  disabled = false,
  className = ''
}) => {
  const [variants, setVariants] = useState<ApiVariant[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { get, loading } = useApi({
    cancelOnUnmount: true,
    dedupe: false,
    cacheDuration: 0,
  });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
  if (!productId) {
    setVariants([]);
  }
}, [productId]);

  const fetchVariants = async () => {
  setVariants([]); // Clear existing data
  try {
    const response = await get(`https://api.promowe.com/Admin/ProductEditor/GetVariantsList?productId=${productId}&_t=${Date.now()}`) as ApiVariantsResponse;
    
    if (response?.variants) {
      setVariants(response.variants);
    } else {
      setVariants([]);
    }
  } catch (error: any) {
    if (error?.name !== 'CanceledError') {
      showToast.error('Failed to load variants');
      setVariants([]);
    }
  }
};

  const handleSelect = (variant: ApiVariant | null) => {
    if (variant) {
      onChange(variant.name, variant.id);
      onVariantSelect?.(variant);
    } else {
      onChange('No Variant', -1);
      onVariantSelect?.(null);
    }
    setIsOpen(false);
  };

  const displayValue = value || 'Select variant';
  const hasVariants = variants.length > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          if (!disabled && productId) {
            if (!isOpen) {
              // Always fetch when opening dropdown
              fetchVariants();
            }
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled || loading || !productId}
        className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
          disabled || loading || !productId ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {loading ? 'Loading...' : displayValue}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {!productId ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              Select a product first
            </div>
          ) : loading ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              Loading variants...
            </div>
          ) : (
            <div className="py-1">
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  value === 'No Variant' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                }`}
              >
                No Variant
              </button>
              
              {hasVariants ? (
                variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => handleSelect(variant)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                      value === variant.name ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{variant.name}</span>
                      {variant.supplierItemNumber && (
                        <span className="text-xs text-gray-400">#{variant.supplierItemNumber}</span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500 text-sm">
                  No variants available
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MethodDropdownProps extends Omit<BaseDropdownProps, 'icon' | 'placeholder'> {
  onMethodSelect?: (method: ApiMethod | null) => void;
}

export const MethodDropdown: React.FC<MethodDropdownProps> = ({
  productId,
  value,
  onChange,
  onMethodSelect,
  disabled = false,
  className = ''
}) => {
  const [methods, setMethods] = useState<ApiMethod[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { get, loading } = useApi({
    cancelOnUnmount: true,
    dedupe: true,
    cacheDuration: 60000,
  });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (productId) {
      fetchMethods();
    } else {
      setMethods([]);
    }
  }, [productId]);

  const fetchMethods = async () => {
  setMethods([]); // Clear existing data
  try {
    const response = await get(`https://api.promowe.com/Admin/ProductEditor/GetDecorationMethods?productId=${productId}&_t=${Date.now()}`) as ApiMethodsResponse;
    
    if (response?.methods) {
      const filteredMethods = response.methods.filter(
        method => method.id !== -1 && method.id !== 2 && method.name !== 'Default' && method.name !== 'test method'
      );
      setMethods(filteredMethods);
    } else {
      setMethods([]);
    }
  } catch (error: any) {
    if (error?.name !== 'CanceledError') {
      showToast.error('Failed to load decoration methods');
      setMethods([]);
    }
  }
};


  const handleSelect = (method: ApiMethod | null) => {
    if (method) {
      onChange(method.name, method.id);
      onMethodSelect?.(method);
    } else {
      onChange('No Method', -1);
      onMethodSelect?.(null);
    }
    setIsOpen(false);
  };

  const displayValue = value || 'Select method';
  const hasMethods = methods.length > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && productId && setIsOpen(!isOpen)}
        disabled={disabled || loading || !productId}
        className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
          disabled || loading || !productId ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {loading ? 'Loading...' : displayValue}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {!productId ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              Select a product first
            </div>
          ) : loading ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              Loading methods...
            </div>
          ) : (
            <div className="py-1">
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  value === 'No Method' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                }`}
              >
                No Method
              </button>
              
              {hasMethods ? (
                methods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => handleSelect(method)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                      value === method.name ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                    }`}
                  >
                    {method.name}
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500 text-sm">
                  No decoration methods available
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ColorDropdownProps extends Omit<BaseDropdownProps, 'icon' | 'placeholder'> {
  onColorSelect?: (color: ApiColor | null) => void;
}

export const ColorDropdown: React.FC<ColorDropdownProps> = ({
  productId,
  value,
  onChange,
  onColorSelect,
  disabled = false,
  className = ''
}) => {
  const [colors, setColors] = useState<ApiColor[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { get, loading } = useApi({
    cancelOnUnmount: true,
    dedupe: true,
    cacheDuration: 60000,
  });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (productId) {
      fetchColors();
    } else {
      setColors([]);
    }
  }, [productId]);

  const fetchColors = async () => {
  setColors([]); // Clear existing data
  try {
    const response = await get(`https://api.promowe.com/Admin/ProductEditor/GetProductColorOptionsList?productId=${productId}&_t=${Date.now()}`) as ApiColorsResponse;
    
    if (response?.colors) {
      setColors(response.colors);
    } else {
      setColors([]);
    }
  } catch (error: any) {
    if (error?.name !== 'CanceledError') {
      showToast.error('Failed to load colors');
      setColors([]);
    }
  }
};

  const handleSelect = (color: ApiColor | null) => {
    if (color) {
      onChange(color.name, color.id);
      onColorSelect?.(color);
    } else {
      onChange('No Color', '-1');
      onColorSelect?.(null);
    }
    setIsOpen(false);
  };

  const displayValue = value || 'Select color';
  const hasColors = colors.length > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && productId && setIsOpen(!isOpen)}
        disabled={disabled || loading || !productId}
        className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
          disabled || loading || !productId ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-400" />
          <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {loading ? 'Loading...' : displayValue}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {!productId ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              Select a product first
            </div>
          ) : loading ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              Loading colors...
            </div>
          ) : (
            <div className="py-1">
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  value === 'No Color' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                }`}
              >
                No Color
              </button>
              
              {hasColors ? (
                colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleSelect(color)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                      value === color.name ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: getColorValue(color.name) }}
                      />
                      <span>{color.name}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500 text-sm">
                  No colors available
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get color value for display
const getColorValue = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#008000',
    'yellow': '#ffff00',
    'orange': '#ffa500',
    'purple': '#800080',
    'pink': '#ffc0cb',
    'brown': '#a52a2a',
    'gray': '#808080',
    'grey': '#808080',
    'navy': '#000080',
    'silver': '#c0c0c0',
    'gold': '#ffd700',
  };

  const lowerName = colorName.toLowerCase();
  return colorMap[lowerName] || '#e5e7eb';
};

export type { ApiVariant, ApiMethod, ApiColor };