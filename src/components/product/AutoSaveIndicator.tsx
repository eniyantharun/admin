/**
 * AutoSaveIndicator Component
 * Displays auto-save status
 */

'use client';

import { Check, Loader2, AlertCircle, Clock } from 'lucide-react';
import type { SaveStatus } from '@/hooks/api/useAutoSave';

export interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  className?: string;
}

/**
 * Displays auto-save status indicator
 *
 * @example
 * ```tsx
 * <AutoSaveIndicator status={status} lastSaved={lastSaved} />
 * ```
 */
export function AutoSaveIndicator({
  status,
  lastSaved,
  className = '',
}: AutoSaveIndicatorProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Saving...',
          color: 'text-blue-600',
        };
      case 'saved':
        return {
          icon: <Check className="w-4 h-4" />,
          text: 'Saved',
          color: 'text-green-600',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Save failed',
          color: 'text-red-600',
        };
      default:
        return lastSaved
          ? {
              icon: <Clock className="w-4 h-4" />,
              text: `Saved ${getTimeAgo(lastSaved)}`,
              color: 'text-gray-500',
            }
          : null;
    }
  };

  const display = getStatusDisplay();

  if (!display) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${display.color} ${className}`}>
      {display.icon}
      <span>{display.text}</span>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 minute ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  return `${Math.floor(seconds / 3600)} hours ago`;
}
