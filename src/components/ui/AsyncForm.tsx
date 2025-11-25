'use client';

import React, { useEffect, useRef, useState, FormEvent } from 'react';
import { UseFormReturn, FormProvider } from 'react-hook-form';

export type AsyncFormStatus = 'clean' | 'saving' | 'saved' | 'failed' | 'invalid';

interface AsyncFormProps<T extends Record<string, any>> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void>;
  children: React.ReactNode;
  className?: string;
  debounceMs?: number;
  showToast?: boolean;
}

export function AsyncForm<T extends Record<string, any>>({
  form,
  onSubmit,
  children,
  className = '',
  debounceMs = 700,
  showToast = false,
}: AsyncFormProps<T>) {
  const [status, setStatus] = useState<AsyncFormStatus>('clean');
  const [autoKey, setAutoKey] = useState(0);
  const isFirstRender = useRef(true);
  const formRef = useRef<HTMLFormElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSubmittedDataRef = useRef<string>('');

  // Track form changes for auto-save
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Ignore if it's the first render
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      // Check if the changed field should trigger auto-save
      const changedElement = name ? formRef.current?.elements.namedItem(name) : null;

      if (changedElement instanceof HTMLElement) {
        // Skip if field has data-no-auto-save attribute
        if (changedElement.getAttribute('data-no-auto-save') === 'true') {
          return;
        }
      }

      // Trigger auto-save
      setAutoKey((prev) => prev + 1);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Auto-submit when autoKey changes
  useEffect(() => {
    if (autoKey === 0) return; // Skip initial render

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setStatus('saving');

    timeoutRef.current = setTimeout(() => {
      console.debug('Auto-submitting form after debounce');
      formRef.current?.requestSubmit();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoKey, debounceMs]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check for validation errors
    const isValid = await form.trigger();
    if (!isValid) {
      setStatus('invalid');
      if (showToast) {
        // Optionally show toast for validation errors
        console.error('Form validation failed');
      }
      return;
    }

    try {
      setStatus('saving');
      const data = form.getValues();

      // PROTECTION: Compare with last submitted data to avoid duplicate saves
      const dataString = JSON.stringify(data);
      if (dataString === lastSubmittedDataRef.current) {
        console.log('[AsyncForm] Data unchanged, skipping save');
        setStatus('clean');
        return;
      }

      // PROTECTION: Check if all values are empty/null/undefined
      const hasNonEmptyValue = Object.values(data).some(value => {
        if (value === null || value === undefined || value === '') return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === 'object' && Object.keys(value).length === 0) return false;
        return true;
      });

      if (!hasNonEmptyValue) {
        console.warn('[AsyncForm] All form values are empty, skipping save to prevent data loss');
        setStatus('clean');
        return;
      }

      await onSubmit(data);

      // Update last submitted data
      lastSubmittedDataRef.current = dataString;

      setStatus('saved');

      // Reset to clean after 2 seconds
      setTimeout(() => {
        setStatus('clean');
      }, 2000);
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('failed');

      if (showToast) {
        // Optionally show toast for errors
        console.error('Failed to save form');
      }
    }
  };

  return (
    <FormProvider {...form}>
      <AsyncFormContext.Provider value={{ status, setStatus }}>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={className}
        >
          {children}
        </form>
      </AsyncFormContext.Provider>
    </FormProvider>
  );
}

// Context for sharing status with child components
const AsyncFormContext = React.createContext<{
  status: AsyncFormStatus;
  setStatus: (status: AsyncFormStatus) => void;
} | null>(null);

export function useAsyncFormStatus() {
  const context = React.useContext(AsyncFormContext);
  if (!context) {
    throw new Error('useAsyncFormStatus must be used within AsyncForm');
  }
  return context;
}

// Component to display saving status
export function AsyncFormSavingStatus() {
  const { status } = useAsyncFormStatus();

  if (status === 'clean') {
    return null;
  }

  return (
    <span className="text-sm mr-2">
      {status === 'saving' && (
        <span className="text-blue-600">Saving...</span>
      )}
      {status === 'saved' && (
        <span className="text-green-600">Saved</span>
      )}
      {status === 'failed' && (
        <span className="text-red-600">Failed to save</span>
      )}
      {status === 'invalid' && (
        <span className="text-orange-600">Please fix validation errors</span>
      )}
    </span>
  );
}
