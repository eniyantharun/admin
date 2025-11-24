'use client';

import React from 'react';
import { useAsyncFormStatus, AsyncFormStatus } from './AsyncForm';
import { cn } from '@/lib/utils';

interface AsyncFormSavingStatusProps {
  className?: string;
}

export function AsyncFormSavingStatus({ className }: AsyncFormSavingStatusProps) {
  const { status } = useAsyncFormStatus();

  if (status === 'clean') {
    return null;
  }

  return (
    <div className={cn('text-sm', className)}>
      {status === 'saving' && (
        <span className="text-muted-foreground">Saving...</span>
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
    </div>
  );
}
