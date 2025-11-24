/**
 * BackgroundSyncStatus Component
 * Displays background sync status badge
 */

'use client';

import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import type { SyncStatus } from '@/hooks/api/useBackgroundSync';

export interface BackgroundSyncStatusProps {
  status: SyncStatus;
  className?: string;
}

/**
 * Displays background sync status as a badge
 *
 * @example
 * ```tsx
 * <BackgroundSyncStatus status={status} />
 * ```
 */
export function BackgroundSyncStatus({
  status,
  className = '',
}: BackgroundSyncStatusProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'reindexing':
        return {
          icon: <RefreshCw className="w-3 h-3 animate-spin" />,
          text: 'Reindexing',
          bg: 'bg-blue-100',
          text_color: 'text-blue-700',
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-3 h-3 animate-spin" />,
          text: 'Syncing',
          bg: 'bg-purple-100',
          text_color: 'text-purple-700',
        };
      case 'completed':
        return {
          icon: <CheckCircle2 className="w-3 h-3" />,
          text: 'Synced',
          bg: 'bg-green-100',
          text_color: 'text-green-700',
        };
      case 'error':
        return {
          icon: <XCircle className="w-3 h-3" />,
          text: 'Sync failed',
          bg: 'bg-red-100',
          text_color: 'text-red-700',
        };
      default:
        return null;
    }
  };

  const display = getStatusDisplay();

  if (!display) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${display.bg} ${display.text_color} ${className}`}
    >
      {display.icon}
      <span>{display.text}</span>
    </div>
  );
}
