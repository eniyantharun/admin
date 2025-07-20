import React from 'react';
import { Calendar } from 'lucide-react';

interface DateDisplayProps {
  date: string;
  format?: 'short' | 'long' | 'relative';
  showIcon?: boolean;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({ 
  date, 
  format = 'short',
  showIcon = true
}) => {
  const dateObj = new Date(date);
  
  const getFormattedDate = () => {
    switch (format) {
      case 'long':
        return dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'relative':
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - dateObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
      default:
        return dateObj.toLocaleDateString();
    }
  };

  return (
    <div className="date-display text-sm text-gray-900 flex items-center gap-1">
      {showIcon && <Calendar className="date-display-icon w-4 h-4 text-gray-400" />}
      <span className="date-display-text text-xs">
        {getFormattedDate()}
      </span>
    </div>
  );
};