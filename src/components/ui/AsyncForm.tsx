'use client';

import React, { useEffect, useRef, useState, FormEvent } from 'react';
import { UseFormReturn } from 'react-hook-form';

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
      await onSubmit(data);
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
    <AsyncFormContext.Provider value={{ status, setStatus }}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={className}
      >
        {children}
      </form>
    </AsyncFormContext.Provider>
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
