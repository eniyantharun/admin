'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { debounce } from '@/lib/utils';

export interface SearchConfig {
  placeholder: string;
  enabled: boolean;
  searchFunction?: (query: string) => void;
  filters?: SearchFilter[];
}

export interface SearchFilter {
  key: string;
  label: string;
  type: 'select' | 'checkbox' | 'date';
  options?: { value: string; label: string }[];
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchConfig: SearchConfig;
  setSearchConfig: (config: SearchConfig) => void;
  clearSearch: () => void;
  isSearching: boolean;
  searchResults: any[];
  setSearchResults: (results: any[]) => void;
  performSearch: (query: string) => void;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
}

const defaultConfig: SearchConfig = {
  placeholder: 'Search...',
  enabled: false,
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchConfig, setSearchConfig] = useState<SearchConfig>(defaultConfig);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  const pathname = usePathname();
  const router = useRouter();
  const previousPathname = useRef(pathname);
  const isInitialMount = useRef(true);

  // Only clear search when actually changing pages, not on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (previousPathname.current !== pathname) {
      // Use setTimeout to prevent blocking the navigation
      setTimeout(() => {
        setSearchQuery('');
        setSearchResults([]);
        setFilters({});
        setSearchConfig(defaultConfig);
        setIsSearching(false);
      }, 0);
      
      previousPathname.current = pathname;
    }
  }, [pathname]);

  // Memoized debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string, searchFunction?: (query: string) => void) => {
      if (searchFunction && query.trim()) {
        setIsSearching(true);
        Promise.resolve(searchFunction(query))
          .finally(() => setIsSearching(false));
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    debouncedSearch(query, searchConfig.searchFunction);
  }, [debouncedSearch, searchConfig.searchFunction]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setFilters({});
    setIsSearching(false);
  }, []);

  // Optimized keyboard shortcuts with proper cleanup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      
      if (event.key === 'Escape') {
        clearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clearSearch]);

  const value: SearchContextType = {
    searchQuery,
    setSearchQuery: performSearch,
    searchConfig,
    setSearchConfig,
    clearSearch,
    isSearching,
    searchResults,
    setSearchResults,
    performSearch,
    filters,
    setFilters,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

// Optimized hook for pages to register their search functionality
export const usePageSearch = (config: SearchConfig) => {
  const { setSearchConfig } = useSearch();
  const configRef = useRef(config);
  
  // Only update if config actually changed
  useEffect(() => {
    const hasChanged = JSON.stringify(configRef.current) !== JSON.stringify(config);
    if (hasChanged) {
      configRef.current = config;
      setSearchConfig(config);
    }
  }, [config, setSearchConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setSearchConfig(defaultConfig);
    };
  }, [setSearchConfig]);
};