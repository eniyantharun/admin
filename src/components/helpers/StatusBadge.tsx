import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface StatusBadgeProps {
  enabled: boolean;
  label?: { enabled: string; disabled: string };
  variant?: 'default' | 'compact';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  enabled, 
  label,
  variant = 'default'
}) => {
  const defaultLabel = { enabled: 'Enabled', disabled: 'Disabled' };
  const displayLabel = label || defaultLabel;
  
  const isCompact = variant === 'compact';
  
  return (
    <span className={`inline-flex items-center ${isCompact ? 'px-2 py-0.5' : 'px-2.5 py-0.5'} rounded-full text-xs font-medium ${
      enabled 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {!isCompact && (enabled ? (
        <CheckCircle className="w-3 h-3 mr-1" />
      ) : (
        <AlertCircle className="w-3 h-3 mr-1" />
      ))}
      {enabled ? displayLabel.enabled : displayLabel.disabled}
    </span>
  );
};