import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  iconOnly = false,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'ui-button-base inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform  active:scale-95 shadow-lg hover:shadow-xl';
  
  const variantClasses = {
    primary: 'ui-button-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white focus:ring-primary-500',
    secondary: 'ui-button-secondary bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-secondary-500 shadow-sm hover:shadow-md',
    danger: 'ui-button-danger bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-danger-500',
    success: 'ui-button-success bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white focus:ring-success-500',
    warning: 'ui-button-warning bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white focus:ring-warning-400',
  };

  const sizeClasses = {
    sm: iconOnly ? 'ui-button-sm-icon p-1.5' : 'ui-button-sm px-3 py-1.5 text-sm',
    md: iconOnly ? 'ui-button-md-icon p-2' : 'ui-button-md px-4 py-2 text-sm',
    lg: iconOnly ? 'ui-button-lg-icon p-3' : 'ui-button-lg px-6 py-3 text-base',
  };

  const iconSizes = {
    sm: 'ui-button-icon-sm w-3 h-3',
    md: 'ui-button-icon-md w-4 h-4',
    lg: 'ui-button-icon-lg w-5 h-5',
  };

  const borderRadius = iconOnly ? 'ui-button-rounded-icon rounded-lg' : 'ui-button-rounded rounded-lg';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${borderRadius} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className={`ui-button-spinner animate-spin rounded-full border-2 border-white border-t-transparent ${iconSizes[size]}`} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={`ui-button-icon-left ${iconSizes[size]} ${!iconOnly && children ? 'mr-2' : ''}`} />
          )}
          {!iconOnly && children}
          {Icon && iconPosition === 'right' && (
            <Icon className={`ui-button-icon-right ${iconSizes[size]} ${!iconOnly && children ? 'ml-2' : ''}`} />
          )}
        </>
      )}
    </button>
  );
};