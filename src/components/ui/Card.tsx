import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  rounded = 'lg',
  ...rest 
}) => {
  const paddingClasses = {
    none: 'ui-card-padding-none',
    sm: 'ui-card-padding-sm p-3',
    md: 'ui-card-padding-md p-4',
    lg: 'ui-card-padding-lg p-6',
  };

  const shadowClasses = {
    none: 'ui-card-shadow-none',
    sm: 'ui-card-shadow-sm shadow-sm',
    md: 'ui-card-shadow-md shadow-md',
    lg: 'ui-card-shadow-lg shadow-lg',
  };

  const roundedClasses = {
    none: 'ui-card-rounded-none',
    sm: 'ui-card-rounded-sm rounded-sm',
    md: 'ui-card-rounded-md rounded-md',
    lg: 'ui-card-rounded-lg rounded-lg',
  };

  const borderClass = border ? 'ui-card-border border border-secondary-200' : 'ui-card-no-border';

  return (
    <div
      className={`ui-card-container bg-white ${paddingClasses[padding]} ${shadowClasses[shadow]} ${roundedClasses[rounded]} ${borderClass} ${className}`}
      {...rest} 
    >
      {children}
    </div>
  );
};
