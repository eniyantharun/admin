'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeCRUDService } from '@/lib/services/theme';
import { Button } from '@/components/ui/Button';
import { X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeleteThemeModalProps {
  themeId: number;
  themeName: string;
  hasChildren: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteThemeModal({
  themeId,
  themeName,
  hasChildren,
  onClose,
  onSuccess,
}: DeleteThemeModalProps) {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (hasChildren && !redirectTo) {
      toast.error('Please select a theme to redirect to');
      return;
    }

    setLoading(true);
    try {
      await ThemeCRUDService.deleteTheme({
        themeId,
        redirectToThemeId: redirectTo,
      });

      toast.success('Theme deleted successfully');
      onSuccess();
      router.push('/themes');
    } catch (error) {
      console.error('Failed to delete theme:', error);
      toast.error('Failed to delete theme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Delete Theme</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{themeName}</strong>?
          </p>

          {hasChildren ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                This theme has subthemes. You must select a theme to redirect to before deleting.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                This action cannot be undone. All slug aliases will be transferred if you select a redirect theme.
              </p>
            </div>
          )}

          {hasChildren && (
            <div>
              <label htmlFor="redirect" className="block text-sm font-medium text-gray-700 mb-1">
                Redirect to Theme *
              </label>
              <select
                id="redirect"
                value={redirectTo || ''}
                onChange={(e) => setRedirectTo(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a theme...</option>
                {/* TODO: Load themes from API */}
              </select>
            </div>
          )}
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
            type="button"
            variant="danger"
            loading={loading}
            disabled={loading || (hasChildren && !redirectTo)}
            onClick={handleDelete}
          >
            Delete Theme
          </Button>
        </div>
      </div>
    </div>
  );
}
