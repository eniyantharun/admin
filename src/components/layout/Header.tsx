'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  LogOut, 
  Search, 
  BookOpen, 
  Map, 
  HelpCircle, 
  Bell,
  Settings,
  ChevronDown,
  X,
  Plus,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

interface PageConfig {
  title: string;
  searchPlaceholder: string;
  addButtonText: string;
  addButtonAction: () => void;
  filters?: FilterConfig[];
  actions?: ActionConfig[];
  showFilters?: boolean;
  showSearch?: boolean;
  showAddButton?: boolean;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'toggle';
  options?: { value: string; label: string }[];
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}

interface ActionConfig {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface HeaderContextData {
  totalCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddNew: () => void;
  filters: FilterConfig[];
  actions: ActionConfig[];
}

interface HeaderProps {
  contextData?: HeaderContextData;
}

export const Header: React.FC<HeaderProps> = ({ contextData }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update search value when context changes
  useEffect(() => {
    if (contextData?.searchTerm !== undefined) {
      setSearchValue(contextData.searchTerm);
    }
  }, [contextData?.searchTerm]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setSearchFocused(false), 200);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    contextData?.onSearchChange?.(value);
  };

  const handleSearchClear = () => {
    setSearchValue('');
    contextData?.onSearchChange?.('');
    searchInputRef.current?.focus();
  };

  const getPageConfig = (): PageConfig => {
    const basePath = pathname.split('/')[1];
    
    const configs: Record<string, PageConfig> = {
      dashboard: {
        title: 'Dashboard',
        searchPlaceholder: 'Search dashboard...',
        addButtonText: 'Quick Action',
        addButtonAction: () => router.push('/customers'),
        showFilters: false,
        showSearch: false,
        showAddButton: false,
      },
      customers: {
        title: `Customers${contextData?.totalCount ? ` (${contextData.totalCount.toLocaleString()})` : ''}`,
        searchPlaceholder: 'Search customers...',
        addButtonText: 'New Customer',
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
      suppliers: {
        title: `Suppliers${contextData?.totalCount ? ` (${contextData.totalCount.toLocaleString()})` : ''}`,
        searchPlaceholder: 'Search suppliers...',
        addButtonText: 'New Supplier',
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
      orders: {
        title: `Orders${contextData?.totalCount ? ` (${contextData.totalCount.toLocaleString()})` : ''}`,
        searchPlaceholder: 'Search orders...',
        addButtonText: 'New Order',
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
      quotes: {
        title: `Quotes${contextData?.totalCount ? ` (${contextData.totalCount.toLocaleString()})` : ''}`,
        searchPlaceholder: 'Search quotes...',
        addButtonText: 'New Quote',
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
      brands: {
        title: `Brands${contextData?.totalCount ? ` (${contextData.totalCount.toLocaleString()})` : ''}`,
        searchPlaceholder: 'Search brands...',
        addButtonText: 'New Brand',
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
      products: {
        title: 'Products',
        searchPlaceholder: 'Search products...',
        addButtonText: 'New Product',
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
      searches: {
        title: 'Searches',
        searchPlaceholder: 'Search analytics...',
        addButtonText: 'New Search',
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: false,
        showSearch: true,
        showAddButton: false,
      },
      blog: {
        title: 'Blog Management',
        searchPlaceholder: 'Search posts...',
        addButtonText: 'New Post',
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
    };

    return configs[basePath] || {
      title: 'Admin Portal',
      searchPlaceholder: 'Search...',
      addButtonText: 'Add New',
      addButtonAction: () => {},
      showFilters: false,
      showSearch: false,
      showAddButton: false,
    };
  };

  const pageConfig = getPageConfig();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dashboard-header-user-menu')) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      
      if (event.key === 'Escape') {
        setSearchValue('');
        setSearchFocused(false);
        searchInputRef.current?.blur();
        contextData?.onSearchChange?.('');
      }
    };

    document.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [contextData]);

  const renderFilters = () => {
    if (!pageConfig.showFilters || !contextData?.filters?.length) return null;

    return (
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="secondary"
          size="sm"
          icon={Filter}
          className="bg-white/80 border-gray-200 hover:bg-blue-50 hover:border-blue-300 lg:hidden"
        >
          Filters
        </Button>
        
        <div className={`flex items-center space-x-2 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
          {contextData.filters.map((filter) => (
            <div key={filter.key} className="flex items-center space-x-1">
              {filter.type === 'select' ? (
                <select
                  value={filter.value as string}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/80 hover:bg-white transition-all duration-200"
                >
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {filter.options?.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => filter.onChange(option.value)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        filter.value === option.value
                          ? "bg-white shadow-sm text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderActions = () => {
    if (!contextData?.actions?.length) return null;

    return (
      <div className="flex items-center space-x-2">
        {contextData.actions.map((action) => (
          <Button
            key={action.key}
            onClick={action.onClick}
            variant={action.variant || 'secondary'}
            size="sm"
            className="bg-white/80 border-gray-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
            title={action.label}
          >
            <span className="hidden sm:inline">{action.label}</span>
          </Button>
        ))}
      </div>
    );
  };

  return (
    <header className="dashboard-header bg-gradient-to-r from-white via-gray-50 to-blue-50 shadow-lg border-b border-gray-200/50 w-full relative z-30">
      <div className="dashboard-header-content flex items-center h-16 px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Left Section - Page Title */}
        <div className="dashboard-header-left flex-shrink-0">
          <h1 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
            {pageConfig.title}
          </h1>
        </div>

        {/* Center Section - Search & Filters */}
        <div className="dashboard-header-center flex-1 flex items-center justify-center space-x-4 px-4 max-w-2xl mx-auto">
          {pageConfig.showSearch && (
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              
              <input
                ref={searchInputRef}
                type="text"
                placeholder={pageConfig.searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/80 shadow-sm hover:shadow-md transition-all duration-200 placeholder-gray-500"
              />
              
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
                {searchValue && (
                  <button
                    onClick={handleSearchClear}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                
                <kbd className="hidden sm:inline-flex items-center rounded border border-gray-200 px-1.5 py-0.5 text-xs font-sans text-gray-400 bg-gray-50">
                  ⌘K
                </kbd>
              </div>
            </div>
          )}

          {renderFilters()}
        </div>

        {/* Right Section - Actions & User Menu */}
        <div className="dashboard-header-right flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          
          {/* Page Actions */}
          {renderActions()}

          {/* Add Button */}
          {pageConfig.showAddButton && (
            <Button
              onClick={pageConfig.addButtonAction}
              icon={Plus}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              size="sm"
            >
              <span className="hidden sm:inline">{pageConfig.addButtonText}</span>
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="secondary"
            size="sm"
            icon={Bell}
            iconOnly
            className="relative bg-white/80 border-gray-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 w-9 h-9"
            title="Notifications"
          >
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>

          {/* Settings */}
          <Button
            variant="secondary"
            size="sm"
            icon={Settings}
            iconOnly
            className="bg-white/80 border-gray-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 w-9 h-9"
            title="Settings"
          />

          {/* User Menu */}
          <div className="dashboard-header-user-menu relative">
            <Button
              variant="secondary"
              onClick={handleDropdownToggle}
              className="flex items-center space-x-2 bg-white/80 border-gray-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 px-3 py-2 h-9"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <User className="w-3 h-3 text-white" />
              </div>
              <div className="hidden sm:block text-left flex-shrink-0">
                <span className="block text-sm font-semibold text-gray-900 truncate max-w-20">
                  {user?.username || 'Admin'}
                </span>
              </div>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                dropdownOpen ? 'transform rotate-180' : ''
              }`} />
            </Button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 rounded-xl shadow-xl border border-gray-200/50 py-2 z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.username || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@ppi.com'}</p>
                </div>

                <div className="py-1">
                  <Button
                    onClick={() => {
                      router.push('/blog');
                      setDropdownOpen(false);
                    }}
                    variant="secondary"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none shadow-none bg-transparent transition-colors duration-200"
                    icon={BookOpen}
                  >
                    Blog Management
                  </Button>
                  <Button
                    onClick={() => {
                      router.push('/sitemaps');
                      setDropdownOpen(false);
                    }}
                    variant="secondary"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none shadow-none bg-transparent transition-colors duration-200"
                    icon={Map}
                  >
                    Site Maps
                  </Button>
                  <Button
                    onClick={() => {
                      router.push('/faq');
                      setDropdownOpen(false);
                    }}
                    variant="secondary"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none shadow-none bg-transparent transition-colors duration-200"
                    icon={HelpCircle}
                  >
                    FAQ Center
                  </Button>
                  
                  <hr className="my-2 border-gray-100" />
                  
                  <Button
                    onClick={() => {
                      router.push('/profile');
                      setDropdownOpen(false);
                    }}
                    variant="secondary"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none shadow-none bg-transparent transition-colors duration-200"
                    icon={User}
                  >
                    Profile Settings
                  </Button>
                  
                  <Button
                    onClick={() => {
                      router.push('/settings');
                      setDropdownOpen(false);
                    }}
                    variant="secondary"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none shadow-none bg-transparent transition-colors duration-200"
                    icon={Settings}
                  >
                    System Settings
                  </Button>
                  
                  <hr className="my-2 border-gray-100" />
                  
                  <Button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                    variant="secondary"
                    className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 border-none shadow-none bg-transparent transition-colors duration-200"
                    icon={LogOut}
                  >
                    Sign Out
                  </Button>
                </div>

                <div className="px-4 py-2 border-t border-gray-100 mt-1">
                  <p className="text-xs text-gray-400">Version 1.0.0</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {showFilters && pageConfig.showFilters && contextData?.filters?.length && (
        <div className="lg:hidden border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {contextData.filters.map((filter) => (
              <div key={filter.key} className="flex items-center space-x-1">
                {filter.type === 'select' ? (
                  <select
                    value={filter.value as string}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    {filter.options?.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => filter.onChange(option.value)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          filter.value === option.value
                            ? "bg-white shadow-sm text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
    </header>
  );
};