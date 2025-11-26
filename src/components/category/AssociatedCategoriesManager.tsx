'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Plus, Search } from 'lucide-react';

interface AssociatedCategory {
  id: number;
  name: string;
  includeInSearch: boolean;
}

interface AssociatedCategoriesManagerProps {
  associatedCategories: AssociatedCategory[];
  onChange: (categories: AssociatedCategory[]) => void;
}

export function AssociatedCategoriesManager({
  associatedCategories,
  onChange,
}: AssociatedCategoriesManagerProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = (category: AssociatedCategory) => {
    if (!associatedCategories.find(c => c.id === category.id)) {
      onChange([...associatedCategories, category]);
    }
    setShowSearch(false);
    setSearchTerm('');
  };

  const handleRemove = (id: number) => {
    onChange(associatedCategories.filter(c => c.id !== id));
  };

  const handleToggleIncludeInSearch = (id: number) => {
    onChange(
      associatedCategories.map(c =>
        c.id === id ? { ...c, includeInSearch: !c.includeInSearch } : c
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Associated Categories</h3>
        <Button
          onClick={() => setShowSearch(!showSearch)}
          variant="secondary"
          icon={Plus}
          size="sm"
          type="button"
        >
          Add
        </Button>
      </div>

      {associatedCategories.length === 0 && (
        <p className="text-sm text-gray-400 italic">No associated categories</p>
      )}

      {associatedCategories.length > 0 && (
        <div className="space-y-2">
          {associatedCategories.map(category => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{category.name}</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={category.includeInSearch}
                    onChange={() => handleToggleIncludeInSearch(category.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-gray-600">Include in search</span>
                </label>

                <button
                  onClick={() => handleRemove(category.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSearch && (
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-500">
            Search and select categories to associate with this category
          </p>
        </div>
      )}
    </div>
  );
}
