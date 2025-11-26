'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Plus } from 'lucide-react';

interface SlugManagerProps {
  primarySlug: string;
  slugAliases: string[];
  onPrimarySlugChange: (slug: string) => void;
  onAliasesChange: (aliases: string[]) => void;
  disabled?: boolean;
}

export function SlugManager({
  primarySlug,
  slugAliases,
  onPrimarySlugChange,
  onAliasesChange,
  disabled = false,
}: SlugManagerProps) {
  const [newAlias, setNewAlias] = useState('');

  const handleAddAlias = () => {
    if (newAlias.trim() && !slugAliases.includes(newAlias.trim())) {
      onAliasesChange([...slugAliases, newAlias.trim()]);
      setNewAlias('');
    }
  };

  const handleRemoveAlias = (index: number) => {
    onAliasesChange(slugAliases.filter((_, i) => i !== index));
  };

  const validateSlug = (slug: string): boolean => {
    // Slug pattern: lowercase letters, numbers, hyphens
    const slugPattern = /^[a-z0-9-]+$/;
    return slugPattern.test(slug);
  };

  return (
    <div className="space-y-4">
      {/* Primary URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Primary URL
        </label>
        <input
          type="text"
          value={primarySlug}
          onChange={(e) => onPrimarySlugChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
          } ${!validateSlug(primarySlug) && primarySlug ? 'border-red-500' : ''}`}
          placeholder="leave-blank-to-auto-generate"
        />
        {!validateSlug(primarySlug) && primarySlug && (
          <p className="text-xs text-red-600 mt-1">
            Only lowercase letters, numbers, and hyphens are allowed
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Leave blank to be auto-generated from the name
        </p>
      </div>

      {/* Alternative URLs / Redirects */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Other URLs / Redirect from:
        </h4>

        {slugAliases.length === 0 && (
          <p className="text-sm text-gray-400 italic mb-3">No redirects</p>
        )}

        {slugAliases.length > 0 && (
          <div className="space-y-2 mb-3">
            {slugAliases.map((alias, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => {
                    const newAliases = [...slugAliases];
                    newAliases[index] = e.target.value;
                    onAliasesChange(newAliases);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="alternative-url"
                />
                <button
                  onClick={() => handleRemoveAlias(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new alias */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newAlias}
            onChange={(e) => setNewAlias(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddAlias();
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Add alternative URL..."
          />
          <Button
            onClick={handleAddAlias}
            variant="secondary"
            icon={Plus}
            type="button"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
