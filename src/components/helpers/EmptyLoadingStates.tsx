import React from 'react';
import { Building } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<any>;
  title: string;
  description?: string;
  hasSearch?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon = Building, 
  title, 
  description, 
  hasSearch = false 
}) => (
  <div className="empty-state text-center py-8">
    <div className="empty-state-icon-wrapper text-gray-400 mb-3">
      <Icon className="empty-state-icon w-10 h-10 mx-auto" />
    </div>
    <h3 className="empty-state-title text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {description && (
      <p className="empty-state-description text-gray-500 text-sm">
        {hasSearch ? 'Try adjusting your search terms.' : description}
      </p>
    )}
  </div>
);

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => (
  <div className="loading-state text-center py-8">
    <div className="loading-spinner w-8 h-8 mx-auto animate-spin text-blue-600 mb-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
    <p className="loading-text text-gray-500 text-sm">{message}</p>
  </div>
);