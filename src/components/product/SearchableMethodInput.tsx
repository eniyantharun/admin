'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

interface DecorationMethod {
  id: number;
  name: string;
}

interface SearchableMethodInputProps {
  value: DecorationMethod | null;
  onChange: (method: DecorationMethod) => void;
  label?: string;
  className?: string;
}

export function SearchableMethodInput({
  value,
  onChange,
  label = 'Imprint Method',
  className = '',
}: SearchableMethodInputProps) {
  const { get } = useApi();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [methods, setMethods] = useState<DecorationMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search methods
  useEffect(() => {
    if (!isOpen) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await get<{ methods: DecorationMethod[] }>(
          `/Admin/ProductEditor/GetDecorationMethods?search=${encodeURIComponent(searchQuery)}`
        );
        setMethods(response?.methods || []);
      } catch (error) {
        console.error('Failed to fetch decoration methods:', error);
        setMethods([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, isOpen, get]);

  const handleSelect = (method: DecorationMethod) => {
    onChange(method);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value?.name || ''}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search decoration methods..."
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : methods.length > 0 ? (
            methods.map((method) => (
              <div
                key={method.id}
                onClick={() => handleSelect(method)}
                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                {method.name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchQuery ? 'No methods found' : 'Type to search...'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
