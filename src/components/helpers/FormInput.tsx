import { iFormInputProps } from '@/types';
import React from 'react';

export const FormInput: React.FC<iFormInputProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required = false, 
  type = "text", 
  placeholder,
  helpText
}) => (
  <div className="form-input-group">
    <label className="form-label block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'checkbox' ? (
      <div className="flex items-center">
        <input
          type="checkbox"
          name={name}
          checked={value as boolean}
          onChange={onChange}
          className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-600">{placeholder}</span>
      </div>
    ) : (
      <input
        type={type}
        name={name}
        value={value as string}
        onChange={onChange}
        className={`form-input w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
      />
    )}
    {helpText && !error && (
      <p className="form-help-text text-gray-500 text-xs mt-1">{helpText}</p>
    )}
    {error && (
      <p className="form-error text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
);