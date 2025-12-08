'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeCRUDService } from '@/lib/services/theme';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddThemeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddThemeModal({ onClose, onSuccess }: AddThemeModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('PromotionalProductInc');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a theme name');
      return;
    }

    setLoading(true);
    try {
      const result = await ThemeCRUDService.createTheme({
        name: name.trim(),
        website,
        type: 'Theme',
      });

      toast.success('Theme created successfully');
      onSuccess();

      // Navigate to the new theme editor
      if (result.id) {
        router.push(`/themes/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to create theme:', error);
      toast.error('Failed to create theme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Theme</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Theme Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter theme name"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <select
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PromotionalProductInc">Promotional Product Inc</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Create Theme
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
