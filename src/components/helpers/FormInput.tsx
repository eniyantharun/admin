import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  type = "text",
  placeholder,
  helpText,
  disabled
}) => (
  <div className="form-input-group">
    <label htmlFor={name} className="form-label block text-xs font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'checkbox' ? (
      <div className="flex items-center">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={value as boolean}
          onChange={onChange}
          className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={disabled}
        />
        <span className="ml-2 text-xs text-gray-600">{placeholder}</span>
      </div>
    ) : (
      // For all other types (text, email, number, etc.), render a standard input
      <input
        type={type}
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        className={`form-input w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
        disabled={disabled}
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