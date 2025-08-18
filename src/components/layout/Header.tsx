"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  LogOut,
  Search,
  BookOpen,
  Map,
  HelpCircle,
  ChevronDown,
  X,
  Plus,
  Filter,
  LayoutGrid,
  List,
  Menu,
} from "lucide-react";
import { IHeaderProps, IPageConfig } from "@/types/header";


export const Header: React.FC<IHeaderProps> = ({ contextData }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Update search value when context changes
  useEffect(() => {
    if (contextData?.searchTerm !== undefined) {
      setSearchValue(contextData.searchTerm);
    }
  }, [contextData?.searchTerm]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
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
    setSearchValue("");
    contextData?.onSearchChange?.("");
    if (mobileSearchOpen) {
      mobileSearchInputRef.current?.focus();
    } else {
      searchInputRef.current?.focus();
    }
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (!mobileSearchOpen) {
      setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 100);
    }
  };

  const getPageConfig = (): IPageConfig => {
      const basePath = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";

    const configs: Record<string, IPageConfig> = {
      dashboard: {
        title: "Dashboard",
        searchPlaceholder: "Search dashboard...",
        addButtonAction: () => router.push("/customers"),
        showFilters: false,
        showSearch: false,
        showAddButton: false,
      },
      customers: {
        title: `Customers${
          contextData?.totalCount
            ? ` (${contextData.totalCount.toLocaleString()})`
            : ""
        }`,
        searchPlaceholder: "Search by name, email, phone, or company...",
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
      suppliers: {
        title: `Suppliers${
          contextData?.totalCount
            ? ` (${contextData.totalCount.toLocaleString()})`
            : ""
        }`,
        searchPlaceholder: "Search suppliers by name or email...",
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
      orders: {
        title: `Orders${
          contextData?.totalCount
            ? ` (${contextData.totalCount.toLocaleString()})`
            : ""
        }`,
        searchPlaceholder: "Search orders by number, customer, or email...",
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
      quotes: {
        title: `Quotes${
          contextData?.totalCount
            ? ` (${contextData.totalCount.toLocaleString()})`
            : ""
        }`,
        searchPlaceholder: "Search quotes by number, customer, or email...",
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
      brands: {
        title: `Brands${
          contextData?.totalCount
            ? ` (${contextData.totalCount.toLocaleString()})`
            : ""
        }`,
        searchPlaceholder: "Search brands by name...",
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
      products: {
        title: "Products",
        searchPlaceholder: "Search products...",
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
      searches: {
        title: "Searches",
        searchPlaceholder: "Search analytics...",
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: false,
        showSearch: true,
        showAddButton: false,
      },
      blog: {
        title: "Blog Management",
        searchPlaceholder: "Search posts...",
        addButtonAction: () => contextData?.onAddNew?.(),
        showFilters: true,
        showSearch: true,
        showAddButton: true,
      },
    };

    return (
      configs[basePath] || {
        title: "Admin Portal",
        searchPlaceholder: "Search...",
        addButtonAction: () => {},
        showFilters: false,
        showSearch: false,
        showAddButton: false,
      }
    );
  };

  const pageConfig = getPageConfig();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dashboard-header-user-menu")) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [dropdownOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (window.innerWidth < 768 && pageConfig.showSearch) {
          setMobileSearchOpen(true);
          setTimeout(() => {
            mobileSearchInputRef.current?.focus();
          }, 100);
        } else {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }
      }

      if (event.key === "Escape") {
        setSearchValue("");
        setSearchFocused(false);
        setMobileSearchOpen(false);
        searchInputRef.current?.blur();
        mobileSearchInputRef.current?.blur();
        contextData?.onSearchChange?.("");
      }
    };

    document.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [contextData, pageConfig.showSearch]);

  const renderFilters = () => {
    if (!pageConfig.showFilters || !contextData?.filters?.length) return null;

    return (
      <>
        {/* Mobile Filter Toggle */}
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="secondary"
          size="sm"
          icon={Filter}
          iconOnly
          className="lg:hidden flex-shrink-0 bg-white border-gray-200 hover:bg-gray-50 shadow-sm w-9 h-9"
          title="Toggle Filters"
        />

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          {contextData.filters.map((filter) => (
            <div key={filter.key} className="flex items-center">
              {filter.type === "select" ? (
                <select
                  value={filter.value as string}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:border-gray-300 transition-all duration-200 shadow-sm"
                >
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                  {filter.options?.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => filter.onChange(option.value)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                        filter.value === option.value
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
      </>
    );
  };

  return (
    <>
      <header className="dashboard-header bg-white border-b border-gray-200 w-full sticky top-0 z-[60] flex-shrink-0">
        <div className="dashboard-header-content px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-3 lg:gap-4">
            {/* Left Section - Page Title (Responsive) */}
            <div className="dashboard-header-left flex-shrink-0 min-w-0">
              <h1 className="text-base sm:text-md lg:text-md font-bold text-gray-900 truncate">
                {pageConfig.title}
              </h1>
            </div>

            {/* Center Section - Search (Desktop) */}
            {pageConfig.showSearch && (
              <div className="hidden md:flex flex-1 items-center gap-3">
                <div
                  className={`relative flex-1 ${
                    searchFocused ? "ring-2 ring-blue-500 ring-opacity-50" : ""
                  } rounded-lg transition-all duration-200`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search
                      className={`w-5 h-5 transition-colors duration-200 ${
                        searchFocused ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                  </div>

                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={pageConfig.searchPlaceholder}
                    value={searchValue}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    className="w-full pl-11 pr-24 py-2.5 border border-gray-200 rounded-lg focus:ring-0 focus:border-blue-500 focus:outline-none text-sm bg-gray-50 hover:bg-white transition-all duration-200 placeholder-gray-400"
                  />

                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                    {searchValue && (
                      <button
                        onClick={handleSearchClear}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-md">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </div>
                </div>

                {/* Desktop Filters */}
                {renderFilters()}
              </div>
            )}

            {/* Mobile Search Button */}
            {pageConfig.showSearch && (
              <Button
                onClick={toggleMobileSearch}
                variant="secondary"
                size="sm"
                icon={Search}
                iconOnly
                className="md:hidden flex-shrink-0 bg-white border-gray-200 hover:bg-gray-50 shadow-sm w-9 h-9"
                title="Search"
              />
            )}

            {/* Mobile Filter Button */}
            <div className="md:hidden">{renderFilters()}</div>

            {/* Spacer for desktop when no search */}
            {!pageConfig.showSearch && (
              <div className="hidden md:block flex-1" />
            )}

            {/* Right Section - Actions */}
            <div className="dashboard-header-right flex items-center gap-2 flex-shrink-0">
              {/* Add Button */}
              {pageConfig.showAddButton && (
                <Button
                  onClick={pageConfig.addButtonAction}
                  icon={Plus}
                  iconOnly
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 w-9 h-9 rounded-lg"
                  size="sm"
                  title="Add New"
                />
              )}

              {/* User Menu */}
              <div className="dashboard-header-user-menu relative">
                <Button
                  variant="secondary"
                  onClick={handleDropdownToggle}
                  className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 px-2 sm:px-3 py-2 h-9 rounded-lg"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-900 max-w-[100px] truncate">
                    {user?.username || "Admin"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.username || "Admin User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {user?.email || "admin@ppi.com"}
                      </p>
                    </div>

                    <div className="py-1">
                      <Button
                        onClick={() => {
                          router.push("/blog");
                          setDropdownOpen(false);
                        }}
                        variant="secondary"
                        className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-none shadow-none bg-transparent"
                        icon={BookOpen}
                      >
                        Blog Management
                      </Button>
                      <Button
                        onClick={() => {
                          router.push("/sitemaps");
                          setDropdownOpen(false);
                        }}
                        variant="secondary"
                        className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-none shadow-none bg-transparent"
                        icon={Map}
                      >
                        Site Maps
                      </Button>
                      <Button
                        onClick={() => {
                          router.push("/faq");
                          setDropdownOpen(false);
                        }}
                        variant="secondary"
                        className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-none shadow-none bg-transparent"
                        icon={HelpCircle}
                      >
                        FAQ Center
                      </Button>

                      <div className="my-1 border-t border-gray-100" />

                      <Button
                        onClick={() => {
                          router.push("/profile");
                          setDropdownOpen(false);
                        }}
                        variant="secondary"
                        className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-none shadow-none bg-transparent"
                        icon={User}
                      >
                        Profile Settings
                      </Button>

                      <Button
                        onClick={() => {
                          router.push("/settings");
                          setDropdownOpen(false);
                        }}
                        variant="secondary"
                        className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-none shadow-none bg-transparent"
                        icon={Menu}
                      >
                        System Settings
                      </Button>

                      <div className="my-1 border-t border-gray-100" />

                      <Button
                        onClick={() => {
                          handleLogout();
                          setDropdownOpen(false);
                        }}
                        variant="secondary"
                        className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-none shadow-none bg-transparent"
                        icon={LogOut}
                      >
                        Sign Out
                      </Button>
                    </div>

                    <div className="px-4 py-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">Version 1.0.0</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters &&
            pageConfig.showFilters &&
            contextData?.filters?.length && (
              <div className="lg:hidden border-t border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {contextData.filters.map((filter) => (
                    <div key={filter.key} className="flex items-center">
                      {filter.type === "select" ? (
                        <select
                          value={filter.value as string}
                          onChange={(e) => filter.onChange(e.target.value)}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                        >
                          {filter.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex bg-white border border-gray-200 rounded-lg p-0.5">
                          {filter.options?.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => filter.onChange(option.value)}
                              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                                filter.value === option.value
                                  ? "bg-blue-500 text-white"
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
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && pageConfig.showSearch && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/50"
          onClick={() => setMobileSearchOpen(false)}
        >
          <div
            className="bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>

                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder={pageConfig.searchPlaceholder}
                  value={searchValue}
                  onChange={handleSearchChange}
                  className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm bg-gray-50"
                  autoFocus
                />

                {searchValue && (
                  <button
                    onClick={handleSearchClear}
                    className="absolute inset-y-0 right-3 flex items-center"
                    type="button"
                  >
                    <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              <Button
                onClick={() => setMobileSearchOpen(false)}
                variant="secondary"
                className="px-4 py-2"
              >
                Cancel
              </Button>
            </div>

            <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">
                ESC
              </kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
