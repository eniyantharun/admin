import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EntityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

export const EntityDrawer: React.FC<EntityDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  loading = false,
  size = 'lg',
  footer
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 right-0 z-50 w-full ${sizeClasses[size]} sm:max-w-sm md:${sizeClasses[size]} transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col bg-white shadow-2xl">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{title}</h2>
            <Button
              onClick={onClose}
              variant="secondary"
              size="sm"
              icon={X}
              iconOnly
              disabled={loading}
              className="flex-shrink-0"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {children}
          </div>

          {footer && (
            <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};