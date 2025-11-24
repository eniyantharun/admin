/**
 * useAutoSave Hook
 * Automatically save form data with debouncing
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { debounceAsync } from '@/utils/debounce';
import toast from 'react-hot-toast';

export interface UseAutoSaveOptions<T> {
  data: T;
  saveFunction: (data: T) => Promise<any>;
  debounceMs?: number;
  enabled?: boolean;
  onSaveStart?: () => void;
  onSaveSuccess?: (response: any) => void;
  onSaveError?: (error: Error) => void;
  showToast?: boolean;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveReturn {
  status: SaveStatus;
  save: () => Promise<void>;
  lastSaved: Date | null;
  error: Error | null;
}

/**
 * Hook for auto-saving data with debouncing
 *
 * @example
 * ```tsx
 * const { status, lastSaved } = useAutoSave({
 *   data: formData,
 *   saveFunction: (data) => ProductCRUDService.updateProduct(productId, data),
 *   debounceMs: 300,
 *   enabled: true,
 * });
 * ```
 */
export function useAutoSave<T>({
  data,
  saveFunction,
  debounceMs = 300,
  enabled = true,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
  showToast = false,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const isFirstRender = useRef(true);
  const previousData = useRef<T>(data);

  // Create debounced save function
  const debouncedSave = useRef(
    debounceAsync(async (dataToSave: T) => {
      try {
        setStatus('saving');
        setError(null);

        if (onSaveStart) {
          onSaveStart();
        }

        const response = await saveFunction(dataToSave);

        setStatus('saved');
        setLastSaved(new Date());

        if (onSaveSuccess) {
          onSaveSuccess(response);
        }

        if (showToast) {
          toast.success('Changes saved');
        }

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setStatus('idle');
        }, 2000);
      } catch (err) {
        const error = err as Error;
        setStatus('error');
        setError(error);

        if (onSaveError) {
          onSaveError(error);
        }

        if (showToast) {
          toast.error(`Save failed: ${error.message}`);
        }

        console.error('Auto-save error:', error);
      }
    }, debounceMs)
  ).current;

  // Auto-save when data changes
  useEffect(() => {
    // Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousData.current = data;
      return;
    }

    // Skip if disabled
    if (!enabled) {
      return;
    }

    // Check if data actually changed
    if (JSON.stringify(data) === JSON.stringify(previousData.current)) {
      return;
    }

    previousData.current = data;

    // Trigger debounced save
    debouncedSave(data);
  }, [data, enabled, debouncedSave]);

  // Manual save (skip debounce)
  const save = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      setStatus('saving');
      setError(null);

      if (onSaveStart) {
        onSaveStart();
      }

      const response = await saveFunction(data);

      setStatus('saved');
      setLastSaved(new Date());

      if (onSaveSuccess) {
        onSaveSuccess(response);
      }

      if (showToast) {
        toast.success('Changes saved');
      }

      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    } catch (err) {
      const error = err as Error;
      setStatus('error');
      setError(error);

      if (onSaveError) {
        onSaveError(error);
      }

      if (showToast) {
        toast.error(`Save failed: ${error.message}`);
      }

      console.error('Manual save error:', error);
    }
  }, [data, enabled, saveFunction, onSaveStart, onSaveSuccess, onSaveError, showToast]);

  return {
    status,
    save,
    lastSaved,
    error,
  };
}
